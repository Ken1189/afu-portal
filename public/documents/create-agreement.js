const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, LevelFormat,
        HeadingLevel, BorderStyle, WidthType, ShadingType,
        PageNumber, PageBreak } = require('docx');
const fs = require('fs');

const AFU_GREEN = "5DB347";
const DARK = "1B2A4A";
const GRAY = "666666";
const LIGHT_GREEN = "EBF7E5";
const LINE = "CCCCCC";

const border = { style: BorderStyle.SINGLE, size: 1, color: LINE };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function heading1(text) {
  return new Paragraph({
    spacing: { before: 360, after: 200 },
    children: [new TextRun({ text, bold: true, size: 28, font: "Georgia", color: DARK })],
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: AFU_GREEN, space: 4 } }
  });
}

function heading2(text) {
  return new Paragraph({
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, size: 24, font: "Georgia", color: DARK })]
  });
}

function para(runs, opts = {}) {
  const children = typeof runs === 'string'
    ? [new TextRun({ text: runs, size: 22, font: "Georgia", color: "333333" })]
    : runs;
  return new Paragraph({ spacing: { after: 120 }, ...opts, children });
}

function boldPara(label, value) {
  return para([
    new TextRun({ text: label, bold: true, size: 22, font: "Georgia", color: "333333" }),
    new TextRun({ text: value, size: 22, font: "Georgia", color: "333333" })
  ]);
}

function bulletItem(text, bold = "") {
  const children = [];
  if (bold) {
    children.push(new TextRun({ text: bold, bold: true, size: 22, font: "Georgia", color: "333333" }));
  }
  children.push(new TextRun({ text, size: 22, font: "Georgia", color: "333333" }));
  return new Paragraph({
    spacing: { after: 60 },
    indent: { left: 720, hanging: 360 },
    numbering: { reference: "bullets", level: 0 },
    children
  });
}

function sigBlock(name, title) {
  return [
    new Paragraph({ spacing: { before: 400 }, children: [] }),
    para([new TextRun({ text: name + " \u2014 " + title, bold: true, size: 22, font: "Georgia", color: DARK })]),
    new Paragraph({ spacing: { before: 200 }, children: [] }),
    para([new TextRun({ text: "Signature: ________________________________________", size: 22, font: "Georgia", color: "333333" })]),
    new Paragraph({ spacing: { before: 80 }, children: [] }),
    para([new TextRun({ text: "Date: ________________________________________", size: 22, font: "Georgia", color: "333333" })]),
  ];
}

