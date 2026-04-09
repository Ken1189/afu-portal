// ============================================================================
// AFU Countries Library — canonical source of truth
// ============================================================================
// Every page that needs a country list or country metadata imports from here.
// To add / edit countries, update the COUNTRY_DATA table below.
// ============================================================================

export type CountryRegion =
  | 'East Africa'
  | 'West Africa'
  | 'Southern Africa'
  | 'Central Africa'
  | 'North Africa'
  | 'Europe'
  | 'North America'
  | 'South America'
  | 'Caribbean'
  | 'Middle East'
  | 'Asia'
  | 'Oceania';

export interface Country {
  name: string;
  code: string;            // ISO Alpha-2 (e.g. "KE")
  code3: string;           // ISO Alpha-3 (e.g. "KEN")
  flag: string;            // emoji flag
  currency: string;        // ISO 4217 currency code
  currencySymbol: string;  // display symbol
  phoneCode: string;       // international dial code e.g. "+254"
  region: CountryRegion;
  isAfuOperating: boolean; // part of the 11 AFU operating countries
}

// ============================================================================
// COUNTRY_DATA — the single source of truth
// ============================================================================

export const COUNTRY_DATA: Country[] = [
  // ─── AFU operating (11) ───
  { name: 'Zimbabwe',     code: 'ZW', code3: 'ZWE', flag: '🇿🇼', currency: 'USD', currencySymbol: '$',   phoneCode: '+263', region: 'Southern Africa', isAfuOperating: true },
  { name: 'Botswana',     code: 'BW', code3: 'BWA', flag: '🇧🇼', currency: 'BWP', currencySymbol: 'P',   phoneCode: '+267', region: 'Southern Africa', isAfuOperating: true },
  { name: 'Kenya',        code: 'KE', code3: 'KEN', flag: '🇰🇪', currency: 'KES', currencySymbol: 'KSh', phoneCode: '+254', region: 'East Africa',     isAfuOperating: true },
  { name: 'Tanzania',     code: 'TZ', code3: 'TZA', flag: '🇹🇿', currency: 'TZS', currencySymbol: 'TSh', phoneCode: '+255', region: 'East Africa',     isAfuOperating: true },
  { name: 'South Africa', code: 'ZA', code3: 'ZAF', flag: '🇿🇦', currency: 'ZAR', currencySymbol: 'R',   phoneCode: '+27',  region: 'Southern Africa', isAfuOperating: true },
  { name: 'Nigeria',      code: 'NG', code3: 'NGA', flag: '🇳🇬', currency: 'NGN', currencySymbol: '₦',   phoneCode: '+234', region: 'West Africa',     isAfuOperating: true },
  { name: 'Ghana',        code: 'GH', code3: 'GHA', flag: '🇬🇭', currency: 'GHS', currencySymbol: 'GH₵', phoneCode: '+233', region: 'West Africa',     isAfuOperating: true },
  { name: 'Uganda',       code: 'UG', code3: 'UGA', flag: '🇺🇬', currency: 'UGX', currencySymbol: 'USh', phoneCode: '+256', region: 'East Africa',     isAfuOperating: true },
  { name: 'Zambia',       code: 'ZM', code3: 'ZMB', flag: '🇿🇲', currency: 'ZMW', currencySymbol: 'K',   phoneCode: '+260', region: 'Southern Africa', isAfuOperating: true },
  { name: 'Mozambique',   code: 'MZ', code3: 'MOZ', flag: '🇲🇿', currency: 'MZN', currencySymbol: 'MT',  phoneCode: '+258', region: 'Southern Africa', isAfuOperating: true },
  { name: 'Ethiopia',     code: 'ET', code3: 'ETH', flag: '🇪🇹', currency: 'ETB', currencySymbol: 'Br',  phoneCode: '+251', region: 'East Africa',     isAfuOperating: true },

  // ─── Rest of Africa ───
  { name: 'Algeria',                  code: 'DZ', code3: 'DZA', flag: '🇩🇿', currency: 'DZD', currencySymbol: 'د.ج', phoneCode: '+213', region: 'North Africa',    isAfuOperating: false },
  { name: 'Angola',                   code: 'AO', code3: 'AGO', flag: '🇦🇴', currency: 'AOA', currencySymbol: 'Kz',  phoneCode: '+244', region: 'Southern Africa', isAfuOperating: false },
  { name: 'Benin',                    code: 'BJ', code3: 'BEN', flag: '🇧🇯', currency: 'XOF', currencySymbol: 'CFA', phoneCode: '+229', region: 'West Africa',     isAfuOperating: false },
  { name: 'Burkina Faso',             code: 'BF', code3: 'BFA', flag: '🇧🇫', currency: 'XOF', currencySymbol: 'CFA', phoneCode: '+226', region: 'West Africa',     isAfuOperating: false },
  { name: 'Burundi',                  code: 'BI', code3: 'BDI', flag: '🇧🇮', currency: 'BIF', currencySymbol: 'FBu', phoneCode: '+257', region: 'East Africa',     isAfuOperating: false },
  { name: 'Cameroon',                 code: 'CM', code3: 'CMR', flag: '🇨🇲', currency: 'XAF', currencySymbol: 'CFA', phoneCode: '+237', region: 'Central Africa',  isAfuOperating: false },
  { name: 'Cape Verde',               code: 'CV', code3: 'CPV', flag: '🇨🇻', currency: 'CVE', currencySymbol: '$',   phoneCode: '+238', region: 'West Africa',     isAfuOperating: false },
  { name: 'Central African Republic', code: 'CF', code3: 'CAF', flag: '🇨🇫', currency: 'XAF', currencySymbol: 'CFA', phoneCode: '+236', region: 'Central Africa',  isAfuOperating: false },
  { name: 'Chad',                     code: 'TD', code3: 'TCD', flag: '🇹🇩', currency: 'XAF', currencySymbol: 'CFA', phoneCode: '+235', region: 'Central Africa',  isAfuOperating: false },
  { name: 'Comoros',                  code: 'KM', code3: 'COM', flag: '🇰🇲', currency: 'KMF', currencySymbol: 'CF',  phoneCode: '+269', region: 'East Africa',     isAfuOperating: false },
  { name: 'Congo (Brazzaville)',      code: 'CG', code3: 'COG', flag: '🇨🇬', currency: 'XAF', currencySymbol: 'CFA', phoneCode: '+242', region: 'Central Africa',  isAfuOperating: false },
  { name: 'Congo (DRC)',              code: 'CD', code3: 'COD', flag: '🇨🇩', currency: 'CDF', currencySymbol: 'FC',  phoneCode: '+243', region: 'Central Africa',  isAfuOperating: false },
  { name: 'Djibouti',                 code: 'DJ', code3: 'DJI', flag: '🇩🇯', currency: 'DJF', currencySymbol: 'Fdj', phoneCode: '+253', region: 'East Africa',     isAfuOperating: false },
  { name: 'Egypt',                    code: 'EG', code3: 'EGY', flag: '🇪🇬', currency: 'EGP', currencySymbol: 'E£',  phoneCode: '+20',  region: 'North Africa',    isAfuOperating: false },
  { name: 'Equatorial Guinea',        code: 'GQ', code3: 'GNQ', flag: '🇬🇶', currency: 'XAF', currencySymbol: 'CFA', phoneCode: '+240', region: 'Central Africa',  isAfuOperating: false },
  { name: 'Eritrea',                  code: 'ER', code3: 'ERI', flag: '🇪🇷', currency: 'ERN', currencySymbol: 'Nfk', phoneCode: '+291', region: 'East Africa',     isAfuOperating: false },
  { name: 'Eswatini',                 code: 'SZ', code3: 'SWZ', flag: '🇸🇿', currency: 'SZL', currencySymbol: 'L',   phoneCode: '+268', region: 'Southern Africa', isAfuOperating: false },
  { name: 'Gabon',                    code: 'GA', code3: 'GAB', flag: '🇬🇦', currency: 'XAF', currencySymbol: 'CFA', phoneCode: '+241', region: 'Central Africa',  isAfuOperating: false },
  { name: 'Gambia',                   code: 'GM', code3: 'GMB', flag: '🇬🇲', currency: 'GMD', currencySymbol: 'D',   phoneCode: '+220', region: 'West Africa',     isAfuOperating: false },
  { name: 'Guinea',                   code: 'GN', code3: 'GIN', flag: '🇬🇳', currency: 'GNF', currencySymbol: 'FG',  phoneCode: '+224', region: 'West Africa',     isAfuOperating: false },
  { name: 'Guinea-Bissau',            code: 'GW', code3: 'GNB', flag: '🇬🇼', currency: 'XOF', currencySymbol: 'CFA', phoneCode: '+245', region: 'West Africa',     isAfuOperating: false },
  { name: 'Ivory Coast',              code: 'CI', code3: 'CIV', flag: '🇨🇮', currency: 'XOF', currencySymbol: 'CFA', phoneCode: '+225', region: 'West Africa',     isAfuOperating: false },
  { name: 'Lesotho',                  code: 'LS', code3: 'LSO', flag: '🇱🇸', currency: 'LSL', currencySymbol: 'L',   phoneCode: '+266', region: 'Southern Africa', isAfuOperating: false },
  { name: 'Liberia',                  code: 'LR', code3: 'LBR', flag: '🇱🇷', currency: 'LRD', currencySymbol: '$',   phoneCode: '+231', region: 'West Africa',     isAfuOperating: false },
  { name: 'Libya',                    code: 'LY', code3: 'LBY', flag: '🇱🇾', currency: 'LYD', currencySymbol: 'LD',  phoneCode: '+218', region: 'North Africa',    isAfuOperating: false },
  { name: 'Madagascar',               code: 'MG', code3: 'MDG', flag: '🇲🇬', currency: 'MGA', currencySymbol: 'Ar',  phoneCode: '+261', region: 'East Africa',     isAfuOperating: false },
  { name: 'Malawi',                   code: 'MW', code3: 'MWI', flag: '🇲🇼', currency: 'MWK', currencySymbol: 'MK',  phoneCode: '+265', region: 'Southern Africa', isAfuOperating: false },
  { name: 'Mali',                     code: 'ML', code3: 'MLI', flag: '🇲🇱', currency: 'XOF', currencySymbol: 'CFA', phoneCode: '+223', region: 'West Africa',     isAfuOperating: false },
  { name: 'Mauritania',               code: 'MR', code3: 'MRT', flag: '🇲🇷', currency: 'MRU', currencySymbol: 'UM',  phoneCode: '+222', region: 'West Africa',     isAfuOperating: false },
  { name: 'Mauritius',                code: 'MU', code3: 'MUS', flag: '🇲🇺', currency: 'MUR', currencySymbol: '₨',   phoneCode: '+230', region: 'East Africa',     isAfuOperating: false },
  { name: 'Morocco',                  code: 'MA', code3: 'MAR', flag: '🇲🇦', currency: 'MAD', currencySymbol: 'DH',  phoneCode: '+212', region: 'North Africa',    isAfuOperating: false },
  { name: 'Namibia',                  code: 'NA', code3: 'NAM', flag: '🇳🇦', currency: 'NAD', currencySymbol: '$',   phoneCode: '+264', region: 'Southern Africa', isAfuOperating: false },
  { name: 'Niger',                    code: 'NE', code3: 'NER', flag: '🇳🇪', currency: 'XOF', currencySymbol: 'CFA', phoneCode: '+227', region: 'West Africa',     isAfuOperating: false },
  { name: 'Rwanda',                   code: 'RW', code3: 'RWA', flag: '🇷🇼', currency: 'RWF', currencySymbol: 'FRw', phoneCode: '+250', region: 'East Africa',     isAfuOperating: false },
  { name: 'Senegal',                  code: 'SN', code3: 'SEN', flag: '🇸🇳', currency: 'XOF', currencySymbol: 'CFA', phoneCode: '+221', region: 'West Africa',     isAfuOperating: false },
  { name: 'Seychelles',               code: 'SC', code3: 'SYC', flag: '🇸🇨', currency: 'SCR', currencySymbol: '₨',   phoneCode: '+248', region: 'East Africa',     isAfuOperating: false },
  { name: 'Sierra Leone',             code: 'SL', code3: 'SLE', flag: '🇸🇱', currency: 'SLE', currencySymbol: 'Le',  phoneCode: '+232', region: 'West Africa',     isAfuOperating: false },
  { name: 'Somalia',                  code: 'SO', code3: 'SOM', flag: '🇸🇴', currency: 'SOS', currencySymbol: 'Sh',  phoneCode: '+252', region: 'East Africa',     isAfuOperating: false },
  { name: 'South Sudan',              code: 'SS', code3: 'SSD', flag: '🇸🇸', currency: 'SSP', currencySymbol: '£',   phoneCode: '+211', region: 'East Africa',     isAfuOperating: false },
  { name: 'Sudan',                    code: 'SD', code3: 'SDN', flag: '🇸🇩', currency: 'SDG', currencySymbol: '£',   phoneCode: '+249', region: 'North Africa',    isAfuOperating: false },
  { name: 'Togo',                     code: 'TG', code3: 'TGO', flag: '🇹🇬', currency: 'XOF', currencySymbol: 'CFA', phoneCode: '+228', region: 'West Africa',     isAfuOperating: false },
  { name: 'Tunisia',                  code: 'TN', code3: 'TUN', flag: '🇹🇳', currency: 'TND', currencySymbol: 'DT',  phoneCode: '+216', region: 'North Africa',    isAfuOperating: false },

  // ─── Europe ───
  { name: 'United Kingdom', code: 'GB', code3: 'GBR', flag: '🇬🇧', currency: 'GBP', currencySymbol: '£',   phoneCode: '+44',  region: 'Europe', isAfuOperating: false },
  { name: 'Germany',        code: 'DE', code3: 'DEU', flag: '🇩🇪', currency: 'EUR', currencySymbol: '€',   phoneCode: '+49',  region: 'Europe', isAfuOperating: false },
  { name: 'France',         code: 'FR', code3: 'FRA', flag: '🇫🇷', currency: 'EUR', currencySymbol: '€',   phoneCode: '+33',  region: 'Europe', isAfuOperating: false },
  { name: 'Netherlands',    code: 'NL', code3: 'NLD', flag: '🇳🇱', currency: 'EUR', currencySymbol: '€',   phoneCode: '+31',  region: 'Europe', isAfuOperating: false },
  { name: 'Belgium',        code: 'BE', code3: 'BEL', flag: '🇧🇪', currency: 'EUR', currencySymbol: '€',   phoneCode: '+32',  region: 'Europe', isAfuOperating: false },
  { name: 'Switzerland',    code: 'CH', code3: 'CHE', flag: '🇨🇭', currency: 'CHF', currencySymbol: 'Fr',  phoneCode: '+41',  region: 'Europe', isAfuOperating: false },
  { name: 'Ireland',        code: 'IE', code3: 'IRL', flag: '🇮🇪', currency: 'EUR', currencySymbol: '€',   phoneCode: '+353', region: 'Europe', isAfuOperating: false },
  { name: 'Portugal',       code: 'PT', code3: 'PRT', flag: '🇵🇹', currency: 'EUR', currencySymbol: '€',   phoneCode: '+351', region: 'Europe', isAfuOperating: false },
  { name: 'Spain',          code: 'ES', code3: 'ESP', flag: '🇪🇸', currency: 'EUR', currencySymbol: '€',   phoneCode: '+34',  region: 'Europe', isAfuOperating: false },
  { name: 'Italy',          code: 'IT', code3: 'ITA', flag: '🇮🇹', currency: 'EUR', currencySymbol: '€',   phoneCode: '+39',  region: 'Europe', isAfuOperating: false },
  { name: 'Sweden',         code: 'SE', code3: 'SWE', flag: '🇸🇪', currency: 'SEK', currencySymbol: 'kr',  phoneCode: '+46',  region: 'Europe', isAfuOperating: false },
  { name: 'Norway',         code: 'NO', code3: 'NOR', flag: '🇳🇴', currency: 'NOK', currencySymbol: 'kr',  phoneCode: '+47',  region: 'Europe', isAfuOperating: false },
  { name: 'Denmark',        code: 'DK', code3: 'DNK', flag: '🇩🇰', currency: 'DKK', currencySymbol: 'kr',  phoneCode: '+45',  region: 'Europe', isAfuOperating: false },
  { name: 'Finland',        code: 'FI', code3: 'FIN', flag: '🇫🇮', currency: 'EUR', currencySymbol: '€',   phoneCode: '+358', region: 'Europe', isAfuOperating: false },
  { name: 'Austria',        code: 'AT', code3: 'AUT', flag: '🇦🇹', currency: 'EUR', currencySymbol: '€',   phoneCode: '+43',  region: 'Europe', isAfuOperating: false },
  { name: 'Poland',         code: 'PL', code3: 'POL', flag: '🇵🇱', currency: 'PLN', currencySymbol: 'zł',  phoneCode: '+48',  region: 'Europe', isAfuOperating: false },
  { name: 'Czech Republic', code: 'CZ', code3: 'CZE', flag: '🇨🇿', currency: 'CZK', currencySymbol: 'Kč',  phoneCode: '+420', region: 'Europe', isAfuOperating: false },
  { name: 'Greece',         code: 'GR', code3: 'GRC', flag: '🇬🇷', currency: 'EUR', currencySymbol: '€',   phoneCode: '+30',  region: 'Europe', isAfuOperating: false },
  { name: 'Romania',        code: 'RO', code3: 'ROU', flag: '🇷🇴', currency: 'RON', currencySymbol: 'lei', phoneCode: '+40',  region: 'Europe', isAfuOperating: false },
  { name: 'Hungary',        code: 'HU', code3: 'HUN', flag: '🇭🇺', currency: 'HUF', currencySymbol: 'Ft',  phoneCode: '+36',  region: 'Europe', isAfuOperating: false },

  // ─── North America ───
  { name: 'United States', code: 'US', code3: 'USA', flag: '🇺🇸', currency: 'USD', currencySymbol: '$', phoneCode: '+1',  region: 'North America', isAfuOperating: false },
  { name: 'Canada',        code: 'CA', code3: 'CAN', flag: '🇨🇦', currency: 'CAD', currencySymbol: '$', phoneCode: '+1',  region: 'North America', isAfuOperating: false },
  { name: 'Mexico',        code: 'MX', code3: 'MEX', flag: '🇲🇽', currency: 'MXN', currencySymbol: '$', phoneCode: '+52', region: 'North America', isAfuOperating: false },

  // ─── South America ───
  { name: 'Brazil',    code: 'BR', code3: 'BRA', flag: '🇧🇷', currency: 'BRL', currencySymbol: 'R$', phoneCode: '+55', region: 'South America', isAfuOperating: false },
  { name: 'Argentina', code: 'AR', code3: 'ARG', flag: '🇦🇷', currency: 'ARS', currencySymbol: '$',  phoneCode: '+54', region: 'South America', isAfuOperating: false },
  { name: 'Colombia',  code: 'CO', code3: 'COL', flag: '🇨🇴', currency: 'COP', currencySymbol: '$',  phoneCode: '+57', region: 'South America', isAfuOperating: false },
  { name: 'Chile',     code: 'CL', code3: 'CHL', flag: '🇨🇱', currency: 'CLP', currencySymbol: '$',  phoneCode: '+56', region: 'South America', isAfuOperating: false },
  { name: 'Peru',      code: 'PE', code3: 'PER', flag: '🇵🇪', currency: 'PEN', currencySymbol: 'S/', phoneCode: '+51', region: 'South America', isAfuOperating: false },

  // ─── Caribbean ───
  { name: 'Jamaica',             code: 'JM', code3: 'JAM', flag: '🇯🇲', currency: 'JMD', currencySymbol: '$', phoneCode: '+1', region: 'Caribbean', isAfuOperating: false },
  { name: 'Trinidad and Tobago', code: 'TT', code3: 'TTO', flag: '🇹🇹', currency: 'TTD', currencySymbol: '$', phoneCode: '+1', region: 'Caribbean', isAfuOperating: false },

  // ─── Middle East ───
  { name: 'United Arab Emirates', code: 'AE', code3: 'ARE', flag: '🇦🇪', currency: 'AED', currencySymbol: 'د.إ',  phoneCode: '+971', region: 'Middle East', isAfuOperating: false },
  { name: 'Saudi Arabia',         code: 'SA', code3: 'SAU', flag: '🇸🇦', currency: 'SAR', currencySymbol: '﷼',    phoneCode: '+966', region: 'Middle East', isAfuOperating: false },
  { name: 'Qatar',                code: 'QA', code3: 'QAT', flag: '🇶🇦', currency: 'QAR', currencySymbol: 'ر.ق',  phoneCode: '+974', region: 'Middle East', isAfuOperating: false },
  { name: 'Kuwait',               code: 'KW', code3: 'KWT', flag: '🇰🇼', currency: 'KWD', currencySymbol: 'د.ك',  phoneCode: '+965', region: 'Middle East', isAfuOperating: false },
  { name: 'Bahrain',              code: 'BH', code3: 'BHR', flag: '🇧🇭', currency: 'BHD', currencySymbol: '.د.ب', phoneCode: '+973', region: 'Middle East', isAfuOperating: false },
  { name: 'Oman',                 code: 'OM', code3: 'OMN', flag: '🇴🇲', currency: 'OMR', currencySymbol: 'ر.ع.', phoneCode: '+968', region: 'Middle East', isAfuOperating: false },
  { name: 'Israel',               code: 'IL', code3: 'ISR', flag: '🇮🇱', currency: 'ILS', currencySymbol: '₪',    phoneCode: '+972', region: 'Middle East', isAfuOperating: false },
  { name: 'Jordan',               code: 'JO', code3: 'JOR', flag: '🇯🇴', currency: 'JOD', currencySymbol: 'د.ا',  phoneCode: '+962', region: 'Middle East', isAfuOperating: false },
  { name: 'Lebanon',              code: 'LB', code3: 'LBN', flag: '🇱🇧', currency: 'LBP', currencySymbol: 'ل.ل',  phoneCode: '+961', region: 'Middle East', isAfuOperating: false },
  { name: 'Turkey',               code: 'TR', code3: 'TUR', flag: '🇹🇷', currency: 'TRY', currencySymbol: '₺',    phoneCode: '+90',  region: 'Middle East', isAfuOperating: false },

  // ─── Asia ───
  { name: 'India',       code: 'IN', code3: 'IND', flag: '🇮🇳', currency: 'INR', currencySymbol: '₹',  phoneCode: '+91', region: 'Asia', isAfuOperating: false },
  { name: 'China',       code: 'CN', code3: 'CHN', flag: '🇨🇳', currency: 'CNY', currencySymbol: '¥',  phoneCode: '+86', region: 'Asia', isAfuOperating: false },
  { name: 'Japan',       code: 'JP', code3: 'JPN', flag: '🇯🇵', currency: 'JPY', currencySymbol: '¥',  phoneCode: '+81', region: 'Asia', isAfuOperating: false },
  { name: 'South Korea', code: 'KR', code3: 'KOR', flag: '🇰🇷', currency: 'KRW', currencySymbol: '₩',  phoneCode: '+82', region: 'Asia', isAfuOperating: false },
  { name: 'Singapore',   code: 'SG', code3: 'SGP', flag: '🇸🇬', currency: 'SGD', currencySymbol: '$',  phoneCode: '+65', region: 'Asia', isAfuOperating: false },
  { name: 'Malaysia',    code: 'MY', code3: 'MYS', flag: '🇲🇾', currency: 'MYR', currencySymbol: 'RM', phoneCode: '+60', region: 'Asia', isAfuOperating: false },
  { name: 'Thailand',    code: 'TH', code3: 'THA', flag: '🇹🇭', currency: 'THB', currencySymbol: '฿',  phoneCode: '+66', region: 'Asia', isAfuOperating: false },
  { name: 'Indonesia',   code: 'ID', code3: 'IDN', flag: '🇮🇩', currency: 'IDR', currencySymbol: 'Rp', phoneCode: '+62', region: 'Asia', isAfuOperating: false },
  { name: 'Philippines', code: 'PH', code3: 'PHL', flag: '🇵🇭', currency: 'PHP', currencySymbol: '₱',  phoneCode: '+63', region: 'Asia', isAfuOperating: false },
  { name: 'Vietnam',     code: 'VN', code3: 'VNM', flag: '🇻🇳', currency: 'VND', currencySymbol: '₫',  phoneCode: '+84', region: 'Asia', isAfuOperating: false },

  // ─── Oceania ───
  { name: 'Australia',   code: 'AU', code3: 'AUS', flag: '🇦🇺', currency: 'AUD', currencySymbol: '$', phoneCode: '+61', region: 'Oceania', isAfuOperating: false },
  { name: 'New Zealand', code: 'NZ', code3: 'NZL', flag: '🇳🇿', currency: 'NZD', currencySymbol: '$', phoneCode: '+64', region: 'Oceania', isAfuOperating: false },
];

