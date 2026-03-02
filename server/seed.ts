import { db } from "./db.js";
import { companies, items, supplierPricelists, supplierPriceItems, pricingRules, appSettings } from "../shared/schema.js";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  // Check if data exists
  const [existing] = await db.select({ count: sql<number>`count(*)` }).from(companies);
  if (Number(existing.count) > 0) {
    console.log("Database already has data, skipping seed.");
    return;
  }

  // Suppliers
  const [sup1] = await db.insert(companies).values({
    name: "Mediterranean Foods SA",
    role: "Supplier",
    email: "info@medfood.gr",
    phone: "+30 210 1234567",
    vat: "EL123456789",
    paymentTerms: "Net 30",
  }).returning();

  const [sup2] = await db.insert(companies).values({
    name: "Aegean Olive Co",
    role: "Supplier",
    email: "sales@aegeanolive.gr",
    phone: "+30 210 9876543",
    vat: "EL987654321",
    paymentTerms: "Net 45",
  }).returning();

  // Clients
  const [cli1] = await db.insert(companies).values({
    name: "Hotel Athenian Palace",
    role: "Client",
    email: "procurement@athenianpalace.gr",
    phone: "+30 210 5555555",
    vat: "EL555555555",
    paymentTerms: "Net 15",
  }).returning();

  const [cli2] = await db.insert(companies).values({
    name: "Ristorante Bella Vista",
    role: "Client",
    email: "orders@bellavista.it",
    phone: "+39 02 1234567",
    vat: "IT12345678",
    paymentTerms: "Net 30",
  }).returning();

  // Items
  const [item1] = await db.insert(items).values({ sku: "OLV-001", name: "Extra Virgin Olive Oil", unit: "LT", packSize: "5" }).returning();
  const [item2] = await db.insert(items).values({ sku: "OLV-002", name: "Kalamata Olives", unit: "KG", packSize: "1" }).returning();
  const [item3] = await db.insert(items).values({ sku: "CHE-001", name: "Feta Cheese PDO", unit: "KG", packSize: "2" }).returning();
  const [item4] = await db.insert(items).values({ sku: "HNY-001", name: "Thyme Honey", unit: "KG", packSize: "0.5" }).returning();
  const [item5] = await db.insert(items).values({ sku: "PAS-001", name: "Orzo Pasta", unit: "KG", packSize: "0.5" }).returning();

  // Supplier Pricelists
  const [pl1] = await db.insert(supplierPricelists).values({
    supplierId: sup1.id,
    name: "MedFood 2026 Standard",
  }).returning();

  const [pl2] = await db.insert(supplierPricelists).values({
    supplierId: sup2.id,
    name: "Aegean 2026 Q1",
  }).returning();

  // Price Items with MOQ tiers
  await db.insert(supplierPriceItems).values([
    { pricelistId: pl1.id, itemId: item1.id, moq: "1", costPrice: "8.50" },
    { pricelistId: pl1.id, itemId: item1.id, moq: "10", costPrice: "7.80" },
    { pricelistId: pl1.id, itemId: item1.id, moq: "50", costPrice: "7.20" },
    { pricelistId: pl1.id, itemId: item2.id, moq: "1", costPrice: "5.00" },
    { pricelistId: pl1.id, itemId: item2.id, moq: "20", costPrice: "4.50" },
    { pricelistId: pl1.id, itemId: item3.id, moq: "1", costPrice: "12.00" },
    { pricelistId: pl1.id, itemId: item3.id, moq: "10", costPrice: "11.00" },
    { pricelistId: pl2.id, itemId: item4.id, moq: "1", costPrice: "15.00" },
    { pricelistId: pl2.id, itemId: item4.id, moq: "5", costPrice: "13.50" },
    { pricelistId: pl2.id, itemId: item5.id, moq: "1", costPrice: "2.80" },
    { pricelistId: pl2.id, itemId: item5.id, moq: "50", costPrice: "2.40" },
  ]);

  // Pricing Rules
  await db.insert(pricingRules).values([
    { clientId: cli1.id, supplierId: sup1.id, markupType: "PERCENT", markupValue: "15" },
    { clientId: cli2.id, supplierId: sup1.id, markupType: "PERCENT", markupValue: "20" },
    { clientId: cli1.id, supplierId: sup2.id, markupType: "FIXED", markupValue: "2.00" },
  ]);

  // App Settings (broker branding)
  await db.insert(appSettings).values([
    { key: "company_name", value: "Broker's Command Center" },
    { key: "company_address", value: "123 Trading Street, Athens 10563, Greece" },
    { key: "company_vat", value: "EL000000000" },
    { key: "company_phone", value: "+30 210 0000000" },
    { key: "company_email", value: "info@brokercenter.gr" },
  ]);

  console.log("✅ Seed complete!");
}

seed().catch(console.error).finally(() => process.exit(0));
