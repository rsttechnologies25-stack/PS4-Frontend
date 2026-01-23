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
export const USE_STATIC_DATA = true;

export interface Category {
    id: string;
    name: string;
    slug: string;
    image: string;
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
    category?: Category;
}

export interface Branch {
    id: string;
    name: string;
    address: string;
    city: string;
    phone: string;
    image: string;
}

// Categories
export const STATIC_CATEGORIES: Category[] = [
    { id: 'cat-1', name: 'Sweets', slug: 'sweets', image: '/hero_motichoor_laddu.jpg' },
    { id: 'cat-2', name: 'Snacks', slug: 'snacks', image: 'https://perambursrinivasa.com/cdn/shop/files/PEANUTPAKODA_2.jpg?v=1753018705&width=500' },
    { id: 'cat-3', name: 'Savouries', slug: 'savouries', image: 'https://perambursrinivasa.com/cdn/shop/files/ANDHRA_MURUKKU.jpg?v=1753018411&width=500' },
    { id: 'cat-4', name: 'Cookies', slug: 'cookies', image: 'https://perambursrinivasa.com/cdn/shop/files/KESAR_BADAM_COOKIES.jpg?v=1753017309&width=500' },
    { id: 'cat-5', name: 'Podi & Thokku', slug: 'podi-thokku', image: 'https://perambursrinivasa.com/cdn/shop/files/IDLY_PODI_34e04bc4-aee0-42a9-949a-2bd13815a4f1.jpg?v=1753016470&width=500' },
];

