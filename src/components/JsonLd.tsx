/**
 * S4.8: JSON-LD structured data component.
 * Renders a <script type="application/ld+json"> tag for SEO.
 */

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({ '@context': 'https://schema.org', ...data }),
      }}
    />
  );
}

/** Organization schema for AFU — use in root layout */
export const AFU_ORGANIZATION = {
  '@type': 'Organization',
  name: 'African Farming Union',
  url: 'https://africanfarmingunion.org',
  logo: 'https://africanfarmingunion.org/afu-logo.svg',
  description:
    "Africa's integrated agriculture development platform providing financing, insurance, training, and market access across 20 countries.",
  foundingDate: '2024',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@africanfarmingunion.org',
    contactType: 'customer service',
    availableLanguage: ['English', 'French', 'Portuguese', 'Swahili', 'Arabic'],
  },
  areaServed: [
    'Botswana', 'Zimbabwe', 'Tanzania', 'Kenya', 'Nigeria', 'Zambia',
    'Mozambique', 'South Africa', 'Ghana', 'Uganda', 'Sierra Leone',
    'Egypt', 'Ethiopia', 'Malawi', 'Namibia', 'Guinea', 'Guinea-Bissau',
    'Liberia', 'Mali', 'Ivory Coast',
  ],
};

/** WebSite schema — use in root layout for sitelinks search */
export const AFU_WEBSITE = {
  '@type': 'WebSite',
  name: 'African Farming Union',
  url: 'https://africanfarmingunion.org',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://africanfarmingunion.org/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};
