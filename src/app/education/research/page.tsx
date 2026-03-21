import Link from "next/link";

export const metadata = {
  title: "Research Centres - AFU Education",
  description:
    "Explore AFU's network of agricultural research centres across Africa, advancing crop science, soil health, livestock genetics, and climate adaptation.",
};

const centres = [
  {
    name: "Harare Crop Science Lab",
    country: "Zimbabwe",
    city: "Harare",
    focus: "Crop Genetics & Breeding",
    established: 2019,
    description:
      "Specialising in the development of drought-resistant and high-yield crop varieties suited to southern African growing conditions. The lab operates advanced greenhouses and open-field trial plots across 15 hectares.",
    achievements: [
      "Developed 3 drought-resistant maize varieties now in commercial use",
      "Published 12 peer-reviewed papers on crop genetics in tropical climates",
      "Trained 200+ agricultural extension workers in seed selection techniques",
    ],
    partners: [
      "University of Zimbabwe",
      "CIMMYT",
      "Zimbabwe Agricultural Research Council",
    ],
  },
  {
    name: "Gaborone Soil Research Institute",
    country: "Botswana",
    city: "Gaborone",
    focus: "Soil Science & Fertility",
    established: 2020,
    description:
      "Dedicated to understanding and improving soil health across semi-arid regions of southern Africa. The institute conducts large-scale soil mapping and develops sustainable fertilization strategies for degraded farmland.",
    achievements: [
      "Completed soil health mapping for 50,000 hectares across Botswana",
      "Created an organic fertiliser blend that increased yields by 25% in trials",
      "Established a soil testing service used by 800+ farmers annually",
    ],
    partners: [
      "University of Botswana",
      "ICRISAT",
      "Botswana Ministry of Agriculture",
    ],
  },
  {
    name: "Dodoma Agricultural Innovation Centre",
    country: "Tanzania",
    city: "Dodoma",
    focus: "Agricultural Technology",
    established: 2021,
    description:
      "A hub for agricultural technology development and adaptation, focusing on precision farming tools, mobile-based extension services, and data-driven farm management solutions for East African smallholders.",
    achievements: [
      "Launched a mobile crop advisory platform reaching 15,000 farmers",
      "Piloted drone-based crop monitoring across 5 districts in central Tanzania",
      "Developed an SMS-based pest early warning system with 90% accuracy",
    ],
    partners: [
      "University of Dar es Salaam",
      "Tanzania Agricultural Research Institute",
      "Google.org",
    ],
  },
  {
    name: "Masvingo Livestock Research Station",
    country: "Zimbabwe",
    city: "Masvingo",
    focus: "Livestock Genetics & Health",
    established: 2020,
    description:
      "Focused on improving livestock productivity through genetic research, disease prevention, and sustainable grazing management. The station maintains a herd of 500+ cattle for breeding trials and veterinary research.",
    achievements: [
      "Identified genetic markers for heat tolerance in indigenous cattle breeds",
      "Reduced tick-borne disease incidence by 40% through integrated management protocols",
      "Established a livestock semen bank serving 300+ commercial and smallholder farms",
    ],
    partners: [
      "Midlands State University",
      "ILRI",
      "Zimbabwe Herd Book Authority",
    ],
  },
  {
    name: "Francistown Water Management Centre",
    country: "Botswana",
    city: "Francistown",
    focus: "Water Conservation & Irrigation",
    established: 2022,
    description:
      "Researching and deploying water-efficient farming techniques for arid and semi-arid zones. The centre develops drip irrigation systems, rainwater harvesting infrastructure, and groundwater management protocols.",
    achievements: [
      "Designed a low-cost drip irrigation kit reducing water use by 60%",
      "Installed rainwater harvesting systems on 120 farms across northern Botswana",
      "Published comprehensive groundwater mapping for the Tuli Block farming region",
    ],
    partners: [
      "Botswana University of Agriculture",
      "IWMI",
      "WaterAid Southern Africa",
    ],
  },
  {
    name: "Arusha Climate Adaptation Lab",
    country: "Tanzania",
    city: "Arusha",
    focus: "Climate-Smart Agriculture",
    established: 2023,
    description:
      "Addressing the impact of climate change on East African agriculture through adaptive crop systems, carbon sequestration research, and climate risk modelling for farming communities in the Great Rift Valley corridor.",
    achievements: [
      "Developed a climate risk assessment tool used by 2,000+ farming households",
      "Established 8 climate-smart demonstration farms across northern Tanzania",
      "Initiated a carbon credit verification programme for agroforestry systems",
    ],
    partners: [
      "Nelson Mandela African Institution of Science and Technology",
      "CCAFS",
      "Tanzania Meteorological Authority",
    ],
  },
];

export default function ResearchCentresPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-[#5DB347]/20 text-[#5DB347] px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            Education
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-[#5DB347] to-[#6ABF4B] bg-clip-text text-transparent">
            Research Centres
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
            A network of specialised agricultural research centres across Africa,
            driving innovation from the lab to the field. Each centre partners
            with leading universities and international research organisations.
          </p>
        </div>
      </section>

      {/* Research Centres Grid */}
      <section className="py-16 bg-[#EBF7E5]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {centres.map((centre, i) => (
              <div
                key={i}
                className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-l-4 border-[#5DB347] shadow-lg shadow-[#5DB347]/5 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#1B2A4A]">
                      {centre.name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {centre.city}, {centre.country}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#EBF7E5] text-[#5DB347]">
                    Est. {centre.established}
                  </span>
                </div>

                <div className="inline-block bg-[#5DB347]/10 text-[#5DB347] px-3 py-1 rounded-full text-xs font-medium mb-4">
                  {centre.focus}
                </div>

                <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                  {centre.description}
                </p>

                <div className="mb-5">
                  <h4 className="text-sm font-semibold text-[#1B2A4A] mb-3">
                    Key Achievements
                  </h4>
                  <ul className="space-y-2">
                    {centre.achievements.map((a, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-gray-600 text-sm"
                      >
                        <svg
                          className="w-4 h-4 text-[#5DB347] mt-0.5 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[#1B2A4A] mb-2">
                    Partner Institutions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {centre.partners.map((p, j) => (
                      <span
                        key={j}
                        className="bg-[#EBF7E5] text-[#1B2A4A] text-xs font-medium px-3 py-1 rounded-full border border-[#5DB347]/20"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#5DB347] to-[#449933]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Partner With Our Research Network
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            We are always looking for academic institutions, research
            organisations, and industry partners to collaborate with. Join our
            growing network and help drive agricultural innovation in Africa.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/contact"
              className="inline-block bg-white text-[#5DB347] hover:bg-gray-100 hover:scale-105 px-8 py-3.5 rounded-xl font-semibold text-lg transition-all duration-300"
            >
              Contact Us
            </Link>
            <Link
              href="/education"
              className="inline-block border-2 border-white text-white hover:bg-white/10 px-8 py-3.5 rounded-xl font-semibold text-lg transition-all duration-300"
            >
              Back to Education Hub
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
