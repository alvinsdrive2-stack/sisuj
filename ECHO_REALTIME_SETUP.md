# Echo + Reverb Real-Time Setup

Migrasi dari Ably ke Laravel Echo + Reverb untuk real-time sync disemua halaman.

## Files Changed

### Backend (`gatensi-backend`)

| File | Change |
|------|--------|
| `.env` | `BROADCAST_CONNECTION=reverb`, added `REVERB_*` vars |
| `bootstrap/providers.php` | Registered `BroadcastServiceProvider` |
| `app/Providers/BroadcastServiceProvider.php` | **NEW** - Boots broadcasting routes |
| `routes/channels.php` | Added `signing.{idIzin}.{docType}` channel auth |
| `app/Events/DocumentSigned.php` | **NEW** - Generic signing event for all dokumen |
| `app/Http/Controllers/PraAsesmenController.php` | Added `use DocumentSigned`, broadcast in both `generateTtdBarcode*` methods |
| `app/Http/Controllers/AsesmenController.php` | Added `use DocumentSigned`, broadcast in `generateTtdBarcode` |

### Frontend (`sisuj`)

| File | Change |
|------|--------|
| `package.json` | Added `laravel-echo ^2.3.7`, `pusher-js ^8.5.0` |
| `.env` | Added `VITE_REVERB_APP_KEY`, `VITE_REVERB_HOST`, `VITE_REVERB_PORT` |
| `.env.prod`, `.env.prod2`, `.env.production` | Added same `VITE_REVERB_*` vars |
| `src/lib/echo.ts` | **NEW** - Echo instance config + connect/disconnect |
| `src/hooks/useEchoSync.ts` | **NEW** - Replaces `useRealtimeSync` |
| `src/hooks/useSigningState.ts` | Uses `useEchoSync` instead of `useRealtimeSync` |
| `src/contexts/auth-context.tsx` | Connect Echo on login, disconnect on logout |
| `src/pages/asesi/PraAsesmenPage.tsx` | Uses `useEchoSync` |
| `src/pages/asesi/asesmen/UjianPage.tsx` | Uses `useEchoSync` |
| `src/vite-env.d.ts` | Added `VITE_REVERB_*` type declarations |

## Architecture

```
Asesi TTD ──POST──→ Laravel API ──broadcast()──→ Reverb Server
                                                     │
Asesi Page (waiting) ◄──Echo.private()────listen('document.signed')──┘
Asesor Page ◄────────Echo.private()────listen('document.signed')─────┘
```

Channel pattern: `private:signing.{idIzin}.{docType}`

Event: `DocumentSigned` → broadcast as `document.signed`

## Server Setup

### 1. Backend (Laravel)

```bash
cd /path/to/gatensi-backend

# Install dependencies
composer install
php artisan reverb:install

# Update .env sudah include REVERB_* vars
# Verify:
grep REVERB .env
# Output:
# BROADCAST_CONNECTION=reverb
# REVERB_APP_ID=app-gatensi
# REVERB_APP_KEY=genius
# REVERB_APP_SECRET=rahasia-banget-dah-ges
# REVERB_HOST=0.0.0.0
# REVERB_PORT=8080
# REVERB_SCHEME=http

# Start services (butuh 3 terminal atau supervisor)
# Terminal 1:
php artisan serve

# Terminal 2:
php artisan reverb:start

# Terminal 3:
php artisan queue:work
```

### 2. Production (Supervisor Config)

```ini
; /etc/supervisor/conf.d/reverb.conf
[program:reverb]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/gatensi-backend/artisan reverb:start
user=www-data
autostart=true
autorestart=true
numprocs=1
redirect_stderr=true
stdout_logfile=/var/log/reverb.log

; /etc/supervisor/conf.d/queue-worker.conf
[program:queue-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /path/to/gatensi-backend/artisan queue:work --sleep=3 --tries=3 --max-time=3600
user=www-data
autostart=true
autorestart=true
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/queue-worker.log
```

### 3. Open Port

Pastikan port **8080** (atau sesuai REVERB_PORT) terbuka di firewall.

For production with SSL:
```bash
# Set di .env
REVERB_SCHEME=https
REVERB_PORT=443
# Or use reverse proxy (Nginx) to forward /app/ to Reverb port 8080
```

### 4. Frontend Deploy

```bash
cd /path/to/sisuj

# Build for production
npm run build

# Deploy dist/ folder ke Vercel / hosting
```

Env vars for frontend:
```
VITE_REVERB_APP_KEY=genius
VITE_REVERB_HOST=your-domain.com
VITE_REVERB_PORT=8080
```

## How to Verify

### 1. Cek Reverb running
```bash
php artisan reverb:status
# Should show: Server is running
```

### 2. Cek Broadcast Route
```bash
php artisan route:list --path=broadcasting
# Should show: POST /broadcasting/auth
```

### 3. Cek Queue
```bash
php artisan queue:monitor database
# Check jobs table for pending broadcasts
```

### 4. Browser Console
```javascript
// Setelah login, cek console:
// Echo instance should be created (no WebSocket errors)
// Subscribe to channel:
window.Echo.private('signing.12345.APL01')
  .listen('.document.signed', (e) => console.log('Real-time:', e))
```

## Rollback

### Jika ada masalah, untuk rollback:

```bash
# 1. Backend - Set broadcast ke log (disable real-time)
sed -i 's/BROADCAST_CONNECTION=reverb/BROADCAST_CONNECTION=log/' .env
# Atau manual edit .env

# 2. Backend - Comment BroadcastServiceProvider
# Edit bootstrap/providers.php, hapus baris:
# App\Providers\BroadcastServiceProvider::class,

# 3. Backend - Hapus broadcast try-catch di controllers
# Edit PraAsesmenController.php:
#   Hapus block try-catch broadcast DocumentSigned di kedua generateTtdBarcode methods
# Edit AsesmenController.php:
#   Hapus block try-catch broadcast DocumentSigned di generateTtdBarcode method

# 4. Frontend - Kembalikan ke Ably
# Revert semua perubahan di:
#   src/hooks/useSigningState.ts → import useRealtimeSync instead
#   src/pages/asesi/PraAsesmenPage.tsx → import useRealtimeSync
#   src/pages/asesi/asesmen/UjianPage.tsx → import useRealtimeSync
# Hapus:
#   src/lib/echo.ts
#   src/hooks/useEchoSync.ts

# 5. Revert .env frontend
# Hapus VITE_REVERB_* lines

# 6. Reinstall packages (optional)
# npm uninstall laravel-echo pusher-js

# 7. Restart semua service
# php artisan queue:restart
# Supervisor: supervisorctl reload
```

## Troubleshooting

### "No connection could be made" di browser
- Reverb server running? `php artisan reverb:status`
- Port 8080 terbuka? `telnet your-host.com 8080`
- VITE_REVERB_HOST correct? (should be backend domain)
- CORS? Check allowed_origins in config/reverb.php

### "401 Unauthorized" di /broadcasting/auth
- Token expired? Login ulang
- Auth guard mismatch? Check auth config
- BroadcastServiceProvider registered?

### Broadcast events not received
- Queue worker running? `php artisan queue:work`
- Check jobs table: `SELECT * FROM jobs ORDER BY id DESC LIMIT 5`
- Event queue failed? `php artisan queue:failed`

### Echo connection errors
- Check browser console WebSocket connection logs
- Verify VITE_REVERB_APP_KEY matches backend REVERB_APP_KEY
- Check Reverb log file
