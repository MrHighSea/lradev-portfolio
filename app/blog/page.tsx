import React from "react";
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { allPosts, Post } from "contentlayer/generated";
import { compareDesc } from "date-fns";
import Navbar from "@/components/portfolio/Navbar";

export default function BlogPage() {
  const posts = allPosts.sort((a, b) =>
    compareDesc(new Date(a.date), new Date(b.date))
  );
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#050508] text-white py-24 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Blog <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Tecnico</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Articoli, tutorial e riflessioni su backend development, architetture software e AI.
          </p>
        </div>

        {/* Blog Posts */}
        <div className="space-y-8">
          {posts.map((post: Post) => (
            <article
              key={post.slug}
              className="group bg-gray-900/50 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all duration-300"
            >
              <Link href={`/blog/${post.slug}`}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {post.category && (
                      <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full">
                        {post.category}
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.date).toLocaleDateString('it-IT')}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h2>

                  <p className="text-gray-400 line-clamp-2">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center gap-2 text-blue-400 group-hover:gap-3 transition-all">
                    Leggi articolo
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              Nessun articolo pubblicato ancora. Torna presto!
            </p>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
