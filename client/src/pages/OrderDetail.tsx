import { useOrder, useConfirmOrder } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function OrderDetail({ params }: { params: { id: string } }) {
  const { data: order, isLoading } = useOrder(params.id);
  const confirmMutation = useConfirmOrder(params.id);
  const { t } = useI18n();

  if (isLoading) return <div className="text-center py-10">{t("common.loading")}</div>;
  if (!order) return <div className="text-center py-10">Order not found</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link href="/orders">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <h2 className="text-2xl font-bold">{order.orderNumber}</h2>
        <Badge variant={order.status === "Confirmed" ? "success" : "secondary"}>{order.status}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t("order.client")}</CardTitle></CardHeader>
          <CardContent><div className="font-medium">{order.client?.name}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t("order.supplier")}</CardTitle></CardHeader>
          <CardContent><div className="font-medium">{order.supplier?.name}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t("order.totalSell")}</CardTitle></CardHeader>
          <CardContent><div className="text-xl font-bold">€{parseFloat(order.totalSell || 0).toFixed(2)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{t("order.serviceFee")}</CardTitle></CardHeader>
          <CardContent><div className="text-xl font-bold text-green-600">€{parseFloat(order.serviceFee || 0).toFixed(2)}</div></CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Line Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("item.sku")}</TableHead>
                <TableHead>{t("common.name")}</TableHead>
                <TableHead>{t("order.qty")}</TableHead>
                <TableHead>{t("order.costPrice")}</TableHead>
                <TableHead>{t("order.sellPrice")}</TableHead>
                <TableHead>{t("order.margin")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">{item.sku}</TableCell>
                  <TableCell>{item.itemName}</TableCell>
                  <TableCell>{item.qty} {item.unit}</TableCell>
                  <TableCell>€{parseFloat(item.costPrice).toFixed(2)}</TableCell>
                  <TableCell>€{parseFloat(item.sellPrice).toFixed(2)}</TableCell>
                  <TableCell>€{parseFloat(item.margin || 0).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">{t("order.totalCost")}</div>
              <div className="font-bold">€{parseFloat(order.totalCost || 0).toFixed(2)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">{t("order.totalSell")}</div>
              <div className="font-bold">€{parseFloat(order.totalSell || 0).toFixed(2)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">{t("order.margin")}</div>
              <div className="font-bold text-green-600">€{parseFloat(order.totalMargin || 0).toFixed(2)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">{t("order.serviceFee")}</div>
              <div className="font-bold text-blue-600">€{parseFloat(order.serviceFee || 0).toFixed(2)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {order.status === "Draft" && (
        <div className="flex gap-2">
          <Button onClick={() => confirmMutation.mutateAsync(null)} disabled={confirmMutation.isPending}>
            <CheckCircle className="h-4 w-4 mr-2" /> {t("common.confirm")} Order
          </Button>
        </div>
      )}
    </div>
  );
}
