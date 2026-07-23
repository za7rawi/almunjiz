export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  excerpt: string;
  excerptEn: string;
  content: string;
  contentEn: string;
  author: string;
  authorEn: string;
  date: string;
  readTime: string;
  category: string;
  gradient: string;
  image: string;
}

export const blogCategories = [
  { id: 'all', label: 'الكل', labelEn: 'All' },
  { id: 'visas', label: 'التأشيرات', labelEn: 'Visas' },
  { id: 'vehicles', label: 'المركبات', labelEn: 'Vehicles' },
  { id: 'government', label: 'الخدمات الحكومية', labelEn: 'Government Services' },
  { id: 'travel', label: 'السفر والسياحة', labelEn: 'Travel & Tourism' },
  { id: 'tips', label: 'نصائح وإرشادات', labelEn: 'Tips & Guides' },
];

export const blogsData: BlogPost[] = [
  {
    id: '1',
    slug: 'visa-tourism-guide',
    title: 'دليل شامل لاستخراج التأشيرة السياحية',
    titleEn: 'Complete Guide to Tourist Visa Issuance',
    excerpt: 'تعرف على جميع الخطوات والمستندات المطلوبة للحصول على التأشيرة السياحية بسهولة وسرعة.',
    excerptEn: 'Learn all the steps and documents required to obtain a tourist visa easily and quickly.',
    content: `<p>يُعدّ التخطيط السليم أول خطوة نحو رحلة سياحية ناجحة. من أهم القرارات التي يجب اتخاذها قبل السفر هو التأكد من الحصول على التأشيرة المناسبة للوجهة المختارة.</p>

<h2>المستندات المطلوبة</h2>
<p>يختلف مجموع المستندات المطلوبة من دولة إلى أخرى، ولكن بشكل عام تشمل: جواز سفر ساري المفعول لمدة لا تقل عن 6 أشهر، صور شخصية بمواصفات محددة، كشف حساب بنكي يثبت القدرة المالية، حجز فندق وتأجير مركبة إن لزم الأمر، وتأمين سفر يغطي فترة الإقامة.</p>

<h2>خطوات التقديم</h2>
<p>ابدأ بجمع جميع المستندات المطلوبة وتأكد من اكتمالها. قم بملء طلب التأشيرة عبر الإنترنت بدقة تامة، ثم احجز موعداً في السفارة أو القنصلية. حضر الموعد في الوقت المحدد مع جميع الأصل والنسخ المطلوبة. في بعض الحالات، قد يُطلب منك مقابلة شخصية للتحقق من أهداف السفر.</p>

<h2>نصائح مهمة</h2>
<p>قدّم طلبك قبل موعد السفر بشهر على الأقل لتجنب أي تأخير. تأكد من أن جميع المعلومات المقدمة صحيحة ومتطابقة مع المستندات الأصلية. في حال رفض طلبك، لا تتردد في تقديم طلب جديد مع استيفاء الملاحظات المذكورة في خطاب الرفض.</p>

<h2>كيف يمكننا مساعدتك</h2>
<p>فريقنا في المنجز على استعداد لمساعدتك في جميع مراحل استخراج التأشيرة. نوفر لك استشارة مجانية لتحديد المستندات المطلوبة، ومساعدتك في ملء الطلبات، ومتابعة حالة طلبك حتى الحصول على التأشيرة.</p>`,
    contentEn: `<p>Proper planning is the first step toward a successful trip. One of the most important decisions to make before traveling is ensuring you have the appropriate visa for your chosen destination.</p>

<h2>Required Documents</h2>
<p>The set of required documents varies from country to country, but generally includes: a passport valid for at least 6 months, personal photos meeting specific requirements, a bank statement proving financial capability, hotel booking and car rental if necessary, and travel insurance covering the duration of stay.</p>

<h2>Application Steps</h2>
<p>Start by gathering all required documents and ensure they are complete. Fill out the visa application form accurately online, then book an appointment at the embassy or consulate. Attend the appointment on time with all original and copied documents. In some cases, you may be asked for a personal interview to verify travel intentions.</p>

<h2>Important Tips</h2>
<p>Submit your application at least a month before your travel date to avoid any delays. Make sure all information provided is accurate and matches the original documents. If your application is rejected, don't hesitate to submit a new one addressing the notes mentioned in the rejection letter.</p>

<h2>How We Can Help You</h2>
<p>Our team at Al-Munjiz is ready to assist you at every stage of visa issuance. We provide a free consultation to determine required documents, help you fill out applications, and follow up on your application status until you receive your visa.</p>`,
    author: 'فريق المنجز',
    authorEn: 'Al-Munjiz Team',
    date: '2025-07-15',
    readTime: '5 دقائق',
    category: 'visas',
    gradient: 'from-[#2580eb] to-[#14b8a6]',
    image: '',
  },
  {
    id: '2',
    slug: 'vehicle-transfer-tips',
    title: 'نصائح مهمة لنقل ملكية المركبات',
    titleEn: 'Important Tips for Vehicle Ownership Transfer',
    excerpt: 'إرشادات مفصلة لإنجاز إجراءات نقل ملكية المركبات بدون أي مشاكل أو تأخير.',
    excerptEn: 'Detailed guidance to complete vehicle ownership transfer procedures without any issues or delays.',
    content: `<p>نقل ملكية المركبة عملية تتطلب عناية بالتفاصيل وتحضير جيد لضمان إتمامها بنجاح. سواء كنت بائعاً أو مشترياً، فإن فهم الخطوات الصحيحة يوفر عليك الكثير من الوقت والجهد.</p>

<h2>المستندات المطلوبة من البائع</h2>
<p>يجب على البائع تجهيز: صورة من هوية البائع الأصلية، استمارة المركبة الأصلية، فاتورة المبيعات الموقعة من الطرفين، شهادة الفحص الفني سارية المفعول،以及 إثبات سداد جميع الغرامات المرورية.</p>

<h2>المستندات المطلوبة من المشتري</h2>
<p>يحتاج المشتري إلى: هوية شخصية سارية المفعول، بطاقة التأمين على المركبة، إثبات عنوان السكن الحالي. في حال كان المشتري شركة، يُشترط تقديم سجل تجاري وتصاريح خاصة.</p>

<h2>خطوات الإنجاز</h2>
<ol>
<li>تأكد من سداد جميع الغرامات المرورية للمركبة</li>
<li>احصل على شهادة الفحص الفني من مراكز الفحص المعتمدة</li>
<li>قم بزيارة إدارة المرور مع جميع المستندات المطلوبة</li>
<li>قم بتسجيل النقل واستلام الاستمارة الجديدة</li>
<li>حدّث التأمين على اسم المشتري الجديد</li>
</ol>

<h2>نصائح ذهبية</h2>
<p>تجنب إجراءات نقل الملكية وحيداً؛ يُفضل مرافقة الطرف الآخر لتسهيل الإجراءات. احتفظ بنسخ من جميع المستندات قبل تقديم الأصل. تأكد من تحديث بيانات المركبة في نظام التأمين فوراً.</p>`,
    contentEn: `<p>Vehicle ownership transfer is a process that requires attention to detail and good preparation to ensure successful completion. Whether you are a seller or a buyer, understanding the correct steps saves you a lot of time and effort.</p>

<h2>Documents Required from the Seller</h2>
<p>The seller must prepare: a copy of the seller's original ID, the original vehicle registration, a sales invoice signed by both parties, a valid technical inspection certificate, and proof of payment of all traffic violations.</p>

<h2>Documents Required from the Buyer</h2>
<p>The buyer needs: a valid personal ID, vehicle insurance certificate, proof of current address. If the buyer is a company, a commercial register and special permits are required.</p>

<h2>Completion Steps</h2>
<ol>
<li>Ensure all traffic violations for the vehicle are paid</li>
<li>Obtain the technical inspection certificate from approved inspection centers</li>
<li>Visit the traffic department with all required documents</li>
<li>Register the transfer and receive the new registration</li>
<li>Update the insurance under the new owner's name</li>
</ol>

<h2>Golden Tips</h2>
<p>Avoid handling ownership transfer procedures alone; it is preferable to accompany the other party to facilitate procedures. Keep copies of all documents before submitting originals. Make sure to update vehicle data in the insurance system immediately.</p>`,
    author: 'فريق المنجز',
    authorEn: 'Al-Munjiz Team',
    date: '2025-07-10',
    readTime: '6 دقائق',
    category: 'vehicles',
    gradient: 'from-[#7c3aed] to-[#2580eb]',
    image: '',
  },
  {
    id: '3',
    slug: 'government-services-online',
    title: 'كيفية التعامل مع المعاملات الحكومية إلكترونياً',
    titleEn: 'How to Handle Government Transactions Electronically',
    excerpt: 'شرح مبسط لأفضل طرق إنجاز المعاملات الحكومية عبر الأنظمة الإلكترونية الحديثة.',
    excerptEn: 'A simple explanation of the best ways to complete government transactions through modern electronic systems.',
    content: `<p>شهدت الأنظمة الحكومية في المملكة العربية السعودية تحولاً رقمياً كبيراً خلال السنوات الأخيرة. أصبح بإمكان المواطنين والمقيمين إنجاز معظم المعاملات الحكومية من منازلهم عبر الأنظمة الإلكترونية المتطورة.</p>

<h2>الأنظمة الإلكترونية الرئيسية</h2>
<p>تتوفر عدة منصات إلكترونية لإنجاز المعاملات الحكومية: منصة أبشر للمعاملات الإلكترونية، نظام معاملاتي للجهات الحكومية، منصة نور للخدمات التعليمية، ونظام مدد للخدمات الصحية. كل منصة تقدم مجموعة متنوعة من الخدمات التي تلبي احتياجات المواطنين والمقيمين.</p>

<h2>كيف تبدأ</h2>
<p>أولاً، قم بإنشاء حساب في منصة أبشر باستخدام رقم الهوية الوطنية. ثانياً، فعّل الخدمة الإلكترونية التي تحتاجها. ثالثاً، اتبع الخطوات المحددة لكل خدمة واملأ البيانات المطلوبة بدقة. رابعاً، ادفع أي رسوم مستحقة إلكترونياً عبر وسائل الدفع المتاحة.</p>

<h2>نصائح لتجربة سلسة</h2>
<p>تأكد من تحديث بياناتك الشخصية في النظام قبل تقديم أي طلب. استخدم متصفح الإنترنت الحديث لضمان التوافق مع المنصات الإلكترونية. احتفظ بسجل رقمي لجميع المعاملات التي تجريها إلكترونياً. في حال واجهت مشكلة، لا تتردد في التواصل مع الدعم الفني للمنصة.</p>

<h2>خدماتنا الإلكترونية</h2>
<p>في المنجز، نقدم خدمات مساعدة لإنجاز معاملاتك الحكومية بسهولة. فريقنا على استعداد لمساعدتك في理解和 استيفاء جميع المتطلبات الإلكترونية للحصول على أفضل نتيجة ممكنة.</p>`,
    contentEn: `<p>Government systems in Saudi Arabia have undergone a major digital transformation in recent years. Citizens and residents can now complete most government transactions from home through advanced electronic systems.</p>

<h2>Main Electronic Systems</h2>
<p>Several electronic platforms are available for government transactions: Absher for electronic transactions, Mudad system for government entities, Noor platform for educational services, and Mada for health services. Each platform offers a diverse range of services meeting the needs of citizens and residents.</p>

<h2>How to Get Started</h2>
<p>First, create an account on Absher using your national ID number. Second, activate the electronic service you need. Third, follow the specific steps for each service and fill in the required data accurately. Fourth, pay any applicable fees electronically through available payment methods.</p>

<h2>Tips for a Smooth Experience</h2>
<p>Make sure to update your personal data in the system before submitting any application. Use a modern web browser to ensure compatibility with electronic platforms. Keep a digital record of all transactions you perform electronically. If you encounter a problem, don't hesitate to contact the platform's technical support.</p>

<h2>Our Electronic Services</h2>
<p>At Al-Munjiz, we provide assistance services to complete your government transactions with ease. Our team is ready to help you understand and fulfill all electronic requirements for the best possible result.</p>`,
    author: 'فريق المنجز',
    authorEn: 'Al-Munjiz Team',
    date: '2025-07-05',
    readTime: '4 دقائق',
    category: 'government',
    gradient: 'from-[#14b8a6] to-[#10B981]',
    image: '',
  },
  {
    id: '4',
    slug: 'cheapest-tourist-destinations-2025',
    title: 'أرخص الوجهات السياحية لعام 2025',
    titleEn: 'Cheapest Tourist Destinations for 2025',
    excerpt: 'اكتشف أجمل الوجهات السياحية الاقتصادية التي تقدم تجربة مميزة بأسعار معقولة.',
    excerptEn: 'Discover the most beautiful affordable tourist destinations that offer a unique experience at reasonable prices.',
    content: `<p>لا يعني السفر بأقل تكلفة التخلي عن جودة التجربة السياحية. تتوفر العديد من الوجهات الرائعة التي تقدم خدمات ممتازة وتجارب لا تُنسى بأسعار في متناول الجميع.</p>

<h2>destination 1: جورجيا</h2>
<p>تُعدّ جورجيا من أرخص الوجهات الأوروبية للسياح العرب. تتميز بالطبيعة الخلابة والثقافة الغنية والطعام اللذيذ. يمكن قضاء أسبوع كامل بميزانية لا تتجاوز 500 دولار شاملة الإقامة والطعام والتنقل. العاصمة تبليسي تقدم تجربة حديثة مع أسعار معيشة منخفضة.</p>

<h2>destination 2: ماليزيا</h2>
<p>ماليزيا وجهة مثالية لمن يبحث عن تنوع ثقافي وطبيعي بأسعار معقولة. كوالالمبور تقدم خيارات فندقية واسعة بأسعار تنافسية، mentre جزر بورنאו تقدم مغامرات طبيعية فريدة. يمكن الاستمتاع بأسبوع في ماليزيا بميزانية تتراوح بين 400 إلى 700 دولار.</p>

<h2>destination 3: سريلانكا</h2>
<p>جزيرة سريلانكا توفر مزيجاً رائعاً من الشواطئ الجميلة والجبال الخضراء والمعابد التاريخية. تتميز بأسعار أقل بكثير من الوجهات السياحية المماثلة في جنوب شرق آسيا. تجربة سياحية متكاملة بتكلفة لا تتجاوز 350 دولار لأسبوع كامل.</p>

<h2>كيف نساعدك في الحجز</h2>
<p>فريقنا في المنجز على استعداد لمساعدتك في التخطيط لرحلتك واختيار أفضل العروض. نوفر لك استشارة مجانية لتحديد الميزانية المناسبة والوجهة المثالية لاحتياجاتك.</p>`,
    contentEn: `<p>Traveling on a budget doesn't mean compromising on the quality of your travel experience. Many wonderful destinations offer excellent services and unforgettable experiences at affordable prices.</p>

<h2>Destination 1: Georgia</h2>
<p>Georgia is one of the cheapest European destinations for Arab tourists. It features stunning nature, rich culture, and delicious food. A full week can be spent with a budget not exceeding $500 including accommodation, food, and transportation. The capital Tbilisi offers a modern experience with low living costs.</p>

<h2>Destination 2: Malaysia</h2>
<p>Malaysia is an ideal destination for those seeking cultural and natural diversity at reasonable prices. Kuala Lumpur offers a wide range of competitive hotel options, while the islands of Borneo offer unique natural adventures. A week in Malaysia can be enjoyed with a budget ranging from $400 to $700.</p>

<h2>Destination 3: Sri Lanka</h2>
<p>Sri Lanka offers a wonderful mix of beautiful beaches, green mountains, and historical temples. It features prices much lower than similar tourist destinations in Southeast Asia. A complete travel experience at a cost not exceeding $350 for a full week.</p>

<h2>How We Help You Book</h2>
<p>Our team at Al-Munjiz is ready to help you plan your trip and choose the best offers. We provide a free consultation to determine the appropriate budget and ideal destination for your needs.</p>`,
    author: 'فريق المنجز',
    authorEn: 'Al-Munjiz Team',
    date: '2025-06-28',
    readTime: '5 دقائق',
    category: 'travel',
    gradient: 'from-[#F59E0B] to-[#EF4444]',
    image: '',
  },
  {
    id: '5',
    slug: 'hotel-booking-guide',
    title: 'دليل حجز الفنادق بأفضل الأسعار',
    titleEn: 'Hotel Booking Guide at the Best Prices',
    excerpt: 'تعلم كيفية حجز الفنادق بأفضل الأسعار والحصول على أفضل قيمة مقابل أموالك.',
    excerptEn: 'Learn how to book hotels at the best prices and get the best value for your money.',
    content: `<p>يُعدّ حجز الفنادق من أهم عناصر التخطيط السياحي. اختيار الفندق المناسب بأفضل سعر يمكن أن يوفر لك مبالغ كبيرة ويجعل رحلتك أكثر راحة واستمتاعاً.</p>

<h2>أفضل أوقات الحجز</h2>
<p>يُنصح بالحجز مبكراً قبل موعد السفر بشهر على الأقل للحصول على أفضل الأسعار. كما أن الحجز في منتصف الأسبوع عادةً ما يكون أرخص من نهايته. فترات الذروة السياحية تشهد ارتفاعاً في الأسعار، لذا يُفضل الحجز خارج هذه الفترات إن أمكن.</p>

<h2>منصات الحجز</h2>
<p>تتوفر العديد من منصات الحجز الإلكترونية مثل بوكينج وagooda وTripAdvisor. يُنصح بمقارنة الأسعار عبر عدة منصات قبل اتخاذ القرار. بعض المنصات تقدم عروضاً حصرية ونقاط ولاء يمكن استخدامها في الحجوزات المستقبلية.</p>

<h2>نصائح للحصول على أفضل سعر</h2>
<ol>
<li>قارن الأسعار عبر عدة منصات حجز</li>
<li>اشترك في newsletters للحصول على عروض خاصة</li>
<li>استخدم نقاط الولاء ونقاط بطاقات الائتمان</li>
<li>احجز مباشرة من الموقع الرسمي للفندق أحياناً</li>
<li>استخدم كوبونات الخصم المتاحة عبر الإنترنت</li>
</ol>

<h2>خدمات الحجز في المنجز</h2>
<p>نوفر في المنجز خدمة حجز الفنادق بأسعار تنافسية وخيارات متنوعة تناسب جميع الميزانيات. فريقنا يساعك في اختيار الفندق المناسب ويضمن لك أفضل قيمة مقابل أموالك.</p>`,
    contentEn: `<p>Hotel booking is one of the most important elements of travel planning. Choosing the right hotel at the best price can save you a significant amount and make your trip more comfortable and enjoyable.</p>

<h2>Best Booking Times</h2>
<p>It is recommended to book at least a month before your travel date to get the best prices. Booking mid-week is usually cheaper than weekends. Peak tourist periods see price increases, so it is advisable to book outside these periods if possible.</p>

<h2>Booking Platforms</h2>
<p>Many electronic booking platforms are available such as Booking.com, Agoda, and TripAdvisor. It is recommended to compare prices across multiple platforms before making a decision. Some platforms offer exclusive deals and loyalty points that can be used for future bookings.</p>

<h2>Tips for Getting the Best Price</h2>
<ol>
<li>Compare prices across multiple booking platforms</li>
<li>Subscribe to newsletters for special offers</li>
<li>Use loyalty points and credit card points</li>
<li>Book directly from the hotel's official website sometimes</li>
<li>Use discount coupons available online</li>
</ol>

<h2>Booking Services at Al-Munjiz</h2>
<p>At Al-Munjiz, we provide hotel booking services at competitive prices with a variety of options to suit all budgets. Our team helps you choose the right hotel and ensures you get the best value for your money.</p>`,
    author: 'فريق المنجز',
    authorEn: 'Al-Munjiz Team',
    date: '2025-06-20',
    readTime: '4 دقائق',
    category: 'travel',
    gradient: 'from-[#2580eb] to-[#7c3aed]',
    image: '',
  },
  {
    id: '6',
    slug: 'choose-service-company',
    title: 'كيف تختار شركة خدمات موثوقة',
    titleEn: 'How to Choose a Reliable Service Company',
    excerpt: 'معايير مهمة يجب مراعاتها عند اختيار شركة خدمات إلكترونية لتلبية احتياجاتك.',
    excerptEn: 'Important criteria to consider when choosing an electronic services company to meet your needs.',
    content: `<p>تعددت شركات الخدمات الإلكترونية في الفترة الأخيرة، مما يجعل اختيار الشركة المناسبة أمراً يتطلب عناية ودراية. إليك أهم المعايير التي يجب مراعاتها قبل اتخاذ القرار.</p>

<h2>السمعة والتقييمات</h2>
<p>ابحث عن تقييمات العملاء السابقين على منصات مختلفة. اقرأ المراجعات الإيجابية والسلبية واحصل على صورة شاملة عن تجربة العملاء. تحقق من وجود شكاوى معروفة أو مشاكل متكررة. السمعة الجيدة مؤشر قوي على جودة الخدمة.</p>

<h2>الشفافية في الأسعار</h2>
<p>تأكد من وضوح جميع التكاليف قبل التعاقد. لا تتردد في السؤال عن أي رسوم إضافية مخفية. احصل على عرض سعر مكتوب وواضح يشمل جميع الخدمات. مقارنة الأسعار بين عدة شركات تساعدك في اتخاذ القرار الصحيح.</p>

<h2>جودة الخدمة والدعم</h2>
<p>تحقق من توفر دعم على مدار الساعة أو خلال ساعات عمل واضحة. سرعة الاستجابة للاستفسارات مؤشر مهم على اهتمام الشركة بعملائها. تأكد من وجود قنوات تواصل متعددة مثل الهاتف والبريد الإلكتروني والدردشة المباشرة.</p>

<h2>الضمانات وسياسة الاسترداد</h2>
<p>تأكد من وجود ضمان على الخدمات المقدمة. اسأل عن سياسة استرداد المبالغ في حال عدم رضاك عن الخدمة. احصل على توثيق مكتوب للضمانات المقدمة. الضمانات تعطيك ثقة في التعامل وحماية لأموالك.</p>

<h2>لماذا تختار المنجز</h2>
<p>نفخر في المنجز بتقديم خدمات إلكترونية متميزة بمعايير جودة عالية. نوفر شفافية كاملة في الأسعار، وضمانات على جميع خدماتنا، وفريق دعم متخصص على استعداد لمساعدتك في أي وقت.</p>`,
    contentEn: `<p>Electronic services companies have multiplied in recent years, making choosing the right company a matter that requires care and awareness. Here are the most important criteria to consider before making a decision.</p>

<h2>Reputation and Reviews</h2>
<p>Look for customer reviews on different platforms. Read positive and negative reviews to get a comprehensive picture of customer experience. Check for known complaints or recurring issues. A good reputation is a strong indicator of service quality.</p>

<h2>Price Transparency</h2>
<p>Make sure all costs are clear before signing a contract. Don't hesitate to ask about any hidden additional fees. Get a written and clear quote that includes all services. Comparing prices between multiple companies helps you make the right decision.</p>

<h2>Service Quality and Support</h2>
<p>Check the availability of round-the-clock support or clear working hours. Response speed to inquiries is an important indicator of the company's interest in its customers. Make sure there are multiple communication channels such as phone, email, and live chat.</p>

<h2>Guarantees and Refund Policy</h2>
<p>Make sure there is a guarantee on services provided. Ask about the refund policy if you are not satisfied with the service. Get written documentation of the guarantees provided. Guarantees give you confidence in dealing and protect your money.</p>

<h2>Why Choose Al-Munjiz</h2>
<p>At Al-Munjiz, we pride ourselves on providing distinguished electronic services with high quality standards. We offer full price transparency, guarantees on all our services, and a specialized support team ready to help you at any time.</p>`,
    author: 'فريق المنجز',
    authorEn: 'Al-Munjiz Team',
    date: '2025-06-15',
    readTime: '5 دقائق',
    category: 'tips',
    gradient: 'from-[#10B981] to-[#2580eb]',
    image: '',
  },
];
