import { useState } from "react";
import { Route, Switch, Link, useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import {
  LayoutDashboard, Building2, Package, FileText, Calculator,
  ClipboardList, ShoppingCart, Receipt, Wallet, Mail, Settings,
  Menu, X, Globe, Sun, Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Dashboard from "@/pages/Dashboard";
import Companies from "@/pages/Companies";
import Items from "@/pages/Items";
import Pricelists from "@/pages/Pricelists";
import PricingRules from "@/pages/PricingRules";
import OrderDesk from "@/pages/OrderDesk";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/OrderDetail";
import ServiceInvoices from "@/pages/ServiceInvoices";
import Cashbook from "@/pages/Cashbook";
import EmailHub from "@/pages/EmailHub";
import SettingsPage from "@/pages/Settings";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const { lang, toggleLanguage, t } = useI18n();
  const [location] = useLocation();

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  const navItems = [
    { href: "/", icon: LayoutDashboard, label: t("nav.dashboard") },
    { href: "/companies", icon: Building2, label: t("nav.companies") },
    { href: "/items", icon: Package, label: t("nav.items") },
    { href: "/pricelists", icon: FileText, label: t("nav.pricelists") },
    { href: "/pricing-rules", icon: Calculator, label: t("nav.pricingRules") },
    { href: "/order-desk", icon: ClipboardList, label: t("nav.orderDesk") },
    { href: "/orders", icon: ShoppingCart, label: t("nav.orders") },
    { href: "/service-invoices", icon: Receipt, label: t("nav.serviceInvoices") },
    { href: "/cashbook", icon: Wallet, label: t("nav.cashbook") },
    { href: "/email-hub", icon: Mail, label: t("nav.emailHub") },
    { href: "/settings", icon: Settings, label: t("nav.settings") },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-lg font-bold text-primary">BCC</h1>
          <span className="text-xs text-muted-foreground">Broker's Command</span>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-65px)]">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href}>
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors ${
                  location === href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </div>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-14 border-b flex items-center justify-between px-4 bg-card">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden lg:block text-lg font-semibold">
            Broker's Command Center
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleLanguage} title={lang === "en" ? "Ελληνικά" : "English"}>
              <Globe className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium">{lang.toUpperCase()}</span>
            <Button variant="ghost" size="icon" onClick={toggleDark}>
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/companies" component={Companies} />
            <Route path="/items" component={Items} />
            <Route path="/pricelists" component={Pricelists} />
            <Route path="/pricing-rules" component={PricingRules} />
            <Route path="/order-desk" component={OrderDesk} />
            <Route path="/orders" component={Orders} />
            <Route path="/orders/:id" component={OrderDetail} />
            <Route path="/service-invoices" component={ServiceInvoices} />
            <Route path="/cashbook" component={Cashbook} />
            <Route path="/email-hub" component={EmailHub} />
            <Route path="/settings" component={SettingsPage} />
            <Route>
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold">404</h2>
                <p className="text-muted-foreground">Page not found</p>
              </div>
            </Route>
          </Switch>
        </main>
      </div>
    </div>
  );
}

export default App;
