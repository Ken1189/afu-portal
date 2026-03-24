'use client';

import Link from "next/link";
import { Truck, TruckIcon, Tractor, Bike, Car, Bus, type LucideIcon } from "lucide-react";

const coverOptions = [
  {
    type: "Third Party Only",
    description:
      "The legal minimum. Covers damage you cause to other people, vehicles, and property. Does not cover your own vehicle.",
    ideal: "Older vehicles and tight budgets",
    priceFrom: "From $8/month",
  },
  {
    type: "Third Party, Fire & Theft",
    description:
      "Everything in Third Party plus cover if your vehicle is stolen or damaged by fire. A popular mid-range option.",
    ideal: "Medium-value farm vehicles and bakkies",
    priceFrom: "From $15/month",
  },
  {
    type: "Comprehensive",
    description:
      "Full cover including accidental damage, theft, fire, windscreen, and third-party liability. The complete protection package.",
    ideal: "Newer vehicles, trucks, and high-value fleet",
    priceFrom: "From $30/month",
  },
];

const vehicles = [
  { name: "Farm Bakkies & Pickups", icon: Truck, desc: "Light commercial vehicles used for daily farm operations and transport." },
  { name: "Trucks & Lorries", icon: TruckIcon, desc: "Heavy vehicles for produce transport, livestock hauling, and input delivery." },
  { name: "Tractors (Road Use)", icon: Tractor, desc: "Cover for tractors when driven on public roads between farms and facilities." },
  { name: "Motorbikes & ATVs", icon: Bike, desc: "Two-wheelers and all-terrain vehicles used for farm patrols and errands." },
  { name: "Trailers", icon: Car, desc: "Agricultural trailers, flatbeds, and tanker trailers used with farm vehicles." },
  { name: "Fleet Vehicles", icon: Bus, desc: "Multi-vehicle policies for commercial farms with 3 or more vehicles at discounted rates." },
];

const steps = [
  { step: "Register", desc: "Add your vehicles to your AFU dashboard with registration details and photos." },
  { step: "Choose Cover", desc: "Select third party, fire & theft, or comprehensive cover for each vehicle." },
  { step: "Get Insured", desc: "Receive your policy documents and proof of insurance digitally within minutes." },
  { step: "Claim", desc: "Report accidents or theft via the app. Towing assistance and fast claims processing included." },
];

export default function VehicleInsurancePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-block bg-gold/20 text-gold px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            AFU Insurance
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Vehicle &amp; Transport Insurance
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl">
            Keep your farm vehicles on the road. Third party, fire and theft,
            and comprehensive cover for bakkies, trucks, tractors, and your
            entire fleet.
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

      {/* Cover Options */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Cover Options
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Choose the level of protection that matches your vehicle value
              and budget.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coverOptions.map((option, i) => (
              <div
                key={i}
                className={`rounded-2xl p-8 ${
                  i === 2
                    ? "bg-teal text-white"
                    : "bg-white border border-gray-100"
                }`}
              >
                <h3
                  className={`text-xl font-bold mb-3 ${
                    i === 2 ? "text-white" : "text-navy"
                  }`}
                >
                  {option.type}
                </h3>
                <p
                  className={`text-sm mb-5 leading-relaxed ${
                    i === 2 ? "text-white/80" : "text-gray-500"
                  }`}
                >
                  {option.description}
                </p>
                <div
                  className={`text-xs mb-2 ${
                    i === 2 ? "text-white/60" : "text-gray-400"
                  }`}
                >
                  Ideal for: {option.ideal}
                </div>
                <div
                  className={`text-sm font-bold ${
                    i === 2 ? "text-gold" : "text-teal"
                  }`}
                >
                  {option.priceFrom}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vehicles Covered */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-navy mb-4">
              Vehicles We Cover
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              From motorbikes to heavy trucks, we insure every vehicle on your
              farm.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((v, i) => (
              <div key={i} className="bg-white rounded-2xl p-6">
                <div className="w-12 h-12 rounded-xl bg-[#5DB347]/10 flex items-center justify-center mb-3"><v.icon className="w-6 h-6 text-[#5DB347]" /></div>
                <h3 className="font-bold text-navy mb-2">{v.name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {v.desc}
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
            <h2 className="text-3xl font-bold text-navy mb-4">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-14 h-14 bg-gold rounded-2xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-bold text-navy mb-2">{item.step}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Insure Your Vehicles</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Do not let a single accident or theft bring your farm to a standstill.
            Get vehicle insurance that keeps your operation moving.
          </p>
          <Link
            href="/farm/insurance/quote"
            className="inline-block bg-gold hover:bg-gold/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Get a Vehicle Insurance Quote
          </Link>
        </div>
      </section>
    </>
  );
}
