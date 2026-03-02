import { useDashboard } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Building2, Package, Wallet } from "lucide-react";

export default function Dashboard() {
  const { data, isLoading } = useDashboard();
  const { t } = useI18n();

  if (isLoading) return <div className="text-center py-10">{t("common.loading")}</div>;

  const kpis = [
    { label: t("dash.totalOrders"), value: data?.totalOrders ?? 0, icon: ShoppingCart, color: "text-blue-500" },
    { label: t("dash.totalCompanies"), value: data?.totalCompanies ?? 0, icon: Building2, color: "text-green-500" },
    { label: t("dash.totalItems"), value: data?.totalItems ?? 0, icon: Package, color: "text-purple-500" },
    { label: t("dash.cashBalance"), value: `€${(data?.cashBalance ?? 0).toFixed(2)}`, icon: Wallet, color: "text-yellow-500" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t("nav.dashboard")}</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className={`h-5 w-5 ${color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("dash.recentOrders")}</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recentOrders?.length ? (
            <div className="space-y-3">
              {data.recentOrders.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <div className="font-medium">{o.orderNumber}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">€{parseFloat(o.totalSell || 0).toFixed(2)}</span>
                    <Badge variant={o.status === "Confirmed" ? "success" : o.status === "Draft" ? "secondary" : "default"}>
                      {o.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">{t("common.noData")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
