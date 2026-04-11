/**
 * Page schemas for the unified Content Editor.
 *
 * Each schema describes one editable page (or chrome blob) on the public site.
 * The editor reads/writes the `draftKey` and copies it to `publishedKey` on publish.
 * The iframe loads `previewPath` (which should accept ?preview=draft).
 */

export type FieldType = 'text' | 'textarea' | 'richtext' | 'image' | 'string-list' | 'object-list';

export interface ItemFieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea';
}

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  itemFields?: ItemFieldDef[];
  defaultItem?: Record<string, string>;
  defaultString?: string;
}

export interface SectionDef {
  id: string;
  title: string;
  fields: FieldDef[];
}

export interface PageSchema {
  id: string;
  label: string;
  publishedKey: string;
  draftKey: string;
  previewPath: string;
  sections: SectionDef[];
}

export interface SchemaGroup {
  title: string;
  schemaIds: string[];
}

// ───────────────────────────────────────────────────────────────────────
// Homepage / Footer / About (existing)
// ───────────────────────────────────────────────────────────────────────

export const HOMEPAGE_SCHEMA: PageSchema = {
  id: 'homepage',
  label: 'Homepage',
  publishedKey: 'homepage_content_published',
  draftKey: 'homepage_content_draft',
  previewPath: '/?preview=draft',
  sections: [
    {
      id: 'hero',
      title: 'Hero',
      fields: [
        { key: 'hero_headline', label: 'Headline', type: 'text' },
        { key: 'hero_subtitle', label: 'Subtitle', type: 'textarea' },
        { key: 'hero_cta_text', label: 'CTA Button Text', type: 'text' },
        { key: 'hero_cta_link', label: 'CTA Button Link', type: 'text' },
        { key: 'hero_bg_image', label: 'Background Image', type: 'image' },
        { key: 'hero_badge_text', label: 'Badge Text', type: 'text' },
      ],
    },
    {
      id: 'stats',
      title: 'Stats Section',
      fields: [
        { key: 'stats_eyebrow', label: 'Eyebrow', type: 'text' },
        { key: 'stats_title', label: 'Title', type: 'text' },
        { key: 'stats_subtitle', label: 'Subtitle', type: 'textarea' },
      ],
    },
    {
      id: 'services',
      title: 'Services Section Header',
      fields: [
        { key: 'services_eyebrow', label: 'Eyebrow', type: 'text' },
        { key: 'services_title', label: 'Title', type: 'text' },
        { key: 'services_subtitle', label: 'Subtitle', type: 'textarea' },
      ],
    },
    {
      id: 'programs',
      title: 'Programs Section Header',
      fields: [
        { key: 'programs_eyebrow', label: 'Eyebrow', type: 'text' },
        { key: 'programs_title', label: 'Title', type: 'text' },
        { key: 'programs_subtitle', label: 'Subtitle', type: 'textarea' },
      ],
    },
    {
      id: 'flywheel',
      title: 'AFU Flywheel',
      fields: [
        { key: 'flywheel_eyebrow', label: 'Eyebrow', type: 'text' },
        { key: 'flywheel_title', label: 'Title', type: 'text' },
        { key: 'flywheel_subtitle', label: 'Subtitle', type: 'textarea' },
        {
          key: 'flywheel_labels',
          label: 'Step Labels (7 steps)',
          type: 'string-list',
          defaultString: 'Step',
        },
        { key: 'flywheel_recycle_text', label: 'Recycle Caption', type: 'text' },
      ],
    },
    {
      id: 'how_it_works',
      title: 'How It Works',
      fields: [
        { key: 'how_it_works_eyebrow', label: 'Eyebrow', type: 'text' },
        { key: 'how_it_works_title', label: 'Title', type: 'text' },
        { key: 'how_it_works_subtitle', label: 'Subtitle', type: 'textarea' },
        {
          key: 'how_it_works_steps',
          label: 'Steps',
          type: 'object-list',
          itemFields: [
            { key: 'step', label: 'Step #', type: 'text' },
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'desc', label: 'Description', type: 'textarea' },
          ],
          defaultItem: { step: '01', title: 'New Step', desc: '' },
        },
      ],
    },
    {
      id: 'ai',
      title: 'AI / Technology Feature',
      fields: [
        { key: 'ai_eyebrow', label: 'Eyebrow', type: 'text' },
        { key: 'ai_title', label: 'Title', type: 'text' },
        { key: 'ai_body', label: 'Body Text', type: 'textarea' },
        { key: 'ai_features', label: 'Feature Bullets', type: 'string-list', defaultString: 'New feature' },
        { key: 'ai_link_text', label: 'Link Text', type: 'text' },
        { key: 'ai_image', label: 'Image URL', type: 'image' },
      ],
    },
    {
      id: 'investor',
      title: 'Investor Section',
      fields: [
        { key: 'investor_eyebrow', label: 'Badge Text', type: 'text' },
        { key: 'investor_title_pre', label: 'Title (Pre Highlight)', type: 'text' },
        { key: 'investor_title_highlight', label: 'Title Highlight Word', type: 'text' },
        { key: 'investor_body', label: 'Body Text', type: 'textarea' },
      ],
    },
    {
      id: 'promise',
      title: 'Our Promise Section',
      fields: [
        { key: 'promise_eyebrow', label: 'Eyebrow', type: 'text' },
        { key: 'promise_title', label: 'Title', type: 'text' },
        { key: 'promise_subtitle', label: 'Subtitle', type: 'textarea' },
      ],
    },
    {
      id: 'showup',
      title: '"We Show Up" Section',
      fields: [
        { key: 'showup_eyebrow', label: 'Eyebrow', type: 'text' },
        { key: 'showup_title', label: 'Title', type: 'text' },
        { key: 'showup_subtitle', label: 'Subtitle', type: 'textarea' },
      ],
    },
    {
      id: 'sponsor',
      title: 'Sponsor a Farmer Section',
      fields: [
        { key: 'sponsor_eyebrow', label: 'Eyebrow', type: 'text' },
        { key: 'sponsor_title', label: 'Title (plain text overrides default)', type: 'text' },
        { key: 'sponsor_subtitle', label: 'Subtitle', type: 'textarea' },
      ],
    },
    {
      id: 'final_cta',
      title: 'Final CTA',
      fields: [
        { key: 'final_cta_title', label: 'Title', type: 'text' },
        { key: 'final_cta_body', label: 'Body Text', type: 'textarea' },
        { key: 'final_cta_primary_text', label: 'Primary Button Text', type: 'text' },
        { key: 'final_cta_primary_link', label: 'Primary Button Link', type: 'text' },
        { key: 'final_cta_secondary_text', label: 'Secondary Button Text', type: 'text' },
        { key: 'final_cta_secondary_link', label: 'Secondary Button Link', type: 'text' },
      ],
    },
  ],
};

export const FOOTER_SCHEMA: PageSchema = {
  id: 'footer',
  label: 'Footer',
  publishedKey: 'footer_config',
  draftKey: 'footer_config_draft',
  previewPath: '/?preview=draft',
  sections: [
    {
      id: 'main',
      title: 'Footer Mission & Branding',
      fields: [{ key: 'mission', label: 'Mission Statement', type: 'textarea' }],
    },
    {
      id: 'columns',
      title: 'Footer Link Columns (advanced — edit JSON via Site Content tab)',
      fields: [],
    },
  ],
};

export const ABOUT_SCHEMA: PageSchema = {
  id: 'about',
  label: 'About',
  publishedKey: 'about_content_published',
  draftKey: 'about_content_draft',
  previewPath: '/about?preview=draft',
  sections: [
    {
      id: 'hero',
      title: 'About Hero',
      fields: [
        { key: 'hero_title', label: 'Hero Title', type: 'text' },
        { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'text' },
        { key: 'hero_body', label: 'Hero Body', type: 'textarea' },
        { key: 'hero_image', label: 'Hero Image URL', type: 'image' },
      ],
    },
    {
      id: 'mission',
      title: 'Mission Section',
      fields: [
        { key: 'mission_title', label: 'Mission Title', type: 'text' },
        { key: 'mission_body', label: 'Mission Body', type: 'textarea' },
      ],
    },
  ],
};

