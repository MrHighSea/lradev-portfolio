"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, Search, Filter } from "lucide-react";
import { allPosts, Post } from "contentlayer/generated";
import { compareDesc } from "date-fns";
import Navbar from "@/components/portfolio/Navbar";

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Ordina i post dal più recente al più vecchio
  const sortedPosts = useMemo(() => {
    return [...allPosts].sort((a, b) =>
      compareDesc(new Date(a.date), new Date(b.date))
    );
  }, []);

  // Estrai tutte le categorie uniche
  const categories = useMemo(() => {
    const cats = new Set(allPosts.map(post => post.category).filter(Boolean));
    return Array.from(cats);
  }, []);

  // Filtra i post
  const filteredPosts = useMemo(() => {
    return sortedPosts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [sortedPosts, searchQuery, selectedCategory]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#050508] text-white py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Blog <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Tecnico</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Articoli, tutorial e riflessioni su backend development, architetture software e AI.
            </p>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Cerca articoli per titolo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-12 pr-8 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer min-w-[200px]"
                >
                  <option value="all">Tutte le categorie</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-gray-500">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'articolo trovato' : 'articoli trovati'}
            </div>
          </div>

          {/* Blog Posts */}
          <div className="space-y-6">
            {filteredPosts.map((post: Post, index: number) => (
              <article
                key={post.slug}
                className="group relative bg-gradient-to-br from-gray-900/80 via-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1"
                style={{
                  animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500" />

                <Link href={`/blog/${post.slug}`}>
                  <div className="relative p-8 flex flex-col md:flex-row gap-6">
                    {/* Left side - Category badge and metadata */}
                    <div className="flex flex-col gap-4 md:w-48 shrink-0">
                      {post.category && (
                        <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-bold text-sm uppercase tracking-wider text-center shadow-lg">
                          {post.category}
                        </span>
                      )}
                      <div className="flex flex-col gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span className="font-medium">
                            {new Date(post.date).toLocaleDateString('it-IT', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Clock className="w-4 h-4 text-purple-400" />
                          <span className="font-medium">{post.readTime} di lettura</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Content */}
                    <div className="flex-1 flex flex-col gap-4">
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent group-hover:from-blue-400 group-hover:via-purple-400 group-hover:to-blue-400 transition-all duration-300">
                        {post.title}
                      </h2>

                      <p className="text-gray-300 text-lg leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center gap-3 text-blue-400 font-semibold group-hover:gap-4 transition-all mt-auto">
                        <span>Continua a leggere</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Decorative gradient line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </article>
            ))}
          </div>

          <style jsx>{`
            @keyframes fadeIn {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>

          {/* Empty State */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Nessun articolo trovato
              </h3>
              <p className="text-gray-500 text-lg">
                Prova a modificare i filtri di ricerca
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="mt-6 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
              >
                Resetta filtri
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
