const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, LevelFormat,
        BorderStyle, WidthType, ShadingType,
        PageNumber, PageBreak } = require('docx');
const fs = require('fs');

const AFU_GREEN = "5DB347";
const DARK = "1B2A4A";
const GRAY = "666666";
const LINE = "CCCCCC";

const border = { style: BorderStyle.SINGLE, size: 1, color: LINE };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function heading1(text) {
  return new Paragraph({
    spacing: { before: 360, after: 200 },
    children: [new TextRun({ text, bold: true, size: 32, font: "Georgia", color: DARK })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 3, color: AFU_GREEN, space: 4 } }
  });
}

function heading2(text) {
  return new Paragraph({
    spacing: { before: 280, after: 140 },
    children: [new TextRun({ text, bold: true, size: 26, font: "Georgia", color: DARK })]
  });
}

function heading3(text) {
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, bold: true, size: 23, font: "Georgia", color: AFU_GREEN })]
  });
}

function para(text, opts = {}) {
  const children = typeof text === 'string'
    ? [new TextRun({ text, size: 21, font: "Arial", color: "333333" })]
    : text;
  return new Paragraph({ spacing: { after: 100 }, ...opts, children });
}

function bullet(text, bold = "") {
  const children = [];
  if (bold) children.push(new TextRun({ text: bold, bold: true, size: 21, font: "Arial", color: "333333" }));
  children.push(new TextRun({ text, size: 21, font: "Arial", color: "333333" }));
  return new Paragraph({
    spacing: { after: 50 },
    numbering: { reference: "bullets", level: 0 },
    children
  });
}

function label(key, value) {
  return para([
    new TextRun({ text: key, bold: true, size: 21, font: "Arial", color: DARK }),
    new TextRun({ text: value, size: 21, font: "Arial", color: "333333" })
  ]);
}

function tableCell(text, opts = {}) {
  const { bold, header, width, color } = opts;
  return new TableCell({
    borders,
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    margins: cellMargins,
    shading: header ? { fill: DARK, type: ShadingType.CLEAR } : color ? { fill: color, type: ShadingType.CLEAR } : undefined,
    children: [new Paragraph({
      children: [new TextRun({
        text, bold: bold || header, size: 19, font: "Arial",
        color: header ? "FFFFFF" : "333333"
      })]
    })]
  });
}

function divider() {
  return new Paragraph({
    spacing: { before: 100, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: LINE, space: 4 } },
    children: []
  });
}

// JOB AD BUILDER
function jobAd(title, dept, location, reportsto, type, salary, about, responsibilities, requirements, niceToHave, whyAFU) {
  const elements = [
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      spacing: { before: 100, after: 60 },
      children: [
        new TextRun({ text: "AFU", bold: true, size: 18, font: "Arial", color: AFU_GREEN }),
        new TextRun({ text: "  |  JOB POSTING", size: 18, font: "Arial", color: GRAY }),
      ]
    }),
    new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({ text: title, bold: true, size: 30, font: "Georgia", color: DARK })],
      border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: AFU_GREEN, space: 6 } }
    }),
    label("Department: ", dept),
    label("Location: ", location),
    label("Reports To: ", reportsto),
    label("Type: ", type),
    label("Salary Range: ", salary),
    divider(),
    heading3("About the Role"),
    para(about),
    heading3("Key Responsibilities"),
  ];
  responsibilities.forEach(r => elements.push(bullet(r)));
  elements.push(heading3("Requirements"));
  requirements.forEach(r => elements.push(bullet(r)));
  if (niceToHave && niceToHave.length > 0) {
    elements.push(heading3("Nice to Have"));
    niceToHave.forEach(r => elements.push(bullet(r)));
  }
  elements.push(heading3("Why AFU?"));
  whyAFU.forEach(r => elements.push(bullet(r)));
  elements.push(divider());
  elements.push(para([
    new TextRun({ text: "To apply: ", bold: true, size: 21, font: "Arial", color: DARK }),
    new TextRun({ text: "Send your CV and a brief cover letter to careers@africanfarmersunion.com with the subject line: \"[Role Title] \u2014 [Your Name]\"", size: 21, font: "Arial", color: "333333" })
  ]));
  elements.push(para([
    new TextRun({ text: "African Farming Union is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all team members.", size: 19, font: "Arial", color: GRAY, italics: true })
  ]));
  return elements;
}

const whyAFUDefault = [
  "Ground floor of a $500M-backed agritech platform transforming African agriculture",
  "Equity participation \u2014 share in the upside as we scale across 10 countries",
  "Work with a mission-driven team: by farmers, for farmers, run by Africans for Africans",
  "Cutting-edge technology stack (AI, blockchain, satellite data, mobile money)",
  "Direct impact on the livelihoods of millions of smallholder farmers",
  "Fast-track career growth in one of Africa\u2019s most exciting sectors",
];

