/**
 * Security Penetration Test — Data Isolation Verification
 *
 * Tests that User B cannot access User A's data through any API endpoint.
 *
 * Usage:
 *   npx tsx scripts/security-test.ts [BASE_URL]
 *   Defaults to http://localhost:3000
 *
 * Requirements:
 *   - Server must be running
 *   - Database must be accessible
 */

const BASE_URL = process.argv[2] || 'http://localhost:3000';

interface TestResult {
  name: string;
  passed: boolean;
  status?: number;
  detail?: string;
}

const results: TestResult[] = [];
let userACookie = '';
let userBCookie = '';
let userAId = '';
let userBId = '';
let testOrderId = '';
let testInvoiceId = '';
let testPaymentId = '';
let testNotificationId = '';

const timestamp = Date.now();
const userAEmail = `testuser-a-${timestamp}@test.com`;
const userBEmail = `testuser-b-${timestamp}@test.com`;
const testPassword = 'TestPassword123!';

// ─── Helpers ────────────────────────────────────────────────

async function nextAuthSignIn(email: string, password: string): Promise<string> {
  // Step 1: Get CSRF token AND its cookie
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;
  const csrfCookies = csrfRes.headers.getSetCookie?.() || [];
  const csrfCookie = csrfCookies.map(c => c.split(';')[0]).join('; ');

  // Step 2: Sign in with credentials, sending both CSRF cookie and token
  const body = new URLSearchParams();
  body.append('csrfToken', csrfToken);
  body.append('email', email);
  body.append('password', password);
  body.append('redirect', 'false');
  body.append('json', 'true');

  const signInRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': csrfCookie,
    },
    body: body.toString(),
    redirect: 'manual',
  });

  // Collect ALL cookies from sign-in response and follow redirects manually
  const allCookies: string[] = [...csrfCookie.split('; ')];
  const signInCookies = signInRes.headers.getSetCookie?.() || [];
  for (const c of signInCookies) {
    allCookies.push(c.split(';')[0]);
  }

  // Follow redirect if needed
  const location = signInRes.headers.get('location');
  if (location) {
    const redirRes = await fetch(location, {
      headers: { Cookie: allCookies.join('; ') },
      redirect: 'manual',
    });
    const redirCookies = redirRes.headers.getSetCookie?.() || [];
    for (const c of redirCookies) {
      allCookies.push(c.split(';')[0]);
    }
  }

  return [...new Set(allCookies)].join('; ');
}

async function apiGet(url: string, cookie: string): Promise<{ status: number; data: unknown }> {
  const res = await fetch(`${BASE_URL}${url}`, {
    headers: { Cookie: cookie },
    redirect: 'manual',
  });
  let data: unknown = null;
  try { data = await res.json(); } catch { /* empty */ }
  return { status: res.status, data };
}