// ============================================================================
// Derived lists (backward-compatible string exports)
// ============================================================================

const AFRICAN_REGIONS: CountryRegion[] = [
  'East Africa',
  'West Africa',
  'Southern Africa',
  'Central Africa',
  'North Africa',
];

export const AFRICAN_COUNTRIES_FULL: Country[] = COUNTRY_DATA.filter((c) =>
  AFRICAN_REGIONS.includes(c.region),
);

export const WORLD_COUNTRIES_FULL: Country[] = COUNTRY_DATA;

// Backward-compatible string[] exports (used by 32+ files post-sweep)
// All sorted alphabetically for consistent dropdowns
export const AFU_COUNTRIES: string[] = COUNTRY_DATA.filter((c) => c.isAfuOperating).map(
  (c) => c.name,
).sort();

export const ALL_AFRICAN_COUNTRIES: string[] = AFRICAN_COUNTRIES_FULL.map((c) => c.name).sort();

export const WORLD_COUNTRIES: string[] = COUNTRY_DATA.map((c) => c.name).sort();

// "Global" sentinel — use with spread: ['Global', ...ALL_AFRICAN_COUNTRIES]
export const GLOBAL_OPTION = 'Global';

// ============================================================================
// Helper functions
// ============================================================================

export function getCountryByCode(code: string): Country | undefined {
  if (!code) return undefined;
  const up = code.toUpperCase();
  return COUNTRY_DATA.find((c) => c.code === up || c.code3 === up);
}

export function getCountryByName(name: string): Country | undefined {
  if (!name) return undefined;
  return COUNTRY_DATA.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

export function getCountry(codeOrName: string): Country | undefined {
  return getCountryByCode(codeOrName) ?? getCountryByName(codeOrName);
}

export function getCurrency(codeOrName: string): string | undefined {
  return getCountry(codeOrName)?.currency;
}

export function getCurrencySymbol(codeOrName: string): string | undefined {
  return getCountry(codeOrName)?.currencySymbol;
}

export function getFlag(codeOrName: string): string | undefined {
  return getCountry(codeOrName)?.flag;
}

export function getPhoneCode(codeOrName: string): string | undefined {
  return getCountry(codeOrName)?.phoneCode;
}

export function getCountriesInRegion(region: CountryRegion): Country[] {
  return COUNTRY_DATA.filter((c) => c.region === region);
}

export function getRegionsList(): CountryRegion[] {
  return Array.from(new Set(COUNTRY_DATA.map((c) => c.region))) as CountryRegion[];
}
