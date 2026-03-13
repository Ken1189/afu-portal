"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-teal rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <span className="text-navy font-bold text-xl">AFU</span>
              <span className="hidden sm:inline text-navy-light text-sm ml-2">
                African Farming Union
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/about" className="text-navy hover:text-teal transition-colors text-sm font-medium">
              About
            </Link>

            {/* Services Dropdown */}
            <div className="relative" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
              <button className="text-navy hover:text-teal transition-colors text-sm font-medium flex items-center gap-1">
                Services
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {servicesOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2">
                  <Link href="/services/financing" className="block px-4 py-2 text-sm text-navy hover:bg-teal-light transition-colors">
                    Financing
                  </Link>
                  <Link href="/services/inputs" className="block px-4 py-2 text-sm text-navy hover:bg-teal-light transition-colors">
                    Inputs & Equipment
                  </Link>
                  <Link href="/services/processing" className="block px-4 py-2 text-sm text-navy hover:bg-teal-light transition-colors">
                    Processing Hubs
                  </Link>
                  <Link href="/services/offtake" className="block px-4 py-2 text-sm text-navy hover:bg-teal-light transition-colors">
                    Guaranteed Offtake
                  </Link>
                  <Link href="/services/trade-finance" className="block px-4 py-2 text-sm text-navy hover:bg-teal-light transition-colors">
                    Trade Finance
                  </Link>
                  <Link href="/services/training" className="block px-4 py-2 text-sm text-navy hover:bg-teal-light transition-colors">
                    Training
                  </Link>
                </div>
              )}
            </div>

            <Link href="/countries" className="text-navy hover:text-teal transition-colors text-sm font-medium">
              Countries
            </Link>
            <Link href="/partners" className="text-navy hover:text-teal transition-colors text-sm font-medium">
              Partners
            </Link>
            <Link href="/contact" className="text-navy hover:text-teal transition-colors text-sm font-medium">
              Contact
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-navy hover:text-teal transition-colors text-sm font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/apply"
              className="bg-teal hover:bg-teal-dark text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
              Become a Member
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-navy"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 mt-2 pt-4">
            <div className="flex flex-col gap-3">
              <Link href="/about" className="text-navy hover:text-teal text-sm font-medium" onClick={() => setMobileOpen(false)}>About</Link>
              <Link href="/services/financing" className="text-navy hover:text-teal text-sm font-medium" onClick={() => setMobileOpen(false)}>Financing</Link>
              <Link href="/services/inputs" className="text-navy hover:text-teal text-sm font-medium" onClick={() => setMobileOpen(false)}>Inputs & Equipment</Link>
              <Link href="/services/processing" className="text-navy hover:text-teal text-sm font-medium" onClick={() => setMobileOpen(false)}>Processing Hubs</Link>
              <Link href="/services/offtake" className="text-navy hover:text-teal text-sm font-medium" onClick={() => setMobileOpen(false)}>Guaranteed Offtake</Link>
              <Link href="/services/trade-finance" className="text-navy hover:text-teal text-sm font-medium" onClick={() => setMobileOpen(false)}>Trade Finance</Link>
              <Link href="/services/training" className="text-navy hover:text-teal text-sm font-medium" onClick={() => setMobileOpen(false)}>Training</Link>
              <Link href="/countries" className="text-navy hover:text-teal text-sm font-medium" onClick={() => setMobileOpen(false)}>Countries</Link>
              <Link href="/partners" className="text-navy hover:text-teal text-sm font-medium" onClick={() => setMobileOpen(false)}>Partners</Link>
              <Link href="/contact" className="text-navy hover:text-teal text-sm font-medium" onClick={() => setMobileOpen(false)}>Contact</Link>
              <hr className="border-gray-200" />
              <Link href="/login" className="text-navy hover:text-teal text-sm font-medium" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link href="/apply" className="bg-teal text-white px-4 py-2 rounded-lg text-sm font-semibold text-center" onClick={() => setMobileOpen(false)}>
                Become a Member
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
