import { allPosts, Post } from "contentlayer/generated";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/portfolio/Navbar";
import "../blog.css";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return allPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = allPosts.find((post: Post) => post.slug === slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = allPosts.find((post: Post) => post.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-[#050508] via-gray-900 to-[#050508] border-b border-gray-800 pt-24">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 via-purple-500/5 to-transparent" />

        <div className="relative max-w-5xl mx-auto px-6 py-12">
          {/* Back Button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Torna al Blog</span>
          </Link>

          {/* Category Badge */}
          {post.category && (
            <div className="mb-6">
              <span className="inline-block px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full font-bold text-sm uppercase tracking-wider shadow-lg shadow-blue-500/30">
                {post.category}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
              {post.title}
            </span>
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-8">
            {post.author && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <div className="text-sm text-gray-500">Scritto da</div>
                  <div className="text-white font-semibold">{post.author}</div>
                </div>
              </div>
            )}

            <div className="h-8 w-px bg-gray-700" />

            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-sm text-gray-500">Pubblicato il</div>
                <div className="text-white font-medium">
                  {new Date(post.date).toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>

            <div className="h-8 w-px bg-gray-700" />

            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-sm text-gray-500">Tempo di lettura</div>
                <div className="text-white font-medium">{post.readTime}</div>
              </div>
            </div>
          </div>

          {/* Excerpt */}
          <p className="text-xl text-gray-300 leading-relaxed max-w-3xl border-l-4 border-blue-500 pl-6 py-2">
            {post.excerpt}
          </p>
        </div>
      </div>

      {/* Article Content */}
      <div className="min-h-screen bg-[#050508] text-white py-16 px-6">
        <article className="max-w-4xl mx-auto">

        {/* Content */}
        <div className="prose prose-invert prose-xl max-w-none
          prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
          prose-h1:text-5xl prose-h1:mt-16 prose-h1:mb-8 prose-h1:leading-tight
          prose-h2:text-4xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:border-b-2 prose-h2:border-blue-500/30 prose-h2:pb-4 prose-h2:leading-tight
          prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-6 prose-h3:text-blue-400 prose-h3:leading-snug
          prose-h4:text-xl prose-h4:mt-10 prose-h4:mb-4 prose-h4:text-gray-200 prose-h4:leading-snug
          prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-lg
          prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-a:transition-colors
          prose-strong:text-white prose-strong:font-bold
          prose-code:text-emerald-400 prose-code:bg-gray-800/50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-base prose-code:font-mono prose-code:border prose-code:border-gray-700
          prose-pre:bg-gradient-to-br prose-pre:from-gray-900 prose-pre:to-gray-800 prose-pre:border prose-pre:border-gray-700 prose-pre:rounded-xl prose-pre:p-6 prose-pre:overflow-x-auto prose-pre:my-8
          prose-pre:shadow-2xl prose-pre:shadow-black/50
          prose-ul:text-gray-300 prose-ul:my-6 prose-ul:space-y-3 prose-ul:text-lg
          prose-ol:text-gray-300 prose-ol:my-6 prose-ol:space-y-3 prose-ol:text-lg
          prose-li:text-gray-300 prose-li:leading-relaxed
          prose-li:marker:text-blue-400
          prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:italic prose-blockquote:text-gray-400 prose-blockquote:my-8
          prose-hr:border-gray-700 prose-hr:my-12
          [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-gray-100 [&_pre_code]:text-base [&_pre_code]:border-0
        "
          dangerouslySetInnerHTML={{ __html: post.body.html }}
        />


        {/* Footer */}
        <footer className="mt-24">
          {/* Decorative separator */}
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
            <div className="text-gray-500 text-sm font-medium">Fine dell'articolo</div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
          </div>

          {/* Author card */}
          {post.author && (
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/50 border border-gray-700/50 rounded-2xl p-8 mb-12">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-3xl shadow-xl shrink-0">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Scritto da {post.author}</h3>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    Backend Developer specializzato in Python, PHP e AI. Appassionato di architetture software scalabili e best practices.
                  </p>
                  <Link
                    href="/#contatti"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    Contattami
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Back to blog */}
          <div className="text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
            >
              <ArrowLeft className="w-5 h-5" />
              Torna agli articoli
            </Link>
          </div>
        </footer>
      </article>
    </div>
    </>
  );
}
