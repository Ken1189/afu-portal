const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "African Farming Union";
pres.title = "AFU - Farmers For Farmers";

// ── Brand Colors ──
const GREEN = "5DB347";
const NAVY = "1B2A4A";
const SAGE = "8CB89C";
const WHITE = "FFFFFF";
const CREAM = "F8FAF6";
const DARK = "0F1A30";

const cardShadow = () => ({ type: "outer", blur: 5, offset: 2, angle: 135, color: "000000", opacity: 0.1 });

// ════════════════════════════════════════════════════════════════
// SLIDE 1: IMPACT TITLE — Big numbers, bold statement
// ════════════════════════════════════════════════════════════════
const s1 = pres.addSlide();
s1.background = { color: DARK };

// Giant green accent
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.15, h: 5.625, fill: { color: GREEN } });

// Header — the big name
s1.addText("AFRICAN", {
  x: 0.7, y: 0.4, w: 9, h: 1.0,
  fontSize: 54, fontFace: "Arial Black", color: WHITE, margin: 0
});
s1.addText("FARMING UNION", {
  x: 0.7, y: 1.25, w: 9, h: 1.0,
  fontSize: 54, fontFace: "Arial Black", color: GREEN, margin: 0
});

s1.addText("FARMERS FOR FARMERS", {
  x: 0.7, y: 2.2, w: 8, h: 0.35,
  fontSize: 12, fontFace: "Calibri", color: SAGE, bold: true, charSpacing: 5, margin: 0
});

// Divider
s1.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 2.75, w: 2.5, h: 0.04, fill: { color: GREEN } });

// Sub-stats row
const heroStats = [
  { val: "19,000+", lbl: "Farmers" },
  { val: "1M+", lbl: "Hectares Under\nManagement" },
  { val: "20", lbl: "African\nCountries" },
  { val: "$50B+", lbl: "Addressable\nMarket" },
];
heroStats.forEach((s, i) => {
  const cx = 0.7 + i * 2.3;
  s1.addText(s.val, { x: cx, y: 3.0, w: 2.0, h: 0.7, fontSize: 28, fontFace: "Arial Black", color: GREEN, margin: 0 });
  s1.addText(s.lbl, { x: cx, y: 3.6, w: 2.0, h: 0.6, fontSize: 11, fontFace: "Calibri", color: SAGE, margin: 0, lineSpacingMultiple: 1.2 });
});

// Website bottom
s1.addText("africanfarmingunion.org", {
  x: 0.7, y: 5.05, w: 4, h: 0.35,
  fontSize: 11, fontFace: "Calibri", color: "666666", margin: 0
});

// Green bottom bar
s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.45, w: 10, h: 0.175, fill: { color: GREEN } });

// ════════════════════════════════════════════════════════════════
// SLIDE 2: ONE-STOP ECOSYSTEM
// ════════════════════════════════════════════════════════════════
const s2 = pres.addSlide();
s2.background = { color: WHITE };

s2.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.12, h: 5.625, fill: { color: GREEN } });

s2.addText("ONE-STOP ECOSYSTEM", {
  x: 0.5, y: 0.25, w: 9, h: 0.7,
  fontSize: 26, fontFace: "Arial Black", color: NAVY, margin: 0
});
s2.addText("Everything a farmer needs. Everything a partner can plug into.", {
  x: 0.5, y: 0.85, w: 9, h: 0.35,
  fontSize: 13, fontFace: "Calibri", color: "888888", italic: true, margin: 0
});

// 8 ecosystem cards — 2 rows of 4
const ecosystem = [
  { letter: "F", title: "Finance", desc: "Loans, banking, asset\nfinance, crop credit" },
  { letter: "I", title: "Inputs", desc: "Seeds, fertiliser, equipment\nat wholesale prices" },
  { letter: "I", title: "Insurance", desc: "Crop, livestock, weather\nindex, parametric" },
  { letter: "T", title: "Training", desc: "Agronomy, business,\ndigital skills" },
  { letter: "W", title: "Warehousing", desc: "Storage, grading,\nreceipt financing" },
  { letter: "O", title: "Offtake", desc: "We buy. Guaranteed\ncontracts for your crops" },
  { letter: "E", title: "Export", desc: "Trade finance, logistics,\nLC support, compliance" },
  { letter: "C", title: "Carbon", desc: "Credits marketplace,\nearnings from sustainability" },
];

