# Broker's Command Center

Full-stack intermediation/broker management application for managing supplier-client relationships, SKU-based items, supplier pricelists with MOQ-based tier pricing, pricing rules, order creation with automatic cost/sell/margin calculations, PDF generation, SMTP email, service invoice tracking, cashbook, and Greek/English bilingual UI.

## Architecture

```
├── client/          # React SPA (Vite + TypeScript + Tailwind + shadcn/ui)
├── server/          # Express API (TypeScript + Drizzle ORM + PostgreSQL)
├── shared/          # Shared schema, types, pricing utilities
├── package.json     # Monorepo root
└── vite.config.ts   # Vite config with path aliases
```

## Quick Start

```bash
npm install
npm run db:push
npm run seed
npm run dev
```

## Features

- Companies (Supplier/Client/Both) with contacts & addresses
- Items catalog (SKU, unit, pack size)
- Supplier pricelists with MOQ-based tier pricing
- Pricing rules (PERCENT/FIXED markup per client-supplier pair)
- Order Desk with per-item pricing overrides
- Orders lifecycle (Draft → Confirmed → Sent → Completed)
- Service Invoices for broker fees
- Cashbook for financial tracking
- Email Hub (SMTP send + history)
- Settings (company branding, logo, custom fields)
- Greek/English bilingual UI
- Dark/Light mode
- Responsive mobile-first design
- PWA Ready
