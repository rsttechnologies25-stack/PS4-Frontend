import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/cart', '/checkout', '/orders/success', '/notifications', '/login', '/register'],
    },
    sitemap: 'https://perambursrinivasa.com/sitemap.xml',
  };
}
