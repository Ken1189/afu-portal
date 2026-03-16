"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Menu,
  X,
  Landmark,
  ShieldCheck,
  ShoppingCart,
  Cpu,
  Zap,
  Wrench,
  BookOpen,
  FlaskConical,
  FolderKanban,
} from "lucide-react";

/* ─── Data ─── */

const financeLinks = [
  { label: "AFU Bank", href: "/services/finance/afu-bank" },
  { label: "Asset Finance", href: "/services/finance/asset-finance" },
  { label: "Crop Dev Loan", href: "/services/finance/crop-dev-loan" },
  { label: "Mortgages", href: "/services/finance/mortgages" },
  { label: "Input Finance", href: "/services/finance/input-finance" },
  { label: "Harvest Finance", href: "/services/finance/harvest-finance" },
];

const insuranceLinks = [
  { label: "Asset Insurance", href: "/services/insurance/asset" },
  { label: "Crop Insurance", href: "/services/insurance/crop" },
  { label: "Medical Insurance", href: "/services/insurance/medical" },
  { label: "Farm Insurance", href: "/services/insurance/farm" },
  { label: "Trade Insurance", href: "/services/insurance/trade" },
  { label: "Livestock Insurance", href: "/services/insurance/livestock" },
];

const moreServicesLinks = [
  { label: "Marketplace", href: "/supplier", icon: ShoppingCart },
  { label: "Technology", href: "/services/technology", icon: Cpu },
  { label: "Energy", href: "/services/energy", icon: Zap },
  { label: "Machinery", href: "/services/machinery", icon: Wrench },
];

const educationLinks = [
  { label: "Research Centres", href: "/education/research", icon: FlaskConical },
  { label: "Projects", href: "/education/projects", icon: FolderKanban },
  { label: "Knowledgebase", href: "/education/knowledgebase", icon: BookOpen },
];

type OpenDropdown = null | "services" | "education";

/* ─── Dropdown animation variants ─── */

const dropdownVariants = {
  hidden: { opacity: 0, y: -4, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.98 },
};

const mobileMenuVariants = {
  hidden: { opacity: 0, x: "100%" as string },
  visible: { opacity: 1, x: "0%" },
  exit: { opacity: 0, x: "100%" as string },
};