function tableCell(text, opts = {}) {
  const { bold, header, width } = opts;
  return new TableCell({
    borders,
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    margins: cellMargins,
    shading: header ? { fill: DARK, type: ShadingType.CLEAR } : undefined,
    children: [new Paragraph({
      children: [new TextRun({
        text, bold: bold || header, size: 20, font: "Georgia",
        color: header ? "FFFFFF" : "333333"
      })]
    })]
  });
}

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
            new TextRun({ text: "Co-Founder Agreement", size: 20, font: "Georgia", color: GRAY, italics: true }),
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
      // TITLE PAGE
      new Paragraph({ spacing: { before: 2400 }, children: [] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: "CO-FOUNDER AGREEMENT", bold: true, size: 44, font: "Georgia", color: DARK })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: AFU_GREEN, space: 8 } },
        children: [new TextRun({ text: "AFRICAN FARMING UNION (PTY) LTD", size: 28, font: "Georgia", color: AFU_GREEN })]
      }),
      new Paragraph({ spacing: { before: 600 }, alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: "Date: ________________________", size: 24, font: "Georgia", color: GRAY })
      ]}),
      new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: "Effective Date: Upon execution by all parties", size: 22, font: "Georgia", color: GRAY })
      ]}),
      new Paragraph({ spacing: { before: 1200 }, alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: "CONFIDENTIAL", bold: true, size: 20, font: "Georgia", color: "CC0000" })
      ]}),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [
        new TextRun({ text: "This document is a template for discussion purposes.", size: 18, font: "Georgia", color: GRAY, italics: true })
      ]}),
      new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: "The Co-Founders are advised to have this Agreement reviewed by a qualified legal professional before execution.", size: 18, font: "Georgia", color: GRAY, italics: true })
      ]}),

      // PAGE BREAK
      new Paragraph({ children: [new PageBreak()] }),

      // SECTION 1 - PARTIES
      heading1("1. PARTIES"),
      para("This Co-Founder Agreement (the \"Agreement\") is entered into by and between:"),
      new Paragraph({ spacing: { before: 160, after: 60 }, children: [
        new TextRun({ text: "1. Peter Watson ", bold: true, size: 22, font: "Georgia", color: "333333" }),
        new TextRun({ text: "(\"Watson\") \u2014 Founder & Chief Executive Officer", size: 22, font: "Georgia", color: "333333" }),
      ]}),
      bulletItem("ID/Passport: ________________________"),
      bulletItem("Address: ________________________"),
      bulletItem("Email: ________________________"),
      new Paragraph({ spacing: { before: 160, after: 60 }, children: [
        new TextRun({ text: "2. Devon Kennaird ", bold: true, size: 22, font: "Georgia", color: "333333" }),
        new TextRun({ text: "(\"Kennaird\") \u2014 Co-Founder, CTO, Head of Product & Operations", size: 22, font: "Georgia", color: "333333" }),
      ]}),
      bulletItem("ID/Passport: ________________________"),
      bulletItem("Address: ________________________"),
      bulletItem("Email: dkennaird8@gmail.com"),
      para([new TextRun({ text: "Collectively referred to as the \"Co-Founders\" or individually as a \"Co-Founder.\"", size: 22, font: "Georgia", color: "333333", italics: true })]),

      // SECTION 2 - RECITALS
      new Paragraph({ children: [new PageBreak()] }),
      heading1("2. RECITALS"),
      para([new TextRun({ text: "WHEREAS:", bold: true, size: 22, font: "Georgia", color: DARK })]),
      para("A. The Co-Founders wish to establish and operate AFU, a technology-enabled agricultural finance, insurance, and marketplace platform serving smallholder and commercial farmers across Africa;"),
      para("B. Watson has contributed the founding vision, agricultural expertise, commercial farming relationships, and business development efforts;"),
      para("C. Kennaird has designed, architected, and built the entire AFU technology platform, comprising:"),
      bulletItem("200+ page web application (Next.js, TypeScript, React)"),
      bulletItem("5 operational portals (Public Website, Farmer Portal, Commercial Dashboard, Supplier Portal, Admin Portal)"),
      bulletItem("40+ database tables with row-level security (Supabase/PostgreSQL)"),
      bulletItem("Stripe payment infrastructure with 5 mobile money gateway integrations"),
      bulletItem("AI-powered crop advisory system (Google Gemini integration)"),
      bulletItem("Multi-channel notification engine (email, SMS, push, in-app, WhatsApp)"),
      bulletItem("Loan origination and approval workflow engine"),
      bulletItem("Insurance application and claims processing system"),
      bulletItem("Equipment financing and marketplace infrastructure"),
      bulletItem("KYC/AML verification system with document upload"),
      bulletItem("Admin CMS with content management, feature flags, and analytics"),
      bulletItem("Progressive farmer training and tier system"),
      bulletItem("Jobs marketplace and ambassador platform"),
      bulletItem("Investor portal and pitch materials"),
      bulletItem("93+ automated tests with CI/CD pipeline"),
      bulletItem("Trade finance infrastructure (SBLCs, Letters of Credit)"),
      bulletItem("Bulk farmer onboarding with CSV import"),
      bulletItem("Farm Intelligence Map with geospatial data"),
      para("D. The Co-Founders now wish to formalize their respective rights, obligations, and equity interests."),

      // SECTION 3 - EQUITY
      new Paragraph({ children: [new PageBreak()] }),
      heading1("3. EQUITY ALLOCATION"),
      heading2("3.1 Initial Equity Split"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3120, 3120, 3120],
        rows: [
          new TableRow({ children: [
            tableCell("Co-Founder", { header: true, width: 3120 }),
            tableCell("Role", { header: true, width: 3120 }),
            tableCell("Equity", { header: true, width: 3120 }),
          ]}),
          new TableRow({ children: [
            tableCell("Peter Watson", { width: 3120 }),
            tableCell("Founder & CEO", { width: 3120 }),
            tableCell("___%", { width: 3120 }),
          ]}),
          new TableRow({ children: [
            tableCell("Devon Kennaird", { width: 3120 }),
            tableCell("Co-Founder, CTO, Head of Product & Operations", { width: 3120 }),
            tableCell("___%", { width: 3120 }),
          ]}),
          new TableRow({ children: [
            tableCell("Employee Option Pool", { bold: true, width: 3120 }),
            tableCell("Future hires", { width: 3120 }),
            tableCell("___%", { width: 3120 }),
          ]}),
          new TableRow({ children: [
            tableCell("TOTAL", { bold: true, width: 3120 }),
            tableCell("", { width: 3120 }),
            tableCell("100%", { bold: true, width: 3120 }),
          ]}),
        ]
      }),
      para([new TextRun({ text: "Note: Co-Founders to agree on percentages prior to execution.", size: 20, font: "Georgia", color: GRAY, italics: true })]),

      heading2("3.2 Vesting Schedule"),
      para("All Co-Founder equity shall vest over a 4-year period with a 1-year cliff:"),
      bulletItem("25% of allocated equity vests on the 1-year anniversary", "Year 1 Cliff: "),
      bulletItem("Remaining 75% vests monthly (2.083% per month)", "Years 2-4: "),
      bulletItem("100% acceleration on Change of Control (acquisition, merger, or IPO) if the Co-Founder is terminated without Cause within 12 months following such event (\"Double Trigger\")", "Acceleration: "),

      heading2("3.3 Vesting Commencement"),
      para("Vesting shall be deemed to have commenced on ________________________ (the date work on the AFU platform began), recognizing prior contributions."),

      // SECTION 4 - ROLES
      new Paragraph({ children: [new PageBreak()] }),
      heading1("4. ROLES AND RESPONSIBILITIES"),
      heading2("4.1 Peter Watson \u2014 Founder & CEO"),
      bulletItem("Overall business strategy and vision"),
      bulletItem("Investor relations and fundraising"),
      bulletItem("Agricultural partnerships and farm network development"),
      bulletItem("Commercial relationships (offtake agreements, export hubs)"),
      bulletItem("Government and regulatory affairs"),
      bulletItem("Insurance partnerships (Lloyd\u2019s of London, local underwriters)"),
      bulletItem("Banking partnerships (Hamilton Reserve, local banks)"),

      heading2("4.2 Devon Kennaird \u2014 Co-Founder, CTO, Head of Product & Operations"),
      para([new TextRun({ text: "Technology & Product:", bold: true, size: 22, font: "Georgia", color: DARK })]),
      bulletItem("All technology architecture, development, and maintenance"),
      bulletItem("Platform security, performance, and scalability"),
      bulletItem("AI/ML systems and data infrastructure"),
      bulletItem("Technical hiring and engineering team leadership"),
      bulletItem("Product strategy, design, UX/UI, and feature roadmap"),
      bulletItem("DevOps, CI/CD, and infrastructure management"),
      bulletItem("Blockchain and digital asset layer (when implemented)"),
      bulletItem("Digital strategy, marketplace architecture, and platform integrations"),
      bulletItem("Data analytics, reporting dashboards, and business intelligence"),
      para([new TextRun({ text: "Operations & Business Setup:", bold: true, size: 22, font: "Georgia", color: DARK })]),
      bulletItem("Supplier sourcing, vetting, and onboarding (inputs, equipment, services)"),
      bulletItem("Country launch operations and local infrastructure setup"),
      bulletItem("Farmer onboarding programs and support operations"),
      bulletItem("Processing hub and cold chain logistics coordination"),
      bulletItem("Payment systems, mobile money, and financial operations setup"),
      bulletItem("Compliance systems, KYC/AML processes, and regulatory tech"),
      bulletItem("Insurance product design and claims workflow management"),
      bulletItem("Trade finance operations (SBLC processing, LC documentation)"),
      bulletItem("Recruitment engine and talent pipeline management"),
      bulletItem("Training program design and certification workflows"),
      bulletItem("Marketplace operations (exchange, bartering, AFU Fresh)"),
      bulletItem("Ambassador program management and coordination"),

      // SECTION 5 - IP
      new Paragraph({ children: [new PageBreak()] }),
      heading1("5. INTELLECTUAL PROPERTY"),
      heading2("5.1 Assignment of IP"),
      para("Each Co-Founder hereby irrevocably assigns to AFU all right, title, and interest in any Intellectual Property created in connection with AFU\u2019s business, including but not limited to:"),
      bulletItem("Source code, software, databases, and technical documentation"),
      bulletItem("Business plans, strategies, and financial models"),
      bulletItem("Trademarks, branding, and design assets"),
      bulletItem("Trade secrets, algorithms, and proprietary processes"),
      bulletItem("Customer and farmer data, relationships, and goodwill"),

      heading2("5.2 Prior IP Acknowledgment"),
      para("The parties acknowledge that Devon Kennaird has developed the AFU technology platform prior to formal incorporation. All such prior work product is hereby assigned to AFU upon execution of this Agreement, in consideration of the equity allocation in Section 3."),

      heading2("5.3 Third-Party IP"),
      para("No Co-Founder shall incorporate third-party proprietary IP into AFU\u2019s products without prior written consent of the other Co-Founders."),

      // SECTION 6 - FINANCIAL
      heading1("6. FINANCIAL COMMITMENTS"),
      heading2("6.1 Capital Contributions"),
      para("Initial capital contributions, if any:"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 2340, 4680],
        rows: [
          new TableRow({ children: [
            tableCell("Co-Founder", { header: true, width: 2340 }),
            tableCell("Cash Contribution", { header: true, width: 2340 }),
            tableCell("In-Kind Contribution", { header: true, width: 4680 }),
          ]}),
          new TableRow({ children: [
            tableCell("Peter Watson", { width: 2340 }),
            tableCell("$__________", { width: 2340 }),
            tableCell("Agricultural expertise, farm network, business relationships", { width: 4680 }),
          ]}),
          new TableRow({ children: [
            tableCell("Devon Kennaird", { width: 2340 }),
            tableCell("$__________", { width: 2340 }),
            tableCell("Technology platform (valued at $__________)", { width: 4680 }),
          ]}),
        ]
      }),

      heading2("6.2 Compensation"),
      bulletItem("No Co-Founder shall receive a salary until the company has secured seed funding of at least $__________ or generates revenue of at least $__________ per month"),
      bulletItem("Once compensation commences, salaries shall be determined by the Board and shall be market-competitive"),
      bulletItem("All Co-Founders shall receive equal base compensation unless unanimously agreed otherwise"),

      heading2("6.3 Expense Reimbursement"),
      para("Reasonable business expenses incurred by any Co-Founder shall be reimbursed by AFU upon presentation of receipts, subject to a monthly cap of $__________ per Co-Founder until funding is secured."),

      // SECTION 7 - DECISIONS
      new Paragraph({ children: [new PageBreak()] }),
      heading1("7. DECISION MAKING"),
      heading2("7.1 Major Decisions (Unanimous Consent Required)"),
      para("The following require unanimous consent of all Co-Founders:"),
      bulletItem("Issuing new equity or convertible instruments"),
      bulletItem("Taking on debt exceeding $__________"),
      bulletItem("Entering contracts exceeding $__________ in value"),
      bulletItem("Changing the company\u2019s core business model"),
      bulletItem("Hiring or terminating C-level executives"),
      bulletItem("Selling, merging, or dissolving the company"),
      bulletItem("Changing this Agreement"),

      heading2("7.2 Anti-Dilution Protection"),
      para("Neither Co-Founder\u2019s equity may be diluted below ___% of total issued shares without that Co-Founder\u2019s express written consent. Any new share issuance, convertible instrument, or equity grant that would cause dilution below this threshold requires the affected Co-Founder\u2019s prior approval. Each Co-Founder shall have pro-rata rights to participate in any future funding round to maintain their percentage ownership."),

      heading2("7.3 Board Composition"),
      para("The Board of Directors shall consist of three (3) members:"),
      bulletItem("One (1) seat appointed by Watson"),
      bulletItem("One (1) seat appointed by Kennaird"),
      bulletItem("One (1) independent advisor, mutually agreed upon by both Co-Founders"),
      para("Board decisions shall be made by simple majority. Neither Co-Founder may unilaterally remove or replace the independent advisor without the other\u2019s consent."),

      heading2("7.4 Deadlock Resolution"),
      para("In the event the Co-Founders reach a deadlock on any Major Decision:"),
      bulletItem("The independent Board advisor shall serve as the initial mediator for a period of 14 days"),
      bulletItem("If unresolved, the matter shall be referred to an independent mediator agreed upon by both Co-Founders for a further 30 days"),
      bulletItem("If still unresolved, either Co-Founder may invoke a Buy-Sell provision (\"Texas Shootout\"): one Co-Founder makes a written offer to purchase the other\u2019s equity at a stated price per share. The receiving Co-Founder has 30 days to either accept the offer or reverse it by purchasing the offering Co-Founder\u2019s equity at the same price per share"),

      heading2("7.5 Day-to-Day Decisions"),
      para("Each Co-Founder has authority to make decisions within their area of responsibility (as defined in Section 4) up to a value of $__________ without requiring approval from the other Co-Founder."),

      // SECTION 8 - DEPARTURE
      heading1("8. DEPARTURE AND TERMINATION"),
      heading2("8.1 Voluntary Departure"),
      para("If a Co-Founder voluntarily departs:"),
      bulletItem("is forfeited and returns to the company pool", "Unvested equity "),
      bulletItem("is retained by the departing Co-Founder", "Vested equity "),
      bulletItem("to purchase vested equity at Fair Market Value", "Right of First Refusal "),
      bulletItem("90-day transition period for knowledge transfer"),

      heading2("8.2 Termination for Cause"),
      para("A Co-Founder may be terminated for Cause (fraud, gross negligence, material breach, conviction of a felony) by unanimous vote of the remaining Co-Founders:"),
      bulletItem("is immediately forfeited", "All unvested equity "),
      bulletItem("may be repurchased by the company at a 50% discount to Fair Market Value", "Vested equity "),
      bulletItem("Departing Co-Founder must immediately return all company property and materials"),

      heading2("8.3 Death or Incapacity"),
      para("In the event of death or permanent incapacity:"),
      bulletItem("All equity shall be deemed fully vested"),
      bulletItem("The estate/representative has 12 months to sell equity back to the company at Fair Market Value"),
      bulletItem("Company has Right of First Refusal"),

      // SECTION 9 - CONFIDENTIALITY
      new Paragraph({ children: [new PageBreak()] }),
      heading1("9. CONFIDENTIALITY"),
      heading2("9.1"),
      para("Each Co-Founder agrees to maintain strict confidentiality regarding all proprietary information, trade secrets, business strategies, financial data, farmer data, and technical architecture of AFU, both during and for a period of 3 years after departure."),
      heading2("9.2"),
      para("This obligation extends to all investor discussions, partnership negotiations, and internal communications."),

      // SECTION 10 - NON-COMPETE
      heading1("10. NON-COMPETE AND NON-SOLICITATION"),
      heading2("10.1 Non-Compete"),
      para("During their tenure and for 12 months following departure, no Co-Founder shall directly or indirectly engage in any business that competes with AFU\u2019s core agricultural finance, insurance, or marketplace operations in Africa."),
      heading2("10.2 Non-Solicitation"),
      para("For 24 months following departure, no Co-Founder shall solicit AFU\u2019s employees, contractors, farmers, partners, or investors."),

      // SECTION 11 - DISPUTES
      heading1("11. DISPUTE RESOLUTION"),
      heading2("11.1"),
      para("Any dispute arising from this Agreement shall first be addressed through good-faith negotiation between the Co-Founders for a period of 30 days."),
      heading2("11.2"),
      para("If unresolved, disputes shall be submitted to binding arbitration under the rules of ________________________ (arbitration body), with the seat of arbitration in ________________________."),
      heading2("11.3"),
      para("The prevailing party shall be entitled to recover reasonable legal costs."),

      // SECTION 12 - GENERAL
      heading1("12. GENERAL PROVISIONS"),
      heading2("12.1 Entire Agreement"),
      para("This Agreement constitutes the entire understanding between the parties and supersedes all prior discussions, agreements, and understandings."),
      heading2("12.2 Amendments"),
      para("This Agreement may only be amended in writing, signed by all Co-Founders."),
      heading2("12.3 Governing Law"),
      para("This Agreement shall be governed by the laws of ________________________."),
      heading2("12.4 Severability"),
      para("If any provision is found to be unenforceable, the remaining provisions shall continue in full force and effect."),
      heading2("12.5 Counterparts"),
      para("This Agreement may be executed in counterparts, each of which shall be deemed an original."),

      // SIGNATURES
      new Paragraph({ children: [new PageBreak()] }),
      heading1("SIGNATURES"),
      para("IN WITNESS WHEREOF, the Co-Founders have executed this Agreement as of the date first written above."),

      ...sigBlock("Peter Watson", "Founder & CEO"),
      new Paragraph({ spacing: { before: 200 }, border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: LINE, space: 8 } }, children: [] }),

      ...sigBlock("Devon Kennaird", "Co-Founder, CTO, Head of Product & Operations"),
      new Paragraph({ spacing: { before: 200 }, border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: LINE, space: 8 } }, children: [] }),

      new Paragraph({ spacing: { before: 400 }, children: [] }),
      heading2("WITNESS"),
      para([new TextRun({ text: "Name: ________________________________________", size: 22, font: "Georgia", color: "333333" })]),
      new Paragraph({ spacing: { before: 160 }, children: [] }),
      para([new TextRun({ text: "Signature: ________________________________________", size: 22, font: "Georgia", color: "333333" })]),
      new Paragraph({ spacing: { before: 160 }, children: [] }),
      para([new TextRun({ text: "Date: ________________________________________", size: 22, font: "Georgia", color: "333333" })]),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("C:/PROJECT101/AFU/afu-portal/public/documents/AFU-CoFounder-Agreement-v2.docx", buffer);
  console.log("Created AFU-CoFounder-Agreement.docx successfully!");
});
