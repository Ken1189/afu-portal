const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "African Farming Union";
pres.title = "AFU - Partner With Us";

// ── Brand Colors ──
const GREEN = "5DB347";
const NAVY = "1B2A4A";
const SAGE = "8CB89C";
const WHITE = "FFFFFF";
const CREAM = "F8FAF6";
const DARK = "0F1A30";

const cardShadow = () => ({ type: "outer", blur: 5, offset: 2, angle: 135, color: "000000", opacity: 0.1 });

// ════════════════════════════════════════════════════════════════
// SLIDE 1: Bold Title — dark, minimal, impact
// ════════════════════════════════════════════════════════════════
const s1 = pres.addSlide();
s1.background = { color: DARK };

// Large green accent shape (diagonal feel)
s1.addShape(pres.shapes.RECTANGLE, { x: 6.5, y: 0, w: 3.5, h: 5.625, fill: { color: GREEN, transparency: 88 } });
s1.addShape(pres.shapes.RECTANGLE, { x: 7.5, y: 0, w: 2.5, h: 5.625, fill: { color: GREEN, transparency: 80 } });

// Small green dot
s1.addShape(pres.shapes.OVAL, { x: 0.7, y: 1.2, w: 0.15, h: 0.15, fill: { color: GREEN } });

s1.addText("AFRICAN", {
  x: 0.7, y: 1.5, w: 6, h: 0.9,
  fontSize: 48, fontFace: "Arial Black", color: WHITE, margin: 0
});
s1.addText("FARMING UNION", {
  x: 0.7, y: 2.3, w: 6, h: 0.9,
  fontSize: 48, fontFace: "Arial Black", color: GREEN, margin: 0
});

s1.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 3.4, w: 3.0, h: 0.04, fill: { color: SAGE } });

s1.addText("The platform connecting Africa's agricultural ecosystem.", {
  x: 0.7, y: 3.7, w: 5.5, h: 0.5,
  fontSize: 14, fontFace: "Calibri", color: SAGE, margin: 0
});

// Stats bar at bottom
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 4.6, w: 10, h: 1.025, fill: { color: GREEN } });

const heroStats = [
  { val: "20", lbl: "Countries" },
  { val: "$50B+", lbl: "Market Opportunity" },
  { val: "7", lbl: "Core Services" },
];
heroStats.forEach((s, i) => {
  const cx = 0.7 + i * 3.0;
  pres; // just for scope
  s1.addText(s.val, { x: cx, y: 4.65, w: 1.8, h: 0.5, fontSize: 24, fontFace: "Arial Black", color: WHITE, margin: 0 });
  s1.addText(s.lbl, { x: cx, y: 5.1, w: 1.8, h: 0.3, fontSize: 11, fontFace: "Calibri", color: "E8F5E2", margin: 0 });
});

// ════════════════════════════════════════════════════════════════
// SLIDE 2: The Model — clean horizontal flow
// ════════════════════════════════════════════════════════════════
const s2 = pres.addSlide();
s2.background = { color: WHITE };

// Left green sidebar
s2.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.12, h: 5.625, fill: { color: GREEN } });

s2.addText("HOW IT WORKS", {
  x: 0.5, y: 0.3, w: 9, h: 0.6,
  fontSize: 24, fontFace: "Arial Black", color: NAVY, margin: 0
});

s2.addText("One integrated flywheel from financing to market.", {
  x: 0.5, y: 0.85, w: 9, h: 0.35,
  fontSize: 13, fontFace: "Calibri", color: "888888", margin: 0
});

// Two rows of cards
const model = [
  { icon: "$", title: "Finance", desc: "Loans & banking for farmers" },
  { icon: "S", title: "Supply", desc: "Bulk inputs at wholesale" },
  { icon: "G", title: "Grow", desc: "Training, insurance, agronomy" },
  { icon: "P", title: "Process", desc: "Value-addition & packaging" },
  { icon: "M", title: "Market", desc: "Guaranteed offtake buyers" },
  { icon: "T", title: "Trade", desc: "Export finance & logistics" },
];

model.forEach((m, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const cx = 0.5 + col * 3.1;
  const cy = 1.5 + row * 1.85;

  s2.addShape(pres.shapes.RECTANGLE, { x: cx, y: cy, w: 2.85, h: 1.55, fill: { color: CREAM }, shadow: cardShadow() });
  // Icon circle
  s2.addShape(pres.shapes.OVAL, { x: cx + 0.2, y: cy + 0.25, w: 0.5, h: 0.5, fill: { color: GREEN } });
  s2.addText(m.icon, { x: cx + 0.2, y: cy + 0.25, w: 0.5, h: 0.5, fontSize: 16, fontFace: "Arial Black", color: WHITE, align: "center", valign: "middle", margin: 0 });
  // Text
  s2.addText(m.title, { x: cx + 0.85, y: cy + 0.2, w: 1.8, h: 0.35, fontSize: 14, fontFace: "Calibri", color: NAVY, bold: true, margin: 0 });
  s2.addText(m.desc, { x: cx + 0.85, y: cy + 0.55, w: 1.8, h: 0.35, fontSize: 10, fontFace: "Calibri", color: "888888", margin: 0 });
  // Step number
  s2.addText(String(i + 1), { x: cx + 2.3, y: cy + 0.9, w: 0.4, h: 0.4, fontSize: 20, fontFace: "Arial Black", color: SAGE, align: "right", margin: 0 });
});

