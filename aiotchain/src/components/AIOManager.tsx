"use client";

import { useEffect } from "react";

interface AIOProps {
  title: string;
  description: string;
  image?: string;
  url: string;
  type?: "article" | "website";
  author?: string;
  date?: string;
  category?: string;
}

export default function AIOManager({ 
  title, 
  description, 
  image, 
  url, 
  type = "article",
  author = "AIoT Chain",
  date,
  category
}: AIOProps) {
  useEffect(() => {
    // Update Document Title
    document.title = `${title} | AIoT Chain`;

    // Update Meta Tags
    const updateMeta = (name: string, content: string, property = false) => {
      let el = document.querySelector(property ? `meta[property='${name}']` : `meta[name='${name}']`);
      if (!el) {
        el = document.createElement('meta');
        if (property) el.setAttribute('property', name);
        else el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    updateMeta('description', description);
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:url', url, true);
    updateMeta('og:type', type, true);
    if (image) updateMeta('og:image', image, true);
    
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    if (image) updateMeta('twitter:image', image);

    // JSON-LD Structured Data
    const ldJson = {
      "@context": "https://schema.org",
      "@type": type === "article" ? "TechArticle" : "WebPage",
      "headline": title,
      "description": description,
      "image": image,
      "url": url,
      "author": {
        "@type": "Organization",
        "name": author
      },
      "publisher": {
        "@type": "Organization",
        "name": "AIoT Chain",
        "logo": {
          "@type": "ImageObject",
          "url": "https://aiotchain.id/logo.png"
        }
      },
      "datePublished": date,
      "articleSection": category
    };

    let script = document.querySelector('script[type="application/ld+json"]#aio-ld-json');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('id', 'aio-ld-json');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(ldJson);

    return () => {
      // Cleanup if needed, though usually title/meta should persist 
      // or be overwritten by next page's AIOManager
    };
  }, [title, description, image, url, type, author, date, category]);

  return null;
}
