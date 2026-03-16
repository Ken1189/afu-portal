import Link from "next/link";

export const metadata = {
  title: "Livestock Insurance - AFU",
  description:
    "Protect your cattle, goats, sheep, and poultry against disease, theft, predators, and natural disasters with AFU Livestock Insurance.",
};

const animalTypes = [
  {
    type: "Cattle",
    description: "Dairy and beef cattle including breeding stock, calves, and oxen. Individual or herd-level coverage available.",
    valuationRange: "$300 - $3,000/head",
    premiumRange: "From $5/head/month",
    icon: "🐄",
  },
  {
    type: "Goats",
    description: "Meat and dairy goats including breeding stock and kids. Both indigenous and improved breeds covered.",
    valuationRange: "$50 - $500/head",
    premiumRange: "From $1.50/head/month",
    icon: "🐐",
  },
  {
    type: "Sheep",
    description: "Wool and meat sheep including breeding ewes, rams, and lambs. Covers both commercial and stud animals.",
    valuationRange: "$80 - $600/head",
    premiumRange: "From $2/head/month",
    icon: "🐑",
  },
  {
    type: "Poultry",
    description: "Broilers, layers, and breeding stock. Flock-level coverage with per-bird valuation for commercial operations.",
    valuationRange: "$3 - $25/bird",
    premiumRange: "From $0.15/bird/month",
    icon: "🐔",
  },
];

const perils = [
  {
    name: "Disease & Epidemic",
    description: "Coverage for livestock mortality from diagnosed diseases including foot-and-mouth, avian influenza, anthrax, and other notifiable diseases.",
  },
  {
    name: "Theft & Stock Theft",
    description: "Protection against theft of livestock from farm premises, grazing land, or during transport. Police report required.",
  },
  {
    name: "Predator Attack",
    description: "Coverage for livestock killed or injured by predators including wild dogs, leopards, jackals, and crocodiles.",
  },
  {
    name: "Natural Disasters",
    description: "Protection against loss from drought (with trigger thresholds), flooding, lightning strike, wildfire, and severe storms.",
  },
  {
    name: "Accidental Death",
    description: "Coverage for unintentional death including drowning, poisoning (verified), falls, and transport accidents.",
  },
  {
    name: "Calving & Birthing Complications",
    description: "Coverage for breeding stock loss due to complications during birth, including the loss of the offspring.",
  },
];

const valuationMethods = [
  {
    method: "Market Value",
    description: "Based on current auction and market prices for the breed, age, and condition of the animal. Updated quarterly.",
    bestFor: "Commercial beef and dairy cattle",
  },
  {
    method: "Agreed Value",
    description: "A fixed value agreed between the farmer and AFU at policy inception, typically for high-value breeding stock.",
    bestFor: "Stud animals, breeding bulls, and pedigree stock",
  },
  {
    method: "Replacement Cost",
    description: "The cost to replace the animal with one of similar breed, age, and productivity at current market prices.",
    bestFor: "Dairy cows in production, breeding ewes",
  },
  {
    method: "Flock/Herd Average",
    description: "Average value per head applied across the entire flock or herd. Simpler administration for large numbers.",
    bestFor: "Poultry flocks, large goat herds",
  },
];

const claimProcess = [
  { step: "01", title: "Report Immediately", desc: "Contact AFU within 24 hours of the incident. For disease, isolate affected animals and call a veterinarian." },
  { step: "02", title: "Veterinary Verification", desc: "An AFU-approved veterinarian examines the animal or carcass and provides a certified cause-of-death report." },
  { step: "03", title: "Documentation", desc: "Submit the vet report, photos, police report (if theft), and your livestock register showing the insured animals." },
  { step: "04", title: "Assessment & Payout", desc: "AFU assesses the claim against your policy. Approved claims are paid within 7 business days to your AFU Bank account." },
];

const tips = [
  "Maintain an up-to-date livestock register with ear tag numbers or brands",
  "Keep vaccination and treatment records current",
  "Report any disease symptoms to a veterinarian immediately",
  "Secure farm perimeters with adequate fencing",
  "Use livestock tracking (ear tags, microchips) for high-value animals",
  "Photograph all insured animals at policy inception",
];

export default function LivestockInsurancePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-gold/20 text-gold px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            AFU Insurance
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Livestock Insurance
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Protect your cattle, goats, sheep, and poultry against disease,
            theft, predators, and natural disasters. Individual animal or
            herd-level coverage with veterinary-verified claims.
          </p>
          <div className="flex gap-4 mt-8 flex-wrap">
            <Link
              href="/farm/insurance/quote"
              className="bg-gold hover:bg-gold/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Get a Quote
            </Link>
            <Link
              href="/services/insurance"
              className="border-2 border-white/20 hover:border-white/40 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              All Insurance Products
            </Link>
          </div>
        </div>
      </section>

      {/* Animal Types */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Animals We Cover
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Coverage for the main livestock types farmed across Southern and
              East Africa, from individual high-value animals to entire flocks.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {animalTypes.map((animal, i) => (
              <div
                key={i}
                className="bg-cream rounded-2xl p-6 hover:shadow-md transition-all border border-transparent hover:border-gold/20"
              >
                <div className="text-4xl mb-3">{animal.icon}</div>
                <h3 className="font-bold text-navy mb-2">{animal.type}</h3>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                  {animal.description}
                </p>
                <div className="space-y-1">
                  <div className="text-xs text-gray-400">
                    Value: {animal.valuationRange}
                  </div>
                  <span className="inline-block bg-gold/10 text-gold text-xs font-semibold px-3 py-1 rounded-full">
                    {animal.premiumRange}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Perils */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Perils Covered
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Protection against the most common causes of livestock loss in
              African farming.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {perils.map((peril, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="w-10 h-10 bg-gold/10 rounded-xl flex items-center justify-center text-gold font-bold mb-4">
                  {i + 1}
                </div>
                <h3 className="font-bold text-navy mb-2">{peril.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {peril.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Valuation Methods */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Valuation Methods
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              We offer four valuation approaches to ensure your livestock is
              insured at the right value.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {valuationMethods.map((method, i) => (
              <div key={i} className="bg-cream rounded-2xl p-6">
                <h3 className="font-bold text-navy mb-2">{method.method}</h3>
                <p className="text-gray-500 text-sm mb-3 leading-relaxed">
                  {method.description}
                </p>
                <span className="inline-block bg-teal/10 text-teal text-xs font-semibold px-3 py-1 rounded-full">
                  Best for: {method.bestFor}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Claim Process */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Claim Process
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              All livestock claims require veterinary verification to ensure fair
              and accurate assessment.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {claimProcess.map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-gold rounded-2xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-navy mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-navy mb-4 text-center">
            Tips for Smooth Claims
          </h2>
          <p className="text-gray-500 mb-8 text-center">
            Follow these best practices to ensure your claims are processed
            quickly and without complications.
          </p>
          <div className="bg-cream rounded-2xl p-8">
            <ul className="space-y-3">
              {tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-600 text-sm">
                  <span className="text-gold font-bold mt-0.5">&#10003;</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Protect Your Herd Today
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            From a single breeding bull to a thousand-head flock, AFU Livestock
            Insurance has you covered. Get a quote based on your specific herd.
          </p>
          <Link
            href="/farm/insurance/quote"
            className="inline-block bg-gold hover:bg-gold/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Get a Livestock Insurance Quote
          </Link>
        </div>
      </section>
    </>
  );
}
