import { useState, useCallback } from "react";

type Lang = "en" | "el";

const translations: Record<string, Record<Lang, string>> = {
  // Navigation
  "nav.dashboard": { en: "Dashboard", el: "Πίνακας Ελέγχου" },
  "nav.companies": { en: "Companies", el: "Εταιρείες" },
  "nav.items": { en: "Items", el: "Προϊόντα" },
  "nav.pricelists": { en: "Pricelists", el: "Τιμοκατάλογοι" },
  "nav.pricingRules": { en: "Pricing Rules", el: "Κανόνες Τιμολόγησης" },
  "nav.orderDesk": { en: "Order Desk", el: "Γραφείο Παραγγελιών" },
  "nav.orders": { en: "Orders", el: "Παραγγελίες" },
  "nav.serviceInvoices": { en: "Service Invoices", el: "Τιμολόγια Υπηρεσιών" },
  "nav.cashbook": { en: "Cashbook", el: "Ταμείο" },
  "nav.emailHub": { en: "Email Hub", el: "Email" },
  "nav.settings": { en: "Settings", el: "Ρυθμίσεις" },

  // Common
  "common.add": { en: "Add", el: "Προσθήκη" },
  "common.edit": { en: "Edit", el: "Επεξεργασία" },
  "common.delete": { en: "Delete", el: "Διαγραφή" },
  "common.save": { en: "Save", el: "Αποθήκευση" },
  "common.cancel": { en: "Cancel", el: "Ακύρωση" },
  "common.search": { en: "Search...", el: "Αναζήτηση..." },
  "common.loading": { en: "Loading...", el: "Φόρτωση..." },
  "common.noData": { en: "No data", el: "Δεν υπάρχουν δεδομένα" },
  "common.name": { en: "Name", el: "Όνομα" },
  "common.email": { en: "Email", el: "Email" },
  "common.phone": { en: "Phone", el: "Τηλέφωνο" },
  "common.actions": { en: "Actions", el: "Ενέργειες" },
  "common.status": { en: "Status", el: "Κατάσταση" },
  "common.date": { en: "Date", el: "Ημερομηνία" },
  "common.amount": { en: "Amount", el: "Ποσό" },
  "common.total": { en: "Total", el: "Σύνολο" },
  "common.confirm": { en: "Confirm", el: "Επιβεβαίωση" },
  "common.send": { en: "Send", el: "Αποστολή" },
  "common.download": { en: "Download", el: "Λήψη" },
  "common.close": { en: "Close", el: "Κλείσιμο" },

  // Dashboard
  "dash.totalOrders": { en: "Total Orders", el: "Σύνολο Παραγγελιών" },
  "dash.totalCompanies": { en: "Total Companies", el: "Σύνολο Εταιρειών" },
  "dash.totalItems": { en: "Total Items", el: "Σύνολο Προϊόντων" },
  "dash.cashBalance": { en: "Cash Balance", el: "Υπόλοιπο Ταμείου" },
  "dash.recentOrders": { en: "Recent Orders", el: "Πρόσφατες Παραγγελίες" },

  // Companies
  "company.role": { en: "Role", el: "Ρόλος" },
  "company.supplier": { en: "Supplier", el: "Προμηθευτής" },
  "company.client": { en: "Client", el: "Πελάτης" },
  "company.both": { en: "Both", el: "Και τα δύο" },
  "company.vat": { en: "VAT", el: "ΑΦΜ" },
  "company.paymentTerms": { en: "Payment Terms", el: "Όροι Πληρωμής" },
  "company.contacts": { en: "Contacts", el: "Επαφές" },
  "company.addresses": { en: "Addresses", el: "Διευθύνσεις" },

  // Items
  "item.sku": { en: "SKU", el: "Κωδικός" },
  "item.unit": { en: "Unit", el: "Μονάδα" },
  "item.packSize": { en: "Pack Size", el: "Μέγεθος Συσκ." },

  // Orders
  "order.orderNumber": { en: "Order #", el: "Αρ. Παραγγελίας" },
  "order.client": { en: "Client", el: "Πελάτης" },
  "order.supplier": { en: "Supplier", el: "Προμηθευτής" },
  "order.totalCost": { en: "Total Cost", el: "Συνολικό Κόστος" },
  "order.totalSell": { en: "Total Sell", el: "Συνολική Πώληση" },
  "order.margin": { en: "Margin", el: "Κέρδος" },
  "order.serviceFee": { en: "Service Fee", el: "Αμοιβή Υπηρεσίας" },
  "order.draft": { en: "Draft", el: "Πρόχειρη" },
  "order.confirmed": { en: "Confirmed", el: "Επιβεβαιωμένη" },
  "order.qty": { en: "Qty", el: "Ποσ." },
  "order.costPrice": { en: "Cost Price", el: "Τιμή Κόστους" },
  "order.sellPrice": { en: "Sell Price", el: "Τιμή Πώλησης" },
  "order.unitPrice": { en: "Unit Price", el: "Τιμή Μονάδας" },

  // Cashbook
  "cash.in": { en: "Income", el: "Είσπραξη" },
  "cash.out": { en: "Expense", el: "Πληρωμή" },
  "cash.description": { en: "Description", el: "Περιγραφή" },
  "cash.balance": { en: "Balance", el: "Υπόλοιπο" },

  // Settings
  "settings.companyInfo": { en: "Company Info", el: "Στοιχεία Εταιρείας" },
  "settings.logo": { en: "Logo", el: "Λογότυπο" },
  "settings.customFields": { en: "Custom Fields", el: "Προσαρμοσμένα Πεδία" },
};

let currentLang: Lang = "en";

export function t(key: string): string {
  return translations[key]?.[currentLang] || key;
}

export function setLanguage(lang: Lang) {
  currentLang = lang;
}

export function getLanguage(): Lang {
  return currentLang;
}

export function useI18n() {
  const [lang, setLang] = useState<Lang>(currentLang);

  const toggleLanguage = useCallback(() => {
    const next = lang === "en" ? "el" : "en";
    setLanguage(next);
    setLang(next);
  }, [lang]);

  const translate = useCallback((key: string) => {
    return translations[key]?.[lang] || key;
  }, [lang]);

  return { lang, toggleLanguage, t: translate };
}
