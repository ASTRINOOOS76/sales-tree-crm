import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "./db.js";
import {
  companies, contacts, addresses, items,
  supplierPricelists, supplierPriceItems,
  pricingRules, orders, orderItems,
  serviceInvoices, cashbook, emailLog,
  documents, appSettings, customFieldDefs, customFieldValues,
  type Company, type InsertCompany,
  type Contact, type InsertContact,
  type Address, type InsertAddress,
  type Item, type InsertItem,
  type SupplierPricelist, type InsertSupplierPricelist,
  type SupplierPriceItem, type InsertSupplierPriceItem,
  type PricingRule, type InsertPricingRule,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type ServiceInvoice, type InsertServiceInvoice,
  type CashbookEntry, type InsertCashbookEntry,
  type CustomFieldDef, type InsertCustomFieldDef,
  type CustomFieldValue, type InsertCustomFieldValue,
} from "../shared/schema.js";

export interface IStorage {
  // Companies
  getCompanies(): Promise<Company[]>;
  getCompany(id: string): Promise<Company | undefined>;
  createCompany(data: InsertCompany): Promise<Company>;
  updateCompany(id: string, data: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: string): Promise<boolean>;

  // Contacts
  getContacts(companyId: string): Promise<Contact[]>;
  createContact(data: InsertContact): Promise<Contact>;
  updateContact(id: string, data: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: string): Promise<boolean>;

  // Addresses
  getAddresses(companyId: string): Promise<Address[]>;
  createAddress(data: InsertAddress): Promise<Address>;
  updateAddress(id: string, data: Partial<InsertAddress>): Promise<Address | undefined>;
  deleteAddress(id: string): Promise<boolean>;

  // Items
  getItems(): Promise<Item[]>;
  getItem(id: string): Promise<Item | undefined>;
  createItem(data: InsertItem): Promise<Item>;
  updateItem(id: string, data: Partial<InsertItem>): Promise<Item | undefined>;
  deleteItem(id: string): Promise<boolean>;

  // Supplier Pricelists
  getSupplierPricelists(): Promise<SupplierPricelist[]>;
  createSupplierPricelist(data: InsertSupplierPricelist): Promise<SupplierPricelist>;
  updateSupplierPricelist(id: string, data: Partial<InsertSupplierPricelist>): Promise<SupplierPricelist | undefined>;
  deleteSupplierPricelist(id: string): Promise<boolean>;

  // Supplier Price Items
  getSupplierPriceItems(pricelistId: string): Promise<SupplierPriceItem[]>;
  createSupplierPriceItem(data: InsertSupplierPriceItem): Promise<SupplierPriceItem>;
  deleteSupplierPriceItem(id: string): Promise<boolean>;

  // Pricing Rules
  getPricingRules(): Promise<PricingRule[]>;
  getPricingRuleLookup(clientId: string, supplierId: string): Promise<PricingRule | undefined>;
  createPricingRule(data: InsertPricingRule): Promise<PricingRule>;
  updatePricingRule(id: string, data: Partial<InsertPricingRule>): Promise<PricingRule | undefined>;
  deletePricingRule(id: string): Promise<boolean>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(data: InsertOrder): Promise<Order>;
  updateOrder(id: string, data: Partial<InsertOrder>): Promise<Order | undefined>;
  deleteOrder(id: string): Promise<boolean>;

  // Order Items
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(data: InsertOrderItem): Promise<OrderItem>;
  updateOrderItem(id: string, data: Partial<InsertOrderItem>): Promise<OrderItem | undefined>;

  // Service Invoices
  getServiceInvoices(): Promise<ServiceInvoice[]>;
  updateServiceInvoice(id: string, data: Partial<InsertServiceInvoice>): Promise<ServiceInvoice | undefined>;

  // Cashbook
  getCashbook(): Promise<CashbookEntry[]>;
  createCashbookEntry(data: InsertCashbookEntry): Promise<CashbookEntry>;
  deleteCashbookEntry(id: string): Promise<boolean>;
  getCashbookBalance(): Promise<number>;

  // Email Log
  getEmailLog(): Promise<any[]>;
  createEmailLog(data: any): Promise<any>;

  // Documents
  getDocuments(): Promise<any[]>;
  createDocument(data: any): Promise<any>;

  // Settings
  getSettings(): Promise<any[]>;
  getSetting(key: string): Promise<string | null>;
  setSetting(key: string, value: string): Promise<void>;

  // Custom Fields
  getCustomFieldDefs(): Promise<CustomFieldDef[]>;
  createCustomFieldDef(data: InsertCustomFieldDef): Promise<CustomFieldDef>;
  updateCustomFieldDef(id: string, data: Partial<InsertCustomFieldDef>): Promise<CustomFieldDef | undefined>;
  deleteCustomFieldDef(id: string): Promise<boolean>;
  getCustomFieldValues(entityId: string): Promise<CustomFieldValue[]>;
  setCustomFieldValue(data: InsertCustomFieldValue): Promise<CustomFieldValue>;

