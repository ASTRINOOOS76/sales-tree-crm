import { useOrders, useCompanies } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Orders() {
  const { data: orders = [], isLoading } = useOrders();
  const { data: companies = [] } = useCompanies();
  const { t } = useI18n();

  const getName = (id: string) => companies.find((c: any) => c.id === id)?.name || "—";

  const statusVariant = (s: string) => {
    if (s === "Confirmed") return "success";
    if (s === "Draft") return "secondary";
    if (s === "Cancelled") return "destructive";
    return "default";
  };

  if (isLoading) return <div className="text-center py-10">{t("common.loading")}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{t("nav.orders")}</h2>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("order.orderNumber")}</TableHead>
                <TableHead>{t("order.client")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("order.supplier")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead className="hidden md:table-cell">{t("order.totalSell")}</TableHead>
                <TableHead className="hidden lg:table-cell">{t("order.margin")}</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground">{t("common.noData")}</TableCell></TableRow>
              ) : (
                orders.map((o: any) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.orderNumber}</TableCell>
                    <TableCell>{getName(o.clientId)}</TableCell>
                    <TableCell className="hidden md:table-cell">{getName(o.supplierId)}</TableCell>
                    <TableCell><Badge variant={statusVariant(o.status) as any}>{o.status}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell">€{parseFloat(o.totalSell || 0).toFixed(2)}</TableCell>
                    <TableCell className="hidden lg:table-cell">€{parseFloat(o.totalMargin || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Link href={`/orders/${o.id}`}>
                        <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                      </Link>
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