/* ─── Component ─── */

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileEducationOpen, setMobileEducationOpen] = useState(false);
  const [mobileFinanceOpen, setMobileFinanceOpen] = useState(false);
  const [mobileInsuranceOpen, setMobileInsuranceOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Close dropdowns on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* Close dropdowns on Escape */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenDropdown(null);
        setMobileOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  /* Lock body scroll when mobile menu open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setMobileServicesOpen(false);
    setMobileEducationOpen(false);
    setMobileFinanceOpen(false);
    setMobileInsuranceOpen(false);
    setMobileMoreOpen(false);
  }, []);

  /* Hover handlers with debounce to prevent flicker */
  const handleMouseEnter = (dropdown: OpenDropdown) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setOpenDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  return (
    <nav
      ref={navRef}
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
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

          {/* ── Desktop Nav ── */}
          <div className="hidden lg:flex items-center gap-1">
            {/* About Us */}
            <Link
              href="/about"
              className="text-navy hover:text-teal transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-teal-light/50"
            >
              About Us
            </Link>

            {/* Education Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("education")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                  openDropdown === "education"
                    ? "text-teal bg-teal-light/50"
                    : "text-navy hover:text-teal hover:bg-teal-light/50"
                }`}
                onClick={() =>
                  setOpenDropdown(
                    openDropdown === "education" ? null : "education"
                  )
                }
              >
                Education
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    openDropdown === "education" ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {openDropdown === "education" && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
                    onMouseEnter={() => handleMouseEnter("education")}
                    onMouseLeave={handleMouseLeave}
                  >
                    {educationLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy hover:bg-teal-light hover:text-teal transition-colors"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <Icon className="w-4 h-4 text-gray-400" />
                          {link.label}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Services Mega Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter("services")}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                  openDropdown === "services"
                    ? "text-teal bg-teal-light/50"
                    : "text-navy hover:text-teal hover:bg-teal-light/50"
                }`}
                onClick={() =>
                  setOpenDropdown(
                    openDropdown === "services" ? null : "services"
                  )
                }
              >
                Services
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    openDropdown === "services" ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {openDropdown === "services" && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.15 }}
                    className="absolute top-full -left-40 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 w-[700px]"
                    onMouseEnter={() => handleMouseEnter("services")}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="p-6">
                      <div className="grid grid-cols-3 gap-8">
                        {/* Finance Column */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Landmark className="w-4 h-4 text-teal" />
                            <span className="text-xs font-semibold text-teal uppercase tracking-wider">
                              Finance
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            {financeLinks.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                className="block px-3 py-2 text-sm text-navy hover:bg-teal-light hover:text-teal rounded-lg transition-colors"
                                onClick={() => setOpenDropdown(null)}
                              >
                                {link.label}
                              </Link>
                            ))}
                          </div>
                        </div>

                        {/* Insurance Column */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <ShieldCheck className="w-4 h-4 text-teal" />
                            <span className="text-xs font-semibold text-teal uppercase tracking-wider">
                              Insurance
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            {insuranceLinks.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                className="block px-3 py-2 text-sm text-navy hover:bg-teal-light hover:text-teal rounded-lg transition-colors"
                                onClick={() => setOpenDropdown(null)}
                              >
                                {link.label}
                              </Link>
                            ))}
                          </div>
                        </div>

                        {/* More Column */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-xs font-semibold text-teal uppercase tracking-wider">
                              More
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            {moreServicesLinks.map((link) => {
                              const Icon = link.icon;
                              return (
                                <Link
                                  key={link.href}
                                  href={link.href}
                                  className="flex items-center gap-3 px-3 py-2 text-sm text-navy hover:bg-teal-light hover:text-teal rounded-lg transition-colors"
                                  onClick={() => setOpenDropdown(null)}
                                >
                                  <Icon className="w-4 h-4 text-gray-400" />
                                  {link.label}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Simple Links */}
            <Link
              href="/memberships"
              className="text-navy hover:text-teal transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-teal-light/50"
            >
              Memberships
            </Link>
            <Link
              href="/podcasts"
              className="text-navy hover:text-teal transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-teal-light/50"
            >
              Podcasts
            </Link>
            <Link
              href="/partners"
              className="text-navy hover:text-teal transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-teal-light/50"
            >
              Partnerships
            </Link>
            <Link
              href="/projects"
              className="text-navy hover:text-teal transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-teal-light/50"
            >
              Projects
            </Link>
            <Link
              href="/countries"
              className="text-navy hover:text-teal transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-teal-light/50"
            >
              Countries
            </Link>
          </div>

          {/* ── Desktop CTA ── */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
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

          {/* ── Mobile Toggle ── */}
          <button
            className="lg:hidden text-navy p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-0 top-16 bg-white z-40 lg:hidden overflow-y-auto"
          >
            <div className="px-4 py-6 pb-24">
              <div className="flex flex-col gap-1">
                {/* About */}
                <Link
                  href="/about"
                  className="text-navy hover:text-teal text-base font-medium py-3 px-3 rounded-lg hover:bg-teal-light/50 transition-colors"
                  onClick={closeMobile}
                >
                  About Us
                </Link>

                {/* Education Accordion */}
                <div>
                  <button
                    className="flex items-center justify-between w-full text-navy text-base font-medium py-3 px-3 rounded-lg hover:bg-teal-light/50 transition-colors"
                    onClick={() => setMobileEducationOpen(!mobileEducationOpen)}
                  >
                    Education
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        mobileEducationOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {mobileEducationOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 py-1 space-y-0.5">
                          {educationLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                              <Link
                                key={link.href}
                                href={link.href}
                                className="flex items-center gap-3 text-navy/70 hover:text-teal text-sm py-2.5 px-3 rounded-lg hover:bg-teal-light/50 transition-colors"
                                onClick={closeMobile}
                              >
                                <Icon className="w-4 h-4" />
                                {link.label}
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Services Accordion */}
                <div>
                  <button
                    className="flex items-center justify-between w-full text-navy text-base font-medium py-3 px-3 rounded-lg hover:bg-teal-light/50 transition-colors"
                    onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                  >
                    Services
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        mobileServicesOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {mobileServicesOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 py-1 space-y-1">
                          {/* Finance sub-accordion */}
                          <button
                            className="flex items-center justify-between w-full text-navy/80 text-sm font-semibold py-2.5 px-3 rounded-lg hover:bg-teal-light/50 transition-colors"
                            onClick={() =>
                              setMobileFinanceOpen(!mobileFinanceOpen)
                            }
                          >
                            <span className="flex items-center gap-2">
                              <Landmark className="w-4 h-4 text-teal" />
                              Finance
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${
                                mobileFinanceOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          <AnimatePresence>
                            {mobileFinanceOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="overflow-hidden"
                              >
                                <div className="pl-4 space-y-0.5">
                                  {financeLinks.map((link) => (
                                    <Link
                                      key={link.href}
                                      href={link.href}
                                      className="block text-navy/60 hover:text-teal text-sm py-2 px-3 rounded-lg hover:bg-teal-light/50 transition-colors"
                                      onClick={closeMobile}
                                    >
                                      {link.label}
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Insurance sub-accordion */}
                          <button
                            className="flex items-center justify-between w-full text-navy/80 text-sm font-semibold py-2.5 px-3 rounded-lg hover:bg-teal-light/50 transition-colors"
                            onClick={() =>
                              setMobileInsuranceOpen(!mobileInsuranceOpen)
                            }
                          >
                            <span className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-teal" />
                              Insurance
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${
                                mobileInsuranceOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          <AnimatePresence>
                            {mobileInsuranceOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="overflow-hidden"
                              >
                                <div className="pl-4 space-y-0.5">
                                  {insuranceLinks.map((link) => (
                                    <Link
                                      key={link.href}
                                      href={link.href}
                                      className="block text-navy/60 hover:text-teal text-sm py-2 px-3 rounded-lg hover:bg-teal-light/50 transition-colors"
                                      onClick={closeMobile}
                                    >
                                      {link.label}
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* More sub-accordion */}
                          <button
                            className="flex items-center justify-between w-full text-navy/80 text-sm font-semibold py-2.5 px-3 rounded-lg hover:bg-teal-light/50 transition-colors"
                            onClick={() => setMobileMoreOpen(!mobileMoreOpen)}
                          >
                            <span>More Services</span>
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${
                                mobileMoreOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                          <AnimatePresence>
                            {mobileMoreOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="overflow-hidden"
                              >
                                <div className="pl-4 space-y-0.5">
                                  {moreServicesLinks.map((link) => {
                                    const Icon = link.icon;
                                    return (
                                      <Link
                                        key={link.href}
                                        href={link.href}
                                        className="flex items-center gap-3 text-navy/60 hover:text-teal text-sm py-2 px-3 rounded-lg hover:bg-teal-light/50 transition-colors"
                                        onClick={closeMobile}
                                      >
                                        <Icon className="w-4 h-4" />
                                        {link.label}
                                      </Link>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Flat links */}
                <Link
                  href="/memberships"
                  className="text-navy hover:text-teal text-base font-medium py-3 px-3 rounded-lg hover:bg-teal-light/50 transition-colors"
                  onClick={closeMobile}
                >
                  Memberships
                </Link>
                <Link
                  href="/podcasts"
                  className="text-navy hover:text-teal text-base font-medium py-3 px-3 rounded-lg hover:bg-teal-light/50 transition-colors"
                  onClick={closeMobile}
                >
                  Podcasts
                </Link>
                <Link
                  href="/partners"
                  className="text-navy hover:text-teal text-base font-medium py-3 px-3 rounded-lg hover:bg-teal-light/50 transition-colors"
                  onClick={closeMobile}
                >
                  Partnerships
                </Link>
                <Link
                  href="/projects"
                  className="text-navy hover:text-teal text-base font-medium py-3 px-3 rounded-lg hover:bg-teal-light/50 transition-colors"
                  onClick={closeMobile}
                >
                  Projects
                </Link>
                <Link
                  href="/countries"
                  className="text-navy hover:text-teal text-base font-medium py-3 px-3 rounded-lg hover:bg-teal-light/50 transition-colors"
                  onClick={closeMobile}
                >
                  Countries
                </Link>

                {/* CTA Section */}
                <hr className="border-gray-200 my-4" />
                <Link
                  href="/login"
                  className="text-navy hover:text-teal text-base font-medium py-3 px-3 rounded-lg hover:bg-teal-light/50 transition-colors"
                  onClick={closeMobile}
                >
                  Sign In
                </Link>
                <Link
                  href="/apply"
                  className="bg-teal hover:bg-teal-dark text-white px-4 py-3 rounded-lg text-base font-semibold text-center transition-colors"
                  onClick={closeMobile}
                >
                  Become a Member
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
