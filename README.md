# Mobile Device Inventory Management App

## Architecture (Single Pod)
```
/MobileInventory/
├── server/          ← Node.js Express (API + serves built frontend)
│   ├── server.js    ← Main entry point
│   ├── routes/      ← API routes
│   ├── db/          ← Oracle pool + auto DDL
│   └── public/      ← Built Ionic app (served as static files)
└── webapp/          ← Ionic Angular source (Angular 20, standalone)
    └── src/
```

## Running Locally

### Option A: Dev mode (two terminals)
```bash
# Terminal 1 — Backend API
cd /Users/param/MobileInventory/server
node server.js
# → API on http://localhost:3000/api
# → Serves built frontend on http://localhost:3000

# Terminal 2 — Frontend hot-reload
cd /Users/param/MobileInventory/webapp
npx ionic serve --proxy-config proxy.conf.js
# → App on http://localhost:8100 (live reload)
```

### Option B: Production (single server, one terminal)
```bash
# Step 1: Build frontend
cd /Users/param/MobileInventory/webapp
npx ionic build

# Step 2: Start server (serves both API + built app)
cd /Users/param/MobileInventory/server
node server.js
# → Open http://localhost:3000
```

## Default Login
- **Username:** admin
- **Password:** Admin@123

## Database
- Connects to same Oracle DB as Spring Boot: `localhost:1521/XE`
- User: `diagram_user`
- Tables auto-created on first startup: `INV_USERS`, `INV_DEVICES`, `INV_ASSIGNMENTS`, `INV_PROGRAMS`, `INV_PROJECTS`, `INV_AUDIT`

## Environment Config
Edit `/Users/param/MobileInventory/server/.env` to change DB credentials or JWT secret.

## Features
| Feature | Status |
|---|---|
| Login with JWT | ✅ |
| Dashboard — KPI cards, activity feed | ✅ |
| Device list — search, filter, infinite scroll | ✅ |
| Add device — form with barcode scanner | ✅ |
| Device detail — history timeline | ✅ |
| Assign device — User/Program/Project | ✅ |
| Return device | ✅ |
| Barcode scanner (camera) | ✅ |
| Reports — status breakdown, aging | ✅ |
| User management (Admin only) | ✅ |
| Audit trail — all changes logged | ✅ |
| Role-based access (Admin/Manager/User) | ✅ |

## Future — Convert to Native Mobile App
When ready to go native, just run:
```bash
cd webapp
npx ionic cap add ios     # or android
npx ionic cap sync
npx ionic cap open ios
```
The same codebase, zero code changes needed.
