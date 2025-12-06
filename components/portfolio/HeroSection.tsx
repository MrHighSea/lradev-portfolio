"use client";

import React from "react";
import { motion } from "framer-motion";
import { Terminal, ChevronDown } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col justify-center items-center relative px-6 overflow-hidden pt-24 md:pt-0">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center z-10 max-w-4xl"
      >
        {/* Terminal Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-8 shadow-2xl shadow-purple-500/25"
        >
          <Terminal className="w-10 h-10 text-white" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
        >
          Backend
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> Developer</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-xl md:text-2xl text-gray-200 mb-4 font-light"
        >
          Architetture IT · Python · PHP · AI Integrations
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-gray-300 text-lg max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Specializzato nella progettazione di architetture scalabili, 
          sviluppo di API robuste e integrazione di soluzioni AI avanzate.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <a
            href="#competenze"
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:-translate-y-1"
          >
            Scopri le Competenze
          </a>
          <a
            href="#contatti"
            className="px-8 py-4 border border-gray-700 text-gray-300 font-medium rounded-xl hover:border-gray-500 hover:bg-white/5 transition-all duration-300"
          >
            Contattami
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronDown className="w-6 h-6 text-gray-600" />
        </motion.div>
      </motion.div>
    </section>
  );
}