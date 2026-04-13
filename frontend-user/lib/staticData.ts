/**
 * STATIC DATA FILE (CLEANED)
 * =================
 * This file no longer contains hardcoded data. 
 * All data is now fetched exclusively from the backend API.
 */

// Flag to toggle between static data and API fetching
// HARDCODED TO FALSE: Force all components to use API
export const USE_STATIC_DATA = false;

export interface Category {
    id: string;
    name: string;
    slug: string;
    image: string;
    parentId?: string;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    price: number;
    description: string;
    image: string;
    categoryId: string;
    isBestSeller: boolean;
    isNewLaunch: boolean;
    isSoldOut: boolean;
    category?: Category;
}

export interface Branch {
    id: string;
    name: string;
    address: string;
    city: string;
    phone: string;
    image: string;
    isHeadOffice: boolean;
}

// EMPTY ARRAYS: We only keep these to prevent immediate import errors
// while components are being refactored.
export const STATIC_CATEGORIES: Category[] = [];
export const STATIC_PRODUCTS: Product[] = [];
export const STATIC_BRANCHES: Branch[] = [];

// Helper functions now return null or empty to force API path
export function getProductsWithCategory(): (Product & { category: Category })[] {
    return [];
}

export function getProductBySlug(slug: string): (Product & { category: Category }) | undefined {
    return undefined;
}

export function getProductsByCategory(categorySlug: string): Product[] {
    return [];
}

export function getCategoryBySlug(slug: string): Category | undefined {
    return undefined;
}

export function getBestSellers(): Product[] {
    return [];
}

export function getNewLaunches(): Product[] {
    return [];
}

export function getSubCategories(parentSlug: string): Category[] {
    return [];
}
