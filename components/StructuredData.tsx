/**
 * Structured Data (JSON-LD) for SEO
 * Helps Google understand the site content
 */

export function WebsiteStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Luca Altimare - Backend Developer",
    "url": "https://lradev.app",
    "description": "Backend Developer specializzato in architetture IT, Python, PHP e AI Integrations",
    "author": {
      "@type": "Person",
      "name": "Luca Altimare",
      "jobTitle": "Backend Developer",
      "url": "https://lradev.app",
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://lradev.app/blog?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function PersonStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Luca Altimare",
    "url": "https://lradev.app",
    "image": "https://lradev.app/icon.png",
    "jobTitle": "Backend Developer",
    "worksFor": {
      "@type": "Organization",
      "name": "Freelance"
    },
    "sameAs": [
      "https://github.com/MrHighSea",
      "https://linkedin.com/in/luca-altimare" // Aggiorna con il tuo profilo LinkedIn reale
    ],
    "knowsAbout": [
      "Python",
      "PHP",
      "Django",
      "FastAPI",
      "Laravel",
      "Clean Architecture",
      "Hexagonal Architecture",
      "AI Integration",
      "Backend Development"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export function BlogStructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Luca Altimare Blog",
    "description": "Articoli tecnici su Backend Development, Python, Django, FastAPI, Clean Architecture e design patterns",
    "url": "https://lradev.app/blog",
    "author": {
      "@type": "Person",
      "name": "Luca Altimare"
    },
    "publisher": {
      "@type": "Person",
      "name": "Luca Altimare",
      "logo": {
        "@type": "ImageObject",
        "url": "https://lradev.app/icon.png"
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

interface ArticleStructuredDataProps {
  title: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  slug: string;
  category: string;
  author: string;
}

export function ArticleStructuredData({
  title,
  description,
  datePublished,
  dateModified,
  slug,
  category,
  author
}: ArticleStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": title,
    "description": description,
    "image": "https://lradev.app/icon.png",
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "author": {
      "@type": "Person",
      "name": author,
      "url": "https://lradev.app"
    },
    "publisher": {
      "@type": "Person",
      "name": "Luca Altimare",
      "logo": {
        "@type": "ImageObject",
        "url": "https://lradev.app/icon.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://lradev.app/blog/${slug}`
    },
    "articleSection": category,
    "inLanguage": "it-IT"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