async function apiPut(url: string, cookie: string, body?: unknown): Promise<{ status: number; data: unknown }> {
  const res = await fetch(`${BASE_URL}${url}`, {
    method: 'PUT',
    headers: { Cookie: cookie, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  });
  let data: unknown = null;
  try { data = await res.json(); } catch { /* empty */ }
  return { status: res.status, data };
}

function test(name: string, status: number, expectedForbidden: boolean) {
  const blocked = status === 403 || status === 401;
  const passed = expectedForbidden ? blocked : !blocked;
  results.push({ name, passed, status });
  const icon = passed ? '✓' : '✗';
  const statusStr = `[${status}]`;
  console.log(`  ${icon} ${name} ${statusStr} ${passed ? '' : '— FAIL: expected ' + (expectedForbidden ? '403/401' : '200')}`);
}

// ─── Setup ──────────────────────────────────────────────────

async function setup() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  Security Penetration Test — Data Isolation');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  Target: ${BASE_URL}`);
  console.log('');

  // Register User A
  console.log('📋 Setting up test users...');
  const regARes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User A', email: userAEmail, password: testPassword }),
  });
  const regA = await regARes.json();
  if (!regA.success) {
    console.log(`  ⚠ User A register: ${regA.error || regA.message || 'unknown error'}`);
  } else {
    console.log(`  ✓ User A registered: ${userAEmail}`);
  }

  // Register User B
  const regBRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User B', email: userBEmail, password: testPassword }),
  });
  const regB = await regBRes.json();
  if (!regB.success) {
    console.log(`  ⚠ User B register: ${regB.error || regB.message || 'unknown error'}`);
  } else {
    console.log(`  ✓ User B registered: ${userBEmail}`);
  }

  // Sign in both users via NextAuth
  console.log('');
  console.log('🔐 Signing in via NextAuth...');
  userACookie = await nextAuthSignIn(userAEmail, testPassword);
  userBCookie = await nextAuthSignIn(userBEmail, testPassword);

  if (!userACookie) {
    console.log('  ✗ Failed to sign in User A. Cannot proceed.');
    process.exit(1);
  }
  console.log(`  ✓ User A signed in`);
  if (!userBCookie) {
    console.log('  ✗ Failed to sign in User B. Cannot proceed.');
    process.exit(1);
  }
  console.log(`  ✓ User B signed in`);

  // Get user IDs
  const userASession = await apiGet('/api/auth/session', userACookie);
  const userBSession = await apiGet('/api/auth/session', userBCookie);
  const userAData = (userASession.data as Record<string, unknown>)?.user as Record<string, unknown> | undefined;
  const userBData = (userBSession.data as Record<string, unknown>)?.user as Record<string, unknown> | undefined;
  userAId = (userAData?.id as string) || '';
  userBId = (userBData?.id as string) || '';
  console.log(`  User A ID: ${userAId}`);
  console.log(`  User B ID: ${userBId}`);

  // Create an order for User A
  console.log('');
  console.log('📦 Creating test order for User A...');

  // Helper to unwrap API response (handles success() wrapper: { success, data: { data, meta } })
  function unwrapData(apiData: unknown): unknown[] {
    const outer = apiData as Record<string, unknown> | undefined;
    if (!outer?.data) return [];
    const inner = outer.data as Record<string, unknown>;
    if (Array.isArray(inner.data)) return inner.data as unknown[];
    if (Array.isArray(inner)) return inner as unknown[];
    return [];
  }

  const servicesRes = await apiGet('/api/services', userACookie);
  const services = unwrapData(servicesRes.data);

  if (services.length === 0) {
    console.log('  ⚠ No services found via /api/services. Trying /api/cms/services...');
    const cmsSvcRes = await apiGet('/api/cms/services', userACookie);
    const cmsServices = unwrapData(cmsSvcRes.data);
    if (cmsServices.length > 0) {
      console.log(`  ✓ Found ${cmsServices.length} services via CMS API`);
      services.push(...cmsServices);
    }
  }

  const firstService = services[0] as Record<string, unknown> | undefined;
  const serviceId = (firstService?.id as string) || '';
  const serviceName = (firstService?.name as string) || 'Test Service';

  const orderRes = await fetch(`${BASE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: userACookie },
    body: JSON.stringify({
      serviceId,
      serviceName,
      amount: 100,
      total: 100,
      customerName: 'Test User A',
      customerEmail: userAEmail,
      customerPhone: '+962791038472',
      notes: 'Security test order',
    }),
  });
  const orderData = await orderRes.json();
  const order = orderData.data as Record<string, unknown> | undefined;
  testOrderId = (order?.id as string) || '';
  console.log(`  ✓ Order created: ${testOrderId}`);
}

// ─── Tests ──────────────────────────────────────────────────

async function runTests() {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('  TEST SUITE: User B trying to access User A data');
  console.log('═══════════════════════════════════════════════════');

  // ── 1. GET /api/orders — should NOT return User A's orders ──
  console.log('');
  console.log('1. GET /api/orders (list)');
  {
    const res = await apiGet('/api/orders', userBCookie);
    const data = res.data as Record<string, unknown>;
    const orders = (data?.data as Array<Record<string, unknown>>) || [];
    const leakedA = orders.some(o => o.userId === userAId);
    const passed = !leakedA;
    results.push({ name: 'B cannot list A\'s orders', passed, status: res.status, detail: leakedA ? 'LEAKED' : 'Safe' });
    const icon = passed ? '✓' : '✗';
    console.log(`  ${icon} B cannot list A's orders [${res.status}] ${leakedA ? '— FAIL: LEAKED!' : '— Safe'}`);
  }

  // ── 2. GET /api/orders/{id} — should return 403 ──
  console.log('');
  console.log('2. GET /api/orders/{id}');
  if (testOrderId) {
    const res = await apiGet(`/api/orders/${testOrderId}`, userBCookie);
    test('B cannot read A\'s order by ID', res.status, true);
  } else {
    console.log('  ⚠ Skipped (no test order)');
  }

  // ── 3. GET /api/orders/{id}/timeline — should return 403 ──
  console.log('');
  console.log('3. GET /api/orders/{id}/timeline');
  if (testOrderId) {
    const res = await apiGet(`/api/orders/${testOrderId}/timeline`, userBCookie);
    test('B cannot read A\'s order timeline', res.status, true);
  } else {
    console.log('  ⚠ Skipped (no test order)');
  }

  // ── 4. GET /api/invoices — should NOT return A's invoices ──
  console.log('');
  console.log('4. GET /api/invoices (list)');
  {
    const res = await apiGet('/api/invoices', userBCookie);
    const data = res.data as Record<string, unknown>;
    const invoices = (data?.data as Array<Record<string, unknown>>) || [];
    const leakedA = invoices.some(inv => inv.userId === userAId);
    const passed = !leakedA;
    results.push({ name: 'B cannot list A\'s invoices', passed, status: res.status, detail: leakedA ? 'LEAKED' : 'Safe' });
    const icon = passed ? '✓' : '✗';
    console.log(`  ${icon} B cannot list A's invoices [${res.status}] ${leakedA ? '— FAIL: LEAKED!' : '— Safe'}`);

    // Grab an invoice ID from A's list for the next test
    if (!leakedA) {
      const aInvoices = await apiGet('/api/invoices', userACookie);
      const aData = aInvoices.data as Record<string, unknown>;
      const aInv = (aData?.data as Array<Record<string, unknown>>) || [];
      if (aInv.length > 0) testInvoiceId = (aInv[0].id as string) || '';
    }
  }

  // ── 5. GET /api/invoices/{id} — should return 403 ──
  console.log('');
  console.log('5. GET /api/invoices/{id}');
  if (testInvoiceId) {
    const res = await apiGet(`/api/invoices/${testInvoiceId}`, userBCookie);
    test('B cannot read A\'s invoice by ID', res.status, true);
  } else {
    console.log('  ⚠ Skipped (no test invoice)');
  }

  // ── 6. GET /api/payments — should NOT return A's payments ──
  console.log('');
  console.log('6. GET /api/payments (list)');
  {
    const res = await apiGet('/api/payments', userBCookie);
    const data = res.data as Record<string, unknown>;
    const payments = (data?.data as Array<Record<string, unknown>>) || [];
    const leakedA = payments.some(p => p.userId === userAId);
    const passed = !leakedA;
    results.push({ name: 'B cannot list A\'s payments', passed, status: res.status, detail: leakedA ? 'LEAKED' : 'Safe' });
    const icon = passed ? '✓' : '✗';
    console.log(`  ${icon} B cannot list A's payments [${res.status}] ${leakedA ? '— FAIL: LEAKED!' : '— Safe'}`);

    if (!leakedA) {
      const aPayments = await apiGet('/api/payments', userACookie);
      const aData = aPayments.data as Record<string, unknown>;
      const aPay = (aData?.data as Array<Record<string, unknown>>) || [];
      if (aPay.length > 0) testPaymentId = (aPay[0].id as string) || '';
    }
  }

  // ── 7. GET /api/payments/{id} — should return 403 ──
  console.log('');
  console.log('7. GET /api/payments/{id}');
  if (testPaymentId) {
    const res = await apiGet(`/api/payments/${testPaymentId}`, userBCookie);
    test('B cannot read A\'s payment by ID', res.status, true);
  } else {
    console.log('  ⚠ Skipped (no test payment)');
  }

  // ── 8. GET /api/notifications — should NOT return A's ──
  console.log('');
  console.log('8. GET /api/notifications (list)');
  {
    const res = await apiGet('/api/notifications', userBCookie);
    const data = res.data as Record<string, unknown>;
    const notifs = (data?.data as Array<Record<string, unknown>>) || [];
    const leakedA = notifs.some(n => n.userId === userAId);
    const passed = !leakedA;
    results.push({ name: 'B cannot list A\'s notifications', passed, status: res.status, detail: leakedA ? 'LEAKED' : 'Safe' });
    const icon = passed ? '✓' : '✗';
    console.log(`  ${icon} B cannot list A's notifications [${res.status}] ${leakedA ? '— FAIL: LEAKED!' : '— Safe'}`);

    if (!leakedA) {
      const aNotifs = await apiGet('/api/notifications', userACookie);
      const aData = aNotifs.data as Record<string, unknown>;
      const aN = (aData?.data as Array<Record<string, unknown>>) || [];
      if (aN.length > 0) testNotificationId = (aN[0].id as string) || '';
    }
  }

  // ── 9. PUT /api/notifications/{id}/read — should return 403 ──
  console.log('');
  console.log('9. PUT /api/notifications/{id}/read');
  if (testNotificationId) {
    const res = await apiPut(`/api/notifications/${testNotificationId}/read`, userBCookie);
    test('B cannot mark A\'s notification as read', res.status, true);
  } else {
    console.log('  ⚠ Skipped (no test notification)');
  }

  // ── 10. POST /api/payments/process — should return 403 ──
  console.log('');
  console.log('10. POST /api/payments/process (with A\'s orderId)');
  if (testOrderId) {
    const res = await fetch(`${BASE_URL}/api/payments/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: userBCookie },
      body: JSON.stringify({
        orderId: testOrderId,
        gatewayId: 'fake-gateway-id',
        amount: 100,
        currency: 'SAR',
        customerName: 'User B',
        customerEmail: userBEmail,
      }),
    });
    test('B cannot process payment for A\'s order', res.status, true);
  } else {
    console.log('  ⚠ Skipped (no test order)');
  }

  // ── 11. POST /api/payments/verify — should return 403 ──
  console.log('');
  console.log('11. POST /api/payments/verify (with A\'s orderId)');
  if (testOrderId) {
    const res = await fetch(`${BASE_URL}/api/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: userBCookie },
      body: JSON.stringify({
        orderId: testOrderId,
        transactionId: 'fake-txn-id',
        gatewayId: 'fake-gateway-id',
      }),
    });
    test('B cannot verify payment for A\'s order', res.status, true);
  } else {
    console.log('  ⚠ Skipped (no test order)');
  }

  // ── 12. GET /api/track/{orderNumber} — public endpoint, should not leak sensitive data ──
  console.log('');
  console.log('12. GET /api/track/{orderNumber} (public, check for data leakage)');
  if (testOrderId) {
    // Get order number from A's orders
    const aOrders = await apiGet('/api/orders', userACookie);
    const aData = aOrders.data as Record<string, unknown>;
    const aOrdersList = (aData?.data as Array<Record<string, unknown>>) || [];
    const testOrder = aOrdersList.find(o => o.id === testOrderId);
    const orderNumber = (testOrder?.orderNumber as string) || '';

    if (orderNumber) {
      const res = await apiGet(`/api/track/${orderNumber}`, userBCookie);
      const data = res.data as Record<string, unknown>;
      const innerData = (data?.data as Record<string, unknown>) || {};
      const leaksSensitive =
        innerData.customerEmail ||
        innerData.customerPhone ||
        innerData.transactionId ||
        innerData.gatewayData;
      const passed = !leaksSensitive;
      results.push({ name: 'Track endpoint does not leak sensitive data', passed, status: res.status });
      const icon = passed ? '✓' : '✗';
      console.log(`  ${icon} Track endpoint does not leak sensitive data [${res.status}] ${leaksSensitive ? '— FAIL: LEAKED!' : '— Safe'}`);
    } else {
      console.log('  ⚠ Skipped (could not get order number)');
    }
  } else {
    console.log('  ⚠ Skipped (no test order)');
  }
}

