import { useState } from "react";
import { useCompanies, useCreateCompany, useDeleteCompany } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Trash2, Search } from "lucide-react";

export default function Companies() {
  const { data: companies = [], isLoading } = useCompanies();
  const createMutation = useCreateCompany();
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", role: "Client", email: "", phone: "", vat: "", paymentTerms: "" });

  const filtered = companies.filter((c: any) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(form);
    setForm({ name: "", role: "Client", email: "", phone: "", vat: "", paymentTerms: "" });
    setShowForm(false);
  };

  const roleColor = (role: string) => {
    if (role === "Supplier") return "default";
    if (role === "Client") return "success";
    return "warning";
  };

  if (isLoading) return <div className="text-center py-10">{t("common.loading")}</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">{t("nav.companies")}</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("common.search")} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" /> {t("common.add")}
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input placeholder={t("common.name")} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="Client">{t("company.client")}</option>
                <option value="Supplier">{t("company.supplier")}</option>
                <option value="Both">{t("company.both")}</option>
              </select>
              <Input placeholder={t("common.email")} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <Input placeholder={t("common.phone")} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <Input placeholder={t("company.vat")} value={form.vat} onChange={e => setForm({ ...form, vat: e.target.value })} />
              <Input placeholder={t("company.paymentTerms")} value={form.paymentTerms} onChange={e => setForm({ ...form, paymentTerms: e.target.value })} />
              <div className="md:col-span-3 flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowForm(false)}>{t("common.cancel")}</Button>
                <Button type="submit" disabled={createMutation.isPending}>{t("common.save")}</Button>
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
                <TableHead>{t("company.role")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("common.email")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("company.vat")}</TableHead>
                <TableHead className="hidden lg:table-cell">{t("company.paymentTerms")}</TableHead>
                <TableHead className="w-20">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">{t("common.noData")}</TableCell></TableRow>
              ) : (
                filtered.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell><Badge variant={roleColor(c.role) as any}>{c.role}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell">{c.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{c.vat}</TableCell>
                    <TableCell className="hidden lg:table-cell">{c.paymentTerms}</TableCell>
                    <TableCell>
                      <DeleteButton id={c.id} />
                    </TableCell>
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

function DeleteButton({ id }: { id: string }) {
  const mutation = useDeleteCompany(id);
  return (
    <Button variant="ghost" size="icon" onClick={() => mutation.mutateAsync(null)} disabled={mutation.isPending}>
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
}
