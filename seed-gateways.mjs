import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const DATABASE_URL = 'postgresql://neondb_owner:npg_0vEkqy9AGPsg@ep-frosty-violet-aug2spd0-pooler.c-10.us-east-1.aws.neon.tech/neondb?sslmode=verify-full';

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Check if payment_gateways exist
  const gateways = await prisma.paymentGateway.findMany();
  console.log(`Payment gateways in DB: ${gateways.length}`);
  
  if (gateways.length === 0) {
    console.log('No gateways found. Need to seed Tabby and Tamara.');
    
    // Create Tabby gateway
    const tabby = await prisma.paymentGateway.create({
      data: {
        name: 'تابي',
        slug: 'tabby',
        provider: 'TABBY',
        displayName: 'تابي - اشتر الآن وادفع لاحقاً',
        displayNameEn: 'Tabby - Buy Now Pay Later',
        description: 'قسّم المبلغ على 4 دفعات بدون فوائد',
        secretKey: 'placeholder_sandbox_key',
        environment: 'SANDBOX',
        isActive: true,
        isDefault: false,
        sortOrder: 1,
        supportsInstallments: true,
        supportedCurrencies: ['SAR'],
        supportedCountries: ['SA'],
      }
    });
    console.log('Created Tabby gateway:', tabby.id);
    
    // Create Tamara gateway
    const tamara = await prisma.paymentGateway.create({
      data: {
        name: 'تمارا',
        slug: 'tamara',
        provider: 'TAMARA',
        displayName: 'تمارا - اشتر الآن وادفع لاحقاً',
        displayNameEn: 'Tamara - Buy Now Pay Later',
        description: 'قسّم المبلغ على 3 دفعات بدون فوائد',
        secretKey: 'placeholder_sandbox_key',
        environment: 'SANDBOX',
        isActive: true,
        isDefault: false,
        sortOrder: 2,
        supportsInstallments: true,
        supportedCurrencies: ['SAR'],
        supportedCountries: ['SA'],
      }
    });
    console.log('Created Tamara gateway:', tamara.id);
  } else {
    console.log('Existing gateways:', gateways.map(g => `${g.slug} (${g.environment}, active: ${g.isActive})`));
  }
  
  await prisma.$disconnect();
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
