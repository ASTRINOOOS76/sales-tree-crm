import { usePricelists, useCompanies, useCreatePricelist } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus } from "lucide-react";

export default function Pricelists() {
  const { data: pricelists = [], isLoading } = usePricelists();
  const { data: companies = [] } = useCompanies();
  const createMutation = useCreatePricelist();
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ supplierId: "", name: "" });

  const suppliers = companies.filter((c: any) => c.role === "Supplier" || c.role === "Both");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(form);
    setForm({ supplierId: "", name: "" });
    setShowForm(false);
  };

  const getSupplierName = (id: string) => companies.find((c: any) => c.id === id)?.name || id;

  if (isLoading) return <div className="text-center py-10">{t("common.loading")}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("nav.pricelists")}</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> {t("common.add")}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })} required>
                <option value="">{t("company.supplier")}...</option>
                {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <Input placeholder={t("common.name")} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <div className="flex justify-end gap-2">
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
                <TableHead>{t("common.name")}</TableHead>
                <TableHead>{t("company.supplier")}</TableHead>
                <TableHead>{t("common.date")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricelists.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">{t("common.noData")}</TableCell></TableRow>
              ) : (
                pricelists.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{getSupplierName(p.supplierId)}</TableCell>
                    <TableCell>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
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
