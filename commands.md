# Commands

## Root Level

```bash
bun install
bun run format
bun run check-types
```

## Server

```bash
cd apps/server
bun run start
bun run worker
bun run scheduler
```

## Worker

```bash
cd apps/worker
bun run start:us-east
bun run start:eu-west
bun run start:ap-south
bun run dev:us-east
bun run dev:eu-west
bun run dev:ap-south
```

From root:
```bash
bun run --filter=worker start:us-east
bun run --filter=worker start:eu-west
bun run --filter=worker start:ap-south
bun run --filter=worker dev:us-east
bun run --filter=worker dev:eu-west
bun run --filter=worker dev:ap-south
```

## Client

```bash
cd apps/client
bun run dev
bun run build
bun run preview
bun run lint
```

From root:
```bash
bun run --filter=client dev
bun run --filter=client build
bun run --filter=client preview
bun run --filter=client lint
```

## PM2 Production

```bash
pm2 start pm2.config.js
pm2 stop all
pm2 restart all
pm2 logs
pm2 status
pm2 delete all
```

## Nginx

```bash
sudo nginx -t
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
sudo systemctl status nginx
sudo systemctl enable nginx
```

## Certbot

```bash
sudo certbot --nginx -d api.stillup.sh
sudo certbot renew
sudo certbot renew --dry-run
sudo certbot certificates
```
