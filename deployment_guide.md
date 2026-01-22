# PS4 Platform Deployment Guide

Follow these steps to deploy your platform with the backend on your Linux server and the frontend on Cloudflare.

## 1. Backend Setup (Linux Server)

### Recommended Subdomain: `shop-api.perambursrinivasa.co.in`

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- PM2 (`npm install -g pm2`)
- Nginx

### Database Migration
1. **Export Local Data**:
   ```bash
   pg_dump -U postgres -d ps4_sweets > ps4_backup.sql
   ```
2. **Import to Server**:
   ```bash
   psql -U postgres -d your_server_db_name < ps4_backup.sql
   ```

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
2. **Build Command**: `npm run build`
3. **Build Output Directory**: `.next`
4. **Environment Variables**:
   Add this variable in the Cloudflare dashboard:
   - `NEXT_PUBLIC_API_URL`: `https://shop-api.perambursrinivasa.co.in`

---
> [!TIP]
> Don't forget to update your DNS records (A record or CNAME) to point `shop-api` to your Linux server's IP.
