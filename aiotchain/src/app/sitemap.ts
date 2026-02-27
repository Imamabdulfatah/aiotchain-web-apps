import { MetadataRoute } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://aiotchain.id/api";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://aiotchain.id"; // Fallback URL

interface Post {
  slug: string;
  updatedAt?: string;
  createdAt: string;
}

interface Asset {
  id: number;
  updatedAt?: string;
  createdAt: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static routes
  const staticRoutes = [
    '',
    '/blog',
    '/assets',
    '/community',
    '/contact',
    '/pricing',
    '/quiz',
    '/login',
    '/register',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // Dynamic routes for Blog Posts
  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const postsRes = await fetch(`${API_URL}/posts`, { next: { revalidate: 3600 } });
    if (postsRes.ok) {
      const posts: Post[] = await postsRes.json();
      postRoutes = posts.map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt || post.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error('Error fetching posts for sitemap:', error);
  }

  // Dynamic routes for Assets
  let assetRoutes: MetadataRoute.Sitemap = [];
  try {
    const assetsRes = await fetch(`${API_URL}/assets`, { next: { revalidate: 3600 } });
    if (assetsRes.ok) {
      const assets: Asset[] = await assetsRes.json();
      assetRoutes = assets.map((asset) => ({
        url: `${BASE_URL}/assets/${asset.id}`,
        lastModified: new Date(asset.updatedAt || asset.createdAt),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error('Error fetching assets for sitemap:', error);
  }

  return [...staticRoutes, ...postRoutes, ...assetRoutes];
}
