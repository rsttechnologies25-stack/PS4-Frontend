import { MetadataRoute } from 'next';
import { API_URL } from "@/lib/api";
import { STATIC_CATEGORIES, STATIC_PRODUCTS, USE_STATIC_DATA } from "@/lib/staticData";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://perambursrinivasa.com";

  // Static routes
  const staticRoutes = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/branches`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/shipping`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  // Categories
  let categories = STATIC_CATEGORIES;
  if (!USE_STATIC_DATA) {
    try {
      const res = await fetch(`${API_URL}/categories`);
      if (res.ok) {
        categories = await res.json();
      }
    } catch (e) {
      console.error("Error fetching categories for sitemap:", e);
    }
  }

  const categoryRoutes = categories.map(cat => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: ['ghee-sweets', 'cashew-sweets', 'mixture', 'gifting'].includes(cat.slug) ? 0.9 : 0.7,
  }));

  // Products
  let products = STATIC_PRODUCTS;
  if (!USE_STATIC_DATA) {
    try {
      // Limit to 500 products to stay within sitemap size limits per file (though 50k is the actual limit)
      const res = await fetch(`${API_URL}/products?limit=500`);
      if (res.ok) {
        const data = await res.json();
        products = Array.isArray(data) ? data : (data.data || []);
      }
    } catch (e) {
      console.error("Error fetching products for sitemap:", e);
    }
  }

  const productRoutes = products.map(prod => ({
    url: `${baseUrl}/product/${prod.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: prod.isBestSeller ? 0.8 : 0.6,
  }));

  // Combine and cast
  const allRoutes = [...staticRoutes, ...categoryRoutes, ...productRoutes] as MetadataRoute.Sitemap;
  
  return allRoutes;
}
