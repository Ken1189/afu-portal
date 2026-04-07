// AFU operating countries (real)
export const AFU_COUNTRIES = [
  'Zimbabwe', 'Botswana', 'Kenya', 'Tanzania', 'South Africa',
  'Nigeria', 'Ghana', 'Uganda', 'Zambia', 'Mozambique',
];

// Full Africa list (for forms that allow any African country)
export const ALL_AFRICAN_COUNTRIES = [
  ...AFU_COUNTRIES,
  'Algeria', 'Angola', 'Benin', 'Burkina Faso', 'Burundi',
  'Cameroon', 'Cape Verde', 'Central African Republic', 'Chad', 'Comoros',
  'Congo (Brazzaville)', 'Congo (DRC)', 'Djibouti', 'Egypt', 'Equatorial Guinea',
  'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 'Guinea',
  'Guinea-Bissau', 'Ivory Coast', 'Lesotho', 'Liberia', 'Libya',
  'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco',
  'Namibia', 'Niger', 'Rwanda', 'Senegal',
  'Seychelles', 'Sierra Leone', 'Somalia', 'South Sudan',
  'Sudan', 'Togo', 'Tunisia',
];

// Worldwide (for ambassador signups, partners, etc.)
export const WORLD_COUNTRIES = [
  ...ALL_AFRICAN_COUNTRIES,
  'United Kingdom', 'Germany', 'France', 'Netherlands', 'Belgium',
  'Switzerland', 'Ireland', 'Portugal', 'Spain', 'Italy',
  'Sweden', 'Norway', 'Denmark', 'Finland', 'Austria',
  'Poland', 'Czech Republic', 'Greece', 'Romania', 'Hungary',
  'United States', 'Canada', 'Brazil', 'Mexico', 'Argentina',
  'Colombia', 'Chile', 'Peru', 'Jamaica', 'Trinidad and Tobago',
  'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain',
  'Oman', 'Israel', 'Jordan', 'Lebanon', 'Turkey',
  'India', 'China', 'Japan', 'South Korea', 'Singapore',
  'Malaysia', 'Thailand', 'Indonesia', 'Philippines', 'Vietnam',
  'Australia', 'New Zealand',
];