  // Dashboard
  getDashboard(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // ─── Companies ───
  async getCompanies() {
    return db.select().from(companies).orderBy(desc(companies.createdAt));
  }
  async getCompany(id: string) {
    const [c] = await db.select().from(companies).where(eq(companies.id, id));
    return c;
  }
  async createCompany(data: InsertCompany) {
    const [c] = await db.insert(companies).values(data).returning();
    return c;
  }
  async updateCompany(id: string, data: Partial<InsertCompany>) {
    const [c] = await db.update(companies).set(data).where(eq(companies.id, id)).returning();
    return c;
  }
  async deleteCompany(id: string) {
    const r = await db.delete(companies).where(eq(companies.id, id));
    return true;
  }

  // ─── Contacts ───
  async getContacts(companyId: string) {
    return db.select().from(contacts).where(eq(contacts.companyId, companyId));
  }
  async createContact(data: InsertContact) {
    const [c] = await db.insert(contacts).values(data).returning();
    return c;
  }
  async updateContact(id: string, data: Partial<InsertContact>) {
    const [c] = await db.update(contacts).set(data).where(eq(contacts.id, id)).returning();
    return c;
  }
  async deleteContact(id: string) {
    await db.delete(contacts).where(eq(contacts.id, id));
    return true;
  }

  // ─── Addresses ───
  async getAddresses(companyId: string) {
    return db.select().from(addresses).where(eq(addresses.companyId, companyId));
  }
  async createAddress(data: InsertAddress) {
    const [a] = await db.insert(addresses).values(data).returning();
    return a;
  }
  async updateAddress(id: string, data: Partial<InsertAddress>) {
    const [a] = await db.update(addresses).set(data).where(eq(addresses.id, id)).returning();
    return a;
  }
  async deleteAddress(id: string) {
    await db.delete(addresses).where(eq(addresses.id, id));
    return true;
  }

  // ─── Items ───
  async getItems() {
    return db.select().from(items).orderBy(desc(items.createdAt));
  }
  async getItem(id: string) {
    const [i] = await db.select().from(items).where(eq(items.id, id));
    return i;
  }
  async createItem(data: InsertItem) {
    const [i] = await db.insert(items).values(data).returning();
    return i;
  }
  async updateItem(id: string, data: Partial<InsertItem>) {
    const [i] = await db.update(items).set(data).where(eq(items.id, id)).returning();
    return i;
  }
  async deleteItem(id: string) {
    await db.delete(items).where(eq(items.id, id));
    return true;
  }

  // ─── Supplier Pricelists ───
  async getSupplierPricelists() {
    return db.select().from(supplierPricelists).orderBy(desc(supplierPricelists.createdAt));
  }
  async createSupplierPricelist(data: InsertSupplierPricelist) {
    const [p] = await db.insert(supplierPricelists).values(data).returning();
    return p;
  }
  async updateSupplierPricelist(id: string, data: Partial<InsertSupplierPricelist>) {
    const [p] = await db.update(supplierPricelists).set(data).where(eq(supplierPricelists.id, id)).returning();
    return p;
  }
  async deleteSupplierPricelist(id: string) {
    await db.delete(supplierPricelists).where(eq(supplierPricelists.id, id));
    return true;
  }

  // ─── Supplier Price Items ───
  async getSupplierPriceItems(pricelistId: string) {
    return db.select().from(supplierPriceItems).where(eq(supplierPriceItems.pricelistId, pricelistId));
  }
  async createSupplierPriceItem(data: InsertSupplierPriceItem) {
    const [i] = await db.insert(supplierPriceItems).values(data).returning();
    return i;
  }
  async deleteSupplierPriceItem(id: string) {
    await db.delete(supplierPriceItems).where(eq(supplierPriceItems.id, id));
    return true;
  }

  // ─── Pricing Rules ───
  async getPricingRules() {
    return db.select().from(pricingRules).orderBy(desc(pricingRules.createdAt));
  }
  async getPricingRuleLookup(clientId: string, supplierId: string) {
    const [r] = await db.select().from(pricingRules)
      .where(and(eq(pricingRules.clientId, clientId), eq(pricingRules.supplierId, supplierId)));
    return r;
  }
  async createPricingRule(data: InsertPricingRule) {
    const [r] = await db.insert(pricingRules).values(data).returning();
    return r;
  }
  async updatePricingRule(id: string, data: Partial<InsertPricingRule>) {
    const [r] = await db.update(pricingRules).set(data).where(eq(pricingRules.id, id)).returning();
    return r;
  }
  async deletePricingRule(id: string) {
    await db.delete(pricingRules).where(eq(pricingRules.id, id));
    return true;
  }

  // ─── Orders ───
  async getOrders() {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }
  async getOrder(id: string) {
    const [o] = await db.select().from(orders).where(eq(orders.id, id));
    return o;
  }
  async createOrder(data: InsertOrder) {
    const [o] = await db.insert(orders).values(data).returning();
    return o;
  }
  async updateOrder(id: string, data: Partial<InsertOrder>) {
    const [o] = await db.update(orders).set(data).where(eq(orders.id, id)).returning();
    return o;
  }
  async deleteOrder(id: string) {
    await db.delete(orders).where(eq(orders.id, id));
    return true;
  }

  // ─── Order Items ───
  async getOrderItems(orderId: string) {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }
  async createOrderItem(data: InsertOrderItem) {
    const [i] = await db.insert(orderItems).values(data).returning();
    return i;
  }
  async updateOrderItem(id: string, data: Partial<InsertOrderItem>) {
    const [i] = await db.update(orderItems).set(data).where(eq(orderItems.id, id)).returning();
    return i;
  }

  // ─── Service Invoices ───
  async getServiceInvoices() {
    return db.select().from(serviceInvoices).orderBy(desc(serviceInvoices.createdAt));
  }
  async updateServiceInvoice(id: string, data: Partial<InsertServiceInvoice>) {
    const [i] = await db.update(serviceInvoices).set(data).where(eq(serviceInvoices.id, id)).returning();
    return i;
  }

  // ─── Cashbook ───
  async getCashbook() {
    return db.select().from(cashbook).orderBy(desc(cashbook.createdAt));
  }
  async createCashbookEntry(data: InsertCashbookEntry) {
    const [e] = await db.insert(cashbook).values(data).returning();
    return e;
  }
  async deleteCashbookEntry(id: string) {
    await db.delete(cashbook).where(eq(cashbook.id, id));
    return true;
  }
  async getCashbookBalance() {
    const entries = await db.select().from(cashbook);
    return entries.reduce((sum, e) => {
      const amt = parseFloat(String(e.amount));
      return sum + (e.type === "IN" ? amt : -amt);
    }, 0);
  }

  // ─── Email Log ───
  async getEmailLog() {
    return db.select().from(emailLog).orderBy(desc(emailLog.sentAt));
  }
  async createEmailLog(data: any) {
    const [e] = await db.insert(emailLog).values(data).returning();
    return e;
  }

  // ─── Documents ───
  async getDocuments() {
    return db.select().from(documents).orderBy(desc(documents.createdAt));
  }
  async createDocument(data: any) {
    const [d] = await db.insert(documents).values(data).returning();
    return d;
  }

  // ─── Settings ───
  async getSettings() {
    return db.select().from(appSettings);
  }
  async getSetting(key: string) {
    const [s] = await db.select().from(appSettings).where(eq(appSettings.key, key));
    return s?.value ?? null;
  }
  async setSetting(key: string, value: string) {
    await db.insert(appSettings).values({ key, value })
      .onConflictDoUpdate({ target: appSettings.key, set: { value } });
  }

  // ─── Custom Fields ───
  async getCustomFieldDefs() {
    return db.select().from(customFieldDefs).orderBy(desc(customFieldDefs.createdAt));
  }
  async createCustomFieldDef(data: InsertCustomFieldDef) {
    const [d] = await db.insert(customFieldDefs).values(data).returning();
    return d;
  }
  async updateCustomFieldDef(id: string, data: Partial<InsertCustomFieldDef>) {
    const [d] = await db.update(customFieldDefs).set(data).where(eq(customFieldDefs.id, id)).returning();
    return d;
  }
  async deleteCustomFieldDef(id: string) {
    await db.delete(customFieldDefs).where(eq(customFieldDefs.id, id));
    return true;
  }
  async getCustomFieldValues(entityId: string) {
    return db.select().from(customFieldValues).where(eq(customFieldValues.entityId, entityId));
  }
  async setCustomFieldValue(data: InsertCustomFieldValue) {
    const [v] = await db.insert(customFieldValues).values(data).returning();
    return v;
  }

  // ─── Dashboard ───
  async getDashboard() {
    const [orderCount] = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const [companyCount] = await db.select({ count: sql<number>`count(*)` }).from(companies);
    const [itemCount] = await db.select({ count: sql<number>`count(*)` }).from(items);
    const recentOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5);
    const balance = await this.getCashbookBalance();
    return {
      totalOrders: Number(orderCount.count),
      totalCompanies: Number(companyCount.count),
      totalItems: Number(itemCount.count),
      cashBalance: balance,
      recentOrders,
    };
  }
}

export const storage = new DatabaseStorage();
