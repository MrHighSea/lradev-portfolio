"use client";

import React from "react";
import { motion } from "framer-motion";

const techCategories = [
  {
    title: "Linguaggi",
    items: [
      { name: "Python", level: 95 },
      { name: "PHP", level: 90 },
      { name: "SQL", level: 92 },
    ],
    color: "from-blue-500 to-cyan-400",
  },
  {
    title: "Framework Python",
    items: [
      { name: "Django", level: 90 },
      { name: "FastAPI", level: 95 },
      { name: "Flask", level: 88 },
    ],
    color: "from-green-500 to-emerald-400",
  },
  {
    title: "Framework PHP",
    items: [
      { name: "Laravel", level: 92 },
      { name: "CodeIgniter", level: 85 },
      { name: "Fat-Free", level: 80 },
    ],
    color: "from-purple-500 to-pink-400",
  },
  {
    title: "Database SQL",
    items: [
      { name: "PostgreSQL", level: 93 },
      { name: "MySQL", level: 90 },
      { name: "SQLite", level: 88 },
    ],
    color: "from-orange-500 to-amber-400",
  },
  {
    title: "Database NoSQL",
    items: [
      { name: "MongoDB", level: 88 },
    ],
    color: "from-emerald-500 to-teal-400",
  },
  {
    title: "Vector DB & AI",
    items: [
      { name: "ChromaDB", level: 85 },
      { name: "Qdrant", level: 85 },
      { name: "AI Integrations", level: 90 },
    ],
    color: "from-violet-500 to-purple-400",
  },
  {
    title: "DevOps & Architetture",
    items: [
      { name: "Docker", level: 88 },
      { name: "Onion Architecture", level: 85 },
      { name: "Layered Architecture", level: 88 },
      { name: "Hexagonal Architecture", level: 85 },
      { name: "Clean Architecture", level: 87 },
    ],
    color: "from-cyan-500 to-blue-400",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function TechStack() {
  return (
    <section id="competenze" className="py-16 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-20"
        >
          <span className="text-blue-400 text-sm font-medium tracking-widest uppercase mb-4 block">
            Tech Stack
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 md:mb-6">
            Competenze Tecniche
          </h2>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
            Anni di esperienza su tecnologie enterprise-grade per costruire 
            soluzioni robuste, scalabili e performanti.
          </p>
        </motion.div>

        {/* Mobile: Compact list view */}
        <div className="md:hidden space-y-4">
          {techCategories.map((category, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="bg-gray-900/50 border border-gray-800 rounded-xl p-4"
            >
              <h3 className={`text-sm font-semibold bg-gradient-to-r ${category.color} bg-clip-text text-transparent mb-3`}>
                {category.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {category.items.map((tech, techIdx) => (
                  <span 
                    key={techIdx}
                    className="px-3 py-1 bg-gray-800/80 text-gray-300 text-xs rounded-full"
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Desktop: Full card view */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {techCategories.map((category, idx) => (
            <motion.div
              key={idx}
              variants={item}
              className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all duration-500"
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`} />
              
              <h3 className={`text-lg font-semibold bg-gradient-to-r ${category.color} bg-clip-text text-transparent mb-6`}>
                {category.title}
              </h3>

              <div className="space-y-4">
                {category.items.map((tech, techIdx) => (
                  <div key={techIdx}>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300 text-sm font-medium">{tech.name}</span>
                      <span className="text-gray-500 text-xs">{tech.level}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${tech.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.2 + techIdx * 0.1, ease: "easeOut" }}
                        className={`h-full bg-gradient-to-r ${category.color} rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}