// ════════════════════════════════════════════════════════════════
// SLIDE 3: Partner With Us — what we need
// ════════════════════════════════════════════════════════════════
const s3 = pres.addSlide();
s3.background = { color: NAVY };

s3.addText("PARTNER", {
  x: 0.7, y: 0.25, w: 4, h: 0.8,
  fontSize: 36, fontFace: "Arial Black", color: WHITE, margin: 0
});
s3.addText("WITH US", {
  x: 0.7, y: 0.95, w: 4, h: 0.8,
  fontSize: 36, fontFace: "Arial Black", color: GREEN, margin: 0
});

// Two columns of partnership types
const partners = [
  { title: "Suppliers", items: "Seeds, fertiliser, equipment,\nagrochemicals, irrigation" },
  { title: "Processors", items: "Milling, packaging, cold chain,\nvalue-addition, logistics" },
  { title: "Traders", items: "Export/import, commodity trading,\nshipping, warehousing" },
  { title: "Technology", items: "AgriTech, fintech, IoT,\nprecision agriculture, mobile" },
  { title: "Finance", items: "Banks, DFIs, impact investors,\nmicrofinance, insurance" },
  { title: "Institutions", items: "Government, NGOs, research,\ndevelopment agencies" },
];

partners.forEach((p, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const cx = 5.0 + col * 2.45;
  const cy = 0.3 + row * 1.7;

  s3.addShape(pres.shapes.RECTANGLE, { x: cx, y: cy, w: 2.2, h: 1.45, fill: { color: NAVY }, line: { color: GREEN, width: 0.5 } });
  s3.addText(p.title, { x: cx + 0.15, y: cy + 0.1, w: 1.9, h: 0.35, fontSize: 13, fontFace: "Calibri", color: GREEN, bold: true, margin: 0 });
  s3.addText(p.items, { x: cx + 0.15, y: cy + 0.5, w: 1.9, h: 0.8, fontSize: 9.5, fontFace: "Calibri", color: "BBBBBB", margin: 0, lineSpacingMultiple: 1.25 });
});

// Left side — why
s3.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 2.0, w: 3.8, h: 0.04, fill: { color: GREEN, transparency: 60 } });

const whyItems = [
  "One contract, 20 African markets",
  "Verified & insured farmer network",
  "End-to-end digital infrastructure",
  "Guaranteed demand via offtake",
];
whyItems.forEach((w, i) => {
  s3.addShape(pres.shapes.OVAL, { x: 0.7, y: 2.35 + i * 0.6, w: 0.12, h: 0.12, fill: { color: GREEN } });
  s3.addText(w, { x: 1.0, y: 2.2 + i * 0.6, w: 3.5, h: 0.4, fontSize: 12, fontFace: "Calibri", color: WHITE, margin: 0 });
});

// ════════════════════════════════════════════════════════════════
// SLIDE 4: Contact — clean CTA
// ════════════════════════════════════════════════════════════════
const s4 = pres.addSlide();
s4.background = { color: DARK };

// Large green block
s4.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 2.8, fill: { color: GREEN } });

s4.addText("LET'S TALK.", {
  x: 0.7, y: 0.5, w: 8, h: 1.2,
  fontSize: 50, fontFace: "Arial Black", color: WHITE, margin: 0
});

s4.addText("We're looking for partners who want to\ntransform African agriculture at scale.", {
  x: 0.7, y: 1.6, w: 7, h: 0.8,
  fontSize: 15, fontFace: "Calibri", color: "E8F5E2", lineSpacingMultiple: 1.3, margin: 0
});

// Contact details on dark section
s4.addText([
  { text: "Peter Watson", options: { bold: true, fontSize: 18, color: WHITE, breakLine: true } },
  { text: "Co-Founder", options: { fontSize: 11, color: SAGE, breakLine: true } },
  { text: "peterw@africanfarmingunion.org", options: { fontSize: 13, color: GREEN } },
], { x: 0.7, y: 3.2, w: 4, h: 1.2, fontFace: "Calibri" });

s4.addText([
  { text: "Devon Kennaird", options: { bold: true, fontSize: 18, color: WHITE, breakLine: true } },
  { text: "Co-Founder", options: { fontSize: 11, color: SAGE, breakLine: true } },
  { text: "devonk@africanfarmingunion.org", options: { fontSize: 13, color: GREEN } },
], { x: 5.0, y: 3.2, w: 4.5, h: 1.2, fontFace: "Calibri" });

// Bottom line
s4.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 4.7, w: 8.6, h: 0.03, fill: { color: SAGE, transparency: 60 } });

s4.addText([
  { text: "africanfarmingunion.org", options: { bold: true, color: WHITE } },
  { text: "    |    HQ: Gaborone, Botswana    |    20 African Countries", options: { color: SAGE } },
], { x: 0.7, y: 4.9, w: 8.6, h: 0.4, fontSize: 11, fontFace: "Calibri" });

// ── Save ──
const outPath = "C:/PROJECT101/AFU/afu-portal/docs/AFU_Partnership_Deck_v2_final.pptx";
pres.writeFile({ fileName: outPath }).then(() => {
  console.log("Saved to " + outPath);
}).catch(err => {
  console.error("Error:", err);
});
