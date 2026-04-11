/**
 * STATIC DATA FILE
 * =================
 * This file contains hardcoded data for static deployment (e.g., Cloudflare).
 * 
 * TO REMOVE: Delete this file and update components to fetch from API instead.
 * Components using this file:
 * - components/home/CollectionsGrid.tsx
 * - components/home/ExploreSection.tsx
 * - app/category/[slug]/page.tsx
 * - app/product/[slug]/page.tsx
 * - app/branches/page.tsx
 * - app/shop/page.tsx
 */

// Flag to toggle between static data and API fetching
// Set to false to use API, true to use static data
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

// Categories
export const STATIC_CATEGORIES: Category[] = [
    // Parent Categories
    { id: 'cat-sweets', name: "Sweets", slug: "sweets", image: "/hero_motichoor_laddu.jpg" },
    { id: 'cat-savouries', name: "Savouries", slug: "savouries", image: "https://perambursrinivasa.com/cdn/shop/files/ANDHRA_MURUKKU.jpg?v=1753018411" },
    { id: 'cat-sev', name: "Sev", slug: "sev", image: "https://perambursrinivasa.com/cdn/shop/files/MINI_KARA_SEV.jpg?v=1753017794" },
    { id: 'cat-pickle', name: "Pickle", slug: "pickle", image: "https://perambursrinivasa.com/cdn/shop/files/image6.webp?v=1746161359" },
    { id: 'cat-podi', name: "Podi", slug: "podi", image: "https://perambursrinivasa.com/cdn/shop/files/IDLY_PODI_34e04bc4-aee0-42a9-949a-2bd13815a4f1.jpg?v=1753016470" },
    { id: 'cat-cookies', name: "Cookies", slug: "cookies", image: "https://perambursrinivasa.com/cdn/shop/files/KESAR_BADAM_COOKIES.jpg?v=1753017309" },
    { id: 'cat-gifting', name: "Gifting", slug: "gifting", image: "https://perambursrinivasa.com/cdn/shop/files/KESAR_BADAM_COOKIES.jpg?v=1753017309" },
    { id: 'cat-catering', name: "Outdoor Catering", slug: "outdoor-catering", image: "https://perambursrinivasa.com/cdn/shop/files/KESAR_BADAM_COOKIES.jpg?v=1753017309" },

    // Sub Categories
    { id: 'cat-milk-sweets', name: "Milk Sweets", slug: "milk-sweets", parentId: 'cat-sweets', image: "https://perambursrinivasa.com/cdn/shop/files/SPL_MILK_CAKE.jpg?v=1753341841" },
    { id: 'cat-ghee-sweets', name: "Ghee Sweets", slug: "ghee-sweets", parentId: 'cat-sweets', image: "/hero_motichoor_laddu.jpg" },
    { id: 'cat-cashew-sweets', name: "Cashew Sweets", slug: "cashew-sweets", parentId: 'cat-sweets', image: "https://perambursrinivasa.com/cdn/shop/files/KAJU_KATLI.jpg?v=1753000606" },
    { id: 'cat-thokku', name: "Thokku", slug: "thokku", parentId: 'cat-pickle', image: "https://perambursrinivasa.com/cdn/shop/files/image6.webp?v=1746161359" },
];