// BUILD DOCUMENT
const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "\u2022",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    }]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: AFU_GREEN, space: 6 } },
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "AFRICAN FARMING UNION", bold: true, size: 20, font: "Georgia", color: AFU_GREEN }),
            new TextRun({ text: "  |  ", size: 20, font: "Georgia", color: LINE }),
            new TextRun({ text: "Organizational Structure & Recruitment Pack", size: 18, font: "Georgia", color: GRAY, italics: true }),
          ]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 1, color: LINE, space: 6 } },
          children: [
            new TextRun({ text: "CONFIDENTIAL  |  Page ", size: 16, font: "Georgia", color: GRAY }),
            new TextRun({ children: [PageNumber.CURRENT], size: 16, font: "Georgia", color: GRAY }),
          ]
        })]
      })
    },
    children: [
      // COVER PAGE
      new Paragraph({ spacing: { before: 2000 }, children: [] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: "ORGANIZATIONAL STRUCTURE", bold: true, size: 44, font: "Georgia", color: DARK })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
        children: [new TextRun({ text: "&", size: 36, font: "Georgia", color: AFU_GREEN })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: "RECRUITMENT PACK", bold: true, size: 44, font: "Georgia", color: DARK })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: AFU_GREEN, space: 8 } },
        children: [new TextRun({ text: "AFRICAN FARMING UNION (PTY) LTD", size: 26, font: "Georgia", color: AFU_GREEN })]
      }),
      new Paragraph({ spacing: { before: 400 }, alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: "March 2026  |  Confidential", size: 22, font: "Georgia", color: GRAY })
      ]}),
      new Paragraph({ spacing: { before: 800 }, alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: "\"By farmers, for farmers. Run by Africans, for Africans.\"", size: 22, font: "Georgia", color: GRAY, italics: true })
      ]}),

      // =============================================
      // PART 1: ORG CHART
      // =============================================
      new Paragraph({ children: [new PageBreak()] }),
      heading1("PART 1: ORGANIZATIONAL STRUCTURE"),

      // TIER 1
      heading2("Tier 1 \u2014 Co-Founders / Executive"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2800, 2200, 4360],
        rows: [
          new TableRow({ children: [
            tableCell("Name", { header: true, width: 2800 }),
            tableCell("Title", { header: true, width: 2200 }),
            tableCell("Focus", { header: true, width: 4360 }),
          ]}),
          new TableRow({ children: [
            tableCell("Peter Watson", { bold: true, width: 2800 }),
            tableCell("Founder & CEO", { width: 2200 }),
            tableCell("Vision, capital, partnerships, government, farm network", { width: 4360 }),
          ]}),
          new TableRow({ children: [
            tableCell("Devon Kennaird", { bold: true, width: 2800 }),
            tableCell("Co-Founder, CTO, Head of Product & Ops", { width: 2200 }),
            tableCell("Technology, product, operations, country launches, supplier setup, all execution", { width: 4360 }),
          ]}),
        ]
      }),

      // TIER 2
      heading2("Tier 2 \u2014 C-Suite (Hires #1\u20135, Post-Seed)"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2400, 3480, 3480],
        rows: [
          new TableRow({ children: [
            tableCell("Role", { header: true, width: 2400 }),
            tableCell("Responsibility", { header: true, width: 3480 }),
            tableCell("Reports To", { header: true, width: 3480 }),
          ]}),
          new TableRow({ children: [
            tableCell("Chief Financial Officer", { bold: true, width: 2400 }),
            tableCell("Treasury, fund accounting, investor reporting, audit, tax across all jurisdictions", { width: 3480 }),
            tableCell("CEO (Peter Watson)", { width: 3480 }),
          ]}),
          new TableRow({ children: [
            tableCell("Chief Risk Officer", { bold: true, width: 2400 }),
            tableCell("Lloyd\u2019s coverholder compliance, credit risk models, insurance underwriting, fraud prevention", { width: 3480 }),
            tableCell("CEO (Peter Watson)", { width: 3480 }),
          ]}),
          new TableRow({ children: [
            tableCell("Chief Legal Officer", { bold: true, width: 2400 }),
            tableCell("Multi-jurisdiction compliance, Foundation governance, cooperative law, trade finance contracts, IP", { width: 3480 }),
            tableCell("Board / Both Co-Founders", { width: 3480 }),
          ]}),
          new TableRow({ children: [
            tableCell("Chief Commercial Officer", { bold: true, width: 2400 }),
            tableCell("Offtake agreements, export contracts, buyer network, commodity pricing, trade desk", { width: 3480 }),
            tableCell("CEO (Peter Watson)", { width: 3480 }),
          ]}),
          new TableRow({ children: [
            tableCell("Chief People Officer", { bold: true, width: 2400 }),
            tableCell("Talent acquisition across 10 countries, culture, remote teams, local labor law", { width: 3480 }),
            tableCell("Both Co-Founders", { width: 3480 }),
          ]}),
        ]
      }),

      // TIER 3
      heading2("Tier 3 \u2014 VPs / Directors (Hires #6\u201320)"),
      heading3("Under Devon (Technology & Product)"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2800, 6560],
        rows: [
          new TableRow({ children: [
            tableCell("Role", { header: true, width: 2800 }),
            tableCell("Responsibility", { header: true, width: 6560 }),
          ]}),
          new TableRow({ children: [
            tableCell("VP Engineering", { bold: true, width: 2800 }),
            tableCell("Dev team management, sprint planning, code quality, architecture", { width: 6560 }),
          ]}),
          new TableRow({ children: [
            tableCell("VP Product", { bold: true, width: 2800 }),
            tableCell("Feature prioritization, user research, farmer UX, product analytics", { width: 6560 }),
          ]}),
          new TableRow({ children: [
            tableCell("Director of Data & AI", { bold: true, width: 2800 }),
            tableCell("Gemini models, crop intelligence, predictive analytics, satellite data, weather", { width: 6560 }),
          ]}),
          new TableRow({ children: [
            tableCell("Director of Blockchain", { bold: true, width: 2800 }),
            tableCell("EDMA platform, AFUSD stablecoin, RWA tokenization, carbon credits, smart contracts", { width: 6560 }),
          ]}),
          new TableRow({ children: [
            tableCell("Director of InfoSec", { bold: true, width: 2800 }),
            tableCell("Platform security, pen testing, data protection, GDPR/POPIA compliance", { width: 6560 }),
          ]}),
        ]
      }),
      heading3("Under Devon (Operations)"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2800, 6560],
        rows: [
          new TableRow({ children: [
            tableCell("Role", { header: true, width: 2800 }),
            tableCell("Responsibility", { header: true, width: 6560 }),
          ]}),
          new TableRow({ children: [
            tableCell("VP Operations", { bold: true, width: 2800 }),
            tableCell("Cross-country ops, SLAs, process optimization, supply chain oversight", { width: 6560 }),
          ]}),
          new TableRow({ children: [
            tableCell("Director of Supply Chain", { bold: true, width: 2800 }),
            tableCell("Input procurement, equipment sourcing, logistics, warehousing, cold chain", { width: 6560 }),
          ]}),
          new TableRow({ children: [
            tableCell("Director of Farmer Success", { bold: true, width: 2800 }),
            tableCell("Onboarding, training programs, tier progression, farmer NPS, support", { width: 6560 }),
          ]}),
        ]
      }),
      heading3("Under Peter (Commercial)"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2800, 6560],
        rows: [
          new TableRow({ children: [
            tableCell("Role", { header: true, width: 2800 }),
            tableCell("Responsibility", { header: true, width: 6560 }),
          ]}),
          new TableRow({ children: [
            tableCell("VP Business Development", { bold: true, width: 2800 }),
            tableCell("New market entry, government MOUs, institutional partnerships, DFI relationships", { width: 6560 }),
          ]}),
          new TableRow({ children: [
            tableCell("Director of Trade Finance", { bold: true, width: 2800 }),
            tableCell("SBLC origination, LC processing, Hamilton Reserve relationship, FX operations", { width: 6560 }),
          ]}),
        ]
      }),

      // TIER 4 - REGIONS & COUNTRIES
      heading2("Tier 4 \u2014 Regional Structure"),
      para("AFU operates through 3 regional hubs, each overseeing country operations:"),

      // SOUTHERN AFRICA
      new Paragraph({ children: [new PageBreak()] }),
      heading2("REGION 1: SOUTHERN AFRICA"),
      label("Regional Director: ", "Based in Harare, Zimbabwe"),
      label("Countries: ", "Zimbabwe, Botswana, Mozambique, Zambia"),
      divider(),

      heading3("ZIMBABWE (Pilot Country \u2014 Launch Q2 2026)"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3200, 6160],
        rows: [
          new TableRow({ children: [ tableCell("Role", { header: true, width: 3200 }), tableCell("Responsibility", { header: true, width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Country Director", { bold: true, width: 3200 }), tableCell("P&L owner, Watson & Fine blueberry project, government (Agric Ministry, RBZ), cooperative registration", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Operations Manager", { bold: true, width: 3200 }), tableCell("Farmer onboarding, input distribution, crop collection, EcoCash operations", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Finance Manager", { bold: true, width: 3200 }), tableCell("Loan disbursements via EcoCash, collections, portfolio management, RBZ compliance", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Agronomist Lead", { bold: true, width: 3200 }), tableCell("Blueberry agronomy, smallholder crop advisory, soil testing, GlobalGAP compliance", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Commercial Manager", { bold: true, width: 3200 }), tableCell("Blueberry export to EU, maize/soya/tobacco local offtake, GMB relationships", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Insurance Officer", { bold: true, width: 3200 }), tableCell("Crop insurance via Lloyd\u2019s, claims processing, weather index monitoring", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Compliance Officer", { bold: true, width: 3200 }), tableCell("KYC/AML, cooperative law (Co-operative Societies Act), ZIMRA filings", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Ambassador Coordinator", { bold: true, width: 3200 }), tableCell("Recruit 50+ ambassadors, community mobilization, Shona-language support", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("IT Support", { bold: true, width: 3200 }), tableCell("Platform support, EcoCash integration troubleshooting, device provisioning", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("5\u201310 Field Agronomists", { bold: true, width: 3200 }), tableCell("Farm visits, soil testing, crop monitoring, training delivery", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("3\u20135 Loan Officers", { bold: true, width: 3200 }), tableCell("Credit assessments, character references, disbursement verification, collections", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("1\u20132 Warehouse Managers", { bold: true, width: 3200 }), tableCell("Cold chain for blueberries, commodity storage, warehouse receipts", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("20\u201350 Extension Workers", { bold: true, width: 3200 }), tableCell("Community mobilization, farmer sign-up, basic support, Shona/Ndebele translation", { width: 6160 }) ]}),
        ]
      }),
      para([new TextRun({ text: "Target: 5,000 farmers Year 1 | Key crops: Blueberries, maize, soya, tobacco", size: 20, font: "Arial", color: AFU_GREEN, italics: true })]),

      heading3("BOTSWANA (Launch Q4 2026)"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3200, 6160],
        rows: [
          new TableRow({ children: [ tableCell("Role", { header: true, width: 3200 }), tableCell("Responsibility", { header: true, width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Country Director", { bold: true, width: 3200 }), tableCell("P&L, government relations (Ministry of Agriculture), cooperative setup", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Operations Manager", { bold: true, width: 3200 }), tableCell("Farmer onboarding, input distribution, Orange Money/FNB integration", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Finance Manager", { bold: true, width: 3200 }), tableCell("Loan operations, mobile money, NBFIRA compliance", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Agronomist Lead", { bold: true, width: 3200 }), tableCell("Dryland farming advisory, horticulture, cattle integration", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Commercial Manager", { bold: true, width: 3200 }), tableCell("Local market offtake, SACU trade, South Africa export corridor", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Insurance + Compliance", { bold: true, width: 3200 }), tableCell("Combined role initially: crop insurance, KYC, regulatory filings", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Ambassador Coordinator", { bold: true, width: 3200 }), tableCell("Recruit ambassadors, Setswana-language community engagement", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("3\u20135 Field Staff", { bold: true, width: 3200 }), tableCell("Agronomists + loan officers (combined initially)", { width: 6160 }) ]}),
        ]
      }),
      para([new TextRun({ text: "Target: 2,000 farmers Year 1 | Key crops: Sorghum, pulses, horticulture, cattle feed", size: 20, font: "Arial", color: AFU_GREEN, italics: true })]),

      heading3("MOZAMBIQUE (Launch Q1 2027)"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3200, 6160],
        rows: [
          new TableRow({ children: [ tableCell("Role", { header: true, width: 3200 }), tableCell("Responsibility", { header: true, width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Country Director", { bold: true, width: 3200 }), tableCell("P&L, government (MASA), Beira corridor logistics, cooperative registration", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Operations Manager", { bold: true, width: 3200 }), tableCell("Farmer onboarding, M-Pesa Mozambique, input distribution", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Finance Manager", { bold: true, width: 3200 }), tableCell("Loan operations in MZN, mobile money, Banco de Mo\u00E7ambique compliance", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Agronomist Lead", { bold: true, width: 3200 }), tableCell("Cashew, maize, rice, sesame advisory; Portuguese-language training", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Commercial Manager", { bold: true, width: 3200 }), tableCell("Cashew export, Beira port logistics, Indian Ocean trade routes", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Insurance + Compliance", { bold: true, width: 3200 }), tableCell("Combined role: crop insurance, ISSM compliance, KYC", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("5\u20138 Field Staff", { bold: true, width: 3200 }), tableCell("Portuguese-speaking agronomists, loan officers, extension workers", { width: 6160 }) ]}),
        ]
      }),
      para([new TextRun({ text: "Target: 3,000 farmers Year 1 | Key crops: Cashew, maize, rice, sesame | Language: Portuguese", size: 20, font: "Arial", color: AFU_GREEN, italics: true })]),

      heading3("ZAMBIA (Launch Q2 2027)"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3200, 6160],
        rows: [
          new TableRow({ children: [ tableCell("Role", { header: true, width: 3200 }), tableCell("Responsibility", { header: true, width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Country Director", { bold: true, width: 3200 }), tableCell("P&L, government (Ministry of Agriculture), FRA relationships, cooperative setup", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Operations Manager", { bold: true, width: 3200 }), tableCell("Farmer onboarding, MTN/Airtel Money, input distribution via FISP", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Finance Manager", { bold: true, width: 3200 }), tableCell("Loan operations in ZMW, mobile money, Bank of Zambia compliance", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Agronomist Lead", { bold: true, width: 3200 }), tableCell("Maize, soya, groundnut advisory; conservation agriculture focus", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Commercial Manager", { bold: true, width: 3200 }), tableCell("FRA offtake, COMESA trade, DRC/Congo export corridor", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Insurance + Compliance", { bold: true, width: 3200 }), tableCell("Combined: crop insurance, PIA compliance, KYC/AML", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("5\u20138 Field Staff", { bold: true, width: 3200 }), tableCell("Agronomists, loan officers, Bemba/Nyanja-speaking extension workers", { width: 6160 }) ]}),
        ]
      }),
      para([new TextRun({ text: "Target: 3,000 farmers Year 1 | Key crops: Maize, soya, groundnuts, cotton", size: 20, font: "Arial", color: AFU_GREEN, italics: true })]),

      // EAST AFRICA
      new Paragraph({ children: [new PageBreak()] }),
      heading2("REGION 2: EAST AFRICA"),
      label("Regional Director: ", "Based in Nairobi, Kenya"),
      label("Countries: ", "Uganda, Kenya, Tanzania"),
      divider(),

      heading3("UGANDA (Launch Q3 2026)"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3200, 6160],
        rows: [
          new TableRow({ children: [ tableCell("Role", { header: true, width: 3200 }), tableCell("Responsibility", { header: true, width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Country Director", { bold: true, width: 3200 }), tableCell("P&L, 19,000 pre-identified farmer onboarding, MAAIF relations, cooperative registration", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Operations Manager", { bold: true, width: 3200 }), tableCell("Mass farmer onboarding (19K target), MTN MoMo/Airtel Money, input distribution", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Finance Manager", { bold: true, width: 3200 }), tableCell("Loan operations in UGX, mobile money float, Bank of Uganda compliance", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Agronomist Lead", { bold: true, width: 3200 }), tableCell("Coffee, maize, beans, banana advisory; Luganda/Runyankole training materials", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Commercial Manager", { bold: true, width: 3200 }), tableCell("Coffee export (Bugisu AA), staple crop local offtake, UCDA relationships", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Insurance Officer", { bold: true, width: 3200 }), tableCell("Crop insurance, IRA Uganda compliance, weather index for drought-prone areas", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Compliance Officer", { bold: true, width: 3200 }), tableCell("KYC/AML, cooperative law, URA filings, data protection", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Ambassador Coordinator", { bold: true, width: 3200 }), tableCell("Recruit 100+ ambassadors for 19K farmer target, Luganda/Runyankole support", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("IT Support", { bold: true, width: 3200 }), tableCell("MTN MoMo integration, low-connectivity solutions, device provisioning", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("10\u201320 Field Agronomists", { bold: true, width: 3200 }), tableCell("Farm visits across central, western, and eastern Uganda", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("5\u201310 Loan Officers", { bold: true, width: 3200 }), tableCell("Credit assessments for 19K farmer pipeline, character references", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("2\u20133 Warehouse Managers", { bold: true, width: 3200 }), tableCell("Coffee washing stations, grain storage, warehouse receipts", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("50\u2013100 Extension Workers", { bold: true, width: 3200 }), tableCell("Mass onboarding, community mobilization, multi-language support", { width: 6160 }) ]}),
        ]
      }),
      para([new TextRun({ text: "Target: 19,000 farmers Year 1 | Key crops: Coffee, maize, beans, banana, cassava", size: 20, font: "Arial", color: AFU_GREEN, italics: true })]),

      heading3("KENYA (Launch Q1 2027)"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3200, 6160],
        rows: [
          new TableRow({ children: [ tableCell("Role", { header: true, width: 3200 }), tableCell("Responsibility", { header: true, width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Country Director", { bold: true, width: 3200 }), tableCell("P&L, government (Ministry of Agriculture), KALRO partnerships, cooperative setup", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Operations Manager", { bold: true, width: 3200 }), tableCell("M-Pesa integration (strongest mobile money market), Safaricom partnership", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Finance Manager", { bold: true, width: 3200 }), tableCell("Loan ops in KES, M-Pesa float management, CBK compliance", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Agronomist Lead", { bold: true, width: 3200 }), tableCell("Tea, coffee, horticulture (flowers, avocado), dairy advisory", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Commercial Manager", { bold: true, width: 3200 }), tableCell("Horticulture export (EU), tea/coffee auctions, flower exports via JKIA", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Insurance + Compliance", { bold: true, width: 3200 }), tableCell("Combined: crop/livestock insurance, IRA Kenya, KYC/AML", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("8\u201315 Field Staff", { bold: true, width: 3200 }), tableCell("Agronomists, loan officers, Swahili/Kikuyu-speaking extension workers", { width: 6160 }) ]}),
        ]
      }),
      para([new TextRun({ text: "Target: 5,000 farmers Year 1 | Key crops: Tea, coffee, avocado, flowers, dairy", size: 20, font: "Arial", color: AFU_GREEN, italics: true })]),

      heading3("TANZANIA (Launch Q2 2027)"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3200, 6160],
        rows: [
          new TableRow({ children: [ tableCell("Role", { header: true, width: 3200 }), tableCell("Responsibility", { header: true, width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Country Director", { bold: true, width: 3200 }), tableCell("P&L, government (Ministry of Agriculture), cooperative registration under Co-op Act", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Operations Manager", { bold: true, width: 3200 }), tableCell("Farmer onboarding, M-Pesa Tanzania/Tigo Pesa, SAGCOT corridor operations", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Finance Manager", { bold: true, width: 3200 }), tableCell("Loan ops in TZS, mobile money, Bank of Tanzania compliance", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Agronomist Lead", { bold: true, width: 3200 }), tableCell("Cashew, coffee, sisal, maize, rice advisory; Swahili training materials", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Commercial Manager", { bold: true, width: 3200 }), tableCell("Cashew/coffee export, Dar es Salaam port logistics, EAC trade", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Insurance + Compliance", { bold: true, width: 3200 }), tableCell("Combined: crop insurance, TIRA compliance, KYC/AML", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("5\u20138 Field Staff", { bold: true, width: 3200 }), tableCell("Swahili-speaking agronomists, loan officers, extension workers", { width: 6160 }) ]}),
        ]
      }),
      para([new TextRun({ text: "Target: 4,000 farmers Year 1 | Key crops: Cashew, coffee, sisal, maize, rice", size: 20, font: "Arial", color: AFU_GREEN, italics: true })]),

      // WEST AFRICA
      new Paragraph({ children: [new PageBreak()] }),
      heading2("REGION 3: WEST AFRICA"),
      label("Regional Director: ", "Based in Accra, Ghana"),
      label("Countries: ", "Ghana, Nigeria, Senegal"),
      divider(),

      heading3("GHANA (Launch Q3 2027)"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3200, 6160],
        rows: [
          new TableRow({ children: [ tableCell("Role", { header: true, width: 3200 }), tableCell("Responsibility", { header: true, width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Country Director", { bold: true, width: 3200 }), tableCell("P&L, government (MoFA), COCOBOD relationship, cooperative registration", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Operations Manager", { bold: true, width: 3200 }), tableCell("Farmer onboarding, MTN MoMo Ghana, input distribution", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Finance Manager", { bold: true, width: 3200 }), tableCell("Loan ops in GHS, mobile money, Bank of Ghana compliance", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Agronomist Lead", { bold: true, width: 3200 }), tableCell("Cocoa, cashew, maize, rice advisory; Twi/Ga training materials", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Commercial Manager", { bold: true, width: 3200 }), tableCell("Cocoa export via COCOBOD, cashew to India/Vietnam, Tema port logistics", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Insurance + Compliance", { bold: true, width: 3200 }), tableCell("Combined: crop insurance, NIC compliance, KYC/AML", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("5\u20138 Field Staff", { bold: true, width: 3200 }), tableCell("Agronomists, loan officers, Twi/Ewe-speaking extension workers", { width: 6160 }) ]}),
        ]
      }),
      para([new TextRun({ text: "Target: 5,000 farmers Year 1 | Key crops: Cocoa, cashew, maize, rice", size: 20, font: "Arial", color: AFU_GREEN, italics: true })]),

      heading3("NIGERIA (Launch Q4 2027)"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3200, 6160],
        rows: [
          new TableRow({ children: [ tableCell("Role", { header: true, width: 3200 }), tableCell("Responsibility", { header: true, width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Country Director", { bold: true, width: 3200 }), tableCell("P&L, federal + state government navigation, CBN regulations, cooperative setup", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Operations Manager", { bold: true, width: 3200 }), tableCell("Farmer onboarding, OPay/Palmpay/bank transfer ops, multi-state logistics", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Finance Manager", { bold: true, width: 3200 }), tableCell("Loan ops in NGN (volatile FX), fintech integration, CBN compliance", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Agronomist Lead", { bold: true, width: 3200 }), tableCell("Cocoa, palm oil, cassava, rice advisory; Yoruba/Igbo/Hausa training", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Commercial Manager", { bold: true, width: 3200 }), tableCell("Largest domestic market in Africa, Lagos port export, ECOWAS trade", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Insurance Officer", { bold: true, width: 3200 }), tableCell("NAICOM compliance, crop insurance, livestock insurance", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Compliance Officer", { bold: true, width: 3200 }), tableCell("Complex regulatory: CBN, SEC, NAICOM, FIRS, state-level filings", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Ambassador Coordinator", { bold: true, width: 3200 }), tableCell("Multi-ethnic recruitment, Yoruba/Igbo/Hausa community engagement", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("10\u201320 Field Staff", { bold: true, width: 3200 }), tableCell("Multi-state operations, agronomists, loan officers, extension workers", { width: 6160 }) ]}),
        ]
      }),
      para([new TextRun({ text: "Target: 10,000 farmers Year 1 | Key crops: Cocoa, palm oil, cassava, rice, maize | Largest TAM", size: 20, font: "Arial", color: AFU_GREEN, italics: true })]),

      heading3("SENEGAL (Launch Q1 2028)"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3200, 6160],
        rows: [
          new TableRow({ children: [ tableCell("Role", { header: true, width: 3200 }), tableCell("Responsibility", { header: true, width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Country Director", { bold: true, width: 3200 }), tableCell("P&L, government (MAER), francophone market entry, cooperative registration", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Operations Manager", { bold: true, width: 3200 }), tableCell("Farmer onboarding, Orange Money Senegal, input distribution", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Finance Manager", { bold: true, width: 3200 }), tableCell("Loan ops in XOF (CFA Franc), BCEAO compliance, Orange Money float", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Agronomist Lead", { bold: true, width: 3200 }), tableCell("Groundnut, millet, rice, horticulture advisory; French + Wolof training", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Commercial Manager", { bold: true, width: 3200 }), tableCell("Groundnut export, Dakar port logistics, UEMOA/ECOWAS trade", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("Insurance + Compliance", { bold: true, width: 3200 }), tableCell("Combined: crop insurance, CIMA compliance, KYC/AML", { width: 6160 }) ]}),
          new TableRow({ children: [ tableCell("5\u20138 Field Staff", { bold: true, width: 3200 }), tableCell("French/Wolof-speaking agronomists, loan officers, extension workers", { width: 6160 }) ]}),
        ]
      }),
      para([new TextRun({ text: "Target: 3,000 farmers Year 1 | Key crops: Groundnut, millet, rice, horticulture | Language: French", size: 20, font: "Arial", color: AFU_GREEN, italics: true })]),

      // TOTAL COUNTRY SUMMARY
      new Paragraph({ children: [new PageBreak()] }),
      heading2("Country Launch Summary"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2200, 1400, 2000, 1800, 1960],
        rows: [
          new TableRow({ children: [
            tableCell("Country", { header: true, width: 2200 }),
            tableCell("Launch", { header: true, width: 1400 }),
            tableCell("Year 1 Target", { header: true, width: 2000 }),
            tableCell("Key Crops", { header: true, width: 1800 }),
            tableCell("Team Size", { header: true, width: 1960 }),
          ]}),
          new TableRow({ children: [ tableCell("Zimbabwe", { bold: true, width: 2200, color: "EBF7E5" }), tableCell("Q2 2026", { width: 1400, color: "EBF7E5" }), tableCell("5,000", { width: 2000, color: "EBF7E5" }), tableCell("Blueberries, maize", { width: 1800, color: "EBF7E5" }), tableCell("40\u201370", { width: 1960, color: "EBF7E5" }) ]}),
          new TableRow({ children: [ tableCell("Uganda", { bold: true, width: 2200 }), tableCell("Q3 2026", { width: 1400 }), tableCell("19,000", { width: 2000 }), tableCell("Coffee, maize", { width: 1800 }), tableCell("80\u2013140", { width: 1960 }) ]}),
          new TableRow({ children: [ tableCell("Botswana", { bold: true, width: 2200, color: "EBF7E5" }), tableCell("Q4 2026", { width: 1400, color: "EBF7E5" }), tableCell("2,000", { width: 2000, color: "EBF7E5" }), tableCell("Sorghum, pulses", { width: 1800, color: "EBF7E5" }), tableCell("15\u201325", { width: 1960, color: "EBF7E5" }) ]}),
          new TableRow({ children: [ tableCell("Kenya", { bold: true, width: 2200 }), tableCell("Q1 2027", { width: 1400 }), tableCell("5,000", { width: 2000 }), tableCell("Tea, coffee, avocado", { width: 1800 }), tableCell("20\u201335", { width: 1960 }) ]}),
          new TableRow({ children: [ tableCell("Mozambique", { bold: true, width: 2200, color: "EBF7E5" }), tableCell("Q1 2027", { width: 1400, color: "EBF7E5" }), tableCell("3,000", { width: 2000, color: "EBF7E5" }), tableCell("Cashew, rice", { width: 1800, color: "EBF7E5" }), tableCell("15\u201325", { width: 1960, color: "EBF7E5" }) ]}),
          new TableRow({ children: [ tableCell("Tanzania", { bold: true, width: 2200 }), tableCell("Q2 2027", { width: 1400 }), tableCell("4,000", { width: 2000 }), tableCell("Cashew, coffee", { width: 1800 }), tableCell("15\u201325", { width: 1960 }) ]}),
          new TableRow({ children: [ tableCell("Zambia", { bold: true, width: 2200, color: "EBF7E5" }), tableCell("Q2 2027", { width: 1400, color: "EBF7E5" }), tableCell("3,000", { width: 2000, color: "EBF7E5" }), tableCell("Maize, soya", { width: 1800, color: "EBF7E5" }), tableCell("15\u201325", { width: 1960, color: "EBF7E5" }) ]}),
          new TableRow({ children: [ tableCell("Ghana", { bold: true, width: 2200 }), tableCell("Q3 2027", { width: 1400 }), tableCell("5,000", { width: 2000 }), tableCell("Cocoa, cashew", { width: 1800 }), tableCell("15\u201325", { width: 1960 }) ]}),
          new TableRow({ children: [ tableCell("Nigeria", { bold: true, width: 2200, color: "EBF7E5" }), tableCell("Q4 2027", { width: 1400, color: "EBF7E5" }), tableCell("10,000", { width: 2000, color: "EBF7E5" }), tableCell("Cocoa, palm oil", { width: 1800, color: "EBF7E5" }), tableCell("30\u201350", { width: 1960, color: "EBF7E5" }) ]}),
          new TableRow({ children: [ tableCell("Senegal", { bold: true, width: 2200 }), tableCell("Q1 2028", { width: 1400 }), tableCell("3,000", { width: 2000 }), tableCell("Groundnut, millet", { width: 1800 }), tableCell("15\u201325", { width: 1960 }) ]}),
          new TableRow({ children: [ tableCell("TOTAL", { bold: true, width: 2200, color: DARK }), tableCell("", { width: 1400, color: DARK }), tableCell("59,000", { width: 2000, color: DARK }), tableCell("", { width: 1800, color: DARK }), tableCell("260\u2013445", { width: 1960, color: DARK }) ]}),
        ]
      }),

      // TIER 6
      heading2("Tier 6 \u2014 Field Operations (per country)"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2800, 1800, 4760],
        rows: [
          new TableRow({ children: [
            tableCell("Role", { header: true, width: 2800 }),
            tableCell("Count", { header: true, width: 1800 }),
            tableCell("Responsibility", { header: true, width: 4760 }),
          ]}),
          new TableRow({ children: [
            tableCell("Field Agronomists", { bold: true, width: 2800 }),
            tableCell("5\u201320", { width: 1800 }),
            tableCell("Farm visits, soil testing, crop monitoring, training delivery", { width: 4760 }),
          ]}),
          new TableRow({ children: [
            tableCell("Loan Officers", { bold: true, width: 2800 }),
            tableCell("3\u201310", { width: 1800 }),
            tableCell("Farmer assessments, reference checks, disbursement verification, collections", { width: 4760 }),
          ]}),
          new TableRow({ children: [
            tableCell("Warehouse Managers", { bold: true, width: 2800 }),
            tableCell("1\u20133", { width: 1800 }),
            tableCell("Inventory, grading, storage, receipt finance documentation", { width: 4760 }),
          ]}),
          new TableRow({ children: [
            tableCell("Extension Workers / Ambassadors", { bold: true, width: 2800 }),
            tableCell("10\u201350", { width: 1800 }),
            tableCell("Community mobilization, farmer recruitment, basic support, translation", { width: 4760 }),
          ]}),
          new TableRow({ children: [
            tableCell("Drivers / Logistics", { bold: true, width: 2800 }),
            tableCell("2\u20135", { width: 1800 }),
            tableCell("Input delivery, crop collection, sample transport", { width: 4760 }),
          ]}),
        ]
      }),
      para([new TextRun({ text: "25\u201390 field staff per mature country. At full scale: 250\u2013900 across 10 countries.", size: 20, font: "Arial", color: GRAY, italics: true })]),

      // TIER 7
      heading2("Tier 7 \u2014 Central HQ / Shared Services"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2800, 1400, 5160],
        rows: [
          new TableRow({ children: [
            tableCell("Function", { header: true, width: 2800 }),
            tableCell("Size", { header: true, width: 1400 }),
            tableCell("Responsibility", { header: true, width: 5160 }),
          ]}),
          new TableRow({ children: [
            tableCell("Engineering", { bold: true, width: 2800 }),
            tableCell("15\u201325", { width: 1400 }),
            tableCell("Platform development, mobile apps, API integrations", { width: 5160 }),
          ]}),
          new TableRow({ children: [
            tableCell("DevOps / Infrastructure", { bold: true, width: 2800 }),
            tableCell("3\u20135", { width: 1400 }),
            tableCell("Cloud, CI/CD, monitoring, uptime, security", { width: 5160 }),
          ]}),
          new TableRow({ children: [
            tableCell("Data Science", { bold: true, width: 2800 }),
            tableCell("5\u20138", { width: 1400 }),
            tableCell("Credit scoring, yield prediction, market intelligence", { width: 5160 }),
          ]}),
          new TableRow({ children: [
            tableCell("Design / UX", { bold: true, width: 2800 }),
            tableCell("3\u20135", { width: 1400 }),
            tableCell("Farmer-centric design, multilingual UI, accessibility", { width: 5160 }),
          ]}),
          new TableRow({ children: [
            tableCell("Finance & Accounting", { bold: true, width: 2800 }),
            tableCell("5\u20138", { width: 1400 }),
            tableCell("Consolidated reporting, treasury, fund admin", { width: 5160 }),
          ]}),
          new TableRow({ children: [
            tableCell("Legal & Compliance", { bold: true, width: 2800 }),
            tableCell("4\u20136", { width: 1400 }),
            tableCell("Multi-jurisdiction, Foundation governance, contracts", { width: 5160 }),
          ]}),
          new TableRow({ children: [
            tableCell("HR / People Ops", { bold: true, width: 2800 }),
            tableCell("3\u20135", { width: 1400 }),
            tableCell("Hiring across 10 countries, payroll, benefits", { width: 5160 }),
          ]}),
          new TableRow({ children: [
            tableCell("Marketing & Comms", { bold: true, width: 2800 }),
            tableCell("4\u20136", { width: 1400 }),
            tableCell("Brand, PR, investor comms, farmer marketing, social", { width: 5160 }),
          ]}),
          new TableRow({ children: [
            tableCell("Customer Support", { bold: true, width: 2800 }),
            tableCell("5\u201310", { width: 1400 }),
            tableCell("Multilingual support, chatbot training, escalations", { width: 5160 }),
          ]}),
          new TableRow({ children: [
            tableCell("Trade Finance Desk", { bold: true, width: 2800 }),
            tableCell("3\u20135", { width: 1400 }),
            tableCell("SBLC processing, LC documentation, FX operations", { width: 5160 }),
          ]}),
          new TableRow({ children: [
            tableCell("Insurance Operations", { bold: true, width: 2800 }),
            tableCell("3\u20135", { width: 1400 }),
            tableCell("Lloyd\u2019s reporting, claims adjudication, product design", { width: 5160 }),
          ]}),
        ]
      }),
      para([new TextRun({ text: "Central HQ: ~55\u201390 staff", size: 20, font: "Arial", color: GRAY, italics: true })]),

      // HEADCOUNT PROJECTION
      heading2("Headcount Projection"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2800, 1600, 1800, 3160],
        rows: [
          new TableRow({ children: [
            tableCell("Phase", { header: true, width: 2800 }),
            tableCell("Timeline", { header: true, width: 1600 }),
            tableCell("Headcount", { header: true, width: 1800 }),
            tableCell("Monthly Burn", { header: true, width: 3160 }),
          ]}),
          new TableRow({ children: [
            tableCell("Phase 0 \u2014 Now", { bold: true, width: 2800, color: "EBF7E5" }),
            tableCell("Current", { width: 1600, color: "EBF7E5" }),
            tableCell("2", { width: 1800, color: "EBF7E5" }),
            tableCell("$0 (sweat equity)", { width: 3160, color: "EBF7E5" }),
          ]}),
          new TableRow({ children: [
            tableCell("Phase 1 \u2014 Seed", { bold: true, width: 2800 }),
            tableCell("Months 1\u20136", { width: 1600 }),
            tableCell("15\u201325", { width: 1800 }),
            tableCell("$150\u2013250K", { width: 3160 }),
          ]}),
          new TableRow({ children: [
            tableCell("Phase 2 \u2014 Zim + Uganda", { bold: true, width: 2800, color: "EBF7E5" }),
            tableCell("Months 6\u201318", { width: 1600, color: "EBF7E5" }),
            tableCell("50\u201380", { width: 1800, color: "EBF7E5" }),
            tableCell("$400\u2013600K", { width: 3160, color: "EBF7E5" }),
          ]}),
          new TableRow({ children: [
            tableCell("Phase 3 \u2014 5 Countries", { bold: true, width: 2800 }),
            tableCell("Months 18\u201336", { width: 1600 }),
            tableCell("150\u2013250", { width: 1800 }),
            tableCell("$1\u20131.5M", { width: 3160 }),
          ]}),
          new TableRow({ children: [
            tableCell("Phase 4 \u2014 10 Countries", { bold: true, width: 2800, color: "EBF7E5" }),
            tableCell("Months 36\u201360", { width: 1600, color: "EBF7E5" }),
            tableCell("400\u2013700", { width: 1800, color: "EBF7E5" }),
            tableCell("$2.5\u20134M", { width: 3160, color: "EBF7E5" }),
          ]}),
          new TableRow({ children: [
            tableCell("Phase 5 \u2014 Scale", { bold: true, width: 2800 }),
            tableCell("Year 5+", { width: 1600 }),
            tableCell("1,000+", { width: 1800 }),
            tableCell("$5M+", { width: 3160 }),
          ]}),
        ]
      }),

      // HIRING PRIORITY
      heading2("First 20 Hires \u2014 Priority Order"),
      bullet("Zimbabwe Country Director \u2014 Pilot country, boots on ground NOW", "1. "),
      bullet("Chief Financial Officer \u2014 $500M seed = financial controls day 1", "2. "),
      bullet("Chief Legal Officer \u2014 Foundation setup, cooperative registration, contracts", "3. "),
      bullet("VP Engineering \u2014 Build the dev team under Devon", "4. "),
      bullet("Zimbabwe Operations Manager \u2014 Run daily operations", "5. "),
      bullet("Zimbabwe Finance Manager \u2014 Lending operations launch", "6. "),
      bullet("Zimbabwe Agronomist Lead \u2014 Watson & Fine blueberry project", "7. "),
      bullet("Chief Risk Officer \u2014 Lloyd\u2019s coverholder requirement", "8. "),
      bullet("3\u00D7 Field Agronomists (Zimbabwe) \u2014 Start farmer onboarding", "9. "),
      bullet("2\u00D7 Loan Officers (Zimbabwe) \u2014 Process first applications", "10. "),
      bullet("VP Product / Senior Designer \u2014 Scale UX beyond Devon", "11. "),
      bullet("Uganda Country Director \u2014 Second country launch (19,000 farmers)", "12. "),
      bullet("Director of Trade Finance \u2014 SBLCs for blueberry export", "13. "),
      bullet("2\u00D7 Backend Engineers \u2014 Platform scaling", "14. "),
      bullet("Ambassador Coordinator (Zimbabwe) \u2014 Farmer recruitment at scale", "15. "),
      bullet("Marketing & Comms Lead \u2014 Brand building, investor materials", "16. "),
      bullet("Uganda Operations Manager \u2014 Second country ops", "17. "),
      bullet("Director of Data & AI \u2014 Credit scoring models", "18. "),
      bullet("Compliance Officer \u2014 KYC/AML across both countries", "19. "),
      bullet("Customer Support Lead \u2014 Multilingual farmer support", "20. "),

      // =============================================
      // PART 2: JOB ADS
      // =============================================
      new Paragraph({ children: [new PageBreak()] }),
      heading1("PART 2: JOB DESCRIPTIONS & RECRUITMENT BRIEFS"),
      para("The following pages contain detailed job advertisements for every role in the AFU organizational structure. Each posting includes the role brief, responsibilities, requirements, and application instructions."),

      // ---- C-SUITE ----
      ...jobAd(
        "Chief Financial Officer (CFO)",
        "Finance",
        "Remote / Harare, Zimbabwe (with travel across Africa)",
        "CEO (Peter Watson)",
        "Full-time, Executive",
        "$120,000\u2013$180,000 + Equity",
        "AFU is seeking an experienced CFO to build and lead our financial operations across 10 African countries. You will manage a $500M seed deployment, establish treasury operations, and build investor-grade financial reporting from day one. This is not a corporate finance role \u2014 you will be building financial infrastructure for agricultural lending, insurance, trade finance, and mobile money operations in frontier markets.",
        [
          "Build and manage financial controls, treasury, and fund accounting for $500M+ in capital deployment",
          "Establish investor reporting cadence (monthly, quarterly, annual) to institutional standards",
          "Oversee multi-currency operations across 10 African currencies plus USD",
          "Design and implement financial models for agricultural lending, crop insurance, and trade finance",
          "Manage relationships with auditors, tax advisors, and regulators across all jurisdictions",
          "Build the finance team from scratch \u2014 hire country finance managers and central accounting staff",
          "Coordinate with Hamilton Reserve Bank on trade finance and banking operations",
          "Manage mobile money float and liquidity across M-Pesa, EcoCash, MTN MoMo, Orange Money, Airtel",
          "Prepare for Series A and subsequent funding rounds",
          "Oversee cooperative financial governance (51% farmer-owned structures)",
        ],
        [
          "10+ years in finance, with at least 5 years as CFO or VP Finance",
          "Experience in African markets \u2014 ideally across multiple jurisdictions",
          "Deep understanding of agricultural finance, microfinance, or development finance",
          "Experience with mobile money ecosystems and multi-currency treasury management",
          "Strong understanding of cooperative financial structures",
          "CPA, CA, ACCA, or equivalent professional qualification",
          "Experience managing $100M+ in assets or fund deployment",
          "Track record of building finance teams in high-growth environments",
        ],
        [
          "Experience with DFIs (IFC, AfDB, CDC, FMO) or impact investment funds",
          "Knowledge of Lloyd\u2019s of London coverholder financial requirements",
          "Experience with blockchain/tokenized assets accounting",
          "Understanding of SBLC and Letter of Credit documentation",
          "Fluency in French or Portuguese (for West/East Africa expansion)",
        ],
        whyAFUDefault
      ),

      ...jobAd(
        "Chief Risk Officer (CRO)",
        "Risk & Insurance",
        "Remote / Harare, Zimbabwe (with travel)",
        "CEO (Peter Watson)",
        "Full-time, Executive",
        "$100,000\u2013$160,000 + Equity",
        "AFU is building Africa\u2019s first integrated agricultural insurance platform as a Lloyd\u2019s of London coverholder. We need a CRO who can build credit risk models for smallholder lending, design parametric insurance products, and satisfy Lloyd\u2019s regulatory requirements from day one. You will be the bridge between traditional insurance/risk management and cutting-edge agritech.",
        [
          "Build and maintain credit risk scoring models for smallholder and commercial farm lending",
          "Design parametric and index-based crop insurance products with Lloyd\u2019s underwriting capacity",
          "Establish and manage the Lloyd\u2019s coverholder compliance framework",
          "Develop fraud detection and prevention systems across all financial products",
          "Build risk appetite frameworks for agricultural lending across 10 countries",
          "Oversee weather data integration for parametric insurance triggers",
          "Manage reinsurance relationships and treaty negotiations",
          "Implement portfolio risk monitoring and early warning systems",
          "Design credit scorecards using alternative data (satellite imagery, mobile money history, farm telemetry)",
          "Report to the Board on risk exposure, capital adequacy, and insurance performance",
        ],
        [
          "10+ years in risk management, insurance, or credit risk",
          "Deep understanding of agricultural risk \u2014 crop insurance, weather derivatives, or agri-lending",
          "Experience with Lloyd\u2019s of London or coverholder operations",
          "Proven ability to build credit scoring models, ideally for underbanked populations",
          "Understanding of parametric/index-based insurance products",
          "Experience in African markets or emerging market risk management",
          "Professional qualifications in risk management (FRM, CRM) or actuarial science",
        ],
        [
          "Actuarial background or ACII qualification",
          "Experience with satellite data or remote sensing for risk assessment",
          "Knowledge of mobile money data for creditworthiness assessment",
          "Understanding of blockchain-based insurance or smart contract triggers",
        ],
        whyAFUDefault
      ),

      ...jobAd(
        "Chief Legal Officer (CLO)",
        "Legal & Compliance",
        "Remote / Mauritius or Netherlands (Foundation jurisdiction)",
        "Board of Directors",
        "Full-time, Executive",
        "$100,000\u2013$150,000 + Equity",
        "AFU operates across 10 African jurisdictions with a Netherlands Foundation holding structure, Mauritius operating company, country-level cooperatives, and Lloyd\u2019s coverholder status. We need a CLO who can navigate this multi-layered corporate structure while keeping things simple enough to move fast. You\u2019ll handle everything from cooperative law to trade finance contracts to IP protection.",
        [
          "Establish and manage the Netherlands Foundation (Stichting) governance",
          "Register and govern farmer-owned cooperatives across 10 countries (51% farmer ownership)",
          "Draft and manage all commercial agreements: offtake, supply, financing, insurance, partnership",
          "Ensure Lloyd\u2019s coverholder regulatory compliance",
          "Manage IP portfolio including platform technology, brand, and trade secrets",
          "Navigate agricultural, financial services, and cooperative regulations across 10 jurisdictions",
          "Advise on Hamilton Reserve Bank partnership and white-label banking regulatory requirements",
          "Draft investor documents, SAFEs, convertible notes, and equity agreements",
          "Oversee KYC/AML compliance framework across all countries",
          "Manage trade finance legal documentation (SBLCs, Letters of Credit, bills of lading)",
          "Advise on blockchain regulatory landscape (token issuance, stablecoin compliance)",
        ],
        [
          "12+ years legal experience, with 5+ years in African or multi-jurisdiction practice",
          "Experience with cooperative law, agricultural law, or microfinance regulation",
          "Understanding of Dutch Foundation (Stichting) or similar structures",
          "Experience with financial services licensing across African jurisdictions",
          "Strong contract drafting and negotiation skills",
          "Experience advising startups or high-growth companies",
          "LLB/JD with admission to at least one relevant jurisdiction",
        ],
        [
          "Experience with Lloyd\u2019s of London regulatory requirements",
          "Knowledge of Mauritius Global Business License structures",
          "Understanding of blockchain/token regulatory landscape",
          "Experience with DFI or development finance legal frameworks",
          "Fluency in French or Portuguese",
        ],
        whyAFUDefault
      ),

      ...jobAd(
        "Chief Commercial Officer (CCO)",
        "Commercial",
        "Nairobi, Kenya or Harare, Zimbabwe (with extensive travel)",
        "CEO (Peter Watson)",
        "Full-time, Executive",
        "$100,000\u2013$150,000 + Equity",
        "AFU guarantees offtake for every farmer on our platform. We need a CCO who can build and manage the buyer network, negotiate export contracts, manage commodity pricing, and run the trade desk. You are the person who ensures that when a farmer grows it, there\u2019s a buyer waiting.",
        [
          "Build and manage the offtake buyer network across domestic, regional, and international markets",
          "Negotiate export contracts for high-value crops (blueberries, macadamia, avocado, specialty coffee)",
          "Establish commodity pricing frameworks and market intelligence systems",
          "Manage the AFU trade desk \u2014 matching supply from 10 countries with buyer demand",
          "Coordinate with the trade finance team on SBLC and LC requirements for export deals",
          "Develop retail and wholesale distribution channels (AFU Fresh marketplace)",
          "Build strategic partnerships with food processors, retailers, and commodity traders",
          "Lead market entry analysis for new crops and new geographies",
          "Manage quality standards and compliance for export markets (GlobalGAP, HACCP, organic)",
          "Build and manage the commercial team across all countries",
        ],
        [
          "10+ years in agricultural commodity trading, export, or agri-business development",
          "Deep network of buyers in European, Middle Eastern, or Asian commodity markets",
          "Experience in African agricultural exports",
          "Understanding of trade finance instruments (LCs, SBLCs, warehouse receipts)",
          "Track record of building and scaling commercial operations",
          "Knowledge of food safety and export certification requirements",
          "Willingness to travel extensively across Africa",
        ],
        [
          "Existing relationships with European supermarket buyers or commodity traders",
          "Experience with blueberry, macadamia, or high-value horticultural exports",
          "Knowledge of fair trade, organic, or sustainability certifications",
          "Understanding of agricultural blockchain and traceability",
        ],
        whyAFUDefault
      ),

      ...jobAd(
        "Chief People Officer (CPO)",
        "Human Resources",
        "Remote (with travel across Africa)",
        "Both Co-Founders",
        "Full-time, Executive",
        "$80,000\u2013$130,000 + Equity",
        "AFU will grow from 2 people to 1,000+ across 10 African countries in 5 years. We need a CPO who can build a talent engine that recruits, develops, and retains world-class talent in some of the most challenging hiring markets on the continent. You\u2019ll build the culture that makes AFU the employer of choice in African agritech.",
        [
          "Build the entire HR function from scratch \u2014 policies, processes, systems, culture",
          "Design and execute hiring strategies across 10 African countries and multiple languages",
          "Establish competitive compensation and benefits structures for each market",
          "Navigate labor law compliance across 10+ jurisdictions",
          "Build the AFU Jobs marketplace and internal recruitment engine",
          "Design onboarding and training programs for all levels (HQ to field staff)",
          "Establish performance management, career development, and succession planning",
          "Build a distributed team culture that works across time zones and cultures",
          "Manage payroll operations across multiple currencies and payment methods",
          "Champion diversity, equity, and inclusion across all operations",
        ],
        [
          "8+ years in HR/People leadership, with experience building teams in Africa",
          "Experience scaling from startup to 500+ employees",
          "Deep understanding of labor law across at least 3 African jurisdictions",
          "Experience with remote/distributed team management",
          "Strong employer branding and talent acquisition skills",
          "Understanding of agricultural or field-based workforce management",
          "CIPD, SHRM, or equivalent qualification",
        ],
        [
          "Experience hiring field-based agricultural staff at scale",
          "Knowledge of cooperative workforce structures",
          "Fluency in multiple African languages or French/Portuguese",
          "Experience with payroll in mobile-money-heavy markets",
        ],
        whyAFUDefault
      ),

      // ---- VPs / DIRECTORS ----
      ...jobAd(
        "VP Engineering",
        "Technology",
        "Remote (overlap with CTO timezone required)",
        "CTO (Devon Kennaird)",
        "Full-time",
        "$90,000\u2013$140,000 + Equity",
        "AFU\u2019s platform is a 200+ page Next.js application with 40+ database tables, AI integration, real-time data, mobile money APIs, and blockchain components. We need a VP Engineering to take ownership of the engineering team, establish best practices, and scale the platform to handle millions of farmers across 10 countries.",
        [
          "Lead and grow the engineering team from 2 to 25+ developers",
          "Own sprint planning, code reviews, architecture decisions, and technical debt management",
          "Scale the platform for multi-country, multi-currency, multi-language operations",
          "Build and maintain mobile applications (React Native or Flutter)",
          "Implement real-time systems for market prices, weather data, and notifications",
          "Ensure 99.9% uptime with proper monitoring, alerting, and incident response",
          "Establish engineering hiring standards and technical interview processes",
          "Manage integrations with external APIs (mobile money, banking, satellite, weather)",
          "Implement automated testing, CI/CD, and deployment pipelines",
          "Collaborate with Product on feature prioritization and technical feasibility",
        ],
        [
          "8+ years software engineering, with 3+ years in engineering leadership",
          "Expert in TypeScript, React/Next.js, and Node.js",
          "Strong experience with PostgreSQL and Supabase or similar",
          "Experience building multi-tenant SaaS platforms at scale",
          "Track record of hiring and mentoring engineering teams",
          "Understanding of mobile-first development for low-bandwidth environments",
          "Experience with CI/CD, automated testing, and DevOps practices",
        ],
        [
          "Experience with African fintech or agritech platforms",
          "Knowledge of mobile money API integrations (M-Pesa, EcoCash)",
          "Experience with AI/ML integration in production systems",
          "Blockchain/smart contract development experience",
          "Experience building offline-first or low-connectivity applications",
        ],
        whyAFUDefault
      ),

      ...jobAd(
        "VP Product",
        "Product",
        "Remote (with periodic field visits to Africa)",
        "CTO (Devon Kennaird)",
        "Full-time",
        "$80,000\u2013$130,000 + Equity",
        "AFU\u2019s platform serves everyone from illiterate smallholder farmers using basic smartphones to commercial farm managers running 1,000+ hectare operations. We need a VP Product who can build products that work for BOTH ends of this spectrum while maintaining a single coherent platform.",
        [
          "Own the product roadmap and feature prioritization across 5 portals",
          "Conduct user research with farmers, field staff, and administrators across Africa",
          "Design the progressive disclosure system (Seedling\u2192Pioneer tier unlock)",
          "Ensure products work on low-end Android devices with intermittent connectivity",
          "Build product analytics and track farmer engagement, retention, and outcomes",
          "Manage the UX/UI design team and establish design system standards",
          "Coordinate multilingual product releases (English, Shona, Swahili, French, Portuguese)",
          "Design farmer onboarding flows that work for low-literacy users",
          "Build A/B testing frameworks for feature optimization",
          "Translate commercial requirements into product specifications",
        ],
        [
          "7+ years in product management, with 3+ years leading product teams",
          "Experience designing for emerging markets or low-literacy users",
          "Strong UX sensibility with ability to design and prototype",
          "Data-driven approach to product decisions",
          "Experience with B2B2C or marketplace platforms",
          "Willingness to spend time in the field with actual farmers",
          "Understanding of mobile-first product design",
        ],
        [
          "Experience with agricultural technology or farmer-facing products",
          "Knowledge of progressive web apps and offline-first design",
          "Experience with fintech product design (lending, insurance, payments)",
          "Fluency in an African language",
          "Experience with voice-based or USSD interfaces",
        ],
        whyAFUDefault
      ),

      ...jobAd(
        "Director of Data & AI",
        "Technology",
        "Remote",
        "CTO (Devon Kennaird)",
        "Full-time",
        "$80,000\u2013$120,000 + Equity",
        "AFU uses AI across the platform: crop disease detection, yield prediction, credit scoring, market intelligence, and a farmer advisory chatbot. We need a Director of Data & AI to take these from prototype to production-grade systems that serve millions of farmers with actionable intelligence.",
        [
          "Build and deploy credit scoring models using alternative data (satellite, mobile money, farm data)",
          "Scale the AI crop doctor from prototype to production (disease detection, pest identification)",
          "Develop yield prediction models using satellite imagery and weather data",
          "Build market intelligence systems for commodity pricing and demand forecasting",
          "Design and train the multilingual farmer advisory AI chatbot",
          "Implement satellite-based crop monitoring and farm verification systems",
          "Build weather data pipelines for parametric insurance triggers",
          "Create data infrastructure for real-time analytics across 10 countries",
          "Develop carbon credit measurement and verification algorithms",
          "Ensure data privacy and sovereignty compliance across all jurisdictions",
        ],
        [
          "7+ years in data science/ML, with 3+ years leading teams",
          "Strong experience with computer vision (crop/disease detection from imagery)",
          "Experience building credit scoring or risk models for underbanked populations",
          "Proficiency in Python, TensorFlow/PyTorch, and cloud ML platforms",
          "Experience with geospatial data, satellite imagery (Sentinel, Planet Labs)",
          "Understanding of agricultural data and farming systems",
          "Experience deploying ML models at scale in production",
        ],
        [
          "Experience with Google Gemini API or similar LLM integration",
          "Knowledge of blockchain data and on-chain analytics",
          "Experience with weather data APIs and climate modelling",
          "Remote sensing or precision agriculture background",
          "PhD in relevant field (ML, statistics, agricultural science)",
        ],
        whyAFUDefault
      ),

      ...jobAd(
        "Director of Blockchain",
        "Technology",
        "Remote",
        "CTO (Devon Kennaird)",
        "Full-time",
        "$80,000\u2013$120,000 + Equity",
        "AFU is building EDMA \u2014 a blockchain layer on Polygon for agricultural asset tokenization, stablecoin payments (AFUSD), carbon credit trading, and supply chain traceability. We need a Director of Blockchain to take this from concept to live infrastructure.",
        [
          "Design and deploy the EDMA blockchain platform on Polygon",
          "Build the AFUSD stablecoin (pegged to agricultural commodity basket)",
          "Implement Real World Asset (RWA) tokenization for farm assets, equipment, and receivables",
          "Build carbon credit measurement, verification, and trading infrastructure",
          "Design smart contracts for automated insurance payouts and trade finance",
          "Implement supply chain traceability from farm to fork",
          "Ensure regulatory compliance for token issuance across all jurisdictions",
          "Build wallet infrastructure that works for farmers (simplified UX)",
          "Integrate blockchain layer with existing platform (Next.js, Supabase)",
          "Design tokenomics and governance models",
        ],
        [
          "5+ years in blockchain development, with production deployments",
          "Expert in Solidity, Polygon/Ethereum, and smart contract security",
          "Experience with token issuance, stablecoins, or RWA tokenization",
          "Understanding of DeFi protocols and decentralized governance",
          "Knowledge of carbon credit markets and verification standards",
          "Experience with supply chain traceability on blockchain",
          "Understanding of regulatory landscape for digital assets in Africa",
        ],
        [
          "Experience with agricultural supply chain or commodity tokenization",
          "Knowledge of MiCA, FATF, or African digital asset regulations",
          "Experience building consumer-facing blockchain products (simplified UX)",
          "Understanding of cross-border payment systems",
        ],
        whyAFUDefault
      ),

      ...jobAd(
        "Director of InfoSec",
        "Technology",
        "Remote",
        "CTO (Devon Kennaird)",
        "Full-time",
        "$70,000\u2013$110,000 + Equity",
        "AFU handles sensitive financial data, farmer PII, and processes financial transactions across 10 countries. We need a Director of InfoSec to build a security program that protects our platform, our farmers, and our reputation from day one.",
        [
          "Build and manage the information security program across all systems",
          "Conduct regular penetration testing and vulnerability assessments",
          "Implement and maintain SOC 2 Type II and ISO 27001 compliance",
          "Ensure GDPR, POPIA, and local data protection compliance across 10 countries",
          "Design and implement fraud detection systems for lending and payments",
          "Manage incident response procedures and security monitoring",
          "Oversee secure development practices and code security reviews",
          "Ensure PCI-DSS compliance for payment processing",
          "Build security awareness training for all staff",
          "Manage third-party security assessments and vendor risk",
        ],
        [
          "7+ years in information security, with 3+ years in leadership",
          "CISSP, CISM, or equivalent certification",
          "Experience with financial services security requirements",
          "Strong understanding of cloud security (Vercel, Supabase, AWS)",
          "Experience with penetration testing and vulnerability management",
          "Knowledge of African data protection regulations",
          "Experience building security programs from scratch",
        ],
        [
          "Experience with fintech or payment platform security",
          "Knowledge of blockchain security and smart contract auditing",
          "Experience with mobile money security",
          "SOC 2 and ISO 27001 implementation experience",
        ],
        whyAFUDefault
      ),

      ...jobAd(
        "VP Operations",
        "Operations",
        "Harare, Zimbabwe (with travel across Africa)",
        "CTO & Head of Ops (Devon Kennaird)",
        "Full-time",
        "$80,000\u2013$120,000 + Equity",
        "AFU operates across 10 African countries with farming operations, lending, insurance, trade finance, and supply chain logistics all running simultaneously. We need a VP Operations who can build the operational machine that makes all of this work at scale. You\u2019ll be Devon\u2019s right hand on the operations side.",
        [
          "Build and manage cross-country operational processes and SLAs",
          "Oversee country operations managers and ensure consistent quality across all markets",
          "Design and optimize farmer onboarding, lending, and insurance workflows",
          "Manage supply chain operations: inputs, equipment, processing, logistics",
          "Build operational dashboards and KPI tracking across all countries",
          "Coordinate with technology team on process automation and system improvements",
          "Manage vendor and supplier relationships across all markets",
          "Establish quality control and audit processes for field operations",
          "Scale operations from 2 countries to 10 within 36 months",
          "Build the operations team across all country offices",
        ],
        [
          "10+ years in operations management, with 5+ years in senior leadership",
          "Experience in African agricultural operations or microfinance",
          "Track record of scaling operations across multiple countries",
          "Strong process design and optimization skills",
          "Experience managing distributed teams across cultures and languages",
          "Understanding of agricultural supply chains in Africa",
          "Data-driven approach to operational decisions",
        ],
        [
          "Experience with cooperative operations or farmer organizations",
          "Knowledge of mobile money operations and agent networks",
          "Experience with warehouse receipt systems or commodity storage",
          "Background in logistics or cold chain management",
        ],
        whyAFUDefault
      ),

      ...jobAd(
        "Director of Supply Chain",
        "Operations",
        "Harare, Zimbabwe (with travel)",
        "VP Operations",
        "Full-time",
        "$60,000\u2013$90,000 + Equity",
        "AFU procures farming inputs (seeds, fertilizer, chemicals), equipment (tractors, drones, irrigation), and manages post-harvest logistics (storage, processing, cold chain, transport) across 10 countries. We need someone who can build supplier networks, negotiate bulk pricing, and ensure the right inputs reach the right farmers at the right time.",
        [
          "Build and manage supplier networks for farming inputs across 10 countries",
          "Negotiate bulk procurement agreements for seeds, fertilizer, and agrochemicals",
          "Manage equipment procurement and financing (tractors, drones, irrigation systems)",
          "Design and operate post-harvest logistics: collection, grading, storage, transport",
          "Build cold chain infrastructure for perishable exports (blueberries, fresh produce)",
          "Implement warehouse receipt systems for commodity storage and financing",
          "Manage last-mile delivery of inputs to smallholder farmers",
          "Establish quality control standards for all inputs and commodities",
          "Build inventory management and demand forecasting systems",
          "Coordinate with trade finance team on export logistics documentation",
        ],
        [
          "7+ years in supply chain management, preferably in African agriculture",
          "Experience with agricultural input distribution in frontier markets",
          "Knowledge of cold chain logistics and perishable goods handling",
          "Understanding of warehouse receipt systems and commodity storage",
          "Strong negotiation skills and supplier management experience",
          "Experience with last-mile delivery in rural African contexts",
          "Understanding of import/export documentation and customs",
        ],
        [
          "Experience with agricultural equipment financing or leasing",
          "Knowledge of drone technology for agricultural application",
          "Experience with irrigation system procurement and installation",
          "Understanding of organic or specialty crop supply chains",
        ],
        whyAFUDefault
      ),

      ...jobAd(
        "Director of Farmer Success",
        "Operations",
        "Harare, Zimbabwe (with travel)",
        "VP Operations",
        "Full-time",
        "$50,000\u2013$80,000 + Equity",
        "Our farmers are our members, our customers, and our co-owners. We need someone who obsesses over their success. You\u2019ll design the onboarding experience, training programs, tier progression system, and support operations that take a farmer from signing up to thriving.",
        [
          "Design and manage the farmer onboarding journey across all countries",
          "Build and deliver training programs (in-person and digital) for the Seedling\u2192Pioneer progression",
          "Establish farmer support operations: call center, WhatsApp, field support, chatbot training",
          "Track farmer outcomes: yield improvement, income growth, loan repayment, satisfaction",
          "Manage the farmer NPS program and continuous feedback loops",
          "Design certification programs aligned with export market requirements",
          "Coordinate with ambassador network on farmer recruitment and community engagement",
          "Build farmer success metrics and reporting dashboards",
          "Manage the progressive feature unlock system based on training completion",
          "Create multilingual training content (video, audio, illustrated guides for low-literacy users)",
        ],
        [
          "5+ years in farmer extension, agricultural training, or customer success",
          "Deep understanding of smallholder farmer challenges in Africa",
          "Experience designing and delivering training programs for low-literacy audiences",
          "Strong empathy and communication skills across cultures",
          "Experience with agricultural extension services or farmer organizations",
          "Understanding of adult learning principles in developing contexts",
          "Willingness to spend significant time in the field with farmers",
        ],
        [
          "Experience with digital farmer training platforms",
          "Knowledge of GlobalGAP, organic, or export certification programs",
          "Fluency in an African language (Shona, Swahili, Luganda)",
          "Background in community development or cooperative management",
        ],
        whyAFUDefault
      ),

      ...jobAd(
        "VP Business Development",
        "Commercial",
        "Nairobi, Kenya or Johannesburg, South Africa (with extensive travel)",
        "CEO (Peter Watson)",
        "Full-time",
        "$80,000\u2013$120,000 + Equity",
        "AFU is expanding to 10 countries and needs someone who can open doors: government MOUs, DFI partnerships, institutional investor relationships, and strategic alliances. You\u2019ll be Peter\u2019s force multiplier on the commercial side.",
        [
          "Lead market entry strategy for new countries \u2014 regulatory mapping, partnership identification, pilot design",
          "Negotiate government MOUs and concessions for agricultural development programs",
          "Build and manage DFI relationships (IFC, AfDB, CDC, FMO, USAID, AGRA)",
          "Develop institutional investor pipeline and support fundraising efforts",
          "Identify and negotiate strategic partnerships (banks, telcos, input companies, processors)",
          "Lead partnership negotiations with Lloyd\u2019s syndicates and insurance partners",
          "Build relationships with agricultural commodity exchanges",
          "Develop public-private partnership proposals for agricultural infrastructure",
          "Represent AFU at industry conferences, government forums, and investor events",
          "Manage the business development team and pipeline CRM",
        ],
        [
          "10+ years in business development, with 5+ years in Africa",
          "Strong existing network in African government, DFI, and institutional investor circles",
          "Experience in agricultural development, fintech, or impact investment",
          "Track record of closing large partnerships or deals ($10M+)",
          "Understanding of African regulatory environments for financial services",
          "Excellent presentation and negotiation skills",
          "Willingness to travel 50%+ of the time across Africa",
        ],
        [
          "Existing relationships with DFIs (IFC, AfDB, CDC)",
          "Experience with agricultural PPPs (public-private partnerships)",
          "Government advisory experience in African countries",
          "Knowledge of COMESA, SADC, or EAC trade frameworks",
        ],
        whyAFUDefault
      ),

      ...jobAd(
        "Director of Trade Finance",
        "Finance",
        "Remote / Mauritius (Hamilton Reserve Bank proximity)",
        "CFO",
        "Full-time",
        "$70,000\u2013$110,000 + Equity",
        "AFU provides trade finance services to enable agricultural exports from Africa: SBLCs, Letters of Credit, export pre-financing, and FX services via Hamilton Reserve Bank. We need a Director of Trade Finance who can build and run this operation.",
        [
          "Manage the SBLC origination and processing pipeline",
          "Process Letters of Credit for agricultural commodity exports",
          "Coordinate with Hamilton Reserve Bank on trade finance facilities",
          "Manage FX operations and hedging for multi-currency agricultural trade",
          "Build export pre-financing programs for commercial farmers",
          "Design warehouse receipt financing products",
          "Ensure compliance with international trade finance regulations",
          "Manage documentary collections and bills of lading",
          "Build trade finance reporting and portfolio monitoring systems",
          "Train country teams on trade finance documentation requirements",
        ],
        [
          "7+ years in trade finance, with experience in commodity trade",
          "Deep understanding of SBLCs, Letters of Credit, and documentary collections",
          "Experience with African agricultural exports",
          "Knowledge of international trade regulations (UCP 600, ISBP)",
          "Experience managing banking relationships for trade finance",
          "Strong attention to detail for documentation compliance",
          "Understanding of FX risk management and hedging",
        ],
        [
          "Experience with Hamilton Reserve Bank or similar offshore banks",
          "Knowledge of warehouse receipt finance systems",
          "Experience with commodity exchange delivery and settlement",
          "Understanding of agricultural commodity grading and certification",
        ],
        whyAFUDefault
      ),

      // ---- COMMODITY TRADER ----
      ...jobAd(
        "Senior Commodity Trader",
        "Commercial / Trade Desk",
        "Nairobi, Kenya or Johannesburg, South Africa (with extensive travel)",
        "Chief Commercial Officer",
        "Full-time",
        "$80,000\u2013$140,000 + Performance Bonus + Equity",
        "AFU is building a commodity trade desk that matches African agricultural production with global buyers. We need an experienced commodity trader who has sat on a trading desk, managed physical positions, hedged risk, and closed multi-million dollar deals. You will trade soft commodities (grains, oilseeds, horticulture, specialty crops) originating from our 10 African countries into domestic, regional, and international markets. This is hands-on trading \u2014 not strategy or advisory.",
        [
          "Trade physical agricultural commodities originating from AFU\u2019s 10-country farmer network",
          "Manage trading positions in maize, soya, blueberries, macadamia, cashew, cocoa, coffee, and specialty crops",
          "Execute spot and forward contracts with domestic and international buyers",
          "Hedge price risk using appropriate instruments (futures, options, swaps)",
          "Build and manage the counterparty network: traders, processors, exporters, commodity houses",
          "Negotiate offtake agreements with guaranteed minimum pricing for farmers",
          "Monitor global commodity markets and identify arbitrage opportunities across AFU countries",
          "Manage trade execution: pricing, contracts, logistics coordination, quality verification, payment",
          "Coordinate with trade finance team on LC/SBLC requirements for each deal",
          "Manage FX exposure on cross-border trades",
          "Build market intelligence reports for the commercial team and farmer advisory",
          "Develop new trade routes and buyer relationships in Europe, Middle East, and Asia",
          "Manage counterparty credit risk and ensure proper documentation on all trades",
          "Work with the blockchain team on commodity tokenization and traceability",
        ],
        [
          "7+ years as a commodity trader with a physical trading house, commodity merchant, or agri-trading firm",
          "Proven P&L track record trading soft commodities (grains, oilseeds, coffee, cocoa, or horticulture)",
          "Deep understanding of physical commodity logistics: shipping, warehousing, grading, certification",
          "Experience with trade finance instruments: Letters of Credit, documentary collections, pre-export finance",
          "Strong network of commodity buyers in at least 2 of: Europe, Middle East, Asia",
          "Understanding of commodity hedging using futures and options (SAFEX, CME, ICE)",
          "Experience with African agricultural commodities and origin markets",
          "Ability to manage multiple positions and trades simultaneously",
          "Strong analytical skills: market analysis, P&L management, risk assessment",
          "Willingness to travel extensively to origin countries and buyer markets",
        ],
        [
          "Experience at a major trading house (Cargill, ADM, Louis Dreyfus, Olam, ETG, Export Trading Group)",
          "SAFEX or JSE trading certification",
          "Experience trading blueberries, macadamia, or high-value horticultural products",
          "Knowledge of fair trade, organic, or Rainforest Alliance certified supply chains",
          "Experience with commodity exchange warehouse delivery mechanisms",
          "Understanding of carbon credit markets and agricultural carbon trading",
          "Network in East or Southern African commodity markets specifically",
        ],
        whyAFUDefault
      ),

      // ---- REGIONAL DIRECTORS ----
      ...jobAd(
        "Regional Director \u2014 Southern Africa",
        "Regional Management",
        "Harare, Zimbabwe",
        "VP Operations & CEO",
        "Full-time",
        "$60,000\u2013$100,000 + Equity",
        "You will oversee AFU operations across Zimbabwe, Botswana, Mozambique, and Zambia. This is the pilot region \u2014 Zimbabwe launches first with the Watson & Fine blueberry project and 19,000 smallholder farmers. You need to make the model work here before we scale it continent-wide.",
        [
          "Oversee 4 Country Directors and their teams across Southern Africa",
          "Own the regional P&L and growth targets",
          "Ensure the Zimbabwe pilot succeeds as the template for all other countries",
          "Manage cross-border logistics and trade between Southern African countries",
          "Build regional government and institutional relationships",
          "Coordinate regional supply chain and procurement for cost efficiencies",
          "Manage regional risk and compliance across all 4 jurisdictions",
          "Report to HQ on regional performance, challenges, and opportunities",
          "Build the regional team and establish the Harare regional office",
          "Represent AFU at SADC and COMESA forums",
        ],
        [
          "10+ years in senior management in Southern Africa",
          "Deep understanding of Zimbabwean agricultural sector",
          "Experience managing teams across multiple countries",
          "Strong government and institutional relationships in the region",
          "Understanding of agricultural finance, insurance, or commodity trade",
          "Track record of building and scaling operations",
          "Knowledge of SADC trade frameworks and regulations",
        ],
        [
          "Experience in agricultural commodity exports from Zimbabwe",
          "Knowledge of blueberry or horticultural operations",
          "Existing relationships with Zimbabwean government agriculture ministry",
          "Understanding of cooperative structures in Southern Africa",
        ],
        whyAFUDefault
      ),

      ...jobAd(
        "Regional Director \u2014 East Africa",
        "Regional Management",
        "Nairobi, Kenya",
        "VP Operations & CEO",
        "Full-time",
        "$60,000\u2013$100,000 + Equity",
        "East Africa is AFU\u2019s growth engine: Uganda launches with 19,000 pre-identified farmers, Kenya is the fintech hub, and Tanzania offers massive agricultural potential. You\u2019ll build and scale operations across all three markets.",
        [
          "Oversee 3 Country Directors and their teams across East Africa",
          "Own the regional P&L and growth targets",
          "Launch Uganda operations with 19,000 farmer onboarding",
          "Leverage Kenya\u2019s fintech ecosystem for mobile money and payment innovation",
          "Build regional partnerships with M-Pesa, Safaricom, and East African banks",
          "Manage cross-border trade within the EAC (East African Community)",
          "Coordinate with Nairobi-based commodity exchanges and export infrastructure",
          "Build the regional team and establish the Nairobi regional office",
          "Represent AFU at EAC forums and regional agricultural conferences",
          "Scale operations to serve 100,000+ farmers across the region within 3 years",
        ],
        [
          "10+ years in senior management in East Africa",
          "Deep understanding of agricultural operations in Uganda, Kenya, and/or Tanzania",
          "Experience with mobile money ecosystems (M-Pesa, MTN MoMo, Airtel Money)",
          "Strong network in East African business, government, and development circles",
          "Track record of scaling operations in multiple East African countries",
          "Understanding of EAC trade frameworks",
        ],
        [
          "Experience with agricultural cooperatives or farmer organizations in East Africa",
          "Knowledge of Ugandan agricultural sector specifically",
          "Existing relationships with DFIs operating in East Africa",
          "Experience with coffee, tea, or horticultural exports",
        ],
        whyAFUDefault
      ),

      ...jobAd(
        "Regional Director \u2014 West Africa",
        "Regional Management",
        "Accra, Ghana",
        "VP Operations & CEO",
        "Full-time",
        "$60,000\u2013$100,000 + Equity",
        "West Africa represents AFU\u2019s largest total addressable market: Nigeria alone has 40M+ smallholder farmers. Ghana and Senegal offer stable regulatory environments for pilot entry. You\u2019ll build the playbook for West African expansion.",
        [
          "Oversee 3 Country Directors across Ghana, Nigeria, and Senegal",
          "Own the regional P&L and growth targets",
          "Navigate the complex Nigerian regulatory environment for fintech and agriculture",
          "Build partnerships with West African banks, mobile money operators, and agri-businesses",
          "Manage francophone operations in Senegal (French-speaking market entry)",
          "Coordinate with ECOWAS trade frameworks for cross-border agricultural trade",
          "Build the regional team and establish the Accra regional office",
          "Develop cocoa, cashew, and staple crop value chains in the region",
          "Represent AFU at ECOWAS and West African agricultural forums",
          "Scale to serve 200,000+ farmers across West Africa within 4 years",
        ],
        [
          "10+ years in senior management in West Africa",
          "Experience across both anglophone (Ghana, Nigeria) and francophone (Senegal) markets",
          "Understanding of agricultural value chains in West Africa (cocoa, cashew, rice, cassava)",
          "Strong network in West African business and government circles",
          "Experience navigating Nigerian regulatory complexity",
          "Fluency in English and French",
        ],
        [
          "Experience with Orange Money, MTN MoMo, or other West African mobile money",
          "Knowledge of ECOWAS trade regulations",
          "Existing relationships with West African DFIs or development organizations",
          "Experience with cocoa or cashew export operations",
        ],
        whyAFUDefault
      ),

      // ---- COUNTRY ROLES ----
      ...jobAd(
        "Country Director \u2014 Zimbabwe (Pilot Country)",
        "Country Management",
        "Harare, Zimbabwe",
        "Regional Director \u2014 Southern Africa",
        "Full-time",
        "$40,000\u2013$70,000 + Performance Bonus + Equity",
        "Zimbabwe is AFU\u2019s pilot country. Everything we build here becomes the template for 9 more countries. You\u2019ll launch the Watson & Fine blueberry export program, onboard the first cohort of smallholder farmers, and prove that the AFU model works. This is the most important Country Director role in the company.",
        [
          "Own the Zimbabwe P&L \u2014 revenue, costs, farmer growth, loan performance",
          "Launch the Watson & Fine blueberry export program (25ha commercial operation)",
          "Onboard the first 5,000 smallholder farmers in Year 1",
          "Build and manage the Zimbabwe team (Operations, Finance, Agronomy, Commercial, Insurance, Compliance)",
          "Establish relationships with Zimbabwean government (Agriculture Ministry, RBZ, ZIMRA)",
          "Register and operationalize the Zimbabwe farmer cooperative (51% farmer-owned)",
          "Manage local banking relationships and EcoCash mobile money integration",
          "Ensure all operations comply with Zimbabwean regulations",
          "Coordinate with HQ on platform localization (Shona language, local content)",
          "Build the proof-of-concept that unlocks the next $450M+ in deployment",
        ],
        [
          "7+ years in agricultural business, development, or fintech in Zimbabwe",
          "Deep understanding of Zimbabwean farming landscape (commercial and smallholder)",
          "Strong relationships with Zimbabwean government and agricultural institutions",
          "Experience managing teams of 20+ people",
          "Understanding of EcoCash and local payment systems",
          "Knowledge of Zimbabwean cooperative and agricultural law",
          "Track record of delivering results in challenging environments",
          "Fluency in English and Shona",
        ],
        [
          "Experience with blueberry or horticultural operations",
          "Knowledge of tobacco, maize, or soya value chains in Zimbabwe",
          "Existing relationships with TIMB, GMB, or other statutory bodies",
          "Experience with agricultural lending or microfinance in Zimbabwe",
        ],
        whyAFUDefault
      ),

      ...jobAd(
        "Country Operations Manager",
        "Country Management",
        "Various locations across 10 African countries",
        "Country Director",
        "Full-time",
        "$25,000\u2013$45,000 + Performance Bonus",
        "You are the engine that makes a country run. You manage farmer onboarding, daily operations, logistics, field teams, and everything in between. While the Country Director handles strategy and relationships, you handle execution.",
        [
          "Manage day-to-day operations: farmer onboarding, input distribution, crop collection",
          "Supervise field agronomists, loan officers, warehouse managers, and extension workers",
          "Coordinate logistics: input delivery schedules, crop collection routes, storage allocation",
          "Manage farmer training program delivery in the field",
          "Handle escalated farmer issues and resolve operational bottlenecks",
          "Track and report on operational KPIs (farmers onboarded, loans disbursed, crops collected)",
          "Ensure quality standards for inputs distributed and crops collected",
          "Manage vendor relationships for local services (transport, storage, processing)",
          "Coordinate with HQ technology team on system issues and feature requests",
          "Build and maintain the local team culture and morale",
        ],
        [
          "5+ years in operations management, preferably in agriculture or microfinance",
          "Experience managing field teams in rural African environments",
          "Strong organizational and logistics skills",
          "Problem-solving ability in resource-constrained environments",
          "Understanding of agricultural cycles and farmer needs",
          "Proficiency with technology and mobile applications",
          "Fluency in local language(s) plus English",
        ],
        [
          "Experience with agricultural cooperative operations",
          "Knowledge of warehouse management and commodity storage",
          "Experience with mobile money operations",
          "Background in agricultural extension",
        ],
        whyAFUDefault
      ),

      ...jobAd(
        "Country Finance Manager",
        "Finance",
        "Various locations across 10 African countries",
        "Country Director (dotted line to CFO)",
        "Full-time",
        "$25,000\u2013$45,000 + Performance Bonus",
        "You manage the money at the country level: loan disbursements, collections, mobile money operations, and financial reporting. You\u2019re the person who ensures farmers get funded on time and repayments flow back smoothly.",
        [
          "Manage loan origination and disbursement processes",
          "Oversee loan collections and manage portfolio quality (PAR30, write-offs)",
          "Operate mobile money disbursement and collection channels",
          "Process insurance premium collections and claims payouts",
          "Prepare monthly financial reports for country and HQ",
          "Manage local bank accounts and cash flow",
          "Verify farmer KYC documentation and credit references",
          "Coordinate with field loan officers on credit assessments",
          "Manage cooperative financial records and farmer dividend calculations",
          "Ensure compliance with local financial regulations",
        ],
        [
          "5+ years in microfinance, agricultural lending, or banking in Africa",
          "Experience with loan portfolio management and collections",
          "Understanding of mobile money operations and float management",
          "Strong financial reporting and analytical skills",
          "Knowledge of local financial regulations and KYC requirements",
          "Experience with credit assessment for agricultural borrowers",
          "Professional accounting qualification (CPA, ACCA, or equivalent)",
        ],
        [
          "Experience with cooperative financial management",
          "Knowledge of agricultural insurance operations",
          "Experience with digital lending platforms",
          "Understanding of warehouse receipt financing",
        ],
        whyAFUDefault
      ),

      ...jobAd(
        "Country Agronomist Lead",
        "Agronomy",
        "Various locations across 10 African countries",
        "Country Director (dotted line to Director of Farmer Success)",
        "Full-time",
        "$20,000\u2013$40,000 + Performance Bonus",
        "You are the agricultural brain of the country operation. You assess farms, advise farmers, train extension workers, and ensure crop quality meets export standards. Your work directly determines whether farmers succeed and whether AFU\u2019s lending is safe.",
        [
          "Conduct farm assessments for new farmer onboarding and loan applications",
          "Provide crop advisory services to farmers (planting, pest management, harvest timing)",
          "Lead and train the field agronomist team",
          "Monitor crop health and yield across the farmer portfolio using satellite and field data",
          "Ensure compliance with export quality standards (GlobalGAP, HACCP, organic)",
          "Design and deliver farmer training programs on best agricultural practices",
          "Conduct soil testing and provide fertilizer recommendations",
          "Support insurance teams with crop damage assessments",
          "Manage demonstration plots and farmer field schools",
          "Provide technical input for credit assessments and crop viability analysis",
        ],
        [
          "BSc/MSc in Agriculture, Agronomy, or related field",
          "5+ years as a practicing agronomist in Africa",
          "Deep knowledge of local crops, soils, and farming systems",
          "Experience with farmer extension and training",
          "Understanding of export crop quality requirements",
          "Ability to train and manage field agronomist teams",
          "Proficiency with agricultural data collection tools",
          "Fluency in local language(s)",
        ],
        [
          "Experience with blueberry, macadamia, or high-value crop agronomy",
          "Knowledge of precision agriculture tools (drones, satellite monitoring)",
          "Experience with organic or conservation agriculture practices",
          "Understanding of climate-smart agriculture",
        ],
        whyAFUDefault
      ),

      ...jobAd(
        "Country Commercial Manager",
        "Commercial",
        "Various locations across 10 African countries",
        "Country Director (dotted line to CCO)",
        "Full-time",
        "$25,000\u2013$40,000 + Performance Bonus",
        "You find the buyers, negotiate the prices, and make sure every farmer\u2019s harvest has a home. You\u2019re the link between production and market \u2014 the person who turns crops into cash.",
        [
          "Build and manage local buyer relationships (wholesalers, processors, retailers, exporters)",
          "Negotiate offtake agreements with guaranteed minimum prices for farmers",
          "Monitor local commodity prices and market intelligence",
          "Coordinate crop aggregation and delivery to buyers",
          "Manage the AFU Fresh marketplace listings for the country",
          "Identify new market opportunities and crop diversification options",
          "Ensure quality standards meet buyer requirements",
          "Coordinate with trade finance team on export documentation",
          "Manage the country exchange/barter marketplace",
          "Report on commercial performance (volumes, prices, margins, buyer satisfaction)",
        ],
        [
          "5+ years in agricultural marketing, commodity trading, or agri-business",
          "Strong local network of agricultural buyers and processors",
          "Understanding of commodity pricing and market dynamics",
          "Experience negotiating supply contracts",
          "Knowledge of agricultural grading and quality standards",
          "Strong relationship management skills",
          "Fluency in local language(s) and English",
        ],
        [
          "Experience with agricultural export logistics",
          "Knowledge of fair trade or sustainability certifications",
          "Experience with commodity exchange operations",
          "Understanding of food processing requirements",
        ],
        whyAFUDefault
      ),

      ...jobAd(
        "Country Insurance Officer",
        "Insurance",
        "Various locations across 10 African countries",
        "Country Director (dotted line to CRO)",
        "Full-time",
        "$20,000\u2013$35,000 + Performance Bonus",
        "You manage crop insurance operations at the country level: selling policies, processing claims, conducting farm assessments, and reporting to Lloyd\u2019s. You protect farmers from the risks that can wipe out a season\u2019s work.",
        [
          "Manage crop insurance sales and farmer education on insurance products",
          "Process insurance claims: receive, assess, verify, and recommend payouts",
          "Conduct farm assessments for insurance underwriting",
          "Monitor weather data and parametric triggers for index-based insurance",
          "Coordinate with field agronomists on crop damage verification",
          "Prepare Lloyd\u2019s coverholder reports and compliance documentation",
          "Manage relationships with local insurance regulators",
          "Train farmers and field staff on insurance processes",
          "Track portfolio performance (claims ratio, premium collection, farmer satisfaction)",
          "Identify and prevent fraudulent claims",
        ],
        [
          "3+ years in insurance, ideally agricultural or microinsurance",
          "Understanding of crop insurance products (indemnity and parametric)",
          "Knowledge of local insurance regulations",
          "Experience with claims processing and assessment",
          "Strong attention to detail and analytical skills",
          "Ability to work in rural environments",
          "Insurance qualification or diploma preferred",
        ],
        [
          "Experience with Lloyd\u2019s or international reinsurance",
          "Knowledge of weather index insurance",
          "Understanding of satellite-based crop monitoring",
          "Actuarial or risk assessment background",
        ],
        whyAFUDefault
      ),

      ...jobAd(
        "Country Compliance Officer",
        "Legal & Compliance",
        "Various locations across 10 African countries",
        "Country Director (dotted line to CLO)",
        "Full-time",
        "$20,000\u2013$35,000 + Performance Bonus",
        "You ensure AFU operates legally and ethically in your country. KYC/AML compliance, cooperative governance, regulatory filings, and data protection all fall on your shoulders.",
        [
          "Manage KYC/AML compliance for all farmer and partner onboarding",
          "Ensure cooperative governance compliance (board meetings, member records, annual filings)",
          "File regulatory reports with financial services and cooperative regulators",
          "Conduct compliance training for country staff",
          "Monitor and report on regulatory changes that affect AFU operations",
          "Manage data protection compliance (local data protection laws)",
          "Oversee audit preparation and coordinate with external auditors",
          "Maintain the country compliance manual and update procedures",
          "Investigate and report compliance incidents or suspicious activity",
          "Coordinate with HQ legal team on contracts and regulatory queries",
        ],
        [
          "3+ years in compliance, legal, or regulatory roles",
          "Knowledge of local financial services and cooperative regulations",
          "Understanding of KYC/AML requirements",
          "Strong attention to detail and documentation skills",
          "Experience with regulatory filings and audit processes",
          "Legal qualification or compliance certification preferred",
          "Fluency in local language(s) and English",
        ],
        [
          "Experience with microfinance or agricultural lending compliance",
          "Knowledge of data protection regulations",
          "Experience with cooperative law",
          "Anti-money laundering certification",
        ],
        whyAFUDefault
      ),

      ...jobAd(
        "Country Ambassador Coordinator",
        "Community",
        "Various locations across 10 African countries",
        "Country Operations Manager",
        "Full-time",
        "$15,000\u2013$25,000 + Performance Bonus",
        "Ambassadors are the face of AFU in farming communities. You recruit, train, and manage a network of local ambassadors who sign up farmers, provide basic support, and build trust in communities where technology and formal finance are new concepts.",
        [
          "Recruit and onboard ambassador network across the country",
          "Train ambassadors on AFU products, platform usage, and farmer communication",
          "Set and track ambassador performance targets (farmers recruited, active users, satisfaction)",
          "Manage ambassador compensation (commissions, incentives, recognition programs)",
          "Organize community events, farmer field days, and awareness campaigns",
          "Collect farmer feedback through ambassador network and escalate to HQ",
          "Coordinate with marketing team on promotional materials and campaigns",
          "Manage the ambassador portal and communication channels",
          "Resolve community concerns and build trust in AFU\u2019s services",
          "Identify high-performing ambassadors for career progression within AFU",
        ],
        [
          "3+ years in community mobilization, agent network management, or field sales",
          "Experience working in rural African communities",
          "Strong interpersonal and leadership skills",
          "Experience managing distributed teams or agent networks",
          "Understanding of agricultural communities and farmer needs",
          "Proficiency with mobile technology",
          "Fluency in local language(s)",
        ],
        [
          "Experience with mobile money agent network management",
          "Background in agricultural extension or NGO field operations",
          "Experience with community health worker or similar agent models",
          "Knowledge of adult literacy and basic training delivery",
        ],
        whyAFUDefault
      ),

      // ---- FIELD ROLES ----
      ...jobAd(
        "Field Agronomist",
        "Agronomy",
        "Various rural locations across 10 African countries",
        "Country Agronomist Lead",
        "Full-time",
        "$8,000\u2013$18,000 + Performance Bonus",
        "You are on the ground with farmers every day. You visit farms, test soil, advise on crops, monitor for disease, and deliver training. You are the direct link between AFU\u2019s technology platform and the farmer\u2019s field.",
        [
          "Visit farmers regularly to assess crop health and provide advisory",
          "Conduct soil testing and provide tailored fertilizer and input recommendations",
          "Deliver farmer training sessions on best agricultural practices",
          "Use the AFU mobile app to record farm data, photos, and GPS coordinates",
          "Monitor for pest and disease outbreaks and recommend treatments",
          "Support loan officers with farm assessments for credit decisions",
          "Assist with crop damage assessments for insurance claims",
          "Collect harvest data and coordinate with collection logistics",
          "Serve as the technical expert for your assigned farmer portfolio",
          "Report weekly on farm conditions, challenges, and training completed",
        ],
        [
          "Diploma or BSc in Agriculture, Crop Science, or related field",
          "2+ years field experience in agricultural extension or agronomy",
          "Knowledge of local crops, soils, pests, and farming practices",
          "Comfortable using mobile applications for data collection",
          "Motorcycle license (travel to rural farms required)",
          "Physical fitness for field work in all weather conditions",
          "Strong communication skills with farmers of all education levels",
          "Fluency in local language(s)",
        ],
        [
          "Experience with precision agriculture tools",
          "Knowledge of organic farming practices",
          "First aid certification",
          "Experience with agricultural data collection apps",
        ],
        whyAFUDefault
      ),

      ...jobAd(
        "Loan Officer",
        "Finance",
        "Various locations across 10 African countries",
        "Country Finance Manager",
        "Full-time",
        "$8,000\u2013$15,000 + Performance Bonus",
        "You assess farmers for creditworthiness, verify their references, monitor loan usage, and manage collections. In the African context, character references and community reputation matter as much as financials. You need to know your farmers.",
        [
          "Conduct farmer credit assessments: farm visits, reference checks, financial history review",
          "Verify character references \u2014 visit referees, assess farmer reputation in community",
          "Process loan applications through the AFU platform",
          "Monitor loan utilization: ensure funds are used for stated agricultural purposes",
          "Manage loan collections and farmer repayment schedules",
          "Conduct follow-up visits for overdue accounts",
          "Coordinate with agronomists on crop viability for lending decisions",
          "Build relationships with farming communities to identify creditworthy borrowers",
          "Report on portfolio quality (disbursement, collection, PAR30, defaults)",
          "Educate farmers on financial literacy and responsible borrowing",
        ],
        [
          "2+ years in microfinance, agricultural lending, or banking",
          "Experience with credit assessment in rural African contexts",
          "Understanding of agricultural cycles and cash flow timing",
          "Strong interpersonal skills and community trust",
          "Comfortable using mobile technology for data entry and reporting",
          "Motorcycle license for rural travel",
          "Integrity and strong ethical standards \u2014 this is non-negotiable",
          "Fluency in local language(s)",
        ],
        [
          "Experience with mobile money lending platforms",
          "Knowledge of cooperative lending models",
          "Financial literacy training experience",
          "Background in community development",
        ],
        whyAFUDefault
      ),

      ...jobAd(
        "Warehouse Manager",
        "Operations",
        "Processing hub locations across 10 African countries",
        "Country Operations Manager",
        "Full-time",
        "$10,000\u2013$20,000 + Performance Bonus",
        "You manage the physical hub where crops come in, get graded, stored, and shipped out. Warehouse receipt finance means your inventory records are financial instruments \u2014 accuracy is everything.",
        [
          "Manage receiving, grading, weighing, and storage of agricultural commodities",
          "Maintain accurate inventory records for warehouse receipt financing",
          "Ensure proper storage conditions (temperature, humidity, pest control)",
          "Coordinate inbound deliveries from farmers and outbound shipments to buyers",
          "Issue warehouse receipts and manage the receipt register",
          "Maintain cold chain integrity for perishable commodities",
          "Manage warehouse staff (laborers, graders, security)",
          "Ensure food safety and quality standards compliance",
          "Report daily on inventory levels, receipts, and dispatches",
          "Coordinate with logistics team on transport scheduling",
        ],
        [
          "3+ years in warehouse management, preferably agricultural commodities",
          "Experience with commodity grading and quality assessment",
          "Understanding of warehouse receipt systems",
          "Strong organizational and inventory management skills",
          "Knowledge of food safety and storage requirements",
          "Basic computer skills for inventory management systems",
          "Physical fitness for warehouse environment",
        ],
        [
          "Experience with cold chain management",
          "Knowledge of export packaging and documentation",
          "Forklift certification",
          "Experience with HACCP or food safety systems",
        ],
        whyAFUDefault
      ),

      ...jobAd(
        "Marketing & Communications Lead",
        "Marketing",
        "Remote (with travel to Africa)",
        "Both Co-Founders",
        "Full-time",
        "$50,000\u2013$80,000 + Equity",
        "AFU\u2019s story is powerful: by farmers, for farmers, the Amazon of African agriculture. We need someone who can tell this story to farmers, investors, governments, and the media in a way that builds trust and drives growth.",
        [
          "Build and manage the AFU brand across all channels (digital, print, events, PR)",
          "Create investor-facing materials: pitch decks, one-pagers, impact reports",
          "Design farmer-facing marketing: multilingual campaigns, radio, SMS, WhatsApp, community events",
          "Manage social media presence and content strategy",
          "Build PR strategy and manage media relationships across Africa",
          "Create content for the AFU website, blog, and newsletter",
          "Design co-branded materials for partnerships (Lloyd\u2019s, Hamilton Reserve, government)",
          "Manage the AFU ambassador marketing toolkit",
          "Coordinate with product team on in-app messaging and farmer communications",
          "Track marketing performance metrics and optimize spend",
        ],
        [
          "5+ years in marketing, preferably in agritech, fintech, or development sector",
          "Experience with both B2C (farmer-facing) and B2B (investor/partner) marketing",
          "Strong writing and storytelling skills",
          "Experience with digital marketing in African markets",
          "Understanding of multilingual campaign requirements",
          "Design skills or experience managing design teams",
          "Experience with impact reporting and ESG communications",
        ],
        [
          "Experience with farmer-facing marketing in Africa",
          "Knowledge of radio and SMS marketing in rural contexts",
          "Video production skills",
          "Understanding of agricultural sector media landscape",
        ],
        whyAFUDefault
      ),

      ...jobAd(
        "Customer Support Lead",
        "Operations",
        "Remote / Harare, Zimbabwe",
        "Director of Farmer Success",
        "Full-time",
        "$20,000\u2013$35,000 + Performance Bonus",
        "Farmers will call, message, and WhatsApp us with questions about loans, insurance, inputs, crops, payments, and everything in between. You build and run the support operation that makes every farmer feel heard and helped.",
        [
          "Build the customer support function from scratch: processes, tools, knowledge base",
          "Manage multilingual support across phone, WhatsApp, in-app chat, and email",
          "Train and manage the support team across multiple countries",
          "Design support workflows for different query types (finance, insurance, agronomy, tech)",
          "Monitor and improve response times, resolution rates, and farmer satisfaction",
          "Build and maintain the farmer FAQ and self-service knowledge base",
          "Coordinate with product team to improve the AI chatbot responses",
          "Escalate system issues and bugs to the engineering team",
          "Produce weekly support reports with trends and farmer feedback",
          "Design and implement a farmer NPS tracking program",
        ],
        [
          "3+ years in customer support, preferably managing teams",
          "Experience supporting users in African markets",
          "Multilingual ability (at least 2 African languages plus English)",
          "Experience with support tools (Zendesk, Intercom, or similar)",
          "Strong empathy and communication skills",
          "Experience building support processes from scratch",
          "Comfort with technology and ability to troubleshoot platform issues",
        ],
        [
          "Experience with WhatsApp Business API for support",
          "Background in agricultural extension or farmer education",
          "Experience with chatbot training and optimization",
          "Knowledge of mobile money support operations",
        ],
        whyAFUDefault
      ),

      // FINAL NOTE
      new Paragraph({ children: [new PageBreak()] }),
      heading1("APPENDIX: APPLICATION PROCESS"),
      heading2("How to Apply"),
      para("All applications should be submitted to careers@africanfarmersunion.com with:"),
      bullet("Subject line: \"[Role Title] \u2014 [Your Name]\""),
      bullet("Updated CV/resume (PDF format)"),
      bullet("Brief cover letter explaining why you want to join AFU (max 1 page)"),
      bullet("Portfolio or relevant work samples (where applicable)"),
      bullet("2\u20133 professional references"),
      divider(),
      heading2("Selection Process"),
      bullet("Application review (1 week)", "Stage 1: "),
      bullet("Video interview with hiring manager (30 minutes)", "Stage 2: "),
      bullet("Technical assessment or case study (role-dependent)", "Stage 3: "),
      bullet("Interview with Co-Founders (45 minutes)", "Stage 4: "),
      bullet("Reference checks and offer", "Stage 5: "),
      divider(),
      para([new TextRun({ text: "AFU is committed to building a diverse team that reflects the communities we serve. We strongly encourage applications from women, people from rural farming backgrounds, and candidates from all 10 of our operating countries.", size: 20, font: "Arial", color: GRAY, italics: true })]),
      new Paragraph({ spacing: { before: 400 }, alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: "www.africanfarmersunion.com", bold: true, size: 22, font: "Arial", color: AFU_GREEN }),
      ]}),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: "\"Let\u2019s Grow Together\"", size: 22, font: "Georgia", color: GRAY, italics: true }),
      ]}),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("C:/PROJECT101/AFU/afu-portal/public/documents/AFU-OrgChart-RecruitmentPack.docx", buffer);
  console.log("Created AFU-OrgChart-RecruitmentPack.docx successfully!");
});
