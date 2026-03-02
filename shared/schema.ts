import { pgTable, uuid, text, varchar, numeric, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─── Companies ───────────────────────────────────────────
export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("Client"), // Supplier | Client | Both
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  vat: varchar("vat", { length: 50 }),
  paymentTerms: varchar("payment_terms", { length: 100 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true });
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

// ─── Contacts ────────────────────────────────────────────
export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 100 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  mobile: varchar("mobile", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true });
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

// ─── Addresses ───────────────────────────────────────────
export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 100 }),
  street: varchar("street", { length: 255 }),
  city: varchar("city", { length: 100 }),
  region: varchar("region", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 100 }).default("Greece"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAddressSchema = createInsertSchema(addresses).omit({ id: true, createdAt: true });
export type Address = typeof addresses.$inferSelect;
export type InsertAddress = z.infer<typeof insertAddressSchema>;

// ─── Items ───────────────────────────────────────────────
export const items = pgTable("items", {
  id: uuid("id").primaryKey().defaultRandom(),
  sku: varchar("sku", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  unit: varchar("unit", { length: 30 }).default("KG"),
  packSize: numeric("pack_size", { precision: 10, scale: 3 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertItemSchema = createInsertSchema(items).omit({ id: true, createdAt: true });
export type Item = typeof items.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;

// ─── Supplier Pricelists ─────────────────────────────────
export const supplierPricelists = pgTable("supplier_pricelists", {
  id: uuid("id").primaryKey().defaultRandom(),
  supplierId: uuid("supplier_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  validFrom: timestamp("valid_from"),
  validTo: timestamp("valid_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSupplierPricelistSchema = createInsertSchema(supplierPricelists).omit({ id: true, createdAt: true });
export type SupplierPricelist = typeof supplierPricelists.$inferSelect;
export type InsertSupplierPricelist = z.infer<typeof insertSupplierPricelistSchema>;

// ─── Supplier Price Items (MOQ tiers) ────────────────────
export const supplierPriceItems = pgTable("supplier_price_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  pricelistId: uuid("pricelist_id").notNull().references(() => supplierPricelists.id, { onDelete: "cascade" }),
  itemId: uuid("item_id").notNull().references(() => items.id, { onDelete: "cascade" }),
  moq: numeric("moq", { precision: 10, scale: 3 }).default("1"),
  costPrice: numeric("cost_price", { precision: 10, scale: 4 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSupplierPriceItemSchema = createInsertSchema(supplierPriceItems).omit({ id: true, createdAt: true });
export type SupplierPriceItem = typeof supplierPriceItems.$inferSelect;
export type InsertSupplierPriceItem = z.infer<typeof insertSupplierPriceItemSchema>;

// ─── Pricing Rules ───────────────────────────────────────
export const pricingRules = pgTable("pricing_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  supplierId: uuid("supplier_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  markupType: varchar("markup_type", { length: 10 }).notNull().default("PERCENT"), // PERCENT | FIXED
  markupValue: numeric("markup_value", { precision: 10, scale: 4 }).notNull().default("10"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPricingRuleSchema = createInsertSchema(pricingRules).omit({ id: true, createdAt: true });
export type PricingRule = typeof pricingRules.$inferSelect;
export type InsertPricingRule = z.infer<typeof insertPricingRuleSchema>;

// ─── Orders ──────────────────────────────────────────────
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: varchar("order_number", { length: 50 }).notNull(),
  clientId: uuid("client_id").notNull().references(() => companies.id),
  supplierId: uuid("supplier_id").notNull().references(() => companies.id),
  status: varchar("status", { length: 30 }).notNull().default("Draft"), // Draft | Confirmed | Sent | Completed | Cancelled
  totalCost: numeric("total_cost", { precision: 12, scale: 4 }).default("0"),
  totalSell: numeric("total_sell", { precision: 12, scale: 4 }).default("0"),
  totalMargin: numeric("total_margin", { precision: 12, scale: 4 }).default("0"),
  serviceFee: numeric("service_fee", { precision: 12, scale: 4 }).default("0"),
  minServiceFee: numeric("min_service_fee", { precision: 12, scale: 4 }).default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  confirmedAt: timestamp("confirmed_at"),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, confirmedAt: true });
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// ─── Order Items ─────────────────────────────────────────
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  itemId: uuid("item_id").notNull().references(() => items.id),
  itemName: varchar("item_name", { length: 255 }).notNull(),
  sku: varchar("sku", { length: 50 }),
  qty: numeric("qty", { precision: 10, scale: 3 }).notNull(),
  unit: varchar("unit", { length: 30 }),
  costPrice: numeric("cost_price", { precision: 10, scale: 4 }).notNull(),
  sellPrice: numeric("sell_price", { precision: 10, scale: 4 }).notNull(),
  margin: numeric("margin", { precision: 10, scale: 4 }).default("0"),
  overrideType: varchar("override_type", { length: 20 }), // null | PERCENT | SELL_PRICE
  overrideValue: numeric("override_value", { precision: 10, scale: 4 }),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

// ─── Service Invoices ────────────────────────────────────
export const serviceInvoices = pgTable("service_invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
  clientId: uuid("client_id").notNull().references(() => companies.id),
  amount: numeric("amount", { precision: 12, scale: 4 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("Draft"), // Draft | Issued | Paid
  issuedAt: timestamp("issued_at"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertServiceInvoiceSchema = createInsertSchema(serviceInvoices).omit({ id: true, createdAt: true });
export type ServiceInvoice = typeof serviceInvoices.$inferSelect;
export type InsertServiceInvoice = z.infer<typeof insertServiceInvoiceSchema>;

// ─── Cashbook ────────────────────────────────────────────
export const cashbook = pgTable("cashbook", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: varchar("type", { length: 5 }).notNull(), // IN | OUT
  amount: numeric("amount", { precision: 12, scale: 4 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }),
  referenceId: uuid("reference_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCashbookSchema = createInsertSchema(cashbook).omit({ id: true, createdAt: true });
export type CashbookEntry = typeof cashbook.$inferSelect;
export type InsertCashbookEntry = z.infer<typeof insertCashbookSchema>;

// ─── Email Log ───────────────────────────────────────────
export const emailLog = pgTable("email_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  to: varchar("to", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  body: text("body"),
  status: varchar("status", { length: 20 }).notNull().default("sent"),
  error: text("error"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

export const insertEmailLogSchema = createInsertSchema(emailLog).omit({ id: true, sentAt: true });
export type EmailLogEntry = typeof emailLog.$inferSelect;

// ─── Documents ───────────────────────────────────────────
export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 50 }).notNull(), // PO | ClientConfirmation | ServiceInvoice
  filename: varchar("filename", { length: 255 }).notNull(),
  path: varchar("path", { length: 500 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;

// ─── App Settings ────────────────────────────────────────
export const appSettings = pgTable("app_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value"),
});

export type AppSetting = typeof appSettings.$inferSelect;

// ─── Custom Field Definitions ────────────────────────────
export const customFieldDefs = pgTable("custom_field_defs", {
  id: uuid("id").primaryKey().defaultRandom(),
  entityType: varchar("entity_type", { length: 50 }).notNull(), // company | item | order
  fieldName: varchar("field_name", { length: 100 }).notNull(),
  fieldType: varchar("field_type", { length: 20 }).notNull().default("text"), // text | number | date | boolean
  required: boolean("required").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCustomFieldDefSchema = createInsertSchema(customFieldDefs).omit({ id: true, createdAt: true });
export type CustomFieldDef = typeof customFieldDefs.$inferSelect;
export type InsertCustomFieldDef = z.infer<typeof insertCustomFieldDefSchema>;

// ─── Custom Field Values ─────────────────────────────────
export const customFieldValues = pgTable("custom_field_values", {
  id: uuid("id").primaryKey().defaultRandom(),
  fieldDefId: uuid("field_def_id").notNull().references(() => customFieldDefs.id, { onDelete: "cascade" }),
  entityId: uuid("entity_id").notNull(),
  value: text("value"),
});

export const insertCustomFieldValueSchema = createInsertSchema(customFieldValues).omit({ id: true });
export type CustomFieldValue = typeof customFieldValues.$inferSelect;
export type InsertCustomFieldValue = z.infer<typeof insertCustomFieldValueSchema>;
