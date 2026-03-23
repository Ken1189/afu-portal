"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  LogOut,
  LayoutDashboard,
  User,
  Settings,
} from "lucide-react";
import { useAuth } from "@/lib/supabase/auth-context";

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
  { label: "Insurance", href: "/services/insurance", icon: ShieldCheck },
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

const communityLinks = [
  { label: "Jobs Board", href: "/jobs", desc: "Agricultural positions" },
  { label: "Ambassadors", href: "/ambassadors", desc: "Meet our farmers" },
  { label: "Partner Farms", href: "/farms", desc: "Showcase farms" },
  { label: "Partners", href: "/partners", desc: "Our network" },
  { label: "Projects", href: "/projects", desc: "Development projects" },
  { label: "Podcasts", href: "/podcasts", desc: "Listen & learn" },
];

type OpenDropdown = null | "services" | "education" | "community";

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
  const { user, profile, isAdmin, signOut, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<OpenDropdown>(null);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileEducationOpen, setMobileEducationOpen] = useState(false);
  const [mobileFinanceOpen, setMobileFinanceOpen] = useState(false);
  const [mobileInsuranceOpen, setMobileInsuranceOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    router.push('/');
  };

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
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#5DB347' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C8 8 4 14 4 18c0 2.5 3.5 4 8 4s8-1.5 8-4c0-4-4-10-8-16z" fill="white" opacity="0.9"/>
                <path d="M12 8v12" stroke="white" strokeWidth="1.5" opacity="0.6"/>
                <path d="M12 12c-2 0-4 2-4 4" stroke="white" strokeWidth="1.2" fill="none" opacity="0.5"/>
                <path d="M12 14c2 0 3 1.5 3 3" stroke="white" strokeWidth="1.2" fill="none" opacity="0.5"/>
              </svg>
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-lg font-extrabold tracking-tight" style={{ color: '#1B2A4A' }}>AFU</div>
              <div className="text-[9px] font-semibold tracking-[0.12em] uppercase" style={{ color: '#5DB347' }}>African Farming Union</div>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden lg:flex items-center gap-1">
            {/* About Us */}
            <Link
              href="/about"
              className="text-navy hover:text-[#5DB347] transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-[#EBF7E5]/50"
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
                    ? "text-[#5DB347] bg-[#EBF7E5]/50"
                    : "text-navy hover:text-[#5DB347] hover:bg-[#EBF7E5]/50"
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
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-navy hover:bg-[#EBF7E5] hover:text-[#5DB347] transition-colors"
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
                    ? "text-[#5DB347] bg-[#EBF7E5]/50"
                    : "text-navy hover:text-[#5DB347] hover:bg-[#EBF7E5]/50"
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
                    className="absolute top-full -left-40 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 z-50 w-[700px] max-w-[calc(100vw-2rem)]"
                    onMouseEnter={() => handleMouseEnter("services")}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="p-6">
                      <div className="grid grid-cols-3 gap-8">
                        {/* Finance Column */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Landmark className="w-4 h-4 text-[#5DB347]" />
                            <span className="text-xs font-semibold text-[#5DB347] uppercase tracking-wider">
                              Finance
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            {financeLinks.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                className="block px-3 py-2 text-sm text-navy hover:bg-[#EBF7E5] hover:text-[#5DB347] rounded-lg transition-colors"
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
                            <ShieldCheck className="w-4 h-4 text-[#5DB347]" />
                            <span className="text-xs font-semibold text-[#5DB347] uppercase tracking-wider">
                              Insurance
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            {insuranceLinks.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                className="block px-3 py-2 text-sm text-navy hover:bg-[#EBF7E5] hover:text-[#5DB347] rounded-lg transition-colors"
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
                            <span className="text-xs font-semibold text-[#5DB347] uppercase tracking-wider">
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
                                  className="flex items-center gap-3 px-3 py-2 text-sm text-navy hover:bg-[#EBF7E5] hover:text-[#5DB347] rounded-lg transition-colors"
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

            {/* Clean nav: 3 links + 1 dropdown */}
            <Link
              href="/memberships"
              className="text-navy hover:text-[#5DB347] transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-[#EBF7E5]/50"
            >
              Memberships
            </Link>
            <Link
              href="/countries"
              className="text-navy hover:text-[#5DB347] transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-[#EBF7E5]/50"
            >
              Countries
            </Link>
            <Link
              href="/investors"
              className="text-navy hover:text-[#5DB347] transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-[#EBF7E5]/50"
            >
              Investors
            </Link>

            {/* Community dropdown */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === "community" ? null : "community")}
                className={`flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
                  openDropdown === "community"
                    ? "text-[#5DB347] bg-[#EBF7E5]/50"
                    : "text-navy hover:text-[#5DB347] hover:bg-[#EBF7E5]/50"
                }`}
              >
                Community
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === "community" ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {openDropdown === "community" && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50"
                  >
                    {communityLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpenDropdown(null)}
                        className="flex flex-col px-4 py-2.5 hover:bg-[#EBF7E5]/50 transition-colors"
                      >
                        <span className="text-sm font-medium text-navy">{link.label}</span>
                        <span className="text-[10px] text-gray-400">{link.desc}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link
              href="/sponsor"
              className="text-white font-semibold text-xs px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap"
              style={{ background: '#5DB347' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#449933')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#5DB347')}
            >
              <span className="text-sm">❤️</span>
              Sponsor
            </Link>
          </div>

          {/* ── Desktop CTA ── */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {!authLoading && user ? (
              /* Signed-in user menu */
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-cream transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#5DB347]/15 flex items-center justify-center text-[#5DB347] font-semibold text-sm">
                    {profile?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-navy leading-tight">
                      {profile?.full_name || user.email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-gray-400 capitalize leading-tight">
                      {profile?.role?.replace('_', ' ') || 'Member'}
                    </p>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50"
                    >
                      <Link
                        href="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy hover:bg-cream transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-gray-400" />
                        Dashboard
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy hover:bg-cream transition-colors"
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                          Admin Portal
                        </Link>
                      )}
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-navy hover:bg-cream transition-colors"
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        My Profile
                      </Link>
                      <hr className="my-1.5 border-gray-100" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* Not signed in */
              <>
                <Link
                  href="/login"
                  className="text-navy hover:text-[#5DB347] transition-colors text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/apply"
                  className="text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
                  style={{ background: '#5DB347' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#449933')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#5DB347')}
                >
                  Become a Member
                </Link>
              </>
            )}
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
                  className="text-navy hover:text-[#5DB347] text-base font-medium py-3 px-3 rounded-lg hover:bg-[#EBF7E5]/50 transition-colors"
                  onClick={closeMobile}
                >
                  About Us
                </Link>

                {/* Education Accordion */}
                <div>
                  <button
                    className="flex items-center justify-between w-full text-navy text-base font-medium py-3 px-3 rounded-lg hover:bg-[#EBF7E5]/50 transition-colors"
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
                                className="flex items-center gap-3 text-navy/70 hover:text-[#5DB347] text-sm py-2.5 px-3 rounded-lg hover:bg-[#EBF7E5]/50 transition-colors"
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
                    className="flex items-center justify-between w-full text-navy text-base font-medium py-3 px-3 rounded-lg hover:bg-[#EBF7E5]/50 transition-colors"
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
                            className="flex items-center justify-between w-full text-navy/80 text-sm font-semibold py-2.5 px-3 rounded-lg hover:bg-[#EBF7E5]/50 transition-colors"
                            onClick={() =>
                              setMobileFinanceOpen(!mobileFinanceOpen)
                            }
                          >
                            <span className="flex items-center gap-2">
                              <Landmark className="w-4 h-4 text-[#5DB347]" />
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
                                      className="block text-navy/60 hover:text-[#5DB347] text-sm py-2 px-3 rounded-lg hover:bg-[#EBF7E5]/50 transition-colors"
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
                            className="flex items-center justify-between w-full text-navy/80 text-sm font-semibold py-2.5 px-3 rounded-lg hover:bg-[#EBF7E5]/50 transition-colors"
                            onClick={() =>
                              setMobileInsuranceOpen(!mobileInsuranceOpen)
                            }
                          >
                            <span className="flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4 text-[#5DB347]" />
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
                                      className="block text-navy/60 hover:text-[#5DB347] text-sm py-2 px-3 rounded-lg hover:bg-[#EBF7E5]/50 transition-colors"
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
                            className="flex items-center justify-between w-full text-navy/80 text-sm font-semibold py-2.5 px-3 rounded-lg hover:bg-[#EBF7E5]/50 transition-colors"
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
                                        className="flex items-center gap-3 text-navy/60 hover:text-[#5DB347] text-sm py-2 px-3 rounded-lg hover:bg-[#EBF7E5]/50 transition-colors"
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

                {/* Clean mobile nav */}
                <Link
                  href="/memberships"
                  className="text-navy hover:text-[#5DB347] text-base font-medium py-3 px-3 rounded-lg hover:bg-[#EBF7E5]/50 transition-colors"
                  onClick={closeMobile}
                >
                  Memberships
                </Link>
                <Link
                  href="/countries"
                  className="text-navy hover:text-[#5DB347] text-base font-medium py-3 px-3 rounded-lg hover:bg-[#EBF7E5]/50 transition-colors"
                  onClick={closeMobile}
                >
                  Countries
                </Link>
                <Link
                  href="/investors"
                  className="text-navy hover:text-[#5DB347] text-base font-medium py-3 px-3 rounded-lg hover:bg-[#EBF7E5]/50 transition-colors"
                  onClick={closeMobile}
                >
                  Investors
                </Link>

                {/* Community section */}
                <div className="pt-2 mt-2 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Community</p>
                  {communityLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-navy/80 hover:text-[#5DB347] text-sm font-medium py-2.5 px-3 rounded-lg hover:bg-[#EBF7E5]/50 transition-colors block"
                      onClick={closeMobile}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                <Link
                  href="/sponsor"
                  className="text-white font-semibold text-base py-3 px-3 rounded-lg transition-colors flex items-center gap-2"
                  style={{ background: '#5DB347' }}
                  onClick={closeMobile}
                >
                  <span>❤️</span>
                  Sponsor a Farmer
                </Link>

                {/* CTA Section */}
                <hr className="border-gray-200 my-4" />
                {!authLoading && user ? (
                  <>
                    <div className="flex items-center gap-3 px-3 py-2">
                      <div className="w-10 h-10 rounded-full bg-[#5DB347]/15 flex items-center justify-center text-[#5DB347] font-semibold">
                        {profile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-navy text-sm">{profile?.full_name || user.email}</p>
                        <p className="text-xs text-gray-400 capitalize">{profile?.role?.replace('_', ' ') || 'Member'}</p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 text-navy hover:text-[#5DB347] text-base font-medium py-3 px-3 rounded-lg hover:bg-[#EBF7E5]/50 transition-colors"
                      onClick={closeMobile}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 text-navy hover:text-[#5DB347] text-base font-medium py-3 px-3 rounded-lg hover:bg-[#EBF7E5]/50 transition-colors"
                        onClick={closeMobile}
                      >
                        <Settings className="w-4 h-4" />
                        Admin Portal
                      </Link>
                    )}
                    <button
                      onClick={() => { handleSignOut(); closeMobile(); }}
                      className="flex items-center gap-2 text-red-600 text-base font-medium py-3 px-3 rounded-lg hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-navy hover:text-[#5DB347] text-base font-medium py-3 px-3 rounded-lg hover:bg-[#EBF7E5]/50 transition-colors"
                      onClick={closeMobile}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/apply"
                      className="text-white px-4 py-3 rounded-lg text-base font-semibold text-center transition-colors"
                      style={{ background: '#5DB347' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#449933')}
                      onMouseLeave={e => (e.currentTarget.style.background = '#5DB347')}
                      onClick={closeMobile}
                    >
                      Become a Member
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
