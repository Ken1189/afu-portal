import Link from "next/link";
import { Rocket, Sprout, School, Trophy, Handshake, type LucideIcon } from "lucide-react";
import { createPageMetadata } from '@/lib/seo/metadata';
import { createClient } from "@supabase/supabase-js";

export const metadata = createPageMetadata({
  title: 'Young Farmers Program',
  description: 'Inspiring the future of African agriculture. Youth incubators, training programs, school partnerships, and mentorship for young farmers.',
  path: '/young-farmers',
});

/* ─── FALLBACK DATA ─── */

const FALLBACK_PROGRAMS: { iconName: string; title: string; description: string; highlight: string }[] = [
  {
    iconName: "Rocket",
    title: "Young Farmer Incubator",
    description:
      "Our Shark Tank-style pitch program where young entrepreneurs present their agricultural business ideas to a panel of AFU mentors and investors. The best ideas receive seed funding, operational support, and access to AFU's full network to turn their vision into reality.",
    highlight: "Seed funding for winning ideas",
  },
  {
    iconName: "Sprout",
    title: "Junior Training Program",
    description:
      "Age-appropriate farming education modules covering soil science, crop management, livestock care, basic business skills, and sustainable practices. Designed for ages 10 to 18 with hands-on learning experiences.",
    highlight: "Ages 10-18",
  },
  {
    iconName: "School",
    title: "School Farm Partnerships",
    description:
      "AFU partners with schools across our member countries to create learning gardens and mini-farms on school grounds. Students learn agriculture from planting to harvest while contributing fresh produce to their school communities.",
    highlight: "Active in 20 countries",
  },
  {
    iconName: "Trophy",
    title: "Youth Entrepreneurship Awards",
    description:
      "Annual awards recognizing outstanding young agricultural innovators across Africa. Categories include Best Young Farmer, Most Innovative Agritech Idea, Community Impact, and Sustainability Champion.",
    highlight: "Annual awards ceremony",
  },
  {
    iconName: "Handshake",
    title: "Mentorship Program",
    description:
      "Connecting young farmers with experienced AFU ambassadors and commercial farmers. One-on-one mentorship covering everything from crop planning to business management, with regular farm visits and quarterly reviews.",
    highlight: "1-on-1 guidance",
  },
];

const FALLBACK_STATS = [
  { value: "500+", label: "Young farmers enrolled" },
  { value: "45", label: "Partner schools" },
  { value: "9", label: "Countries active" },
  { value: "$120K", label: "Seed funding awarded" },
];

/* ─── ICON MAP ─── */

const iconMap: Record<string, LucideIcon> = {
  Rocket,
  Sprout,
  School,
  Trophy,
  Handshake,
};

function getIcon(name: string) {
  return iconMap[name] || Sprout;
}

/* ─── FETCH SITE CONFIG ─── */

async function fetchYoungFarmersContent() {
  let programs = FALLBACK_PROGRAMS;
  let stats = FALLBACK_STATS;

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data, error } = await supabase
        .from('site_config')
        .select('key, value')
        .in('key', ['young_farmers_programs', 'young_farmers_stats']);

      if (!error && data) {
        for (const row of data) {
          switch (row.key) {
            case 'young_farmers_programs':
              programs = row.value as typeof FALLBACK_PROGRAMS;
              break;
            case 'young_farmers_stats':
              stats = row.value as typeof FALLBACK_STATS;
              break;
          }
        }
      }
    }
  } catch {
    // Silently fall back to hardcoded data
  }

  return { programs, stats };
}

export default async function YoungFarmersPage() {
  const { programs, stats } = await fetchYoungFarmersContent();

  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #5DB347 0%, transparent 50%)' }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-block bg-[#5DB347]/20 text-[#5DB347] px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            Community Program
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Young Farmers — The Next Generation
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Inspiring the future of African agriculture. Building tomorrow&apos;s
            farming leaders through hands-on experience, mentorship, and
            entrepreneurship.
          </p>
        </div>
      </section>

      {/* Commitment Banner */}
      <section className="bg-[#5DB347] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg md:text-xl font-semibold">
            10% of AFU profits support our community programs including Young Farmers
          </p>
          <p className="text-white/80 text-sm mt-1">
            Every membership, every transaction, every partnership helps grow the next generation
          </p>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Our Youth Programs
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Five pathways designed to educate, empower, and launch the next
              generation of African agricultural leaders.
            </p>
          </div>

          <div className="space-y-8">
            {programs.map((program, i) => {
              const Icon = getIcon(program.iconName);
              return (
                <div
                  key={i}
                  className="bg-cream rounded-2xl p-8 md:p-10 border border-gray-100 hover:border-[#5DB347]/20 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-14 h-14 rounded-xl bg-[#5DB347]/10 flex items-center justify-center shrink-0">
                      <Icon className="w-7 h-7 text-[#5DB347]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-navy">
                          {program.title}
                        </h3>
                        <span className="bg-[#5DB347]/10 text-[#5DB347] text-xs font-semibold px-3 py-1 rounded-full">
                          {program.highlight}
                        </span>
                      </div>
                      <p className="text-gray-500 leading-relaxed">
                        {program.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i}>
                <div className="text-3xl md:text-4xl font-bold text-[#5DB347] mb-1">
                  {stat.value}
                </div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Get Involved
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Whether you are a young person passionate about farming, a school
            looking to start a learning garden, or an experienced farmer willing
            to mentor — we want to hear from you.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/contact?subject=young-farmers"
              className="bg-[#5DB347] hover:bg-[#449933] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Apply as a Young Farmer
            </Link>
            <Link
              href="/contact?subject=school-partnership"
              className="border-2 border-white/20 hover:border-white/40 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              School Partnership Enquiry
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
