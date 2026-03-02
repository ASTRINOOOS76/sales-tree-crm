import { useState } from "react";
import { useEmailLog, useSendEmail } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Send, Mail } from "lucide-react";

export default function EmailHub() {
  const { data: emails = [], isLoading } = useEmailLog();
  const sendMutation = useSendEmail();
  const { t } = useI18n();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ to: "", subject: "", body: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMutation.mutateAsync(form);
    setForm({ to: "", subject: "", body: "" });
    setShowForm(false);
  };

  if (isLoading) return <div className="text-center py-10">{t("common.loading")}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Mail className="h-6 w-6" /> {t("nav.emailHub")}
        </h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Send className="h-4 w-4 mr-1" /> Compose
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">New Email</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input type="email" placeholder="To" value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} required />
              <Input placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Message body (HTML supported)..."
                value={form.body}
                onChange={e => setForm({ ...form, body: e.target.value })}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setShowForm(false)}>{t("common.cancel")}</Button>
                <Button type="submit" disabled={sendMutation.isPending}>
                  <Send className="h-4 w-4 mr-1" /> {t("common.send")}
                </Button>
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
                <TableHead>To</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("common.date")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {emails.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">{t("common.noData")}</TableCell></TableRow>
              ) : (
                emails.map((e: any) => (
                  <TableRow key={e.id}>
                    <TableCell>{e.to}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{e.subject}</TableCell>
                    <TableCell>
                      <Badge variant={e.status === "sent" ? "success" : "destructive"}>{e.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(e.sentAt).toLocaleString()}</TableCell>
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
