"use client";

import React from "react";
import HeroSection from "@/components/portfolio/HeroSection";
import TechStack from "@/components/portfolio/TechStack";
import SkillsSection from "@/components/portfolio/SkillStack";
import ContactSection from "@/components/portfolio/ContactSection";
import FloatingTags from "@/components/portfolio/FloatingTags";
import Navbar from "@/components/portfolio/Navbar";

export default function Home() {
  return (
    <>
      <style>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>
      <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Floating Tags */}
      <FloatingTags />

      {/* Subtle Grid Pattern */}
      <div
        className="fixed inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <HeroSection />
      <TechStack />
      <SkillsSection />
      <ContactSection />

      {/* Footer */}
      <footer className="py-8 text-center border-t border-gray-900">
        <p className="text-gray-600 text-sm">
          © {new Date().getFullYear()} · Backend Developer · Made with passion
        </p>
      </footer>
      </div>
    </>
  );
}
