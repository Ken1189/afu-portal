/**
 * Page schemas for the unified Content Editor.
 *
 * Each schema describes one editable page (or chrome blob) on the public site.
 * The editor reads/writes the `draftKey` and copies it to `publishedKey` on publish.
 * The iframe loads `previewPath` (which should accept ?preview=draft).
 */

export type FieldType = 'text' | 'textarea' | 'image' | 'string-list' | 'object-list';

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
            defaultItem: { title: 'New feature', description: '', icon: '✨' },
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
    ],
  },
  {
    title: 'Information Pages',
    schemaIds: ['page_chrome_countries', 'page_chrome_faq', 'page_chrome_carbon'],
  },
];