// ───────────────────────────────────────────────────────────────────────
// Service pages — uniform shape
// ───────────────────────────────────────────────────────────────────────

function makeServiceSchema(slug: string, label: string): PageSchema {
  return {
    id: `service_${slug}`,
    label,
    publishedKey: `service_${slug}`,
    draftKey: `service_${slug}_draft`,
    previewPath: `/services/${slug}?preview=draft`,
    sections: [
      {
        id: 'hero',
        title: 'Hero',
        fields: [
          { key: 'hero_title', label: 'Hero Title', type: 'text' },
          { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
          { key: 'hero_image', label: 'Hero Image URL', type: 'image' },
        ],
      },
      {
        id: 'features',
        title: 'Features',
        fields: [
          {
            key: 'features',
            label: 'Features',
            type: 'object-list',
            itemFields: [
              { key: 'title', label: 'Title', type: 'text' },
              { key: 'description', label: 'Description', type: 'textarea' },
              { key: 'icon', label: 'Icon (emoji)', type: 'text' },
            ],
            defaultItem: { title: 'New feature', description: '', icon: 'sparkles' },
          },
        ],
      },
      {
        id: 'how_it_works',
        title: 'How It Works',
        fields: [
          {
            key: 'how_it_works',
            label: 'Steps',
            type: 'object-list',
            itemFields: [
              { key: 'step', label: 'Step #', type: 'text' },
              { key: 'title', label: 'Title', type: 'text' },
              { key: 'description', label: 'Description', type: 'textarea' },
            ],
            defaultItem: { step: '1', title: 'New step', description: '' },
          },
        ],
      },
      {
        id: 'stats',
        title: 'Stats',
        fields: [
          {
            key: 'stats',
            label: 'Stats',
            type: 'object-list',
            itemFields: [
              { key: 'value', label: 'Value', type: 'text' },
              { key: 'label', label: 'Label', type: 'text' },
              { key: 'sub', label: 'Sub-label', type: 'text' },
            ],
            defaultItem: { value: '', label: '', sub: '' },
          },
        ],
      },
      {
        id: 'cta',
        title: 'Call to Action',
        fields: [
          { key: 'cta_text', label: 'CTA Text', type: 'text' },
          { key: 'cta_link', label: 'CTA Link', type: 'text' },
        ],
      },
    ],
  };
}

export const SERVICE_FINANCING_SCHEMA = makeServiceSchema('financing', 'Financing');
export const SERVICE_INSURANCE_SCHEMA = makeServiceSchema('insurance', 'Insurance');
export const SERVICE_TRAINING_SCHEMA = makeServiceSchema('training', 'Training');
export const SERVICE_VETERINARY_SCHEMA = makeServiceSchema('veterinary', 'Veterinary');
export const SERVICE_INPUTS_SCHEMA = makeServiceSchema('inputs', 'Inputs');
export const SERVICE_PROCESSING_SCHEMA = makeServiceSchema('processing', 'Processing');
export const SERVICE_OFFTAKE_SCHEMA = makeServiceSchema('offtake', 'Offtake');
export const SERVICE_TRADE_FINANCE_SCHEMA = makeServiceSchema('trade-finance', 'Trade Finance');
export const SERVICE_LEGAL_ASSISTANCE_SCHEMA = makeServiceSchema('legal-assistance', 'Legal Assistance');

// ───────────────────────────────────────────────────────────────────────
// Page chrome schemas (text-only marketing chrome around dynamic pages)
// ───────────────────────────────────────────────────────────────────────

export const AMBASSADORS_CHROME_SCHEMA: PageSchema = {
  id: 'page_chrome_ambassadors',
  label: 'Ambassadors',
  publishedKey: 'page_chrome_ambassadors',
  draftKey: 'page_chrome_ambassadors_draft',
  previewPath: '/ambassadors?preview=draft',
  sections: [
    {
      id: 'hero',
      title: 'Hero',
      fields: [
        { key: 'hero_badge', label: 'Hero Badge', type: 'text' },
        { key: 'hero_title', label: 'Hero Title', type: 'text' },
        { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
        { key: 'hero_cta_text', label: 'Hero CTA Text', type: 'text' },
      ],
    },
    {
      id: 'stats',
      title: 'Stats',
      fields: [
        { key: 'stat1_value', label: 'Stat 1 Value', type: 'text' },
        { key: 'stat1_label', label: 'Stat 1 Label', type: 'text' },
        { key: 'stat2_value', label: 'Stat 2 Value', type: 'text' },
        { key: 'stat2_label', label: 'Stat 2 Label', type: 'text' },
        { key: 'stat3_value', label: 'Stat 3 Value', type: 'text' },
        { key: 'stat3_label', label: 'Stat 3 Label', type: 'text' },
      ],
    },
    {
      id: 'sections',
      title: 'Section Titles',
      fields: [
        { key: 'how_it_works_title', label: 'How It Works Title', type: 'text' },
        { key: 'tiers_title', label: 'Tiers Title', type: 'text' },
        { key: 'apply_title', label: 'Apply Title', type: 'text' },
      ],
    },
  ],
};

export const SPONSOR_CHROME_SCHEMA: PageSchema = {
  id: 'page_chrome_sponsor',
  label: 'Sponsor',
  publishedKey: 'page_chrome_sponsor',
  draftKey: 'page_chrome_sponsor_draft',
  previewPath: '/sponsor?preview=draft',
  sections: [
    {
      id: 'hero',
      title: 'Hero',
      fields: [
        { key: 'hero_badge', label: 'Hero Badge', type: 'text' },
        { key: 'hero_title', label: 'Hero Title', type: 'text' },
        { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
        { key: 'hero_cta1_text', label: 'Hero CTA 1 Text', type: 'text' },
        { key: 'hero_cta2_text', label: 'Hero CTA 2 Text', type: 'text' },
      ],
    },
    {
      id: 'sections',
      title: 'Section Titles',
      fields: [
        { key: 'how_it_works_title', label: 'How It Works Title', type: 'text' },
        { key: 'tiers_title', label: 'Tiers Title', type: 'text' },
        { key: 'farmers_title', label: 'Farmers Title', type: 'text' },
        { key: 'impact_title', label: 'Impact Title', type: 'text' },
      ],
    },
    {
      id: 'final_cta',
      title: 'Final CTA',
      fields: [
        { key: 'final_cta_title', label: 'Final CTA Title', type: 'text' },
        { key: 'final_cta_body', label: 'Final CTA Body', type: 'textarea' },
      ],
    },
    {
      id: 'impact_stats',
      title: 'Impact Stats',
      fields: [
        {
          key: 'impact_stats',
          label: 'Impact Stats',
          type: 'object-list',
          itemFields: [
            { key: 'value', label: 'Value', type: 'text' },
            { key: 'label', label: 'Label', type: 'text' },
          ],
          defaultItem: { value: '', label: '' },
        },
      ],
    },
  ],
};

export const PARTNERS_CHROME_SCHEMA: PageSchema = {
  id: 'page_chrome_partners',
  label: 'Partners',
  publishedKey: 'page_chrome_partners',
  draftKey: 'page_chrome_partners_draft',
  previewPath: '/partners?preview=draft',
  sections: [
    {
      id: 'hero',
      title: 'Hero',
      fields: [
        { key: 'hero_badge', label: 'Hero Badge', type: 'text' },
        { key: 'hero_title', label: 'Hero Title', type: 'text' },
        { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
      ],
    },
    {
      id: 'cta',
      title: 'CTA',
      fields: [
        { key: 'cta_title', label: 'CTA Title', type: 'text' },
        { key: 'cta_body', label: 'CTA Body', type: 'textarea' },
        { key: 'cta_price_text', label: 'CTA Price Text', type: 'text' },
      ],
    },
    {
      id: 'tabs',
      title: 'Tabs & Empty States',
      fields: [
        { key: 'tab_labels', label: 'Tab Labels', type: 'string-list', defaultString: 'Tab' },
        {
          key: 'empty_state_titles',
          label: 'Empty State Titles',
          type: 'string-list',
          defaultString: 'No results',
        },
        {
          key: 'empty_state_bodies',
          label: 'Empty State Bodies',
          type: 'string-list',
          defaultString: '',
        },
      ],
    },
  ],
};

export const CONTACT_CHROME_SCHEMA: PageSchema = {
  id: 'page_chrome_contact',
  label: 'Contact',
  publishedKey: 'page_chrome_contact',
  draftKey: 'page_chrome_contact_draft',
  previewPath: '/contact?preview=draft',
  sections: [
    {
      id: 'hero',
      title: 'Hero',
      fields: [
        { key: 'hero_title', label: 'Hero Title', type: 'text' },
        { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
      ],
    },
    {
      id: 'form',
      title: 'Form',
      fields: [
        { key: 'form_title', label: 'Form Title', type: 'text' },
        { key: 'success_title', label: 'Success Title', type: 'text' },
        { key: 'success_body', label: 'Success Body', type: 'textarea' },
      ],
    },
    {
      id: 'info',
      title: 'Info Cards',
      fields: [
        {
          key: 'info_card_labels',
          label: 'Info Card Labels',
          type: 'string-list',
          defaultString: 'Label',
        },
      ],
    },
  ],
};

export const COUNTRIES_CHROME_SCHEMA: PageSchema = {
  id: 'page_chrome_countries',
  label: 'Countries',
  publishedKey: 'page_chrome_countries',
  draftKey: 'page_chrome_countries_draft',
  previewPath: '/countries?preview=draft',
  sections: [
    {
      id: 'hero',
      title: 'Hero',
      fields: [
        { key: 'hero_badge', label: 'Hero Badge', type: 'text' },
        { key: 'hero_title', label: 'Hero Title', type: 'text' },
        { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
      ],
    },
    {
      id: 'section',
      title: 'Section Header',
      fields: [
        { key: 'section_eyebrow', label: 'Section Eyebrow', type: 'text' },
        { key: 'section_title', label: 'Section Title', type: 'text' },
      ],
    },
    {
      id: 'cta',
      title: 'CTA',
      fields: [
        { key: 'cta_title', label: 'CTA Title', type: 'text' },
        { key: 'cta_body', label: 'CTA Body', type: 'textarea' },
      ],
    },
  ],
};

export const FAQ_CHROME_SCHEMA: PageSchema = {
  id: 'page_chrome_faq',
  label: 'FAQ',
  publishedKey: 'page_chrome_faq',
  draftKey: 'page_chrome_faq_draft',
  previewPath: '/faq?preview=draft',
  sections: [
    {
      id: 'hero',
      title: 'Hero',
      fields: [
        { key: 'hero_badge', label: 'Hero Badge', type: 'text' },
        { key: 'hero_title', label: 'Hero Title', type: 'text' },
        { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
      ],
    },
    {
      id: 'cta',
      title: 'CTA',
      fields: [
        { key: 'cta_title', label: 'CTA Title', type: 'text' },
        { key: 'cta_body', label: 'CTA Body', type: 'textarea' },
        { key: 'cta_button', label: 'CTA Button', type: 'text' },
      ],
    },
  ],
};

export const CARBON_CHROME_SCHEMA: PageSchema = {
  id: 'page_chrome_carbon',
  label: 'Carbon',
  publishedKey: 'page_chrome_carbon',
  draftKey: 'page_chrome_carbon_draft',
  previewPath: '/carbon?preview=draft',
  sections: [
    {
      id: 'hero',
      title: 'Hero',
      fields: [
        { key: 'hero_badge', label: 'Hero Badge', type: 'text' },
        { key: 'hero_title', label: 'Hero Title', type: 'text' },
        { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
      ],
    },
    {
      id: 'how',
      title: 'How Section',
      fields: [
        { key: 'how_section_title', label: 'How Section Title', type: 'text' },
        { key: 'how_section_body', label: 'How Section Body', type: 'textarea' },
      ],
    },
    {
      id: 'stats',
      title: 'Stat Labels',
      fields: [
        {
          key: 'stat_labels',
          label: 'Stat Labels',
          type: 'string-list',
          defaultString: 'Label',
        },
      ],
    },
    {
      id: 'impact',
      title: 'Impact Items',
      fields: [
        {
          key: 'impact_items',
          label: 'Impact Items',
          type: 'object-list',
          itemFields: [
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'body', label: 'Body', type: 'textarea' },
          ],
          defaultItem: { title: '', body: '' },
        },
      ],
    },
  ],
};

// ───────────────────────────────────────────────────────────────────────
// Big page schemas
// ───────────────────────────────────────────────────────────────────────

export const INVESTORS_SCHEMA: PageSchema = {
  id: 'page_investors',
  label: 'Investors',
  publishedKey: 'page_investors',
  draftKey: 'page_investors_draft',
  previewPath: '/investors?preview=draft',
  sections: [
    {
      id: 'hero',
      title: 'Hero',
      fields: [
        { key: 'hero_badge', label: 'Badge', type: 'text' },
        { key: 'hero_title', label: 'Title', type: 'text' },
        { key: 'hero_subtitle', label: 'Subtitle', type: 'textarea' },
        { key: 'hero_cta1_text', label: 'Primary CTA Text', type: 'text' },
        { key: 'hero_cta2_text', label: 'Secondary CTA Text', type: 'text' },
        { key: 'hero_image_url', label: 'Hero Image URL', type: 'image' },
      ],
    },
    {
      id: 'opportunity',
      title: 'Opportunity',
      fields: [
        { key: 'opportunity_eyebrow', label: 'Eyebrow', type: 'text' },
        { key: 'opportunity_title', label: 'Title', type: 'text' },
        { key: 'opportunity_intro', label: 'Intro', type: 'textarea' },
        {
          key: 'opportunity_stats',
          label: 'Stats',
          type: 'object-list',
          itemFields: [
            { key: 'value', label: 'Value', type: 'text' },
            { key: 'label', label: 'Label', type: 'text' },
          ],
          defaultItem: { value: '', label: '' },
        },
      ],
    },
    {
      id: 'why_afu',
      title: 'Why AFU',
      fields: [
        { key: 'why_afu_eyebrow', label: 'Eyebrow', type: 'text' },
        { key: 'why_afu_title', label: 'Title', type: 'text' },
        {
          key: 'why_afu_items',
          label: 'Items',
          type: 'object-list',
          itemFields: [
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'desc', label: 'Description', type: 'textarea' },
          ],
          defaultItem: { title: '', desc: '' },
        },
      ],
    },
    {
      id: 'pillars',
      title: 'Pillars',
      fields: [
        { key: 'pillars_title', label: 'Title', type: 'text' },
        {
          key: 'pillars_items',
          label: 'Pillar Items',
          type: 'object-list',
          itemFields: [
            { key: 'icon', label: 'Icon', type: 'text' },
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'desc', label: 'Description', type: 'textarea' },
          ],
          defaultItem: { icon: '', title: '', desc: '' },
        },
      ],
    },
    {
      id: 'traction',
      title: 'Traction',
      fields: [
        { key: 'traction_title', label: 'Title', type: 'text' },
        {
          key: 'traction_items',
          label: 'Items',
          type: 'object-list',
          itemFields: [
            { key: 'value', label: 'Value', type: 'text' },
            { key: 'label', label: 'Label', type: 'text' },
            { key: 'desc', label: 'Description', type: 'textarea' },
          ],
          defaultItem: { value: '', label: '', desc: '' },
        },
      ],
    },
    {
      id: 'tiers',
      title: 'Investment Tiers',
      fields: [
        { key: 'tiers_eyebrow', label: 'Eyebrow', type: 'text' },
        { key: 'tiers_title', label: 'Title', type: 'text' },
        { key: 'tiers_intro', label: 'Intro', type: 'textarea' },
        {
          key: 'tiers_items',
          label: 'Tier Items',
          type: 'object-list',
          itemFields: [
            { key: 'name', label: 'Name', type: 'text' },
            { key: 'min', label: 'Minimum', type: 'text' },
            { key: 'returns', label: 'Returns', type: 'text' },
            { key: 'features', label: 'Features (comma-separated)', type: 'textarea' },
            { key: 'cta_text', label: 'CTA Text', type: 'text' },
            { key: 'featured', label: 'Featured (true/false)', type: 'text' },
          ],
          defaultItem: { name: '', min: '', returns: '', features: '', cta_text: '', featured: 'false' },
        },
      ],
    },
    {
      id: 'leadership',
      title: 'Leadership',
      fields: [
        { key: 'leadership_title', label: 'Title', type: 'text' },
        { key: 'leadership_body', label: 'Body', type: 'textarea' },
        {
          key: 'leadership_bullets',
          label: 'Bullets',
          type: 'string-list',
          defaultString: '',
        },
        {
          key: 'leadership_governance',
          label: 'Governance Items',
          type: 'object-list',
          itemFields: [
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'desc', label: 'Description', type: 'textarea' },
          ],
          defaultItem: { title: '', desc: '' },
        },
      ],
    },
    {
      id: 'demos',
      title: 'Demos',
      fields: [
        { key: 'demos_title', label: 'Title', type: 'text' },
        {
          key: 'demos_items',
          label: 'Demo Items',
          type: 'object-list',
          itemFields: [
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'subhead', label: 'Subhead', type: 'text' },
            { key: 'features', label: 'Features (comma-separated)', type: 'textarea' },
            { key: 'demo_link', label: 'Demo Link', type: 'text' },
          ],
          defaultItem: { title: '', subhead: '', features: '', demo_link: '' },
        },
      ],
    },
    {
      id: 'final_cta',
      title: 'Final CTA',
      fields: [
        { key: 'final_cta_badge', label: 'Badge', type: 'text' },
        { key: 'final_cta_title', label: 'Title', type: 'text' },
        { key: 'final_cta_body', label: 'Body', type: 'textarea' },
        { key: 'final_cta_cta1_text', label: 'Primary CTA Text', type: 'text' },
        { key: 'final_cta_cta2_text', label: 'Secondary CTA Text', type: 'text' },
        { key: 'final_cta_email', label: 'Contact Email', type: 'text' },
        { key: 'final_cta_phone', label: 'Contact Phone', type: 'text' },
      ],
    },
  ],
};

export const DONATE_SCHEMA: PageSchema = {
  id: 'page_donate',
  label: 'Donate',
  publishedKey: 'page_donate',
  draftKey: 'page_donate_draft',
  previewPath: '/donate?preview=draft',
  sections: [
    {
      id: 'hero',
      title: 'Hero',
      fields: [
        { key: 'hero_title', label: 'Title', type: 'text' },
        { key: 'hero_subtitle', label: 'Subtitle', type: 'textarea' },
      ],
    },
    {
      id: 'programs',
      title: 'Programs',
      fields: [
        {
          key: 'programs',
          label: 'Programs',
          type: 'object-list',
          itemFields: [
            { key: 'slug', label: 'Slug', type: 'text' },
            { key: 'name', label: 'Name', type: 'text' },
            { key: 'description', label: 'Description', type: 'textarea' },
            { key: 'impact', label: 'Impact (comma-separated)', type: 'textarea' },
            { key: 'preset_amounts', label: 'Preset Amounts (comma-separated)', type: 'text' },
          ],
          defaultItem: { slug: '', name: '', description: '', impact: '', preset_amounts: '' },
        },
      ],
    },
    {
      id: 'labels',
      title: 'Section Labels',
      fields: [
        { key: 'choose_title', label: 'Choose Title', type: 'text' },
        { key: 'donation_title', label: 'Donation Title', type: 'text' },
        { key: 'impact_title', label: 'Impact Title', type: 'text' },
        { key: 'methods_label', label: 'Methods Label', type: 'text' },
      ],
    },
    {
      id: 'footer',
      title: 'Footer',
      fields: [{ key: 'footer_disclaimer', label: 'Footer Disclaimer', type: 'textarea' }],
    },
    {
      id: 'success',
      title: 'Success',
      fields: [
        { key: 'success_title', label: 'Success Title', type: 'text' },
        { key: 'success_body', label: 'Success Body', type: 'textarea' },
      ],
    },
  ],
};

export const ADVERTISING_SCHEMA: PageSchema = {
  id: 'page_advertising',
  label: 'Advertising',
  publishedKey: 'page_advertising',
  draftKey: 'page_advertising_draft',
  previewPath: '/services/advertising?preview=draft',
  sections: [
    {
      id: 'hero',
      title: 'Hero',
      fields: [
        { key: 'hero_badge', label: 'Badge', type: 'text' },
        { key: 'hero_title', label: 'Title', type: 'text' },
        { key: 'hero_subtitle', label: 'Subtitle', type: 'textarea' },
        { key: 'hero_cta1_text', label: 'Primary CTA Text', type: 'text' },
        { key: 'hero_cta2_text', label: 'Secondary CTA Text', type: 'text' },
      ],
    },
    {
      id: 'stats',
      title: 'Stats',
      fields: [
        {
          key: 'stats',
          label: 'Stats',
          type: 'object-list',
          itemFields: [
            { key: 'value', label: 'Value', type: 'text' },
            { key: 'label', label: 'Label', type: 'text' },
          ],
          defaultItem: { value: '', label: '' },
        },
      ],
    },
    {
      id: 'why',
      title: 'Why Advertise',
      fields: [
        { key: 'why_title', label: 'Title', type: 'text' },
        { key: 'why_intro', label: 'Intro', type: 'textarea' },
        {
          key: 'why_cards',
          label: 'Cards',
          type: 'object-list',
          itemFields: [
            { key: 'icon', label: 'Icon', type: 'text' },
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'desc', label: 'Description', type: 'textarea' },
          ],
          defaultItem: { icon: '', title: '', desc: '' },
        },
      ],
    },
    {
      id: 'formats',
      title: 'Ad Formats',
      fields: [
        { key: 'formats_title', label: 'Title', type: 'text' },
        {
          key: 'formats_items',
          label: 'Items',
          type: 'object-list',
          itemFields: [
            { key: 'icon', label: 'Icon', type: 'text' },
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'desc', label: 'Description', type: 'textarea' },
          ],
          defaultItem: { icon: '', title: '', desc: '' },
        },
      ],
    },
    {
      id: 'packages',
      title: 'Packages',
      fields: [
        { key: 'packages_title', label: 'Title', type: 'text' },
        { key: 'packages_intro', label: 'Intro', type: 'textarea' },
        {
          key: 'packages_items',
          label: 'Package Items',
          type: 'object-list',
          itemFields: [
            { key: 'name', label: 'Name', type: 'text' },
            { key: 'price', label: 'Price', type: 'text' },
            { key: 'period', label: 'Period', type: 'text' },
            { key: 'description', label: 'Description', type: 'textarea' },
            { key: 'features', label: 'Features (comma-separated)', type: 'textarea' },
            { key: 'cta', label: 'CTA Text', type: 'text' },
            { key: 'popular', label: 'Popular (true/false)', type: 'text' },
          ],
          defaultItem: { name: '', price: '', period: '', description: '', features: '', cta: '', popular: 'false' },
        },
      ],
    },
    {
      id: 'pricing',
      title: 'Pricing Table',
      fields: [
        { key: 'pricing_title', label: 'Title', type: 'text' },
        {
          key: 'pricing_rows',
          label: 'Rows',
          type: 'object-list',
          itemFields: [
            { key: 'tier', label: 'Tier', type: 'text' },
            { key: 'countries', label: 'Countries', type: 'text' },
            { key: 'banner', label: 'Banner', type: 'text' },
            { key: 'featured', label: 'Featured', type: 'text' },
            { key: 'directory', label: 'Directory', type: 'text' },
          ],
          defaultItem: { tier: '', countries: '', banner: '', featured: '', directory: '' },
        },
      ],
    },
    {
      id: 'final_cta',
      title: 'Final CTA',
      fields: [
        { key: 'final_cta_title', label: 'Title', type: 'text' },
        { key: 'final_cta_body', label: 'Body', type: 'textarea' },
        { key: 'final_cta_cta1_text', label: 'Primary CTA Text', type: 'text' },
        { key: 'final_cta_cta2_text', label: 'Secondary CTA Text', type: 'text' },
      ],
    },
  ],
};

// ───────────────────────────────────────────────────────────────────────
// Advisors Chrome
// ───────────────────────────────────────────────────────────────────────

export const ADVISORS_CHROME_SCHEMA: PageSchema = {
  id: 'page_chrome_advisors',
  label: 'Advisors',
  publishedKey: 'page_chrome_advisors',
  draftKey: 'page_chrome_advisors_draft',
  previewPath: '/advisors?preview=draft',
  sections: [
    {
      id: 'hero',
      title: 'Hero',
      fields: [
        { key: 'hero_badge', label: 'Hero Badge', type: 'text' },
        { key: 'hero_title', label: 'Hero Title', type: 'text' },
        { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea' },
        { key: 'hero_cta_text', label: 'CTA Button Text', type: 'text' },
      ],
    },
    {
      id: 'stats',
      title: 'Stats Bar',
      fields: [
        { key: 'stat1_value', label: 'Stat 1 Value', type: 'text' },
        { key: 'stat1_label', label: 'Stat 1 Label', type: 'text' },
        { key: 'stat2_value', label: 'Stat 2 Value', type: 'text' },
        { key: 'stat2_label', label: 'Stat 2 Label', type: 'text' },
        { key: 'stat3_value', label: 'Stat 3 Value', type: 'text' },
        { key: 'stat3_label', label: 'Stat 3 Label', type: 'text' },
        { key: 'stat4_value', label: 'Stat 4 Value', type: 'text' },
        { key: 'stat4_label', label: 'Stat 4 Label', type: 'text' },
      ],
    },
    {
      id: 'sections',
      title: 'Section Titles',
      fields: [
        { key: 'featured_title', label: 'Featured Section Title', type: 'text' },
        { key: 'featured_subtitle', label: 'Featured Section Subtitle', type: 'textarea' },
        { key: 'grid_title', label: 'All Advisors Title', type: 'text' },
        { key: 'grid_subtitle', label: 'All Advisors Subtitle', type: 'textarea' },
        { key: 'how_it_works_title', label: 'How It Works Title', type: 'text' },
      ],
    },
    {
      id: 'how_it_works',
      title: 'How It Works Steps',
      fields: [
        {
          key: 'how_it_works_steps',
          label: 'Steps',
          type: 'object-list',
          itemFields: [
            { key: 'step', label: 'Step Number', type: 'text' },
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'desc', label: 'Description', type: 'textarea' },
          ],
          defaultItem: { step: '', title: '', desc: '' },
        },
      ],
    },
    {
      id: 'specializations',
      title: 'Filter Categories',
      fields: [
        {
          key: 'specializations',
          label: 'Specialization Options',
          type: 'string-list',
        },
      ],
    },
    {
      id: 'final_cta',
      title: 'Final CTA',
      fields: [
        { key: 'cta_title', label: 'CTA Title', type: 'text' },
        { key: 'cta_subtitle', label: 'CTA Subtitle', type: 'textarea' },
        { key: 'cta_primary_text', label: 'Primary Button Text', type: 'text' },
        { key: 'cta_secondary_text', label: 'Secondary Button Text', type: 'text' },
      ],
    },
  ],
};

// ───────────────────────────────────────────────────────────────────────
// Forms Management — edit labels, placeholders, help text for platform forms
// ───────────────────────────────────────────────────────────────────────

function makeFormSchema(
  slug: string,
  label: string,
  fields: { key: string; defaultLabel: string; defaultPlaceholder: string; defaultHelp: string }[]
): PageSchema {
  return {
    id: `form_${slug}`,
    label: `${label} Form`,
    publishedKey: `form_${slug}`,
    draftKey: `form_${slug}_draft`,
    previewPath: `/${slug === 'contact' ? 'contact' : slug === 'registration' ? 'apply' : slug === 'loan_application' ? 'dashboard/loans/apply' : slug === 'membership' ? 'membership/apply' : slug}?preview=draft`,
    sections: [
      {
        id: 'settings',
        title: 'Form Settings',
        fields: [
          { key: 'form_title', label: 'Form Title', type: 'text' as const },
          { key: 'form_subtitle', label: 'Form Subtitle', type: 'textarea' as const },
          { key: 'submit_button_text', label: 'Submit Button Text', type: 'text' as const },
          { key: 'success_title', label: 'Success Title', type: 'text' as const },
          { key: 'success_message', label: 'Success Message', type: 'textarea' as const },
          { key: 'error_message', label: 'Error Message', type: 'text' as const },
        ],
      },
      {
        id: 'fields',
        title: 'Form Fields',
        fields: [
          {
            key: 'form_fields',
            label: 'Fields',
            type: 'object-list' as const,
            itemFields: [
              { key: 'field_key', label: 'Field Key (internal)', type: 'text' as const },
              { key: 'label', label: 'Label', type: 'text' as const },
              { key: 'placeholder', label: 'Placeholder', type: 'text' as const },
              { key: 'help_text', label: 'Help Text', type: 'text' as const },
              { key: 'required', label: 'Required (true/false)', type: 'text' as const },
              { key: 'field_type', label: 'Type (text/email/textarea/select/phone/number)', type: 'text' as const },
            ],
            defaultItem: { field_key: '', label: 'New Field', placeholder: '', help_text: '', required: 'false', field_type: 'text' },
          },
        ],
      },
      {
        id: 'validation',
        title: 'Validation Messages',
        fields: [
          { key: 'validation_required', label: 'Required Field Message', type: 'text' as const },
          { key: 'validation_email', label: 'Invalid Email Message', type: 'text' as const },
          { key: 'validation_phone', label: 'Invalid Phone Message', type: 'text' as const },
          { key: 'validation_min_length', label: 'Min Length Message', type: 'text' as const },
          { key: 'validation_max_length', label: 'Max Length Message', type: 'text' as const },
        ],
      },
    ],
  };
}

export const FORM_CONTACT_SCHEMA = makeFormSchema('contact', 'Contact', [
  { key: 'name', defaultLabel: 'Full Name', defaultPlaceholder: 'Enter your name', defaultHelp: '' },
  { key: 'email', defaultLabel: 'Email', defaultPlaceholder: 'you@example.com', defaultHelp: '' },
  { key: 'subject', defaultLabel: 'Subject', defaultPlaceholder: 'What is this about?', defaultHelp: '' },
  { key: 'message', defaultLabel: 'Message', defaultPlaceholder: 'Tell us how we can help...', defaultHelp: '' },
]);

export const FORM_REGISTRATION_SCHEMA = makeFormSchema('registration', 'Registration', [
  { key: 'first_name', defaultLabel: 'First Name', defaultPlaceholder: 'Enter first name', defaultHelp: '' },
  { key: 'last_name', defaultLabel: 'Last Name', defaultPlaceholder: 'Enter last name', defaultHelp: '' },
  { key: 'email', defaultLabel: 'Email', defaultPlaceholder: 'you@example.com', defaultHelp: '' },
  { key: 'phone', defaultLabel: 'Phone', defaultPlaceholder: '+234...', defaultHelp: '' },
  { key: 'country', defaultLabel: 'Country', defaultPlaceholder: 'Select country', defaultHelp: '' },
  { key: 'farm_size', defaultLabel: 'Farm Size (hectares)', defaultPlaceholder: 'e.g. 5', defaultHelp: '' },
]);

export const FORM_LOAN_APPLICATION_SCHEMA = makeFormSchema('loan_application', 'Loan Application', [
  { key: 'loan_type', defaultLabel: 'Loan Type', defaultPlaceholder: 'Select loan type', defaultHelp: '' },
  { key: 'amount', defaultLabel: 'Amount Requested', defaultPlaceholder: 'Enter amount', defaultHelp: '' },
  { key: 'purpose', defaultLabel: 'Purpose', defaultPlaceholder: 'Describe the purpose of the loan', defaultHelp: '' },
  { key: 'repayment_period', defaultLabel: 'Repayment Period', defaultPlaceholder: 'Select period', defaultHelp: '' },
]);

export const FORM_MEMBERSHIP_SCHEMA = makeFormSchema('membership', 'Membership Application', [
  { key: 'membership_tier', defaultLabel: 'Membership Tier', defaultPlaceholder: 'Select tier', defaultHelp: '' },
  { key: 'farm_type', defaultLabel: 'Farm Type', defaultPlaceholder: 'e.g. Crops, Livestock, Mixed', defaultHelp: '' },
  { key: 'experience', defaultLabel: 'Years of Experience', defaultPlaceholder: 'e.g. 5', defaultHelp: '' },
]);

// ───────────────────────────────────────────────────────────────────────
// Resources & Materials — manage downloadable resources
// ───────────────────────────────────────────────────────────────────────

export const RESOURCES_SCHEMA: PageSchema = {
  id: 'resources',
  label: 'Resources & Materials',
  publishedKey: 'resources_content',
  draftKey: 'resources_content_draft',
  previewPath: '/resources?preview=draft',
  sections: [
    {
      id: 'hero',
      title: 'Resources Page Header',
      fields: [
        { key: 'hero_title', label: 'Page Title', type: 'text' },
        { key: 'hero_subtitle', label: 'Page Subtitle', type: 'textarea' },
        { key: 'hero_badge', label: 'Badge Text', type: 'text' },
      ],
    },
    {
      id: 'categories',
      title: 'Resource Categories',
      fields: [
        {
          key: 'categories',
          label: 'Categories',
          type: 'object-list',
          itemFields: [
            { key: 'slug', label: 'Slug (internal)', type: 'text' },
            { key: 'name', label: 'Display Name', type: 'text' },
            { key: 'description', label: 'Description', type: 'textarea' },
            { key: 'icon', label: 'Icon (lucide name)', type: 'text' },
          ],
          defaultItem: { slug: '', name: 'New Category', description: '', icon: 'folder' },
        },
      ],
    },
    {
      id: 'items',
      title: 'Resource Items',
      fields: [
        {
          key: 'resource_items',
          label: 'Resources',
          type: 'object-list',
          itemFields: [
            { key: 'title', label: 'Title', type: 'text' },
            { key: 'description', label: 'Description', type: 'textarea' },
            { key: 'category', label: 'Category Slug', type: 'text' },
            { key: 'file_url', label: 'File URL', type: 'text' },
            { key: 'file_type', label: 'File Type (pdf/doc/xlsx/video/link)', type: 'text' },
            { key: 'visibility', label: 'Visibility (public/members/tier_gold/tier_platinum)', type: 'text' },
            { key: 'language', label: 'Language (en/fr/pt/sw/am/ha/yo/ig/zu/ar/so/lg)', type: 'text' },
          ],
          defaultItem: { title: '', description: '', category: '', file_url: '', file_type: 'pdf', visibility: 'public', language: 'en' },
        },
      ],
    },
    {
      id: 'empty_state',
      title: 'Empty State',
      fields: [
        { key: 'empty_title', label: 'Empty State Title', type: 'text' },
        { key: 'empty_body', label: 'Empty State Body', type: 'textarea' },
      ],
    },
    {
      id: 'cta',
      title: 'Call to Action',
      fields: [
        { key: 'cta_title', label: 'CTA Title', type: 'text' },
        { key: 'cta_body', label: 'CTA Body', type: 'textarea' },
        { key: 'cta_button_text', label: 'CTA Button Text', type: 'text' },
        { key: 'cta_button_link', label: 'CTA Button Link', type: 'text' },
      ],
    },
  ],
};

// ───────────────────────────────────────────────────────────────────────
// Email Templates — manage system email content
// ───────────────────────────────────────────────────────────────────────

function makeEmailSchema(slug: string, label: string, extraFields: { key: string; label: string; type: 'text' | 'textarea' }[] = []): PageSchema {
  return {
    id: `email_${slug}`,
    label: `${label} Email`,
    publishedKey: `email_template_${slug}`,
    draftKey: `email_template_${slug}_draft`,
    previewPath: `/admin/email-preview/${slug}?preview=draft`,
    sections: [
      {
        id: 'content',
        title: 'Email Content',
        fields: [
          { key: 'subject', label: 'Subject Line', type: 'text' },
          { key: 'preview_text', label: 'Preview Text (inbox snippet)', type: 'text' },
          { key: 'heading', label: 'Heading', type: 'text' },
          { key: 'body', label: 'Body', type: 'richtext' },
          ...extraFields,
        ],
      },
      {
        id: 'cta',
        title: 'Call to Action',
        fields: [
          { key: 'cta_text', label: 'Button Text', type: 'text' },
          { key: 'cta_url', label: 'Button URL', type: 'text' },
        ],
      },
      {
        id: 'footer',
        title: 'Email Footer',
        fields: [
          { key: 'footer_text', label: 'Footer Text', type: 'textarea' },
          { key: 'unsubscribe_text', label: 'Unsubscribe Text', type: 'text' },
        ],
      },
    ],
  };
}

export const EMAIL_WELCOME_SCHEMA = makeEmailSchema('welcome', 'Welcome');
export const EMAIL_VERIFICATION_SCHEMA = makeEmailSchema('verification', 'Email Verification');
export const EMAIL_PASSWORD_RESET_SCHEMA = makeEmailSchema('password_reset', 'Password Reset');
export const EMAIL_LOAN_APPROVED_SCHEMA = makeEmailSchema('loan_approved', 'Loan Approved', [
  { key: 'loan_details_label', label: 'Loan Details Label', type: 'text' },
  { key: 'next_steps', label: 'Next Steps Text', type: 'textarea' },
]);
export const EMAIL_LOAN_REJECTED_SCHEMA = makeEmailSchema('loan_rejected', 'Loan Rejected', [
  { key: 'reason_label', label: 'Reason Label', type: 'text' },
  { key: 'reapply_text', label: 'Reapply Instructions', type: 'textarea' },
]);
export const EMAIL_PAYMENT_RECEIVED_SCHEMA = makeEmailSchema('payment_received', 'Payment Received', [
  { key: 'amount_label', label: 'Amount Label', type: 'text' },
  { key: 'receipt_text', label: 'Receipt Text', type: 'textarea' },
]);
export const EMAIL_MEMBERSHIP_CONFIRMED_SCHEMA = makeEmailSchema('membership_confirmed', 'Membership Confirmed', [
  { key: 'tier_label', label: 'Tier Label', type: 'text' },
  { key: 'benefits_text', label: 'Benefits Summary', type: 'textarea' },
]);
export const EMAIL_SPONSOR_UPDATE_SCHEMA = makeEmailSchema('sponsor_update', 'Sponsor Update', [
  { key: 'farmer_name_label', label: 'Farmer Name Label', type: 'text' },
  { key: 'progress_text', label: 'Progress Update', type: 'textarea' },
]);

// ───────────────────────────────────────────────────────────────────────
// Default content — pre-fills the editor so the team sees actual text
// ───────────────────────────────────────────────────────────────────────

export const DEFAULT_CONTENT: Record<string, Record<string, unknown>> = {
  homepage: {
    hero_headline: "Let's Grow Together",
    hero_subtitle: 'By farmers, for farmers. Run by Africans, for Africans. We bring the financing, inputs, processing, and guaranteed buyers — you bring the land and the passion. Together, we turn your harvest into real, sustainable income.',
    hero_cta_text: 'Join Our Farming Family',
    hero_cta_link: '/apply',
    hero_badge_text: 'Active across 20 African countries',
    stats_eyebrow: 'The Africa Agriculture Paradox',
    stats_title: 'The Opportunity is Enormous',
    stats_subtitle: "Africa has the land, labor, and demand. What's missing is the integrated infrastructure and finance to unlock it.",
    services_eyebrow: 'Our Services',
    services_title: 'One Platform, Complete Value Chain',
    services_subtitle: "A vertically integrated agriculture development platform — the specialized agri dev bank and execution engine Africa has been missing.",
    programs_eyebrow: 'Active Programs',
    programs_title: 'Our Programs',
    programs_subtitle: 'Real farming programs generating real revenue. From blueberries bound for Europe to castor oil feeding global biofuel demand.',
    flywheel_eyebrow: 'The Model',
    flywheel_title: 'The AFU Flywheel',
    flywheel_subtitle: 'Most players only do one piece. AFU ties the full loop together — capital flows in, crops flow out, cash recycles.',
    flywheel_labels: ['Capital', 'Inputs', 'Production', 'Processing', 'Offtake', 'Trade Finance', 'Cash Recycle'],
    flywheel_recycle_text: "That's the compounding flywheel — cash recycles back into capital",
    how_it_works_eyebrow: 'Getting Started',
    how_it_works_title: 'Four Steps to Growth',
    how_it_works_subtitle: 'From your first conversation to export income — we walk the journey with you, every step of the way.',
    how_it_works_steps: [
      { step: '01', title: 'Tell Us Your Story', desc: 'Tell us about you and your vision. Share your farming story, your land, your dreams. We want to understand what makes your farm unique.' },
      { step: '02', title: 'Get Financed', desc: 'Access working capital, input finance, and equipment leasing tailored to your crop cycle.' },
      { step: '03', title: 'Grow & Process', desc: 'Use premium inputs, expert training, and processing hubs to maximize yields and value.' },
      { step: '04', title: 'Sell & Scale', desc: 'Guaranteed offtake contracts and trade finance turn your harvest into predictable cash flows.' },
    ],
    ai_eyebrow: 'Technology Advantage',
    ai_title: 'AI-Powered Agriculture for Smarter Farming',
    ai_body: 'Our Amara AI assistant helps farmers with crop diagnostics, market pricing, weather alerts, and personalized recommendations — accessible via the portal or WhatsApp.',
    ai_features: [
      'Crop health scanner with photo-based diagnosis',
      'AI credit scoring for faster loan decisions',
      'Real-time market prices and trend alerts',
      'Satellite monitoring and weather forecasts',
    ],
    ai_link_text: 'Learn more about our technology',
    investor_eyebrow: 'Investment Opportunity',
    investor_title_pre: "Invest in Africa's Agricultural",
    investor_title_highlight: 'Transformation',
    investor_body: "AFU is raising a multi-million dollar funding round to build Africa's first vertically integrated agriculture development bank and operating platform. Trade finance, input lending, and offtake — tapping into Africa's growing agricultural market.",
    promise_eyebrow: 'What Makes Us Different',
    promise_title: 'Our Promise',
    promise_subtitle: "We're not a bank in a boardroom. We're farmers who built a platform to solve the problems we lived through ourselves.",
    showup_eyebrow: 'Our People On Your Farm',
    showup_title: "We Don't Just Finance — We Show Up",
    showup_subtitle: 'Our network of commercial farmers, agronomists, and specialists come to your farm to help you succeed. These are real people with real experience — not just software.',
    sponsor_eyebrow: 'Sponsor a Farmer',
    sponsor_title: "Turn $5 a Month Into a Farm's Future",
    sponsor_subtitle: "Real farmers. Real crops. Real impact. Your sponsorship is distributed across farmers who need it most — funding memberships, inputs, and program access. Get monthly updates as their seasons unfold.",
    final_cta_title: 'Ready to Grow With Us?',
    final_cta_body: "Whether you farm two hectares or two thousand, we're here to help. Tell us your story, share your vision, and let's build something extraordinary together.",
    final_cta_primary_text: 'Join Our Farming Family',
    final_cta_primary_link: '/apply',
    final_cta_secondary_text: "We're Here to Help",
    final_cta_secondary_link: '/contact',
  },
  footer: {
    mission: 'By Farmers, For Farmers. AFU is building the integrated agricultural infrastructure that Africa needs — connecting farmers to finance, inputs, processing, and markets across the continent.',
  },
  about: {
    hero_title: 'About AFU',
    hero_subtitle: 'By Farmers, For Farmers',
    hero_body: "The African Farming Union is a vertically integrated agriculture development platform — combining financing, insurance, inputs, processing, and guaranteed offtake into one ecosystem. We're not a bank, not an NGO, and not a tech startup. We're farmers who built what Africa's agricultural sector has been missing.",
    mission_title: 'Our Mission',
    mission_body: "To empower African farmers with the finance, inputs, technology, and market access they need to build sustainable, profitable farms. We believe that when farmers thrive, communities thrive, and Africa's agricultural potential is finally unlocked.",
  },
  page_chrome_contact: {
    hero_title: 'Get In Touch',
    hero_subtitle: "Have a question, a partnership proposal, or just want to chat about farming? We'd love to hear from you.",
    form_title: 'Send Us a Message',
    success_title: 'Message Sent',
    success_body: "Thank you for reaching out. We'll get back to you within 24 hours.",
  },
  form_contact: {
    form_title: 'Contact Us',
    form_subtitle: 'Send us a message and we will get back to you within 24 hours.',
    submit_button_text: 'Send Message',
    success_title: 'Message Sent!',
    success_message: 'Thank you for reaching out. Our team will respond within 24 hours.',
    error_message: 'Something went wrong. Please try again.',
    form_fields: [
      { field_key: 'name', label: 'Full Name', placeholder: 'Enter your full name', help_text: '', required: 'true', field_type: 'text' },
      { field_key: 'email', label: 'Email Address', placeholder: 'you@example.com', help_text: '', required: 'true', field_type: 'email' },
      { field_key: 'subject', label: 'Subject', placeholder: 'What is this about?', help_text: '', required: 'true', field_type: 'text' },
      { field_key: 'message', label: 'Message', placeholder: 'Tell us how we can help...', help_text: '', required: 'true', field_type: 'textarea' },
    ],
    validation_required: 'This field is required',
    validation_email: 'Please enter a valid email address',
    validation_phone: 'Please enter a valid phone number',
    validation_min_length: 'Must be at least {min} characters',
    validation_max_length: 'Must be no more than {max} characters',
  },
  form_registration: {
    form_title: 'Join Our Farming Family',
    form_subtitle: 'Tell us about yourself and your farm. The first step to accessing finance, inputs, and guaranteed markets.',
    submit_button_text: 'Submit Application',
    success_title: 'Application Received!',
    success_message: 'Welcome to the AFU family. We will review your application and be in touch within 48 hours.',
    error_message: 'Something went wrong. Please try again.',
    form_fields: [
      { field_key: 'first_name', label: 'First Name', placeholder: 'Enter first name', help_text: '', required: 'true', field_type: 'text' },
      { field_key: 'last_name', label: 'Last Name', placeholder: 'Enter last name', help_text: '', required: 'true', field_type: 'text' },
      { field_key: 'email', label: 'Email Address', placeholder: 'you@example.com', help_text: '', required: 'true', field_type: 'email' },
      { field_key: 'phone', label: 'Phone Number', placeholder: '+234...', help_text: 'Include country code', required: 'true', field_type: 'phone' },
      { field_key: 'country', label: 'Country', placeholder: 'Select your country', help_text: '', required: 'true', field_type: 'select' },
      { field_key: 'farm_size', label: 'Farm Size (hectares)', placeholder: 'e.g. 5', help_text: 'Approximate size in hectares', required: 'false', field_type: 'number' },
    ],
    validation_required: 'This field is required',
    validation_email: 'Please enter a valid email address',
    validation_phone: 'Please enter a valid phone number',
    validation_min_length: 'Must be at least {min} characters',
    validation_max_length: 'Must be no more than {max} characters',
  },
  form_loan_application: {
    form_title: 'Apply for Financing',
    form_subtitle: 'Access working capital, input finance, and equipment leasing tailored to your crop cycle.',
    submit_button_text: 'Submit Loan Application',
    success_title: 'Application Submitted!',
    success_message: 'Your loan application is being reviewed. You will hear from our team within 5 business days.',
    error_message: 'Something went wrong. Please try again or contact support.',
    form_fields: [
      { field_key: 'loan_type', label: 'Loan Type', placeholder: 'Select loan type', help_text: 'Choose the type of financing you need', required: 'true', field_type: 'select' },
      { field_key: 'amount', label: 'Amount Requested (USD)', placeholder: 'Enter amount', help_text: 'The amount you need in USD', required: 'true', field_type: 'number' },
      { field_key: 'purpose', label: 'Purpose of Loan', placeholder: 'Describe how you will use the funds...', help_text: 'Be specific about what the funds will be used for', required: 'true', field_type: 'textarea' },
      { field_key: 'repayment_period', label: 'Preferred Repayment Period', placeholder: 'Select period', help_text: 'How long do you need to repay?', required: 'true', field_type: 'select' },
    ],
    validation_required: 'This field is required',
    validation_email: 'Please enter a valid email address',
    validation_phone: 'Please enter a valid phone number',
    validation_min_length: 'Must be at least {min} characters',
    validation_max_length: 'Must be no more than {max} characters',
  },
  form_membership: {
    form_title: 'Become a Member',
    form_subtitle: 'Join the African Farming Union and unlock access to financing, inputs, training, and guaranteed markets.',
    submit_button_text: 'Apply for Membership',
    success_title: 'Membership Application Received!',
    success_message: 'Your application is under review. You will receive a confirmation email shortly.',
    error_message: 'Something went wrong. Please try again.',
    form_fields: [
      { field_key: 'membership_tier', label: 'Membership Tier', placeholder: 'Select tier', help_text: 'Choose the membership level that fits your needs', required: 'true', field_type: 'select' },
      { field_key: 'farm_type', label: 'Farm Type', placeholder: 'e.g. Crops, Livestock, Mixed', help_text: 'What type of farming do you do?', required: 'true', field_type: 'text' },
      { field_key: 'experience', label: 'Years of Experience', placeholder: 'e.g. 5', help_text: 'How many years have you been farming?', required: 'false', field_type: 'number' },
    ],
    validation_required: 'This field is required',
    validation_email: 'Please enter a valid email address',
    validation_phone: 'Please enter a valid phone number',
    validation_min_length: 'Must be at least {min} characters',
    validation_max_length: 'Must be no more than {max} characters',
  },
  resources: {
    hero_title: 'Resources & Materials',
    hero_subtitle: 'Download guides, templates, training materials, and more to help you succeed.',
    hero_badge: 'Knowledge Hub',
    categories: [
      { slug: 'guides', name: 'Farming Guides', description: 'Step-by-step guides for best practices', icon: 'book-open' },
      { slug: 'templates', name: 'Templates', description: 'Ready-to-use business and farm templates', icon: 'file-text' },
      { slug: 'training', name: 'Training Materials', description: 'Educational resources for skills development', icon: 'graduation-cap' },
      { slug: 'policies', name: 'Policies & Compliance', description: 'Legal and policy documents', icon: 'shield' },
      { slug: 'reports', name: 'Reports & Research', description: 'Market analysis and research papers', icon: 'bar-chart' },
    ],
    empty_title: 'No Resources Found',
    empty_body: 'Check back soon for new materials.',
    cta_title: 'Need Something Specific?',
    cta_body: 'If you cannot find what you are looking for, our team is here to help.',
    cta_button_text: 'Contact Us',
    cta_button_link: '/contact',
  },
  email_welcome: {
    subject: 'Welcome to the African Farming Union!',
    preview_text: 'Your farming journey starts here',
    heading: 'Welcome to AFU, {{first_name}}!',
    body: '<p>Thank you for joining the African Farming Union. We are excited to have you as part of our growing family of farmers across Africa.</p><p>Here is what you can do next:</p><ul><li>Complete your farmer profile</li><li>Explore financing options</li><li>Browse training resources</li></ul>',
    cta_text: 'Go to Dashboard',
    cta_url: '/dashboard',
    footer_text: 'African Farming Union - By Farmers, For Farmers',
    unsubscribe_text: 'Unsubscribe from these emails',
  },
  email_verification: {
    subject: 'Verify Your Email Address',
    preview_text: 'Confirm your email to activate your account',
    heading: 'Verify Your Email',
    body: '<p>Please click the button below to verify your email address and activate your AFU account.</p>',
    cta_text: 'Verify Email',
    cta_url: '{{verification_url}}',
    footer_text: 'African Farming Union - By Farmers, For Farmers',
    unsubscribe_text: 'If you did not create this account, ignore this email.',
  },
  email_loan_approved: {
    subject: 'Your Loan Has Been Approved!',
    preview_text: 'Great news about your financing application',
    heading: 'Congratulations, {{first_name}}!',
    body: '<p>Your loan application has been approved. Review the details below and follow the next steps to receive your funds.</p>',
    loan_details_label: 'Loan Details',
    next_steps: 'Sign the loan agreement in your dashboard to proceed with disbursement.',
    cta_text: 'View Loan Details',
    cta_url: '/dashboard/loans',
    footer_text: 'African Farming Union - By Farmers, For Farmers',
    unsubscribe_text: 'Unsubscribe from these emails',
  },
};

// ───────────────────────────────────────────────────────────────────────
// Registry + grouping for the sidebar
// ───────────────────────────────────────────────────────────────────────

export const ALL_SCHEMAS: PageSchema[] = [
  HOMEPAGE_SCHEMA,
  FOOTER_SCHEMA,
  ABOUT_SCHEMA,
  CONTACT_CHROME_SCHEMA,
  SERVICE_FINANCING_SCHEMA,
  SERVICE_INSURANCE_SCHEMA,
  SERVICE_TRAINING_SCHEMA,
  SERVICE_VETERINARY_SCHEMA,
  SERVICE_INPUTS_SCHEMA,
  SERVICE_PROCESSING_SCHEMA,
  SERVICE_OFFTAKE_SCHEMA,
  SERVICE_TRADE_FINANCE_SCHEMA,
  SERVICE_LEGAL_ASSISTANCE_SCHEMA,
  ADVERTISING_SCHEMA,
  INVESTORS_SCHEMA,
  DONATE_SCHEMA,
  SPONSOR_CHROME_SCHEMA,
  AMBASSADORS_CHROME_SCHEMA,
  PARTNERS_CHROME_SCHEMA,
  COUNTRIES_CHROME_SCHEMA,
  FAQ_CHROME_SCHEMA,
  CARBON_CHROME_SCHEMA,
  ADVISORS_CHROME_SCHEMA,
  // Forms
  FORM_CONTACT_SCHEMA,
  FORM_REGISTRATION_SCHEMA,
  FORM_LOAN_APPLICATION_SCHEMA,
  FORM_MEMBERSHIP_SCHEMA,
  // Resources
  RESOURCES_SCHEMA,
  // Email Templates
  EMAIL_WELCOME_SCHEMA,
  EMAIL_VERIFICATION_SCHEMA,
  EMAIL_PASSWORD_RESET_SCHEMA,
  EMAIL_LOAN_APPROVED_SCHEMA,
  EMAIL_LOAN_REJECTED_SCHEMA,
  EMAIL_PAYMENT_RECEIVED_SCHEMA,
  EMAIL_MEMBERSHIP_CONFIRMED_SCHEMA,
  EMAIL_SPONSOR_UPDATE_SCHEMA,
];

export const SCHEMA_GROUPS: SchemaGroup[] = [
  { title: 'Homepage', schemaIds: ['homepage'] },
  { title: 'Site Chrome', schemaIds: ['footer', 'about', 'page_chrome_contact'] },
  {
    title: 'Services',
    schemaIds: [
      'service_financing',
      'service_insurance',
      'service_training',
      'service_veterinary',
      'service_inputs',
      'service_processing',
      'service_offtake',
      'service_trade-finance',
      'service_legal-assistance',
      'page_advertising',
    ],
  },
  {
    title: 'Marketing Pages',
    schemaIds: [
      'page_investors',
      'page_donate',
      'page_chrome_sponsor',
      'page_chrome_ambassadors',
      'page_chrome_partners',
      'page_chrome_advisors',
    ],
  },
  {
    title: 'Information Pages',
    schemaIds: ['page_chrome_countries', 'page_chrome_faq', 'page_chrome_carbon'],
  },
  {
    title: 'Forms',
    schemaIds: ['form_contact', 'form_registration', 'form_loan_application', 'form_membership'],
  },
  {
    title: 'Resources & Materials',
    schemaIds: ['resources'],
  },
  {
    title: 'Email Templates',
    schemaIds: [
      'email_welcome',
      'email_verification',
      'email_password_reset',
      'email_loan_approved',
      'email_loan_rejected',
      'email_payment_received',
      'email_membership_confirmed',
      'email_sponsor_update',
    ],
  },
];
