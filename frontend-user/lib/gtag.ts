export const GA_TRACKING_ID =
  process.env.NEXT_PUBLIC_GA_ID || 'G-FQ4WPJL3JQ';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

/**
 * Track pageview on route changes
 */
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

/**
 * Track standard or custom Google Analytics events
 */
export const event = (action: string, params: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', action, params);
  }
};

/**
 * Track view_item event when viewing product details
 */
export const trackViewItem = (data: {
  id: string;
  name: string;
  category?: string;
  price: number;
}) => {
  event('view_item', {
    currency: 'INR',
    value: data.price,
    items: [
      {
        item_id: data.id,
        item_name: data.name,
        item_category: data.category || 'Sweets',
        price: data.price,
        quantity: 1,
      },
    ],
  });
};

/**
 * Track add_to_cart event when adding items to shopping cart
 */
export const trackAddToCart = (data: {
  id: string;
  name: string;
  category?: string;
  price: number;
  quantity?: number;
}) => {
  const qty = data.quantity || 1;
  event('add_to_cart', {
    currency: 'INR',
    value: data.price * qty,
    items: [
      {
        item_id: data.id,
        item_name: data.name,
        item_category: data.category || 'Sweets',
        price: data.price,
        quantity: qty,
      },
    ],
  });
};

/**
 * Track begin_checkout event when a user proceeds to checkout
 */
export const trackBeginCheckout = (data: {
  items: Array<{ id: string; name?: string; price: number; quantity: number }>;
  totalAmount: number;
}) => {
  event('begin_checkout', {
    currency: 'INR',
    value: data.totalAmount,
    items: data.items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
  });
};

/**
 * Track purchase event when an order is successfully completed
 */
export const trackPurchase = (data: {
  orderId?: string;
  items: Array<{ id: string; name?: string; price: number; quantity: number }>;
  totalAmount: number;
}) => {
  event('purchase', {
    transaction_id: data.orderId,
    currency: 'INR',
    value: data.totalAmount,
    items: data.items.map((i) => ({
      item_id: i.id,
      item_name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
  });
};

/**
 * Track search queries
 */
export const trackSearch = (query: string) => {
  if (!query || !query.trim()) return;
  event('search', {
    search_term: query.trim(),
  });
};

/**
 * Track sign_up event on user registration
 */
export const trackSignUp = (method: string = 'Email') => {
  event('sign_up', {
    method,
  });
};
