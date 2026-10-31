export const FB_PIXEL_ID =
  process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || '1437745125225804';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

/**
 * Track generic PageView event
 */
export const pageview = () => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'PageView');
  }
};

/**
 * Track custom or standard Meta Pixel events
 */
export const event = (name: string, options: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', name, options);
  }
};

/**
 * Track ViewContent when a user views a product details page
 */
export const trackViewContent = (data: {
  id: string;
  name: string;
  category?: string;
  price: number;
}) => {
  event('ViewContent', {
    content_name: data.name,
    content_category: data.category || 'Sweets',
    content_ids: [data.id],
    content_type: 'product',
    value: data.price,
    currency: 'INR',
  });
};

/**
 * Track AddToCart when a user adds an item to their shopping cart
 */
export const trackAddToCart = (data: {
  id: string;
  name: string;
  category?: string;
  price: number;
  quantity?: number;
}) => {
  const qty = data.quantity || 1;
  event('AddToCart', {
    content_name: data.name,
    content_category: data.category || 'Sweets',
    content_ids: [data.id],
    content_type: 'product',
    value: data.price * qty,
    currency: 'INR',
  });
};

/**
 * Track InitiateCheckout when a user begins the checkout process
 */
export const trackInitiateCheckout = (data: {
  items: Array<{ id: string; name?: string; price: number; quantity: number }>;
  totalAmount: number;
}) => {
  event('InitiateCheckout', {
    content_ids: data.items.map((i) => i.id),
    contents: data.items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      item_price: i.price,
    })),
    num_items: data.items.reduce((sum, i) => sum + i.quantity, 0),
    value: data.totalAmount,
    currency: 'INR',
  });
};

/**
 * Track Purchase when an order is successfully verified and completed
 */
export const trackPurchase = (data: {
  orderId?: string;
  items: Array<{ id: string; name?: string; price: number; quantity: number }>;
  totalAmount: number;
}) => {
  event('Purchase', {
    content_type: 'product',
    content_ids: data.items.map((i) => i.id),
    contents: data.items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      item_price: i.price,
    })),
    num_items: data.items.reduce((sum, i) => sum + i.quantity, 0),
    value: data.totalAmount,
    currency: 'INR',
  });
};

/**
 * Track Search queries
 */
export const trackSearch = (query: string) => {
  if (!query || !query.trim()) return;
  event('Search', {
    search_string: query.trim(),
  });
};

/**
 * Track successful user registration
 */
export const trackCompleteRegistration = (method: string = 'Email') => {
  event('CompleteRegistration', {
    status: true,
    registration_method: method,
  });
};