ecosystem.forEach((e, i) => {
  const col = i % 4;
  const row = Math.floor(i / 4);
  const cx = 0.4 + col * 2.4;
  const cy = 1.45 + row * 1.95;

  s2.addShape(pres.shapes.RECTANGLE, { x: cx, y: cy, w: 2.15, h: 1.7, fill: { color: CREAM }, shadow: cardShadow() });
  // Green top bar
  s2.addShape(pres.shapes.RECTANGLE, { x: cx, y: cy, w: 2.15, h: 0.05, fill: { color: GREEN } });
  // Letter circle
  s2.addShape(pres.shapes.OVAL, { x: cx + 0.15, y: cy + 0.2, w: 0.45, h: 0.45, fill: { color: GREEN } });
  s2.addText(e.letter, { x: cx + 0.15, y: cy + 0.2, w: 0.45, h: 0.45, fontSize: 16, fontFace: "Arial Black", color: WHITE, align: "center", valign: "middle", margin: 0 });
  // Title
  s2.addText(e.title, { x: cx + 0.7, y: cy + 0.22, w: 1.3, h: 0.35, fontSize: 13, fontFace: "Calibri", color: NAVY, bold: true, margin: 0 });
  // Desc
  s2.addText(e.desc, { x: cx + 0.15, y: cy + 0.85, w: 1.85, h: 0.7, fontSize: 10, fontFace: "Calibri", color: "777777", margin: 0, lineSpacingMultiple: 1.2 });
});

// ════════════════════════════════════════════════════════════════
// SLIDE 3: WHAT WE'RE LOOKING FOR
// ════════════════════════════════════════════════════════════════
const s3 = pres.addSlide();
s3.background = { color: NAVY };

s3.addText("WE'RE LOOKING FOR", {
  x: 0.7, y: 0.2, w: 5, h: 0.6,
  fontSize: 14, fontFace: "Calibri", color: SAGE, bold: true, charSpacing: 4, margin: 0
});
s3.addText("STRATEGIC PARTNERS", {
  x: 0.7, y: 0.7, w: 8, h: 0.8,
  fontSize: 32, fontFace: "Arial Black", color: WHITE, margin: 0
});

// Left column — Supply side
s3.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.8, w: 4.1, h: 3.2, fill: { color: NAVY }, line: { color: GREEN, width: 1 } });
s3.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.8, w: 4.1, h: 0.5, fill: { color: GREEN } });
s3.addText("SUPPLIERS", { x: 0.9, y: 1.82, w: 3.7, h: 0.45, fontSize: 15, fontFace: "Arial Black", color: WHITE, margin: 0 });

s3.addText([
  { text: "Input suppliers", options: { bold: true, color: WHITE, breakLine: true } },
  { text: "Seeds, fertiliser, agrochemicals, irrigation\n", options: { color: "AAAAAA", breakLine: true } },
  { text: "Equipment providers", options: { bold: true, color: WHITE, breakLine: true } },
  { text: "Tractors, processing, packaging, solar\n", options: { color: "AAAAAA", breakLine: true } },
  { text: "Technology partners", options: { bold: true, color: WHITE, breakLine: true } },
  { text: "AgriTech, fintech, IoT, precision ag", options: { color: "AAAAAA" } },
], { x: 0.9, y: 2.45, w: 3.7, h: 2.4, fontSize: 11, fontFace: "Calibri", lineSpacingMultiple: 1.3 });

// Right column — Buy side
s3.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.8, w: 4.1, h: 3.2, fill: { color: NAVY }, line: { color: GREEN, width: 1 } });
s3.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 1.8, w: 4.1, h: 0.5, fill: { color: GREEN } });
s3.addText("OFFTAKERS & BUYERS", { x: 5.4, y: 1.82, w: 3.7, h: 0.45, fontSize: 15, fontFace: "Arial Black", color: WHITE, margin: 0 });

