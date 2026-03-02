import { useState } from "react";
import { useItems, useCreateItem, useDeleteItem } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Trash2, Search } from "lucide-react";

export default function Items() {
  const { data: items = [], isLoading } = useItems();
  const createMutation = useCreateItem();
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ sku: "", name: "", unit: "KG", packSize: "", description: "" });

  const filtered = items.filter((i: any) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(form);
    setForm({ sku: "", name: "", unit: "KG", packSize: "", description: "" });
    setShowForm(false);
  };

  if (isLoading) return <div className="text-center py-10">{t("common.loading")}</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">{t("nav.items")}</h2>
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
              <Input placeholder={t("item.sku")} value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} required />
              <Input placeholder={t("common.name")} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                <option value="KG">KG</option>
                <option value="LT">LT</option>
                <option value="PC">PC</option>
                <option value="BOX">BOX</option>
              </select>
              <Input placeholder={t("item.packSize")} value={form.packSize} onChange={e => setForm({ ...form, packSize: e.target.value })} />
              <Input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="md:col-span-2" />
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
                <TableHead>{t("item.sku")}</TableHead>
                <TableHead>{t("common.name")}</TableHead>
                <TableHead>{t("item.unit")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("item.packSize")}</TableHead>
                <TableHead className="w-20">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">{t("common.noData")}</TableCell></TableRow>
              ) : (
                filtered.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="hidden md:table-cell">{item.packSize}</TableCell>
                    <TableCell><ItemDeleteBtn id={item.id} /></TableCell>
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

function ItemDeleteBtn({ id }: { id: string }) {
  const m = useDeleteItem(id);
  return (
    <Button variant="ghost" size="icon" onClick={() => m.mutateAsync(null)} disabled={m.isPending}>
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
}
