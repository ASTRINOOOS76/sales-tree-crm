import { usePricingRules, useCompanies, useCreatePricingRule, useDeletePricingRule } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

export default function PricingRules() {
  const { data: rules = [], isLoading } = usePricingRules();
  const { data: companies = [] } = useCompanies();
  const createMutation = useCreatePricingRule();
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ clientId: "", supplierId: "", markupType: "PERCENT", markupValue: "10" });

  const clients = companies.filter((c: any) => c.role === "Client" || c.role === "Both");
  const suppliers = companies.filter((c: any) => c.role === "Supplier" || c.role === "Both");
  const getName = (id: string) => companies.find((c: any) => c.id === id)?.name || id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(form);
    setForm({ clientId: "", supplierId: "", markupType: "PERCENT", markupValue: "10" });
    setShowForm(false);
  };

  if (isLoading) return <div className="text-center py-10">{t("common.loading")}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("nav.pricingRules")}</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> {t("common.add")}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} required>
                <option value="">{t("company.client")}...</option>
                {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })} required>
                <option value="">{t("company.supplier")}...</option>
                {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.markupType} onChange={e => setForm({ ...form, markupType: e.target.value })}>
                <option value="PERCENT">PERCENT (%)</option>
                <option value="FIXED">FIXED (€)</option>
              </select>
              <Input type="number" step="0.01" placeholder="Value" value={form.markupValue} onChange={e => setForm({ ...form, markupValue: e.target.value })} required />
              <div className="md:col-span-4 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowForm(false)}>{t("common.cancel")}</Button>
                <Button type="submit">{t("common.save")}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("company.client")}</TableHead>
                <TableHead>{t("company.supplier")}</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead className="w-20">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">{t("common.noData")}</TableCell></TableRow>
              ) : (
                rules.map((r: any) => (
                  <TableRow key={r.id}>
                    <TableCell>{getName(r.clientId)}</TableCell>
                    <TableCell>{getName(r.supplierId)}</TableCell>
                    <TableCell><Badge variant="outline">{r.markupType}</Badge></TableCell>
                    <TableCell>{r.markupType === "PERCENT" ? `${r.markupValue}%` : `€${r.markupValue}`}</TableCell>
                    <TableCell><RuleDeleteBtn id={r.id} /></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function RuleDeleteBtn({ id }: { id: string }) {
  const m = useDeletePricingRule(id);
  return (
    <Button variant="ghost" size="icon" onClick={() => m.mutateAsync(null)} disabled={m.isPending}>
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
}
