import { allPosts, Post } from "contentlayer/generated";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/portfolio/Navbar";

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
      <div className="min-h-screen bg-[#050508] text-white py-24 px-6">
        <article className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Torna al Blog
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
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

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {post.title}
          </h1>

          {post.author && (
            <p className="text-gray-400 text-lg">
              di <span className="text-white">{post.author}</span>
            </p>
          )}
        </header>

        {/* Content */}
        <div className="prose prose-invert prose-lg max-w-none
          prose-headings:text-white prose-headings:font-bold
          prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
          prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
          prose-p:text-gray-300 prose-p:leading-relaxed
          prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-white prose-strong:font-semibold
          prose-code:text-blue-400 prose-code:bg-gray-900 prose-code:px-2 prose-code:py-1 prose-code:rounded
          prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800 prose-pre:rounded-xl
          prose-ul:text-gray-300 prose-ol:text-gray-300
          prose-li:marker:text-blue-400
        "
          dangerouslySetInnerHTML={{ __html: post.body.html }}
        />


        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-800">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Leggi altri articoli
          </Link>
        </footer>
      </article>
    </div>
    </>
  );
}