// Products
export const STATIC_PRODUCTS: Product[] = [
    // Sweets
    { id: 'prod-1', name: 'Motichur Laddu', slug: 'motichur-laddu', price: 200, description: 'Authentic Taste, Handcrafted, No Maida, No Added Colors', image: '/hero_motichoor_laddu.jpg', categoryId: 'cat-ghee-sweets', isBestSeller: true, isNewLaunch: false, isSoldOut: false },
    { id: 'prod-2', name: 'Srinivasa Laddu Small', slug: 'srinivasa-laddu-small', price: 205, description: 'Authentic Taste, Handcrafted, No Maida, No Added Colors', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/SRINIVASA_LADDU-170_3.webp?v=1748349101', categoryId: 'cat-ghee-sweets', isBestSeller: true, isNewLaunch: false, isSoldOut: false },
    { id: 'prod-4', name: 'Kesar Kaju Katli', slug: 'kesar-kaju-katli', price: 360, description: 'Saffron-infused version of the kaju katli.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/kk2.webp?v=1745989914', categoryId: 'cat-cashew-sweets', isBestSeller: true, isNewLaunch: false, isSoldOut: false },
    { id: 'prod-5', name: 'Special Milk Cake', slug: 'special-milk-cake', price: 200, description: 'Dense milk sweet with caramelized edges.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/SPL_MILK_CAKE.jpg?v=1753341841', categoryId: 'cat-milk-sweets', isBestSeller: false, isNewLaunch: false, isSoldOut: false },
    { id: 'prod-11', name: 'Kaju Katli', slug: 'kaju-katli', price: 310, description: 'Classic cashew fudge.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/KAJU_KATLI.jpg?v=1753000606', categoryId: 'cat-cashew-sweets', isBestSeller: true, isNewLaunch: false, isSoldOut: false },
    { id: 'prod-12', name: 'Karuppatti Mysore Pak', slug: 'karuppatti-mysore-pak', price: 230, description: 'Mysore Pak sweetened with palm jaggery for earthy flavor.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/KARUPATTI_MYSOREPAK.jpg?v=1753341712', categoryId: 'cat-ghee-sweets', isBestSeller: false, isNewLaunch: false, isSoldOut: false },
    { id: 'prod-14', name: 'Rassgulla Bowl', slug: 'rassgulla-bowl', price: 180, description: 'Soft and spongy cottage cheese balls in sugar syrup.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/rag.webp?v=1745992713', categoryId: 'cat-milk-sweets', isBestSeller: false, isNewLaunch: false, isSoldOut: false },
    { id: 'prod-15', name: 'Gulab Jamun Bowl', slug: 'gulab-jamun-bowl', price: 180, description: 'Classic deep-fried milk solids in sugar syrup.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/image34.webp?v=1753339502', categoryId: 'cat-milk-sweets', isBestSeller: false, isNewLaunch: false, isSoldOut: false },

    // Sev
    { id: 'prod-16', name: 'Special Kara Sev', slug: 'special-kara-sev', price: 138, description: 'Special spicy sev variety.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/MINI_KARA_SEV.jpg?v=1753017794', categoryId: 'cat-sev', isBestSeller: false, isNewLaunch: true, isSoldOut: false },

    // Thokku
    { id: 'prod-27', name: 'Pirandai Thokku', slug: 'pirandai-thokku', price: 180, description: 'Made from edible Cissus quadrangularis.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/image6.webp?v=1746161359', categoryId: 'cat-thokku', isBestSeller: false, isNewLaunch: false, isSoldOut: false },
];

// Branches
export const STATIC_BRANCHES: Branch[] = [
    { id: 'branch-1', name: "Tirupathi", address: "No: 20-5-1, Thirumala Bypass Road, Thirupathi Town, Chitoor, AP-517501", city: "Tirupati", phone: "+91 7823999799 / 899", image: "https://perambursrinivasa.com/cdn/shop/files/Tirupathi_01_600x.webp?v=1747809328", isHeadOffice: false },
    { id: 'branch-2', name: "Tirupathi - II", address: "No: 29/1, 29/2, 29/3/254/2, Tiruchanoor Road, Tirupati, AP-517502", city: "Tirupati", phone: "+91 7823 999 599 / 699", image: "https://perambursrinivasa.com/cdn/shop/files/Tirupathi_02_600x.webp?v=1747809328", isHeadOffice: false },
    { id: 'branch-3', name: "Perambur (RS Opp)", address: "No: 23/16, Perambur High Road, Perambur, Chennai-600011", city: "Chennai", phone: "+91 7823999930 / 931", image: "https://perambursrinivasa.com/cdn/shop/files/PERAMBUR_600x.jpg?v=1767788916", isHeadOffice: true },
    { id: 'branch-4', name: "Perambur Market", address: "No: 132, M H Road, Perambur, Chennai-600011", city: "Chennai", phone: "+91 7823999932", image: "https://perambursrinivasa.com/cdn/shop/files/MARKET_600x.jpg?v=1767788917", isHeadOffice: false },
    { id: 'branch-5', name: "Venus (Perambur)", address: "No: 38, Paper Mills Road, Chennai-600011", city: "Chennai", phone: "+91 7823999933", image: "https://perambursrinivasa.com/cdn/shop/files/Perambur_01_600x.webp?v=1747809328", isHeadOffice: false },
    { id: 'branch-6', name: "Ayanavaram", address: "No: 200, KH Road Aynavaram, Chennai-600023", city: "Chennai", phone: "+91 7823999935", image: "https://perambursrinivasa.com/cdn/shop/files/07_Aynavaram_600x.webp?v=1747826010", isHeadOffice: false },
    { id: 'branch-7', name: "Kolathur", address: "1 & 2, 1ST, Anjugam Nagar Main Road, Kolathur, Chennai-600099", city: "Chennai", phone: "+91 7823999936", image: "https://perambursrinivasa.com/cdn/shop/files/KOLATHUR_9ff3245e-b9c6-432b-bdd4-aec1a65280bf_600x.jpg?v=1767788917", isHeadOffice: false },
    { id: 'branch-8', name: "Moolakadai", address: "No: 30, M H Road, Moolakadai, Chennai-600060", city: "Chennai", phone: "+91 7823999937", image: "https://perambursrinivasa.com/cdn/shop/files/MOOL_600x.jpg?v=1767788919", isHeadOffice: false },
    { id: 'branch-9', name: "Redhills", address: "No: 265, G.N.T. Road, Redhills, Chennai-600052", city: "Chennai", phone: "+91 7823999938", image: "https://perambursrinivasa.com/cdn/shop/files/REDHILLS_8347a857-5242-4575-ac86-465d0b258e2a_600x.jpg?v=1767788919", isHeadOffice: false },
    { id: 'branch-10', name: "Padi", address: "No: 100, M.T.H Road Padi, Chennai-600050", city: "Chennai", phone: "+91 7823999939", image: "https://perambursrinivasa.com/cdn/shop/files/PADI_600x.jpg?v=1767788916", isHeadOffice: false },
    { id: 'branch-11', name: "Ambathur", address: "No: 453/1, CTH Road Ambatur O.T, Chennai-600053", city: "Chennai", phone: "+91 7823999940", image: "https://perambursrinivasa.com/cdn/shop/files/12_Ambathur_600x.webp?v=1747826010", isHeadOffice: false },
    { id: 'branch-12', name: "Thiru.vi.ka.nagar", address: "No: 59, S.R.P. Kol Street, T.V.K. nagar, Perambur, Chennai-600011", city: "Chennai", phone: "+91 7823999941", image: "https://perambursrinivasa.com/cdn/shop/files/13_T.V.K._NAGAR_600x.webp?v=1747826010", isHeadOffice: false },
    { id: 'branch-13', name: "Bharathi Road", address: "No: 8, Bharathi Road, Perambur, Chennai-600011", city: "Chennai", phone: "+91 7823999942", image: "https://perambursrinivasa.com/cdn/shop/files/14_Bharathi_Road_600x.webp?v=1747826010", isHeadOffice: false },
    { id: 'branch-14', name: "Thiruvallur", address: "No: 4/3A, C.V. Naidu Salai, National Highways, Tiruvallur-602003", city: "Tiruvallur", phone: "+91 7823999943", image: "https://perambursrinivasa.com/cdn/shop/files/TRL_MAIN_600x.jpg?v=1767788918", isHeadOffice: false },
    { id: 'branch-15', name: "Aminjikarai", address: "No: 493, P.H. Road, Aminjikarai, Chennai-600029", city: "Chennai", phone: "+91 7823999944", image: "https://perambursrinivasa.com/cdn/shop/files/16_Aminjikarai_600x.webp?v=1747826010", isHeadOffice: false },
    { id: 'branch-16', name: "Mathur (MMDA)", address: "No: 132, Kamarajar Salai, Mathur MMDA, Chennai-600068", city: "Chennai", phone: "+91 7823999945", image: "https://perambursrinivasa.com/cdn/shop/files/MATHUR_600x.png?v=1767789273", isHeadOffice: false },
    { id: 'branch-17', name: "Nelson Manickam Rd", address: "No: 130, Nelson Manickam Road, Aminjikarai, Chennai-600 029", city: "Chennai", phone: "+91 7823999946", image: "https://perambursrinivasa.com/cdn/shop/files/18_NMR_600x.webp?v=1747826010", isHeadOffice: false },
    { id: 'branch-18', name: "Periyar Nagar", address: "No: 106, Siva Elango Salai, Periyar Nagar, Chennai-600 082", city: "Chennai", phone: "+91 7823999947 / 956", image: "https://perambursrinivasa.com/cdn/shop/files/19_Periya_Nagar_600x.webp?v=1747826010", isHeadOffice: false },
    { id: 'branch-19', name: "Tiruvallur (Silks)", address: "No: 65A, C.V. Naidu Salai, Chennai Silks Campus, Thiruvallur-602001", city: "Tiruvallur", phone: "+91 7823999948 / 958", image: "https://perambursrinivasa.com/cdn/shop/files/15_Tiruvallur_600x.webp?v=1747826010", isHeadOffice: false },
    { id: 'branch-20', name: "Valasarawakkam", address: "No: 3, Arcot Road, Valasaravakkam, Chennai-600087", city: "Chennai", phone: "+91 7823999950", image: "https://perambursrinivasa.com/cdn/shop/files/Perambur_01_600x.webp?v=1747809328", isHeadOffice: false },
    { id: 'branch-21', name: "Thiruninravur", address: "Plot no: 20, survey no:224/1, C.T.H road, Thiruninravur-602024", city: "Thiruninravur", phone: "+91 7823999951 / 961", image: "https://perambursrinivasa.com/cdn/shop/files/22_Thiruninravur_600x.webp?v=1747826010", isHeadOffice: false },
    { id: 'branch-22', name: "Arumbakkam (MMDA)", address: "No: 249/6, P-block, MMDA Colony, Arumbakkam-600106", city: "Chennai", phone: "+91 7823999952", image: "https://perambursrinivasa.com/cdn/shop/files/23_Arumbakkam_600x.webp?v=1747826010", isHeadOffice: false },
    { id: 'branch-23', name: "Tirumangalam", address: "No: 1, Mogappair Road, Tirumangalam, Chennai-600101", city: "Chennai", phone: "+91 7823999953", image: "https://perambursrinivasa.com/cdn/shop/files/24_Tirumangalam_600x.webp?v=1747826010", isHeadOffice: false },
    { id: 'branch-24', name: "Madhavaram Milk", address: "No-12, Madhavaram Milk Colony Main Road, Chennai-600051", city: "Chennai", phone: "+91 7823999949", image: "https://perambursrinivasa.com/cdn/shop/files/24_Tirumangalam_600x.webp?v=1747826010", isHeadOffice: false },
    { id: 'branch-25', name: "Mathur-2", address: "No-105/4, MMDA 2nd Main Road, Mathur, Chennai-600068", city: "Chennai", phone: "+91 7823999945", image: "https://perambursrinivasa.com/cdn/shop/files/MATHUR_600x.png?v=1767789273", isHeadOffice: false },
    { id: 'branch-26', name: "Srinivasa Nagar", address: "No.10/2, Srinivasa Nagar Main Road, Kolathur, Chennai-600099", city: "Chennai", phone: "+91 7823999954", image: "https://perambursrinivasa.com/cdn/shop/files/SRINIVASA_NAGAR_600x.jpg?v=1767788918", isHeadOffice: false },
    { id: 'branch-27', name: "Ashok Nagar", address: "NO-66 & 67(37) 1st Avenue, Ashok Nagar, Chennai-600083", city: "Chennai", phone: "+91 7823999954", image: "https://perambursrinivasa.com/cdn/shop/files/unnamed_600x.webp?v=1767790212", isHeadOffice: false }
];

// Helper functions to get data with category info
export function getProductsWithCategory(): (Product & { category: Category })[] {
    return STATIC_PRODUCTS.map(product => {
        const category = STATIC_CATEGORIES.find(c => c.id === product.categoryId);
        return {
            ...product,
            category: category || { id: '', name: 'Unknown', slug: '', image: '' }
        };
    });
}

export function getProductBySlug(slug: string): (Product & { category: Category }) | undefined {
    const product = STATIC_PRODUCTS.find(p => p.slug === slug);
    if (!product) return undefined;
    const category = STATIC_CATEGORIES.find(c => c.id === product.categoryId);
    return {
        ...product,
        category: category || { id: '', name: 'Unknown', slug: '', image: '' }
    };
}

export function getProductsByCategory(categorySlug: string): Product[] {
    const category = STATIC_CATEGORIES.find(c => c.slug === categorySlug);
    if (!category) return [];

    // Also include products from sub-categories
    const subCategories = STATIC_CATEGORIES.filter(c => c.parentId === category.id);
    const subCategoryIds = subCategories.map(c => c.id);

    return STATIC_PRODUCTS.filter(p => p.categoryId === category.id || subCategoryIds.includes(p.categoryId));
}

export function getCategoryBySlug(slug: string): Category | undefined {
    return STATIC_CATEGORIES.find(c => c.slug === slug);
}

export function getBestSellers(): Product[] {
    return STATIC_PRODUCTS.filter(p => p.isBestSeller);
}

export function getNewLaunches(): Product[] {
    return STATIC_PRODUCTS.filter(p => p.isNewLaunch);
}

export function getSubCategories(parentSlug: string): Category[] {
    const parent = STATIC_CATEGORIES.find(c => c.slug === parentSlug);
    if (!parent) return [];
    return STATIC_CATEGORIES.filter(c => c.parentId === parent.id);
}