// Products
export const STATIC_PRODUCTS: Product[] = [
    // Sweets
    { id: 'prod-1', name: 'Motichur Laddu', slug: 'motichur-laddu', price: 200, description: 'Authentic Taste, Handcrafted, No Maida, No Added Colors', image: '/hero_motichoor_laddu.jpg', categoryId: 'cat-1', isBestSeller: true, isNewLaunch: false },
    { id: 'prod-2', name: 'Srinivasa Laddu Small', slug: 'srinivasa-laddu-small', price: 205, description: 'Authentic Taste, Handcrafted, No Maida, No Added Colors', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/SRINIVASA_LADDU-170_3.webp?v=1748349101', categoryId: 'cat-1', isBestSeller: true, isNewLaunch: false },
    { id: 'prod-3', name: 'Wheat Laddu', slug: 'wheat-laddu', price: 180, description: 'Made from wheat flour, ghee, and sugar.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/imgps1.webp?v=1747824589', categoryId: 'cat-1', isBestSeller: false, isNewLaunch: false },
    { id: 'prod-4', name: 'Kesar Kaju Katli', slug: 'kesar-kaju-katli', price: 360, description: 'Saffron-infused version of the kaju katli.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/kk2.webp?v=1745989914', categoryId: 'cat-1', isBestSeller: true, isNewLaunch: false },
    { id: 'prod-5', name: 'Special Milk Cake', slug: 'special-milk-cake', price: 200, description: 'Dense milk sweet with caramelized edges.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/SPL_MILK_CAKE.jpg?v=1753341841', categoryId: 'cat-1', isBestSeller: false, isNewLaunch: false },
    { id: 'prod-6', name: 'Kesar Pista Katli', slug: 'kesar-pista-katli', price: 180, description: 'Saffron and pistachio blended katli.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/kpk.webp?v=1745990535', categoryId: 'cat-1', isBestSeller: false, isNewLaunch: false },
    { id: 'prod-7', name: 'Butterscotch Burfi', slug: 'butterscotch-burfi', price: 180, description: 'Sweet, fudgy burfi flavored with butterscotch essence and nuts.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/bb.webp?v=1745990426', categoryId: 'cat-1', isBestSeller: false, isNewLaunch: false },
    { id: 'prod-8', name: 'Kaju Flower', slug: 'kaju-flower', price: 400, description: 'Cashew sweet molded in a floral shape.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/kf2.webp?v=1745989853', categoryId: 'cat-1', isBestSeller: false, isNewLaunch: false },
    { id: 'prod-9', name: 'Kaju Pista Roll', slug: 'kaju-pista-roll', price: 360, description: 'Cashew and pistachio rolled sweet.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/KAJU_PISTA_ROLL.jpg?v=1753338971', categoryId: 'cat-1', isBestSeller: false, isNewLaunch: false },
    { id: 'prod-10', name: 'Gulkanth Burfi', slug: 'gulkanth-burfi', price: 200, description: 'Delightful rose petal jam sweet.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/GULKANTHBURFI.jpg?v=1753000413', categoryId: 'cat-1', isBestSeller: false, isNewLaunch: false },
    { id: 'prod-11', name: 'Kaju Katli', slug: 'kaju-katli', price: 310, description: 'Classic cashew fudge.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/KAJU_KATLI.jpg?v=1753000606', categoryId: 'cat-1', isBestSeller: true, isNewLaunch: false },
    { id: 'prod-12', name: 'Karuppatti Mysore Pak', slug: 'karuppatti-mysore-pak', price: 230, description: 'Mysore Pak sweetened with palm jaggery for earthy flavor.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/KARUPATTI_MYSOREPAK.jpg?v=1753341712', categoryId: 'cat-1', isBestSeller: false, isNewLaunch: false },
    { id: 'prod-13', name: 'Then Mittai', slug: 'then-mittai', price: 180, description: 'Soft, honey-sweetened traditional South Indian sweet.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/then.webp?v=1746003960', categoryId: 'cat-1', isBestSeller: false, isNewLaunch: false },
    { id: 'prod-14', name: 'Rassgulla Bowl', slug: 'rassgulla-bowl', price: 180, description: 'Soft and spongy cottage cheese balls in sugar syrup.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/rag.webp?v=1745992713', categoryId: 'cat-1', isBestSeller: false, isNewLaunch: false },
    { id: 'prod-15', name: 'Gulab Jamun Bowl', slug: 'gulab-jamun-bowl', price: 180, description: 'Classic deep-fried milk solids in sugar syrup.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/image34.webp?v=1753339502', categoryId: 'cat-1', isBestSeller: false, isNewLaunch: false },

    // Snacks
    { id: 'prod-16', name: 'Special Kara Sev', slug: 'special-kara-sev', price: 138, description: 'Special spicy sev variety.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/MINI_KARA_SEV.jpg?v=1753017794', categoryId: 'cat-2', isBestSeller: false, isNewLaunch: true },
    { id: 'prod-17', name: 'Sweet Samosa', slug: 'sweet-samosa', price: 180, description: 'Mini samosa with sweet khoya filling.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/ss.webp?v=1745918451', categoryId: 'cat-2', isBestSeller: false, isNewLaunch: true },

    // Cookies
    { id: 'prod-18', name: 'Sesame Cookies', slug: 'sesame-cookies', price: 140, description: 'Cookies made with sesame seeds.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/SEASAME_COOKIES.jpg?v=1753017240', categoryId: 'cat-4', isBestSeller: false, isNewLaunch: false },
    { id: 'prod-19', name: 'Ragi Cookies', slug: 'ragi-cookies', price: 105, description: 'Nutritious cookies made from ragi.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/RAGI_COOKIES.jpg?v=1753017272', categoryId: 'cat-4', isBestSeller: false, isNewLaunch: false },
    { id: 'prod-20', name: 'Kesar Badam Cookies', slug: 'kesar-badam-cookies', price: 180, description: 'Saffron almond cookies.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/KESAR_BADAM_COOKIES.jpg?v=1753017309', categoryId: 'cat-4', isBestSeller: false, isNewLaunch: false },
    { id: 'prod-21', name: 'Kaju Atta Cookies', slug: 'kaju-atta-cookies', price: 140, description: 'Whole wheat cookies with cashew flavor.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/KAJU_ATTA_COOKIES.jpg?v=1753017344', categoryId: 'cat-4', isBestSeller: false, isNewLaunch: false },
    { id: 'prod-22', name: 'Jam Pista Cookies', slug: 'jam-pista-cookies', price: 105, description: 'Cookies topped with jam and pista.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/JAM_PISTA_COOKIES.jpg?v=1753017376', categoryId: 'cat-4', isBestSeller: false, isNewLaunch: false },
    { id: 'prod-23', name: 'Ghee Pista Stick', slug: 'ghee-pista-stick', price: 180, description: 'Pistachio infused ghee sticks.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/PISTA_STICKS.jpg?v=1753017464', categoryId: 'cat-4', isBestSeller: false, isNewLaunch: false },
    { id: 'prod-24', name: 'Ghee Badam Stick', slug: 'ghee-badam-stick', price: 180, description: 'Crunchy sticks flavored with ghee and almonds.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/BADAM_STICKS_2.jpg?v=1753017489', categoryId: 'cat-4', isBestSeller: false, isNewLaunch: false },
    { id: 'prod-25', name: 'Coconut Crunch', slug: 'coconut-crunch', price: 140, description: 'Crispy coconut-flavored cookies.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/COCONUT_COOKIES.jpg?v=1753017550', categoryId: 'cat-4', isBestSeller: false, isNewLaunch: false },

    // Podi & Thokku
    { id: 'prod-26', name: 'Andra Idly Podi', slug: 'andra-idly-podi', price: 180, description: 'A spicy dry chutney powder made in Andhra style.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/Ps4_Pickles_Thokku-31.jpg?v=1768392408', categoryId: 'cat-5', isBestSeller: false, isNewLaunch: false },
    { id: 'prod-27', name: 'Pirandai Thokku', slug: 'pirandai-thokku', price: 180, description: 'Made from edible Cissus quadrangularis.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/image6.webp?v=1746161359', categoryId: 'cat-5', isBestSeller: false, isNewLaunch: false },
    { id: 'prod-28', name: 'Pudina Thokku', slug: 'pudina-thokku', price: 180, description: 'A refreshing mint-based preserve.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/image4.webp?v=1746161348', categoryId: 'cat-5', isBestSeller: false, isNewLaunch: false },
    { id: 'prod-29', name: 'Tomato Thokku', slug: 'tomato-thokku', price: 180, description: 'Classic tomato thokku balance of spice and tang.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/image3.webp?v=1746161336', categoryId: 'cat-5', isBestSeller: false, isNewLaunch: false },
    { id: 'prod-30', name: 'Paruppu Podi', slug: 'paruppu-podi', price: 170, description: 'A protein-rich lentil powder.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/PARUPPUPODI.jpg?v=1747888955', categoryId: 'cat-5', isBestSeller: false, isNewLaunch: false },
    { id: 'prod-31', name: 'PS4 Idly Podi', slug: 'ps4-idly-podi', price: 170, description: 'Flavorful idly podi made with special PS4 spice blend.', image: 'https://cdn.shopify.com/s/files/1/0625/9834/8887/files/IDLY_PODI_34e04bc4-aee0-42a9-949a-2bd13815a4f1.jpg?v=1753016470', categoryId: 'cat-5', isBestSeller: false, isNewLaunch: false },
];

// Branches
export const STATIC_BRANCHES: Branch[] = [
    { id: 'branch-1', name: "Tirupathi", address: "No: 20-5-1, Thirumala Bypass Road, Thirupathi Town, Chitoor, AP-517501", city: "Tirupati", phone: "+91 7823999799 / 899", image: "https://perambursrinivasa.com/cdn/shop/files/Tirupathi_01_600x.webp?v=1747809328" },
    { id: 'branch-2', name: "Tirupathi - II", address: "No: 29/1, 29/2, 29/3/254/2, Tiruchanoor Road, Tirupati, AP-517502", city: "Tirupati", phone: "+91 7823 999 599 / 699", image: "https://perambursrinivasa.com/cdn/shop/files/Tirupathi_02_600x.webp?v=1747809328" },
    { id: 'branch-3', name: "Perambur (RS Opp)", address: "No: 23/16, Perambur High Road, Perambur, Chennai-600011", city: "Chennai", phone: "+91 7823999930 / 931", image: "https://perambursrinivasa.com/cdn/shop/files/PERAMBUR_600x.jpg?v=1767788916" },
    { id: 'branch-4', name: "Perambur Market", address: "No: 132, M H Road, Perambur, Chennai-600011", city: "Chennai", phone: "+91 7823999932", image: "https://perambursrinivasa.com/cdn/shop/files/MARKET_600x.jpg?v=1767788917" },
    { id: 'branch-5', name: "Venus (Perambur)", address: "No: 38, Paper Mills Road, Chennai-600011", city: "Chennai", phone: "+91 7823999933", image: "https://perambursrinivasa.com/cdn/shop/files/Perambur_01_600x.webp?v=1747809328" },
    { id: 'branch-6', name: "Ayanavaram", address: "No: 200, KH Road Aynavaram, Chennai-600023", city: "Chennai", phone: "+91 7823999935", image: "https://perambursrinivasa.com/cdn/shop/files/07_Aynavaram_600x.webp?v=1747826010" },
    { id: 'branch-7', name: "Kolathur", address: "1 & 2, 1ST, Anjugam Nagar Main Road, Kolathur, Chennai-600099", city: "Chennai", phone: "+91 7823999936", image: "https://perambursrinivasa.com/cdn/shop/files/KOLATHUR_9ff3245e-b9c6-432b-bdd4-aec1a65280bf_600x.jpg?v=1767788917" },
    { id: 'branch-8', name: "Moolakadai", address: "No: 30, M H Road, Moolakadai, Chennai-600060", city: "Chennai", phone: "+91 7823999937", image: "https://perambursrinivasa.com/cdn/shop/files/MOOL_600x.jpg?v=1767788919" },
    { id: 'branch-9', name: "Redhills", address: "No: 265, G.N.T. Road, Redhills, Chennai-600052", city: "Chennai", phone: "+91 7823999938", image: "https://perambursrinivasa.com/cdn/shop/files/REDHILLS_8347a857-5242-4575-ac86-465d0b258e2a_600x.jpg?v=1767788919" },
    { id: 'branch-10', name: "Padi", address: "No: 100, M.T.H Road Padi, Chennai-600050", city: "Chennai", phone: "+91 7823999939", image: "https://perambursrinivasa.com/cdn/shop/files/PADI_600x.jpg?v=1767788916" },
    { id: 'branch-11', name: "Ambathur", address: "No: 453/1, CTH Road Ambatur O.T, Chennai-600053", city: "Chennai", phone: "+91 7823999940", image: "https://perambursrinivasa.com/cdn/shop/files/12_Ambathur_600x.webp?v=1747826010" },
    { id: 'branch-12', name: "Thiru.vi.ka.nagar", address: "No: 59, S.R.P. Kol Street, T.V.K. nagar, Perambur, Chennai-600011", city: "Chennai", phone: "+91 7823999941", image: "https://perambursrinivasa.com/cdn/shop/files/13_T.V.K._NAGAR_600x.webp?v=1747826010" },
    { id: 'branch-13', name: "Bharathi Road", address: "No: 8, Bharathi Road, Perambur, Chennai-600011", city: "Chennai", phone: "+91 7823999942", image: "https://perambursrinivasa.com/cdn/shop/files/14_Bharathi_Road_600x.webp?v=1747826010" },
    { id: 'branch-14', name: "Thiruvallur", address: "No: 4/3A, C.V. Naidu Salai, National Highways, Tiruvallur-602003", city: "Tiruvallur", phone: "+91 7823999943", image: "https://perambursrinivasa.com/cdn/shop/files/TRL_MAIN_600x.jpg?v=1767788918" },
    { id: 'branch-15', name: "Aminjikarai", address: "No: 493, P.H. Road, Aminjikarai, Chennai-600029", city: "Chennai", phone: "+91 7823999944", image: "https://perambursrinivasa.com/cdn/shop/files/16_Aminjikarai_600x.webp?v=1747826010" },
    { id: 'branch-16', name: "Mathur (MMDA)", address: "No: 132, Kamarajar Salai, Mathur MMDA, Chennai-600068", city: "Chennai", phone: "+91 7823999945", image: "https://perambursrinivasa.com/cdn/shop/files/MATHUR_600x.png?v=1767789273" },
    { id: 'branch-17', name: "Nelson Manickam Rd", address: "No: 130, Nelson Manickam Road, Aminjikarai, Chennai-600 029", city: "Chennai", phone: "+91 7823999946", image: "https://perambursrinivasa.com/cdn/shop/files/18_NMR_600x.webp?v=1747826010" },
    { id: 'branch-18', name: "Periyar Nagar", address: "No: 106, Siva Elango Salai, Periyar Nagar, Chennai-600 082", city: "Chennai", phone: "+91 7823999947 / 956", image: "https://perambursrinivasa.com/cdn/shop/files/19_Periya_Nagar_600x.webp?v=1747826010" },
    { id: 'branch-19', name: "Tiruvallur (Silks)", address: "No: 65A, C.V. Naidu Salai, Chennai Silks Campus, Thiruvallur-602001", city: "Tiruvallur", phone: "+91 7823999948 / 958", image: "https://perambursrinivasa.com/cdn/shop/files/15_Tiruvallur_600x.webp?v=1747826010" },
    { id: 'branch-20', name: "Valasarawakkam", address: "No: 3, Arcot Road, Valasaravakkam, Chennai-600087", city: "Chennai", phone: "+91 7823999950", image: "https://perambursrinivasa.com/cdn/shop/files/Perambur_01_600x.webp?v=1747809328" },
    { id: 'branch-21', name: "Thiruninravur", address: "Plot no: 20, survey no:224/1, C.T.H road, Thiruninravur-602024", city: "Thiruninravur", phone: "+91 7823999951 / 961", image: "https://perambursrinivasa.com/cdn/shop/files/22_Thiruninravur_600x.webp?v=1747826010" },
    { id: 'branch-22', name: "Arumbakkam (MMDA)", address: "No: 249/6, P-block, MMDA Colony, Arumbakkam-600106", city: "Chennai", phone: "+91 7823999952", image: "https://perambursrinivasa.com/cdn/shop/files/23_Arumbakkam_600x.webp?v=1747826010" },
    { id: 'branch-23', name: "Tirumangalam", address: "No: 1, Mogappair Road, Tirumangalam, Chennai-600101", city: "Chennai", phone: "+91 7823999953", image: "https://perambursrinivasa.com/cdn/shop/files/24_Tirumangalam_600x.webp?v=1747826010" },
    { id: 'branch-24', name: "Madhavaram Milk", address: "No-12, Madhavaram Milk Colony Main Road, Chennai-600051", city: "Chennai", phone: "+91 7823999949", image: "https://perambursrinivasa.com/cdn/shop/files/24_Tirumangalam_600x.webp?v=1747826010" },
    { id: 'branch-25', name: "Mathur-2", address: "No-105/4, MMDA 2nd Main Road, Mathur, Chennai-600068", city: "Chennai", phone: "+91 7823999945", image: "https://perambursrinivasa.com/cdn/shop/files/MATHUR_600x.png?v=1767789273" },
    { id: 'branch-26', name: "Srinivasa Nagar", address: "No.10/2, Srinivasa Nagar Main Road, Kolathur, Chennai-600099", city: "Chennai", phone: "+91 7823999954", image: "https://perambursrinivasa.com/cdn/shop/files/SRINIVASA_NAGAR_600x.jpg?v=1767788918" },
    { id: 'branch-27', name: "Ashok Nagar", address: "NO-66 & 67(37) 1st Avenue, Ashok Nagar, Chennai-600083", city: "Chennai", phone: "+91 7823999954", image: "https://perambursrinivasa.com/cdn/shop/files/unnamed_600x.webp?v=1767790212" },
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
    return STATIC_PRODUCTS.filter(p => p.categoryId === category.id);
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
