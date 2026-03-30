const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "African Farming Union";
pres.title = "AFU - Partnership Opportunities";

// ── Brand Colors ──
const GREEN = "5DB347";
const NAVY = "1B2A4A";
const SAGE = "8CB89C";
const WHITE = "FFFFFF";
const LIGHT = "F0F7ED";

// ── Helper: fresh shadow ──
const cardShadow = () => ({ type: "outer", blur: 4, offset: 2, angle: 135, color: "000000", opacity: 0.08 });

// ════════════════════════════════════════════════════════════════
// SLIDE 1: Title
// ════════════════════════════════════════════════════════════════
const s1 = pres.addSlide();
s1.background = { color: NAVY };

s1.addShape(pres.shapes.OVAL, { x: 7.5, y: -1.5, w: 4.5, h: 4.5, fill: { color: GREEN, transparency: 85 } });
s1.addShape(pres.shapes.OVAL, { x: 8.2, y: -0.8, w: 3, h: 3, fill: { color: GREEN, transparency: 75 } });
s1.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.3, w: 0.08, h: 2.0, fill: { color: GREEN } });

s1.addText("AFRICAN\nFARMING UNION", {
  x: 1.0, y: 1.0, w: 6, h: 2.2,
  fontSize: 46, fontFace: "Arial Black", color: WHITE, bold: true,
  lineSpacingMultiple: 0.9, margin: 0
});

s1.addText("Partnership & Supplier Opportunities", {
  x: 1.0, y: 3.1, w: 6, h: 0.5,
  fontSize: 20, fontFace: "Calibri", color: SAGE, italic: true, margin: 0
});

s1.addText("20 Countries  |  247+ Members  |  $50B+ Market", {
  x: 1.0, y: 3.8, w: 6, h: 0.4,
  fontSize: 13, fontFace: "Calibri", color: WHITE, margin: 0
});

s1.addText("africanfarmingunion.org", {
  x: 1.0, y: 4.5, w: 4, h: 0.4,
  fontSize: 12, fontFace: "Calibri", color: SAGE, margin: 0
});

s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.35, w: 10, h: 0.275, fill: { color: GREEN } });

// ════════════════════════════════════════════════════════════════
// SLIDE 2: What We Do (Flywheel + Services combined)
// ════════════════════════════════════════════════════════════════
const s2 = pres.addSlide();
s2.background = { color: WHITE };

s2.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.9, fill: { color: NAVY } });
s2.addText("WHAT WE DO", {
  x: 0.7, y: 0.1, w: 8, h: 0.7,
  fontSize: 22, fontFace: "Arial Black", color: WHITE, charSpacing: 4, margin: 0
});

s2.addText("An integrated agricultural value chain — from capital to market, all on one platform.", {
  x: 0.7, y: 1.1, w: 8.6, h: 0.4,
  fontSize: 13, fontFace: "Calibri", color: NAVY, margin: 0
});

const steps = [
  { num: "1", title: "Finance", desc: "Loans, banking, asset finance" },
  { num: "2", title: "Inputs", desc: "Bulk seeds, fertiliser, equipment" },
  { num: "3", title: "Grow", desc: "Training, insurance, agronomy" },
  { num: "4", title: "Process", desc: "Value-addition & packaging" },
  { num: "5", title: "Sell", desc: "Guaranteed offtake contracts" },
  { num: "6", title: "Trade", desc: "Export finance & logistics" },
  { num: "7", title: "Recycle", desc: "Returns flow back into system" },
];

steps.forEach((s, i) => {
  const cx = 0.35 + i * 1.35;
  // Circle
  s2.addShape(pres.shapes.OVAL, { x: cx + 0.3, y: 1.75, w: 0.7, h: 0.7, fill: { color: GREEN } });
  s2.addText(s.num, { x: cx + 0.3, y: 1.75, w: 0.7, h: 0.7, fontSize: 16, fontFace: "Arial Black", color: WHITE, align: "center", valign: "middle", margin: 0 });
  // Arrow (except last)
  if (i < 6) {
    s2.addText(">", { x: cx + 1.05, y: 1.82, w: 0.3, h: 0.5, fontSize: 16, fontFace: "Calibri", color: SAGE, align: "center", valign: "middle", margin: 0 });
  }
  // Title + desc
  s2.addText(s.title, { x: cx, y: 2.6, w: 1.3, h: 0.3, fontSize: 11, fontFace: "Calibri", color: NAVY, bold: true, align: "center", margin: 0 });
  s2.addText(s.desc, { x: cx, y: 2.9, w: 1.3, h: 0.5, fontSize: 9, fontFace: "Calibri", color: "777777", align: "center", margin: 0, lineSpacingMultiple: 1.1 });
});

// Additional services row
s2.addShape(pres.shapes.RECTANGLE, { x: 0, y: 3.7, w: 10, h: 0.04, fill: { color: LIGHT } });

const extras = [
  { title: "Warehouse Receipts", desc: "Commodity storage & trading" },
  { title: "Carbon Credits", desc: "Earn from sustainability" },
  { title: "Technology", desc: "Mobile app + USSD/SMS" },
  { title: "Insurance", desc: "Parametric + traditional" },
];

extras.forEach((e, i) => {
  const cx = 0.5 + i * 2.35;
  s2.addShape(pres.shapes.RECTANGLE, { x: cx, y: 3.95, w: 2.1, h: 0.9, fill: { color: LIGHT }, shadow: cardShadow() });
  s2.addShape(pres.shapes.RECTANGLE, { x: cx, y: 3.95, w: 2.1, h: 0.04, fill: { color: GREEN } });
  s2.addText(e.title, { x: cx + 0.1, y: 4.05, w: 1.9, h: 0.35, fontSize: 11, fontFace: "Calibri", color: NAVY, bold: true, margin: 0 });
  s2.addText(e.desc, { x: cx + 0.1, y: 4.4, w: 1.9, h: 0.3, fontSize: 9, fontFace: "Calibri", color: "777777", margin: 0 });
});

