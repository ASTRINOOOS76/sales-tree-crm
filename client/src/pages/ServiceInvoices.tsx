import { useServiceInvoices } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default function ServiceInvoices() {
  const { data: invoices = [], isLoading } = useServiceInvoices();
  const { t } = useI18n();

  if (isLoading) return <div className="text-center py-10">{t("common.loading")}</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{t("nav.serviceInvoices")}</h2>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>{t("common.amount")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("common.date")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">{t("common.noData")}</TableCell></TableRow>
              ) : (
                invoices.map((inv: any) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono">{inv.invoiceNumber}</TableCell>
                    <TableCell>€{parseFloat(inv.amount || 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={inv.status === "Paid" ? "success" : inv.status === "Issued" ? "warning" : "secondary"}>
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(inv.createdAt).toLocaleDateString()}</TableCell>
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
