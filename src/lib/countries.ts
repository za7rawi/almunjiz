export interface Country {
  code: string;
  name: string;
  nameEn: string;
  flag: string;
  dialCode: string;
  phonePattern: RegExp;
  phonePlaceholder: string;
  phoneLength: number;
}

export const countries: Country[] = [
  { code: 'SA', name: 'السعودية', nameEn: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966', phonePattern: /^05\d{8}$/, phonePlaceholder: '05XXXXXXXX', phoneLength: 10 },
  { code: 'AE', name: 'الإمارات', nameEn: 'UAE', flag: '🇦🇪', dialCode: '+971', phonePattern: /^05\d{8}$/, phonePlaceholder: '05XXXXXXXX', phoneLength: 10 },
  { code: 'KW', name: 'الكويت', nameEn: 'Kuwait', flag: '🇰🇼', dialCode: '+965', phonePattern: /^[569]\d{7}$/, phonePlaceholder: '5XXXXXXX', phoneLength: 8 },
  { code: 'BH', name: 'البحرين', nameEn: 'Bahrain', flag: '🇧🇭', dialCode: '+973', phonePattern: /^[36]\d{7}$/, phonePlaceholder: '3XXXXXXX', phoneLength: 8 },
  { code: 'QA', name: 'قطر', nameEn: 'Qatar', flag: '🇶🇦', dialCode: '+974', phonePattern: /^[3567]\d{7}$/, phonePlaceholder: '3XXXXXXX', phoneLength: 8 },
  { code: 'OM', name: 'عُمان', nameEn: 'Oman', flag: '🇴🇲', dialCode: '+968', phonePattern: /^[79]\d{7}$/, phonePlaceholder: '7XXXXXXX', phoneLength: 8 },
  { code: 'JO', name: 'الأردن', nameEn: 'Jordan', flag: '🇯🇴', dialCode: '+962', phonePattern: /^[79]\d{8}$/, phonePlaceholder: '7X XXXXXXX', phoneLength: 9 },
  { code: 'EG', name: 'مصر', nameEn: 'Egypt', flag: '🇪🇬', dialCode: '+20', phonePattern: /^1[0125]\d{8}$/, phonePlaceholder: '01XXXXXXXX', phoneLength: 10 },
  { code: 'LB', name: 'لبنان', nameEn: 'Lebanon', flag: '🇱🇧', dialCode: '+961', phonePattern: /^[37]\d{7}$/, phonePlaceholder: '7X XXXXXX', phoneLength: 8 },
  { code: 'IQ', name: 'العراق', nameEn: 'Iraq', flag: '🇮🇶', dialCode: '+964', phonePattern: /^7[3-9]\d{8}$/, phonePlaceholder: '7XX XXXXXXX', phoneLength: 10 },
  { code: 'MA', name: 'المغرب', nameEn: 'Morocco', flag: '🇲🇦', dialCode: '+212', phonePattern: /^[67]\d{8}$/, phonePlaceholder: '6XXXXXXXX', phoneLength: 9 },
  { code: 'TN', name: 'تونس', nameEn: 'Tunisia', flag: '🇹🇳', dialCode: '+216', phonePattern: /^[24579]\d{7}$/, phonePlaceholder: '2X XXX XXX', phoneLength: 8 },
  { code: 'DZ', name: 'الجزائر', nameEn: 'Algeria', flag: '🇩🇿', dialCode: '+213', phonePattern: /^[567]\d{8}$/, phonePlaceholder: '5XX XXX XXX', phoneLength: 9 },
  { code: 'LY', name: 'ليبيا', nameEn: 'Libya', flag: '🇱🇾', dialCode: '+218', phonePattern: /^[79]\d{8}$/, phonePlaceholder: '9X XXX XXXX', phoneLength: 9 },
  { code: 'SD', name: 'السودان', nameEn: 'Sudan', flag: '🇸🇩', dialCode: '+249', phonePattern: /^[91]\d{8}$/, phonePlaceholder: '9X XXX XXXX', phoneLength: 9 },
  { code: 'PS', name: 'فلسطين', nameEn: 'Palestine', flag: '🇵🇸', dialCode: '+970', phonePattern: /^5[69]\d{7}$/, phonePlaceholder: '5X XXX XXXX', phoneLength: 9 },
  { code: 'YE', name: 'اليمن', nameEn: 'Yemen', flag: '🇾🇪', dialCode: '+967', phonePattern: /^[7]\d{8}$/, phonePlaceholder: '7XX XXX XXX', phoneLength: 9 },
  { code: 'SY', name: 'سوريا', nameEn: 'Syria', flag: '🇸🇾', dialCode: '+963', phonePattern: /^[9]\d{8}$/, phonePlaceholder: '9XX XXX XXX', phoneLength: 9 },
  { code: 'TR', name: 'تركيا', nameEn: 'Turkey', flag: '🇹🇷', dialCode: '+90', phonePattern: /^[5]\d{9}$/, phonePlaceholder: '5XX XXX XX XX', phoneLength: 10 },
  { code: 'GB', name: 'بريطانيا', nameEn: 'United Kingdom', flag: '🇬🇧', dialCode: '+44', phonePattern: /^7\d{9}$/, phonePlaceholder: '7XXX XXX XXX', phoneLength: 10 },
  { code: 'US', name: 'أمريكا', nameEn: 'United States', flag: '🇺🇸', dialCode: '+1', phonePattern: /^[2-9]\d{9}$/, phonePlaceholder: '(XXX) XXX-XXXX', phoneLength: 10 },
  { code: 'FR', name: 'فرنسا', nameEn: 'France', flag: '🇫🇷', dialCode: '+33', phonePattern: /^[67]\d{8}$/, phonePlaceholder: '6XX XX XX XX', phoneLength: 9 },
  { code: 'DE', name: 'ألمانيا', nameEn: 'Germany', flag: '🇩🇪', dialCode: '+49', phonePattern: /^1[567]\d{8,9}$/, phonePlaceholder: '1XX XXXXXXXX', phoneLength: 11 },
  { code: 'IN', name: 'الهند', nameEn: 'India', flag: '🇮🇳', dialCode: '+91', phonePattern: /^[6-9]\d{9}$/, phonePlaceholder: '9XX XXX XXXX', phoneLength: 10 },
  { code: 'PK', name: 'باكستان', nameEn: 'Pakistan', flag: '🇵🇰', dialCode: '+92', phonePattern: /^3\d{9}$/, phonePlaceholder: '3XX XXX XXXX', phoneLength: 10 },
  { code: 'PH', name: 'الفلبين', nameEn: 'Philippines', flag: '🇵🇭', dialCode: '+63', phonePattern: /^9\d{9}$/, phonePlaceholder: '9XX XXX XXXX', phoneLength: 10 },
  { code: 'ID', name: 'إندونيسيا', nameEn: 'Indonesia', flag: '🇮🇩', dialCode: '+62', phonePattern: /^[8]\d{9,11}$/, phonePlaceholder: '8XX XXX XXXX', phoneLength: 11 },
  { code: 'MY', name: 'ماليزيا', nameEn: 'Malaysia', flag: '🇲🇾', dialCode: '+60', phonePattern: /^1\d{8,9}$/, phonePlaceholder: '1X XXX XXXX', phoneLength: 10 },
  { code: 'AU', name: 'أستراليا', nameEn: 'Australia', flag: '🇦🇺', dialCode: '+61', phonePattern: /^4\d{8}$/, phonePlaceholder: '4XX XXX XXX', phoneLength: 9 },
  { code: 'CA', name: 'كندا', nameEn: 'Canada', flag: '🇨🇦', dialCode: '+1', phonePattern: /^[2-9]\d{9}$/, phonePlaceholder: '(XXX) XXX-XXXX', phoneLength: 10 },
  { code: 'JP', name: 'اليابان', nameEn: 'Japan', flag: '🇯🇵', dialCode: '+81', phonePattern: /^[70-9]\d{8}$/, phonePlaceholder: '7X XXXX XXXX', phoneLength: 10 },
  { code: 'KR', name: 'كوريا', nameEn: 'South Korea', flag: '🇰🇷', dialCode: '+82', phonePattern: /^1[016-9]\d{7,8}$/, phonePlaceholder: '1X XXXX XXXX', phoneLength: 10 },
  { code: 'CN', name: 'الصين', nameEn: 'China', flag: '🇨🇳', dialCode: '+86', phonePattern: /^1[3-9]\d{9}$/, phonePlaceholder: '1XX XXXX XXXX', phoneLength: 11 },
  { code: 'RU', name: 'روسيا', nameEn: 'Russia', flag: '🇷🇺', dialCode: '+7', phonePattern: /^9\d{9}$/, phonePlaceholder: '9XX XXX XX XX', phoneLength: 10 },
  { code: 'IT', name: 'إيطاليا', nameEn: 'Italy', flag: '🇮🇹', dialCode: '+39', phonePattern: /^3\d{8,9}$/, phonePlaceholder: '3XX XXX XXXX', phoneLength: 10 },
  { code: 'ES', name: 'إسبانيا', nameEn: 'Spain', flag: '🇪🇸', dialCode: '+34', phonePattern: /^[6-9]\d{8}$/, phonePlaceholder: '6XX XXX XXX', phoneLength: 9 },
  { code: 'NL', name: 'هولندا', nameEn: 'Netherlands', flag: '🇳🇱', dialCode: '+31', phonePattern: /^6\d{8}$/, phonePlaceholder: '6XXXXXXXX', phoneLength: 9 },
];

export function getCountryByCode(code: string): Country | undefined {
  return countries.find(c => c.code === code);
}

export function getCountryByDialCode(dialCode: string): Country | undefined {
  return countries.find(c => c.dialCode === dialCode);
}

export function getDefaultCountry(): Country {
  return countries[0];
}

export function validatePhone(phone: string, country: Country): boolean {
  return country.phonePattern.test(phone);
}
