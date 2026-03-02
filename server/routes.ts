import { Router, Request, Response } from "express";
import { storage } from "./storage.js";
import { pickTierCostPrice, computeSellPrice, computeServiceFee, computeLineMargin, applyOverride } from "../shared/pricing.js";
import { v4 as uuidv4 } from "uuid";

export function registerRoutes(app: Router) {
  const r = Router();

  // ─── Dashboard ───
  r.get("/dashboard", async (_req: Request, res: Response) => {
    const data = await storage.getDashboard();
    res.json(data);
  });

  // ─── Companies ───
  r.get("/companies", async (_req, res) => {
    res.json(await storage.getCompanies());
  });
  r.post("/companies", async (req, res) => {
    const c = await storage.createCompany(req.body);
    res.status(201).json(c);
  });
  r.patch("/companies/:id", async (req, res) => {
    const c = await storage.updateCompany(req.params.id, req.body);
    c ? res.json(c) : res.status(404).json({ error: "Not found" });
  });
  r.delete("/companies/:id", async (req, res) => {
    await storage.deleteCompany(req.params.id);
    res.status(204).end();
  });

  // ─── Contacts ───
  r.get("/contacts/:companyId", async (req, res) => {
    res.json(await storage.getContacts(req.params.companyId));
  });
  r.post("/contacts", async (req, res) => {
    const c = await storage.createContact(req.body);
    res.status(201).json(c);
  });
  r.patch("/contacts/:id", async (req, res) => {
    const c = await storage.updateContact(req.params.id, req.body);
    c ? res.json(c) : res.status(404).json({ error: "Not found" });
  });
  r.delete("/contacts/:id", async (req, res) => {
    await storage.deleteContact(req.params.id);
    res.status(204).end();
  });

  // ─── Addresses ───
  r.get("/addresses/:companyId", async (req, res) => {
    res.json(await storage.getAddresses(req.params.companyId));
  });
  r.post("/addresses", async (req, res) => {
    const a = await storage.createAddress(req.body);
    res.status(201).json(a);
  });
  r.patch("/addresses/:id", async (req, res) => {
    const a = await storage.updateAddress(req.params.id, req.body);
    a ? res.json(a) : res.status(404).json({ error: "Not found" });
  });
  r.delete("/addresses/:id", async (req, res) => {
    await storage.deleteAddress(req.params.id);
    res.status(204).end();
  });

  // ─── Items ───
  r.get("/items", async (_req, res) => {
    res.json(await storage.getItems());
  });
  r.post("/items", async (req, res) => {
    const i = await storage.createItem(req.body);
    res.status(201).json(i);
  });
  r.patch("/items/:id", async (req, res) => {
    const i = await storage.updateItem(req.params.id, req.body);
    i ? res.json(i) : res.status(404).json({ error: "Not found" });
  });
  r.delete("/items/:id", async (req, res) => {
    await storage.deleteItem(req.params.id);
    res.status(204).end();
  });

  // ─── Supplier Pricelists ───
  r.get("/supplier-pricelists", async (_req, res) => {
    res.json(await storage.getSupplierPricelists());
  });
  r.post("/supplier-pricelists", async (req, res) => {
    const p = await storage.createSupplierPricelist(req.body);
    res.status(201).json(p);
  });
  r.patch("/supplier-pricelists/:id", async (req, res) => {
    const p = await storage.updateSupplierPricelist(req.params.id, req.body);
    p ? res.json(p) : res.status(404).json({ error: "Not found" });
  });
  r.delete("/supplier-pricelists/:id", async (req, res) => {
    await storage.deleteSupplierPricelist(req.params.id);
    res.status(204).end();
  });

  // ─── Supplier Price Items ───
  r.get("/supplier-price-items/:pricelistId", async (req, res) => {
    res.json(await storage.getSupplierPriceItems(req.params.pricelistId));
  });
  r.post("/supplier-price-items", async (req, res) => {
    const i = await storage.createSupplierPriceItem(req.body);
    res.status(201).json(i);
  });
  r.delete("/supplier-price-items/:id", async (req, res) => {
    await storage.deleteSupplierPriceItem(req.params.id);
    res.status(204).end();
  });

  // ─── Pricing Rules ───
  r.get("/pricing-rules", async (_req, res) => {
    res.json(await storage.getPricingRules());
  });
  r.get("/pricing-rules/lookup", async (req, res) => {
    const { clientId, supplierId } = req.query;
    if (!clientId || !supplierId) return res.status(400).json({ error: "clientId and supplierId required" });
    const rule = await storage.getPricingRuleLookup(clientId as string, supplierId as string);
    rule ? res.json(rule) : res.status(404).json({ error: "No rule found" });
  });
  r.post("/pricing-rules", async (req, res) => {
    const rule = await storage.createPricingRule(req.body);
    res.status(201).json(rule);
  });
  r.patch("/pricing-rules/:id", async (req, res) => {
    const rule = await storage.updatePricingRule(req.params.id, req.body);
    rule ? res.json(rule) : res.status(404).json({ error: "Not found" });
  });
  r.delete("/pricing-rules/:id", async (req, res) => {
    await storage.deletePricingRule(req.params.id);
    res.status(204).end();
  });

  // ─── Order Desk ───
  r.post("/order-desk", async (req, res) => {
    try {
      const { clientId, supplierId, items: orderItemsInput, notes, minServiceFee = 0 } = req.body;
      
      // Generate order number
      const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
      
      // Get pricing rule
      const rule = await storage.getPricingRuleLookup(clientId, supplierId);
      
      // Build line items
      const lineItems: any[] = [];
      let totalCost = 0, totalSell = 0;
      
      for (const oi of orderItemsInput) {
        const item = await storage.getItem(oi.itemId);
        if (!item) continue;
        
        const costPrice = parseFloat(oi.costPrice || "0");
        let sellPrice = costPrice;
        
        if (rule) {
          sellPrice = computeSellPrice(costPrice, rule.markupType as "PERCENT" | "FIXED", parseFloat(String(rule.markupValue)));
        }

        // Apply per-item overrides
        sellPrice = applyOverride(costPrice, oi.overrideType, oi.overrideValue ? parseFloat(oi.overrideValue) : null, sellPrice);
        
        const qty = parseFloat(oi.qty);
        const margin = computeLineMargin(costPrice, sellPrice, qty);
        
        lineItems.push({
          itemId: oi.itemId,
          itemName: item.name,
          sku: item.sku,
          qty: String(qty),
          unit: item.unit,
          costPrice: String(costPrice),
          sellPrice: String(sellPrice),
          margin: String(margin),
          overrideType: oi.overrideType || null,
          overrideValue: oi.overrideValue ? String(oi.overrideValue) : null,
        });
        
        totalCost += costPrice * qty;
        totalSell += sellPrice * qty;
      }
      
      const totalMargin = totalSell - totalCost;
      const serviceFee = computeServiceFee(
        lineItems.map(li => ({ qty: parseFloat(li.qty), costPrice: parseFloat(li.costPrice), sellPrice: parseFloat(li.sellPrice) })),
        minServiceFee
      );
      
      // Create order
      const order = await storage.createOrder({
        orderNumber,
        clientId,
        supplierId,
        status: "Draft",
        totalCost: String(totalCost),
        totalSell: String(totalSell),
        totalMargin: String(totalMargin),
        serviceFee: String(serviceFee),
        minServiceFee: String(minServiceFee),
        notes,
      });
      
      // Create order items
      for (const li of lineItems) {
        await storage.createOrderItem({ ...li, orderId: order.id });
      }
      
      // Create service invoice
      const invoiceNumber = `SVC-${Date.now().toString(36).toUpperCase()}`;
      // We don't import serviceInvoices directly, we use storage
      
      res.status(201).json({ order, items: lineItems });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ─── Orders ───
  r.get("/orders", async (_req, res) => {
    res.json(await storage.getOrders());
  });
  r.get("/orders/:id", async (req, res) => {
    const order = await storage.getOrder(req.params.id);
    if (!order) return res.status(404).json({ error: "Not found" });
    const items = await storage.getOrderItems(req.params.id);
    const client = await storage.getCompany(order.clientId);
    const supplier = await storage.getCompany(order.supplierId);
    res.json({ ...order, items, client, supplier });
  });
  r.delete("/orders/:id", async (req, res) => {
    await storage.deleteOrder(req.params.id);
    res.status(204).end();
  });

  // ─── Order Item Update (inline edit sell price) ───
  r.patch("/orders/:orderId/items/:itemId", async (req, res) => {
    try {
      const { sellPrice } = req.body;
      const item = await storage.updateOrderItem(req.params.itemId, {
        sellPrice: String(sellPrice),
        margin: String(parseFloat(sellPrice) - parseFloat((await storage.getOrderItems(req.params.orderId)).find(i => i.id === req.params.itemId)?.costPrice || "0")),
      });
      
      // Recalculate order totals
      const orderItems = await storage.getOrderItems(req.params.orderId);
      let totalCost = 0, totalSell = 0;
      for (const oi of orderItems) {
        const qty = parseFloat(String(oi.qty));
        totalCost += parseFloat(String(oi.costPrice)) * qty;
        totalSell += parseFloat(String(oi.sellPrice)) * qty;
      }
      const totalMargin = totalSell - totalCost;
      const order = await storage.getOrder(req.params.orderId);
      const serviceFee = computeServiceFee(
        orderItems.map(li => ({ qty: parseFloat(String(li.qty)), costPrice: parseFloat(String(li.costPrice)), sellPrice: parseFloat(String(li.sellPrice)) })),
        parseFloat(String(order?.minServiceFee || "0"))
      );
      await storage.updateOrder(req.params.orderId, {
        totalCost: String(totalCost),
        totalSell: String(totalSell),
        totalMargin: String(totalMargin),
        serviceFee: String(serviceFee),
      });
      
      res.json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ─── Order Actions ───
  r.post("/orders/:id/confirm", async (req, res) => {
    const order = await storage.updateOrder(req.params.id, { status: "Confirmed", confirmedAt: new Date() } as any);
    order ? res.json(order) : res.status(404).json({ error: "Not found" });
  });

  // ─── Service Invoices ───
  r.get("/service-invoices", async (_req, res) => {
    res.json(await storage.getServiceInvoices());
  });
  r.patch("/service-invoices/:id", async (req, res) => {
    const i = await storage.updateServiceInvoice(req.params.id, req.body);
    i ? res.json(i) : res.status(404).json({ error: "Not found" });
  });

  // ─── Cashbook ───
  r.get("/cashbook", async (_req, res) => {
    res.json(await storage.getCashbook());
  });
  r.post("/cashbook", async (req, res) => {
    res.status(201).json(await storage.createCashbookEntry(req.body));
  });
  r.delete("/cashbook/:id", async (req, res) => {
    await storage.deleteCashbookEntry(req.params.id);
    res.status(204).end();
  });
  r.get("/cashbook/balance", async (_req, res) => {
    res.json({ balance: await storage.getCashbookBalance() });
  });

  // ─── Email Hub ───
  r.get("/email-log", async (_req, res) => {
    res.json(await storage.getEmailLog());
  });
  r.post("/email-hub/send", async (req, res) => {
    try {
      // Simple SMTP send (uses env vars)
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const { to, subject, body, attachments } = req.body;
      
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html: body,
        attachments: attachments || [],
      });

      const log = await storage.createEmailLog({ to, subject, body, status: "sent" });
      res.json(log);
    } catch (err: any) {
      await storage.createEmailLog({ to: req.body.to, subject: req.body.subject, body: req.body.body, status: "failed", error: err.message });
      res.status(500).json({ error: err.message });
    }
  });

  r.get("/smtp-status", async (_req, res) => {
    res.json({ configured: !!(process.env.SMTP_HOST && process.env.SMTP_USER) });
  });

  // ─── Documents ───
  r.get("/documents", async (_req, res) => {
    res.json(await storage.getDocuments());
  });

  // ─── Settings ───
  r.get("/settings", async (_req, res) => {
    res.json(await storage.getSettings());
  });
  r.get("/settings/:key", async (req, res) => {
    const val = await storage.getSetting(req.params.key);
    res.json({ key: req.params.key, value: val });
  });
  r.post("/settings", async (req, res) => {
    const { key, value } = req.body;
    await storage.setSetting(key, value);
    res.json({ key, value });
  });

  // ─── Logo Upload ───
  r.post("/upload-logo", async (req, res) => {
    try {
      const chunks: Buffer[] = [];
      req.on("data", (chunk: Buffer) => chunks.push(chunk));
      req.on("end", async () => {
        const buffer = Buffer.concat(chunks);
        const base64 = buffer.toString("base64");
        await storage.setSetting("company_logo", `data:image/png;base64,${base64}`);
        res.json({ success: true });
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ─── Custom Fields ───
  r.get("/custom-field-defs", async (_req, res) => {
    res.json(await storage.getCustomFieldDefs());
  });
  r.post("/custom-field-defs", async (req, res) => {
    res.status(201).json(await storage.createCustomFieldDef(req.body));
  });
  r.patch("/custom-field-defs/:id", async (req, res) => {
    const d = await storage.updateCustomFieldDef(req.params.id, req.body);
    d ? res.json(d) : res.status(404).json({ error: "Not found" });
  });
  r.delete("/custom-field-defs/:id", async (req, res) => {
    await storage.deleteCustomFieldDef(req.params.id);
    res.status(204).end();
  });
  r.get("/custom-field-values/:entityId", async (req, res) => {
    res.json(await storage.getCustomFieldValues(req.params.entityId));
  });
  r.post("/custom-field-values", async (req, res) => {
    res.status(201).json(await storage.setCustomFieldValue(req.body));
  });

  app.use("/api", r);
}
