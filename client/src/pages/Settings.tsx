import { useState, useEffect } from "react";
import { useSettings, useSaveSetting, useCustomFieldDefs, useCreateCustomFieldDef } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Save, Upload, Plus } from "lucide-react";

export default function SettingsPage() {
  const { data: settings = [] } = useSettings();
  const saveMutation = useSaveSetting();
  const { data: fieldDefs = [] } = useCustomFieldDefs();
  const createFieldDef = useCreateCustomFieldDef();
  const { t } = useI18n();

  const [companySettings, setCompanySettings] = useState({
    company_name: "",
    company_address: "",
    company_vat: "",
    company_phone: "",
    company_email: "",
  });

  const [newField, setNewField] = useState({ entityType: "company", fieldName: "", fieldType: "text" });

  useEffect(() => {
    if (settings.length) {
      const settingsMap: Record<string, string> = {};
      settings.forEach((s: any) => { settingsMap[s.key] = s.value || ""; });
      setCompanySettings({
        company_name: settingsMap.company_name || "",
        company_address: settingsMap.company_address || "",
        company_vat: settingsMap.company_vat || "",
        company_phone: settingsMap.company_phone || "",
        company_email: settingsMap.company_email || "",
      });
    }
  }, [settings]);

  const handleSave = async () => {
    for (const [key, value] of Object.entries(companySettings)) {
      await saveMutation.mutateAsync({ key, value });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    await fetch("/api/upload-logo", {
      method: "POST",
      body: buffer,
    });
  };

  const handleCreateField = async (e: React.FormEvent) => {
    e.preventDefault();
    await createFieldDef.mutateAsync(newField);
    setNewField({ entityType: "company", fieldName: "", fieldType: "text" });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t("nav.settings")}</h2>

      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("settings.companyInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t("common.name")}</label>
              <Input value={companySettings.company_name} onChange={e => setCompanySettings({ ...companySettings, company_name: e.target.value })} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">{t("company.vat")}</label>
              <Input value={companySettings.company_vat} onChange={e => setCompanySettings({ ...companySettings, company_vat: e.target.value })} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">{t("common.phone")}</label>
              <Input value={companySettings.company_phone} onChange={e => setCompanySettings({ ...companySettings, company_phone: e.target.value })} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">{t("common.email")}</label>
              <Input value={companySettings.company_email} onChange={e => setCompanySettings({ ...companySettings, company_email: e.target.value })} className="mt-1" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Address</label>
              <Input value={companySettings.company_address} onChange={e => setCompanySettings({ ...companySettings, company_address: e.target.value })} className="mt-1" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              <Save className="h-4 w-4 mr-1" /> {t("common.save")}
            </Button>
            <label className="cursor-pointer">
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              <Button variant="outline" asChild>
                <span><Upload className="h-4 w-4 mr-1" /> {t("settings.logo")}</span>
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Custom Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("settings.customFields")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleCreateField} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newField.entityType} onChange={e => setNewField({ ...newField, entityType: e.target.value })}>
              <option value="company">Company</option>
              <option value="item">Item</option>
              <option value="order">Order</option>
            </select>
            <Input placeholder="Field Name" value={newField.fieldName} onChange={e => setNewField({ ...newField, fieldName: e.target.value })} required />
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newField.fieldType} onChange={e => setNewField({ ...newField, fieldType: e.target.value })}>
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="boolean">Boolean</option>
            </select>
            <Button type="submit"><Plus className="h-4 w-4 mr-1" /> {t("common.add")}</Button>
          </form>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entity</TableHead>
                <TableHead>Field Name</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fieldDefs.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">{t("common.noData")}</TableCell></TableRow>
              ) : (
                fieldDefs.map((f: any) => (
                  <TableRow key={f.id}>
                    <TableCell>{f.entityType}</TableCell>
                    <TableCell>{f.fieldName}</TableCell>
                    <TableCell>{f.fieldType}</TableCell>
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