// ════════════════════════════════════════════════════════════════
// SLIDE 3: What We're Looking For
// ════════════════════════════════════════════════════════════════
const s3 = pres.addSlide();
s3.background = { color: NAVY };

s3.addText("WHAT WE'RE LOOKING FOR", {
  x: 0.7, y: 0.3, w: 8, h: 0.7,
  fontSize: 22, fontFace: "Arial Black", color: WHITE, charSpacing: 4, margin: 0
});

s3.addText("We're building partnerships across the agricultural value chain.", {
  x: 0.7, y: 0.9, w: 8, h: 0.4,
  fontSize: 13, fontFace: "Calibri", color: SAGE, italic: true, margin: 0
});

const seeking = [
  { title: "Input Suppliers", desc: "Seeds, fertiliser, agrochemicals,\nirrigation equipment" },
  { title: "Processing Partners", desc: "Packaging, milling, cold chain,\nvalue-addition facilities" },
  { title: "Trade Partners", desc: "Export/import, commodity trading,\nlogistics & shipping" },
  { title: "Technology Partners", desc: "AgriTech, fintech, mobile platforms,\nIoT & precision agriculture" },
  { title: "Financial Partners", desc: "Banks, investors, DFIs,\nmicrofinance institutions" },
  { title: "Government & NGOs", desc: "Policy alignment, development\nprograms, grant facilities" },
];

seeking.forEach((item, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const cx = 0.7 + col * 4.6;
  const cy = 1.5 + row * 1.25;

  s3.addShape(pres.shapes.RECTANGLE, { x: cx, y: cy, w: 4.2, h: 1.0, fill: { color: NAVY }, line: { color: GREEN, width: 0.5 } });
  s3.addShape(pres.shapes.RECTANGLE, { x: cx, y: cy, w: 0.06, h: 1.0, fill: { color: GREEN } });
  s3.addText(item.title, { x: cx + 0.2, y: cy + 0.08, w: 3.8, h: 0.3, fontSize: 13, fontFace: "Calibri", color: GREEN, bold: true, margin: 0 });
  s3.addText(item.desc, { x: cx + 0.2, y: cy + 0.42, w: 3.8, h: 0.5, fontSize: 10, fontFace: "Calibri", color: "CCCCCC", margin: 0, lineSpacingMultiple: 1.2 });
});

// ════════════════════════════════════════════════════════════════
// SLIDE 4: CTA / Contact
// ════════════════════════════════════════════════════════════════
const s4 = pres.addSlide();
s4.background = { color: NAVY };

s4.addShape(pres.shapes.OVAL, { x: -1, y: 3, w: 4, h: 4, fill: { color: GREEN, transparency: 90 } });
s4.addShape(pres.shapes.OVAL, { x: 7.5, y: -1, w: 3.5, h: 3.5, fill: { color: GREEN, transparency: 85 } });

s4.addText("LET'S BUILD\nTOGETHER", {
  x: 1.5, y: 0.6, w: 7, h: 1.8,
  fontSize: 42, fontFace: "Arial Black", color: WHITE, align: "center", lineSpacingMultiple: 0.95, margin: 0
});

s4.addText("One partnership. 20 African markets.\n247+ members. $50B opportunity.", {
  x: 1.5, y: 2.3, w: 7, h: 0.7,
  fontSize: 15, fontFace: "Calibri", color: SAGE, align: "center", lineSpacingMultiple: 1.3
});

// Contact card
s4.addShape(pres.shapes.RECTANGLE, { x: 2.2, y: 3.3, w: 5.6, h: 1.7, fill: { color: GREEN }, shadow: cardShadow() });

s4.addText([
  { text: "Peter Watson", options: { bold: true, fontSize: 16, color: WHITE, breakLine: true } },
  { text: "peterw@africanfarmingunion.org", options: { fontSize: 12, color: "E8F5E2", breakLine: true } },
  { text: "", options: { fontSize: 8, breakLine: true } },
  { text: "Devon Kennaird", options: { bold: true, fontSize: 16, color: WHITE, breakLine: true } },
  { text: "devonk@africanfarmingunion.org", options: { fontSize: 12, color: "E8F5E2" } },
], { x: 2.5, y: 3.35, w: 2.8, h: 1.6, fontFace: "Calibri", valign: "middle" });

s4.addText([
  { text: "africanfarmingunion.org", options: { bold: true, fontSize: 14, color: WHITE, breakLine: true } },
  { text: "", options: { fontSize: 8, breakLine: true } },
  { text: "HQ: Gaborone, Botswana", options: { fontSize: 12, color: "E8F5E2", breakLine: true } },
  { text: "20 African countries", options: { fontSize: 12, color: "E8F5E2" } },
], { x: 5.3, y: 3.35, w: 2.8, h: 1.6, fontFace: "Calibri", valign: "middle" });

s4.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.35, w: 10, h: 0.275, fill: { color: GREEN } });

// ── Save ──
const outPath = "C:/PROJECT101/AFU/afu-portal/docs/AFU_Partnership_Deck.pptx";
pres.writeFile({ fileName: outPath }).then(() => {
  console.log("Saved to " + outPath);
}).catch(err => {
  console.error("Error:", err);
});
