import { useState } from "react";
import { useCompanies, useItems, useCreateOrder } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";

interface OrderLine {
  itemId: string;
  qty: string;
  costPrice: string;
  overrideType: string;
  overrideValue: string;
}

export default function OrderDesk() {
  const { data: companies = [] } = useCompanies();
  const { data: items = [] } = useItems();
  const createOrder = useCreateOrder();
  const { t } = useI18n();
  const [, navigate] = useLocation();

  const [clientId, setClientId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<OrderLine[]>([{ itemId: "", qty: "1", costPrice: "0", overrideType: "", overrideValue: "" }]);

  const clients = companies.filter((c: any) => c.role === "Client" || c.role === "Both");
  const suppliers = companies.filter((c: any) => c.role === "Supplier" || c.role === "Both");

  const addLine = () => setLines([...lines, { itemId: "", qty: "1", costPrice: "0", overrideType: "", overrideValue: "" }]);
  const removeLine = (i: number) => setLines(lines.filter((_, idx) => idx !== i));
  const updateLine = (i: number, field: string, value: string) => {
    const updated = [...lines];
    (updated[i] as any)[field] = value;
    setLines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createOrder.mutateAsync({
      clientId,
      supplierId,
      notes,
      items: lines.filter(l => l.itemId),
    });
    if (result?.order?.id) {
      navigate(`/orders/${result.order.id}`);
    } else {
      navigate("/orders");
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <ShoppingCart className="h-6 w-6" /> {t("nav.orderDesk")}
      </h2>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New Order</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">{t("company.client")}</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" value={clientId} onChange={e => setClientId(e.target.value)} required>
                  <option value="">Select...</option>
                  {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">{t("company.supplier")}</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1" value={supplierId} onChange={e => setSupplierId(e.target.value)} required>
                  <option value="">Select...</option>
                  {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Line Items</label>
                <Button type="button" variant="outline" size="sm" onClick={addLine}>
                  <Plus className="h-3 w-3 mr-1" /> Add Line
                </Button>
              </div>
              {lines.map((line, i) => (
                <div key={i} className="grid grid-cols-2 md:grid-cols-6 gap-2 p-3 bg-muted/50 rounded-lg">
                  <select className="col-span-2 flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm" value={line.itemId} onChange={e => updateLine(i, "itemId", e.target.value)}>
                    <option value="">Item...</option>
                    {items.map((it: any) => <option key={it.id} value={it.id}>{it.sku} - {it.name}</option>)}
                  </select>
                  <Input type="number" step="0.001" placeholder={t("order.qty")} value={line.qty} onChange={e => updateLine(i, "qty", e.target.value)} className="h-9" />
                  <Input type="number" step="0.01" placeholder={t("order.costPrice")} value={line.costPrice} onChange={e => updateLine(i, "costPrice", e.target.value)} className="h-9" />
                  <select className="flex h-9 rounded-md border border-input bg-background px-2 py-1 text-sm" value={line.overrideType} onChange={e => updateLine(i, "overrideType", e.target.value)}>
                    <option value="">No Override</option>
                    <option value="PERCENT">% Markup</option>
                    <option value="SELL_PRICE">Fixed Sell</option>
                  </select>
                  <div className="flex gap-1">
                    {line.overrideType && (
                      <Input type="number" step="0.01" placeholder="Value" value={line.overrideValue} onChange={e => updateLine(i, "overrideValue", e.target.value)} className="h-9" />
                    )}
                    {lines.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeLine(i)} className="h-9 w-9 shrink-0">
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Input placeholder="Notes..." value={notes} onChange={e => setNotes(e.target.value)} />

            <div className="flex justify-end">
              <Button type="submit" disabled={createOrder.isPending}>
                <ShoppingCart className="h-4 w-4 mr-2" /> Create Order
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
