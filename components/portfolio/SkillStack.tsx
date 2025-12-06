"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Server, 
  Database, 
  Brain, 
  Layers, 
  Zap, 
  Shield 
} from "lucide-react";

const skills = [
  {
    icon: Server,
    title: "Architetture IT",
    description: "Progettazione di sistemi distribuiti, microservizi e architetture scalabili per applicazioni enterprise.",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    icon: Layers,
    title: "API Development",
    description: "RESTful API, GraphQL, WebSocket. Design pattern avanzati e documentazione OpenAPI.",
    gradient: "from-purple-500 to-pink-400",
  },
  {
    icon: Database,
    title: "Database Design",
    description: "Modellazione dati, ottimizzazione query, gestione di database relazionali e NoSQL.",
    gradient: "from-orange-500 to-amber-400",
  },
  {
    icon: Brain,
    title: "AI & Machine Learning",
    description: "Integrazione LLM, RAG systems, vector databases e soluzioni AI custom.",
    gradient: "from-green-500 to-emerald-400",
  },
  {
    icon: Zap,
    title: "Performance",
    description: "Caching strategies, async processing, code optimization e monitoring.",
    gradient: "from-yellow-500 to-orange-400",
  },
  {
    icon: Shield,
    title: "Security",
    description: "Authentication, authorization, encryption e best practices di sicurezza.",
    gradient: "from-red-500 to-pink-400",
  },
];

export default function SkillsSection() {
  return (
    <section id="expertise" className="py-32 px-6 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent" />
      
      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-purple-400 text-sm font-medium tracking-widest uppercase mb-4 block">
            Expertise
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Aree di Specializzazione
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Competenze trasversali per gestire progetti complessi 
            dall'ideazione alla produzione.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skills.map((skill, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative"
            >
              <div className="relative bg-gray-900/30 backdrop-blur-sm border border-gray-800/50 rounded-3xl p-8 h-full hover:border-gray-700/50 transition-all duration-500 overflow-hidden">
                {/* Hover Glow */}
                <div className={`absolute -inset-px bg-gradient-to-r ${skill.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`} />
                
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${skill.gradient} mb-6 shadow-lg`}>
                  <skill.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-semibold text-white mb-3">
                  {skill.title}
                </h3>

                <p className="text-gray-400 leading-relaxed">
                  {skill.description}
                </p>

                {/* Corner Accent */}
                <div className={`absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl ${skill.gradient} opacity-5 rounded-tl-full`} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}