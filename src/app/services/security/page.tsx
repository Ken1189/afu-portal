import Link from "next/link";
import { Radio, ShieldAlert, Wifi, MapPin, Lock, Phone } from "lucide-react";
import { type LucideIcon } from "lucide-react";

export const metadata = {
  title: "Agri-Alert — Farm Security & Protection - AFU",
  description:
    "Protecting your farm, your livestock, and your livelihood. Drone surveillance, rapid response teams, smart fencing, livestock tracking, and 24/7 emergency response.",
};

const services: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Radio,
    title: "Drone Surveillance",
    description:
      "Aerial monitoring of farm perimeters and livestock using state-of-the-art drone technology. Automated patrol routes with real-time video feeds and AI-powered anomaly detection.",
  },
  {
    icon: ShieldAlert,
    title: "Rapid Response Teams",
    description:
      "On-the-ground security personnel trained in agricultural environments. Strategically positioned across regions for fastest possible response times when alerts are triggered.",
  },
  {
    icon: Wifi,
    title: "Smart Fencing & Sensors",
    description:
      "IoT-enabled perimeter detection systems that monitor fence integrity, detect breaches, and alert your security dashboard instantly. Solar-powered for off-grid farms.",
  },
  {
    icon: MapPin,
    title: "Livestock Tracking",
    description:
      "GPS tags for cattle and high-value animals with real-time location monitoring. Geofencing alerts notify you immediately if animals move outside designated areas.",
  },
  {
    icon: Lock,
    title: "Theft & Poaching Prevention",
    description:
      "Intelligence-led deterrence combining community reporting networks, pattern analysis, and coordinated response with local authorities to prevent stock theft and crop poaching.",
  },
  {
    icon: Phone,
    title: "Emergency Response",
    description:
      "24/7 alert system with dedicated emergency channels. One-touch panic activation from your phone connects you to the nearest response unit and local law enforcement.",
  },
];

export default function SecurityPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #5DB347 0%, transparent 50%), radial-gradient(circle at 80% 50%, #1B2A4A 0%, transparent 50%)' }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="inline-block bg-[#5DB347]/20 text-[#5DB347] px-4 py-1.5 rounded-full text-sm font-medium">
              Farm Security
            </div>
            <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
              Coming Soon
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Agri-Alert — Farm Security & Protection
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Protecting your farm, your livestock, and your livelihood. Comprehensive
            security solutions designed specifically for African agricultural operations.
          </p>
        </div>
      </section>

      {/* Why Security Matters */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Why Farm Security Matters
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Stock theft, crop poaching, and equipment loss cost African farmers
              billions annually. Agri-Alert combines modern technology with
              community-driven intelligence to protect what you have worked so hard
              to build.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { stat: "$4B+", label: "Annual losses to agricultural crime across Africa" },
              { stat: "60%", label: "Of farmers report theft or stock loss incidents" },
              { stat: "<8 min", label: "Target response time for Agri-Alert rapid teams" },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 bg-cream rounded-2xl">
                <div className="text-3xl font-bold text-[#5DB347] mb-2">{item.stat}</div>
                <p className="text-sm text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Our Security Services
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Six integrated layers of protection, from airborne surveillance to
              on-the-ground rapid response.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-[#5DB347]/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-[#5DB347]/10 flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-[#5DB347]" />
                </div>
                <h3 className="text-xl font-bold text-navy mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              How Agri-Alert Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Install", desc: "Sensors, cameras, and GPS tags deployed on your farm by our team." },
              { step: "02", title: "Monitor", desc: "24/7 monitoring via drone patrols, smart fencing, and livestock tracking." },
              { step: "03", title: "Detect", desc: "AI-powered threat detection triggers instant alerts to your phone and our control room." },
              { step: "04", title: "Respond", desc: "Rapid response teams dispatched immediately. Coordinated with local authorities." },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-navy rounded-2xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-navy mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            Coming Soon
          </span>
          <h2 className="text-3xl font-bold mb-4">
            Protect Your Farm Before It&apos;s Too Late
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Agri-Alert is launching soon across AFU member countries. Register
            your interest to be among the first farms to receive our security
            protection.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/contact?subject=security"
              className="bg-[#5DB347] hover:bg-[#449933] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Register Interest
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white/20 hover:border-white/40 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
