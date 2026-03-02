import { useState } from "react";
import { useCashbook, useCashbookBalance, useCreateCashbookEntry, useDeleteCashbookEntry } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet } from "lucide-react";

export default function Cashbook() {
  const { data: entries = [], isLoading } = useCashbook();
  const { data: balanceData } = useCashbookBalance();
  const createMutation = useCreateCashbookEntry();
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "IN", amount: "", description: "", category: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(form);
    setForm({ type: "IN", amount: "", description: "", category: "" });
    setShowForm(false);
  };

  if (isLoading) return <div className="text-center py-10">{t("common.loading")}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("nav.cashbook")}</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> {t("common.add")}
        </Button>
      </div>

      {/* Balance Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{t("cash.balance")}</CardTitle>
          <Wallet className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${(balanceData?.balance ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
            €{(balanceData?.balance ?? 0).toFixed(2)}
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="IN">{t("cash.in")}</option>
                <option value="OUT">{t("cash.out")}</option>
              </select>
              <Input type="number" step="0.01" placeholder={t("common.amount")} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
              <Input placeholder={t("cash.description")} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              <Input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
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
                <TableHead>Type</TableHead>
                <TableHead>{t("common.amount")}</TableHead>
                <TableHead>{t("cash.description")}</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead>{t("common.date")}</TableHead>
                <TableHead className="w-20">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">{t("common.noData")}</TableCell></TableRow>
              ) : (
                entries.map((e: any) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      {e.type === "IN" ? (
                        <Badge variant="success" className="gap-1"><TrendingUp className="h-3 w-3" /> IN</Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1"><TrendingDown className="h-3 w-3" /> OUT</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">€{parseFloat(e.amount).toFixed(2)}</TableCell>
                    <TableCell>{e.description}</TableCell>
                    <TableCell className="hidden md:table-cell">{e.category}</TableCell>
                    <TableCell>{new Date(e.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell><CashDeleteBtn id={e.id} /></TableCell>
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

function CashDeleteBtn({ id }: { id: string }) {
  const m = useDeleteCashbookEntry(id);
  return (
    <Button variant="ghost" size="icon" onClick={() => m.mutateAsync(null)} disabled={m.isPending}>
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  );
}