s3.addText([
  { text: "Commodity buyers", options: { bold: true, color: WHITE, breakLine: true } },
  { text: "Grain, coffee, cotton, tobacco, cashew\n", options: { color: "AAAAAA", breakLine: true } },
  { text: "Export markets", options: { bold: true, color: WHITE, breakLine: true } },
  { text: "EU, Middle East, Asia trade corridors\n", options: { color: "AAAAAA", breakLine: true } },
  { text: "Processors & retailers", options: { bold: true, color: WHITE, breakLine: true } },
  { text: "Milling, FMCG, food service, supermarkets", options: { color: "AAAAAA" } },
], { x: 5.4, y: 2.45, w: 3.7, h: 2.4, fontSize: 11, fontFace: "Calibri", lineSpacingMultiple: 1.3 });

// Bottom note
s3.addText("We are both supplier AND offtaker. We buy from our farmers and sell to the world.", {
  x: 0.7, y: 5.1, w: 8.6, h: 0.35,
  fontSize: 11, fontFace: "Calibri", color: GREEN, italic: true, bold: true, margin: 0
});

// ════════════════════════════════════════════════════════════════
// SLIDE 4: CONTACT — Bold CTA
// ════════════════════════════════════════════════════════════════
const s4 = pres.addSlide();
s4.background = { color: DARK };

// Full-width green block top
s4.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 3.0, fill: { color: GREEN } });

s4.addText("FARMERS FOR FARMERS.", {
  x: 0.7, y: 0.3, w: 8, h: 0.5,
  fontSize: 13, fontFace: "Calibri", color: "E8F5E2", bold: true, charSpacing: 5, margin: 0
});

s4.addText("LET'S GROW\nTOGETHER.", {
  x: 0.7, y: 0.8, w: 8, h: 1.6,
  fontSize: 48, fontFace: "Arial Black", color: WHITE, lineSpacingMultiple: 0.9, margin: 0
});

s4.addText("19,000+ farmers. 1M+ hectares. 20 countries. One platform.", {
  x: 0.7, y: 2.3, w: 8, h: 0.4,
  fontSize: 14, fontFace: "Calibri", color: "E8F5E2", margin: 0
});

// Contact section — dark background
s4.addText([
  { text: "Peter Watson", options: { bold: true, fontSize: 20, color: WHITE, breakLine: true } },
  { text: "Co-Founder", options: { fontSize: 11, color: SAGE, breakLine: true } },
  { text: "peterw@africanfarmingunion.org", options: { fontSize: 13, color: GREEN } },
], { x: 0.7, y: 3.3, w: 4.2, h: 1.2, fontFace: "Calibri" });

s4.addText([
  { text: "Devon Kennaird", options: { bold: true, fontSize: 20, color: WHITE, breakLine: true } },
  { text: "Co-Founder", options: { fontSize: 11, color: SAGE, breakLine: true } },
  { text: "devonk@africanfarmingunion.org", options: { fontSize: 13, color: GREEN } },
], { x: 5.2, y: 3.3, w: 4.5, h: 1.2, fontFace: "Calibri" });

// Bottom bar
s4.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 4.85, w: 8.6, h: 0.03, fill: { color: GREEN, transparency: 50 } });

s4.addText([
  { text: "africanfarmingunion.org", options: { bold: true, color: WHITE } },
  { text: "    |    Gaborone, Botswana    |    20 African Countries", options: { color: SAGE } },
], { x: 0.7, y: 5.0, w: 8.6, h: 0.35, fontSize: 11, fontFace: "Calibri" });

// ── Save ──
const outPath = "C:/PROJECT101/AFU/afu-portal/docs/AFU_Partnership_Deck_FINAL.pptx";
pres.writeFile({ fileName: outPath }).then(() => {
  console.log("Saved to " + outPath);
}).catch(err => {
  console.error("Error:", err);
});
