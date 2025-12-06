"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const tags = [
  { name: "Python", color: "from-yellow-400 to-blue-500", x: "10%", y: "15%" },
  { name: "PHP", color: "from-indigo-400 to-purple-600", x: "85%", y: "20%" },
  { name: "Laravel", color: "from-red-500 to-orange-500", x: "75%", y: "70%" },
  { name: "CodeIgniter", color: "from-orange-500 to-red-600", x: "15%", y: "75%" },
  { name: "Fat-Free", color: "from-rose-400 to-red-500", x: "92%", y: "75%" },
  { name: "Django", color: "from-green-600 to-emerald-500", x: "5%", y: "45%" },
  { name: "FastAPI", color: "from-teal-400 to-cyan-500", x: "90%", y: "45%" },
  { name: "Flask", color: "from-gray-400 to-gray-600", x: "20%", y: "30%" },
  { name: "PostgreSQL", color: "from-blue-500 to-indigo-600", x: "80%", y: "35%" },
  { name: "MySQL", color: "from-orange-400 to-blue-500", x: "70%", y: "85%" },
  { name: "SQLite", color: "from-blue-400 to-cyan-400", x: "25%", y: "88%" },
  { name: "MongoDB", color: "from-green-500 to-lime-400", x: "8%", y: "60%" },
  { name: "ChromaDB", color: "from-amber-400 to-orange-500", x: "88%", y: "60%" },
  { name: "Qdrant", color: "from-purple-500 to-pink-500", x: "50%", y: "8%" },
  { name: "Docker", color: "from-blue-400 to-cyan-500", x: "35%", y: "12%" },
  { name: "Onion", color: "from-fuchsia-400 to-purple-500", x: "3%", y: "85%" },
  { name: "Layered", color: "from-emerald-400 to-green-500", x: "60%", y: "92%" },
  { name: "Hexagonal", color: "from-amber-400 to-yellow-500", x: "45%", y: "95%" },
  { name: "Clean Arch", color: "from-sky-400 to-blue-500", x: "30%", y: "5%" },
];

// Alternative positions when scrolled - redistributed across the screen
const scrolledPositions = [
  { x: "15%", y: "20%" },
  { x: "45%", y: "15%" },
  { x: "75%", y: "22%" },
  { x: "30%", y: "35%" },
  { x: "60%", y: "30%" },
  { x: "85%", y: "40%" },
  { x: "10%", y: "50%" },
  { x: "40%", y: "45%" },
  { x: "70%", y: "55%" },
  { x: "25%", y: "65%" },
  { x: "55%", y: "60%" },
  { x: "80%", y: "70%" },
  { x: "20%", y: "80%" },
  { x: "50%", y: "75%" },
  { x: "35%", y: "88%" },
  { x: "65%", y: "85%" },
  { x: "8%", y: "35%" },
  { x: "92%", y: "25%" },
  { x: "48%", y: "50%" },
];

export default function FloatingTags() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      const progress = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 hidden md:block">
      {tags.map((tag, idx) => {
        const startX = parseFloat(tag.x);
        const startY = parseFloat(tag.y);
        const endX = parseFloat(scrolledPositions[idx]?.x || tag.x);
        const endY = parseFloat(scrolledPositions[idx]?.y || tag.y);
        
        const currentX = startX + (endX - startX) * scrollProgress;
        const currentY = startY + (endY - startY) * scrollProgress;
        const currentOpacity = 0.5 - (scrollProgress * 0.25);
        const currentBlur = scrollProgress * 2;
        
        return (
          <motion.div
            key={tag.name}
            className="absolute"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: currentOpacity,
              scale: 1,
              y: [0, -15, 0],
              x: [0, idx % 2 === 0 ? 10 : -10, 0],
            }}
            transition={{
              y: {
                duration: 4 + idx * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: idx * 0.2,
              },
              x: {
                duration: 5 + idx * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: idx * 0.3,
              },
              scale: {
                duration: 0.5,
                delay: idx * 0.1,
              },
            }}
            style={{ 
              left: `${currentX}%`, 
              top: `${currentY}%`,
            }}
          >
            <div 
              className={`
                px-4 py-2 rounded-full 
                bg-gradient-to-r ${tag.color} 
                text-white text-sm font-medium
                shadow-lg
                border border-white/10
              `}
              style={{
                boxShadow: `0 0 20px rgba(255,255,255,0.1)`,
                filter: `blur(${currentBlur}px)`,
              }}
            >
              {tag.name}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}