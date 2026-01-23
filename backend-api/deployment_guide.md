# PS4 Platform Deployment Guide

Follow these steps to deploy your platform with the backend on your Linux server and the frontend on Cloudflare.

## 1. Backend Setup (Linux Server)

### Recommended Subdomain: `shop-api.perambursrinivasa.co.in`

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- PM2 (`npm install -g pm2`)
- Nginx

### Option A: Database Migration (Preserves all data)
1. **Export Local Data**:
   ```bash
   pg_dump -U postgres -d ps4_sweets > ps4_backup.sql
   ```
2. **Import to Server**:
   ```bash
   psql -U postgres -d shop_db < ps4_backup.sql
   ```

### Option B: Fresh Seed (Best for initial setup)
If you just want the branches and products I've already set up, you can simply run:
```bash
npm run prisma:seed
```
This will automatically populate all 27 branches and the product catalog on your server.

### Application Deployment
1. Transfer the `backend-api` folder to your server.
2. Install dependencies: `npm install`
3. Generate Prisma client: `npx prisma generate`
4. Start with PM2:
   ```bash
   pm2 start src/index.ts --name "ps4-backend" --interpreter ts-node
   ```

### Nginx Configuration
Create a new server block in `/etc/nginx/sites-available/shop-api`:
```nginx
server {
    listen 80;
    server_name shop-api.perambursrinivasa.co.in;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 2. Frontend Setup (Cloudflare Pages)

1. Connect your repository to **Cloudflare Pages**.
2. **Framework Preset**: Next.js
3. **Build Command**: `npm run build`
4. **Build Output Directory**: `out`
5. **Environment Variables**:
   Add this variable in the Cloudflare dashboard:
   - `NEXT_PUBLIC_API_URL`: `https://shop-api.perambursrinivasa.co.in`

---
> [!TIP]
> Don't forget to update your DNS records (A record or CNAME) to point `shop-api` to your Linux server's IP.
