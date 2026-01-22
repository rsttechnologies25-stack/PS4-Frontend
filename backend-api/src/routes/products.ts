import { Router } from 'express';
import prisma from '../lib/prisma';

const router = Router();

router.get('/', async (req, res) => {
    const { category, isBestSeller, isNewLaunch } = req.query;

    try {
        const products = await prisma.product.findMany({
            where: {
                ...(category ? { category: { slug: category as string } } : {}),
                ...(isBestSeller === 'true' ? { isBestSeller: true } : {}),
                ...(isNewLaunch === 'true' ? { isNewLaunch: true } : {}),
            },
            include: { category: true }
        });
        res.json(products);
    } catch (error) {
        console.error('Fetch products error:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

router.get('/:slug', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { slug: req.params.slug },
            include: { category: true }
        });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

export default router;
