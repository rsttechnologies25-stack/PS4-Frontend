import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import branchRoutes from './routes/branches';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('PS4 Sweets API is running');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
