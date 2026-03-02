import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function fetchJSON(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || res.statusText);
  }
  if (res.status === 204) return null;
  return res.json();
}

// Generic hooks
export function useApiQuery<T>(key: string[], url: string) {
  return useQuery<T>({ queryKey: key, queryFn: () => fetchJSON(url) });
}

export function useApiMutation<T>(url: string, method: string = "POST", invalidateKeys?: string[][]) {
  const qc = useQueryClient();
  return useMutation<T, Error, any>({
    mutationFn: (body: any) => fetchJSON(url, { method, body: body ? JSON.stringify(body) : undefined }),
    onSuccess: () => {
      invalidateKeys?.forEach(k => qc.invalidateQueries({ queryKey: k }));
    },
  });
}

// ─── Dashboard ───
export function useDashboard() {
  return useApiQuery<any>(["dashboard"], "/api/dashboard");
}

// ─── Companies ───
export function useCompanies() {
  return useApiQuery<any[]>(["companies"], "/api/companies");
}
export function useCreateCompany() {
  return useApiMutation("/api/companies", "POST", [["companies"]]);
}
export function useUpdateCompany(id: string) {
  return useApiMutation(`/api/companies/${id}`, "PATCH", [["companies"]]);
}
export function useDeleteCompany(id: string) {
  return useApiMutation(`/api/companies/${id}`, "DELETE", [["companies"]]);
}

// ─── Contacts ───
export function useContacts(companyId: string) {
  return useApiQuery<any[]>(["contacts", companyId], `/api/contacts/${companyId}`);
}
export function useCreateContact() {
  return useApiMutation("/api/contacts", "POST", [["contacts"]]);
}

// ─── Addresses ───
export function useAddresses(companyId: string) {
  return useApiQuery<any[]>(["addresses", companyId], `/api/addresses/${companyId}`);
}
export function useCreateAddress() {
  return useApiMutation("/api/addresses", "POST", [["addresses"]]);
}

// ─── Items ───
export function useItems() {
  return useApiQuery<any[]>(["items"], "/api/items");
}
export function useCreateItem() {
  return useApiMutation("/api/items", "POST", [["items"]]);
}
export function useUpdateItem(id: string) {
  return useApiMutation(`/api/items/${id}`, "PATCH", [["items"]]);
}
export function useDeleteItem(id: string) {
  return useApiMutation(`/api/items/${id}`, "DELETE", [["items"]]);
}

// ─── Pricelists ───
export function usePricelists() {
  return useApiQuery<any[]>(["pricelists"], "/api/supplier-pricelists");
}
export function useCreatePricelist() {
  return useApiMutation("/api/supplier-pricelists", "POST", [["pricelists"]]);
}
export function usePriceItems(pricelistId: string) {
  return useApiQuery<any[]>(["priceItems", pricelistId], `/api/supplier-price-items/${pricelistId}`);
}
export function useCreatePriceItem() {
  return useApiMutation("/api/supplier-price-items", "POST", [["priceItems"]]);
}

// ─── Pricing Rules ───
export function usePricingRules() {
  return useApiQuery<any[]>(["pricingRules"], "/api/pricing-rules");
}
export function useCreatePricingRule() {
  return useApiMutation("/api/pricing-rules", "POST", [["pricingRules"]]);
}
export function useUpdatePricingRule(id: string) {
  return useApiMutation(`/api/pricing-rules/${id}`, "PATCH", [["pricingRules"]]);
}
export function useDeletePricingRule(id: string) {
  return useApiMutation(`/api/pricing-rules/${id}`, "DELETE", [["pricingRules"]]);
}

// ─── Orders ───
export function useOrders() {
  return useApiQuery<any[]>(["orders"], "/api/orders");
}
export function useOrder(id: string) {
  return useApiQuery<any>(["order", id], `/api/orders/${id}`);
}
export function useCreateOrder() {
  return useApiMutation("/api/order-desk", "POST", [["orders"]]);
}
export function useConfirmOrder(id: string) {
  return useApiMutation(`/api/orders/${id}/confirm`, "POST", [["orders"], ["order", id]]);
}
export function useDeleteOrder(id: string) {
  return useApiMutation(`/api/orders/${id}`, "DELETE", [["orders"]]);
}

// ─── Service Invoices ───
export function useServiceInvoices() {
  return useApiQuery<any[]>(["serviceInvoices"], "/api/service-invoices");
}

// ─── Cashbook ───
export function useCashbook() {
  return useApiQuery<any[]>(["cashbook"], "/api/cashbook");
}
export function useCashbookBalance() {
  return useApiQuery<{ balance: number }>(["cashbookBalance"], "/api/cashbook/balance");
}
export function useCreateCashbookEntry() {
  return useApiMutation("/api/cashbook", "POST", [["cashbook"], ["cashbookBalance"]]);
}
export function useDeleteCashbookEntry(id: string) {
  return useApiMutation(`/api/cashbook/${id}`, "DELETE", [["cashbook"], ["cashbookBalance"]]);
}

// ─── Email ───
export function useEmailLog() {
  return useApiQuery<any[]>(["emailLog"], "/api/email-log");
}
export function useSendEmail() {
  return useApiMutation("/api/email-hub/send", "POST", [["emailLog"]]);
}

// ─── Settings ───
export function useSettings() {
  return useApiQuery<any[]>(["settings"], "/api/settings");
}
export function useSaveSetting() {
  return useApiMutation("/api/settings", "POST", [["settings"]]);
}

// ─── Custom Fields ───
export function useCustomFieldDefs() {
  return useApiQuery<any[]>(["customFieldDefs"], "/api/custom-field-defs");
}
export function useCreateCustomFieldDef() {
  return useApiMutation("/api/custom-field-defs", "POST", [["customFieldDefs"]]);
}
