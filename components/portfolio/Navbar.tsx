"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Competenze", href: "/#competenze" },
  { label: "Expertise", href: "/#expertise" },
  { label: "Blog", href: "/blog" },
  { label: "Contatti", href: "/#contatti" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Only track active section on homepage
      if (pathname === "/") {
        const sections = ["#", "#competenze", "#expertise", "#contatti"];
        const sectionElements = sections.map(id =>
          id === "#" ? document.body : document.querySelector(id)
        );

        const scrollPosition = window.scrollY + window.innerHeight / 3;

        for (let i = sectionElements.length - 1; i >= 0; i--) {
          const element = sectionElements[i];
          if (element && element instanceof HTMLElement) {
            const offsetTop = i === 0 ? 0 : element.offsetTop;
            if (scrollPosition >= offsetTop) {
              setActiveSection(sections[i]);
              break;
            }
          }
        }
      }
    };
    handleScroll(); // Check initial scroll position
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-[#050508] border-b border-gray-800/50 py-4" 
          : "bg-transparent py-6"
      }`}
      style={isScrolled ? { backgroundColor: '#050508' } : {}}
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="relative group">
          <img
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69316f33cd5a52e9f13d0634/9598d8f05_AdobeExpress-file.png"
            alt="LRA Logo"
            className="h-10 w-auto invert"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, idx) => {
            const isActive = pathname === link.href || (pathname === "/" && activeSection === link.href.replace("/", ""));
            const linkContent = (
              <>
                {link.label}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ${
                  isActive ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </>
            );

            return (
              <Link
                key={idx}
                href={link.href}
                className={`transition-colors duration-200 text-sm font-medium relative group ${
                  isActive ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {linkContent}
              </Link>
            );
          })}
          <Link
            href="/#contatti"
            className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:-translate-y-0.5"
          >
            Collabora
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu - Fullscreen */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="md:hidden fixed inset-0 top-0 left-0 right-0 bottom-0 bg-[#050508] z-40 flex flex-col"
        >
          <div className="flex items-center justify-between px-6 py-6 border-b border-gray-800/50">
            <Link href="/">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69316f33cd5a52e9f13d0634/9598d8f05_AdobeExpress-file.png"
                alt="LRA Logo"
                className="h-10 w-auto invert"
              />
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 flex flex-col justify-center px-8 space-y-6">
            {navLinks.map((link, idx) => {
              const isActive = pathname === link.href || (pathname === "/" && activeSection === link.href.replace("/", ""));

              return (
                <Link
                  key={idx}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-3xl font-semibold py-3 border-b border-gray-800/50 ${
                    isActive ? 'text-white bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent' : 'text-white'
                  }`}
                >
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    {link.label}
                  </motion.div>
                </Link>
              );
            })}
            <Link
              href="/#contatti"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full text-center px-5 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl mt-8 text-lg"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Collabora
              </motion.div>
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}