// ─── Report ─────────────────────────────────────────────────

function printReport() {
  console.log('');
  console.log('═══════════════════════════════════════════════════');
  console.log('  RESULTS');
  console.log('═══════════════════════════════════════════════════');
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  for (const r of results) {
    const icon = r.passed ? '✓' : '✗';
    const statusStr = r.status ? `[${r.status}]` : '';
    console.log(`  ${icon} ${r.name} ${statusStr}`);
  }

  console.log('');
  console.log(`  Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
  if (failed === 0) {
    console.log('  🎉 ALL TESTS PASSED — Data isolation is secure!');
  } else {
    console.log('  🚨 SECURITY FAILURES DETECTED — Fix required!');
  }
  console.log('');
}

// ─── Cleanup ────────────────────────────────────────────────

async function cleanup() {
  console.log('🧹 Cleaning up test data...');
  // Delete test users via Prisma (if running locally with DB access)
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.user.deleteMany({
      where: { email: { in: [userAEmail, userBEmail] } },
    });
    await prisma.$disconnect();
    console.log('  ✓ Test users deleted');
  } catch {
    console.log('  ⚠ Could not auto-delete test users. Delete manually if needed.');
  }
}

// ─── Main ───────────────────────────────────────────────────

async function main() {
  try {
    await setup();
    await runTests();
    printReport();
  } finally {
    await cleanup();
  }
}

main().catch(console.error);
