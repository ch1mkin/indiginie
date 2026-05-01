import Link from "next/link";

import { uploadDocumentAction } from "@/app/actions/documents";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDocumentSignedUrl } from "@/lib/documents/signed-url";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export default async function UserDocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: docs }, { data: requests }, { data: services }] = await Promise.all([
    supabase.from("documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    supabase
      .from("user_services")
      .select("id, service_id, status, payment_status")
      .eq("user_id", user.id)
      .in("status", ["pending", "active"]),
    supabase.from("services").select("id, title"),
  ]);

  const serviceMap = new Map((services ?? []).map((s) => [s.id, s.title]));

  const rows = await Promise.all(
    (docs ?? []).map(async (doc) => ({
      ...doc,
      signed: await getDocumentSignedUrl(doc.file_url),
      title: serviceMap.get(doc.service_id) ?? "Service",
    }))
  );
  const uploaded = rows.filter((x) => x.type === "upload");
  const received = rows.filter((x) => x.type === "output");

  const payableRequests = (requests ?? []).filter((r) => r.payment_status === "paid");

  return (
    <div className="space-y-10">
      <Card>
        <CardHeader>
          <CardTitle>Upload supporting files</CardTitle>
          <CardDescription>
            Files are stored privately under <code className="text-xs">/{`{you}`}/</code>{" "}
            <code className="text-xs">/{`{service}`}/uploads/</code>. Start a service request first if you do not see
            a matter below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(requests ?? []).length === 0 ? (
            <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
              <div>No active matters yet.</div>
              <Link className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")} href="/dashboard/user/services">
                Go to services
              </Link>
            </div>
          ) : (
            <form action={uploadDocumentAction} className="grid gap-4 md:max-w-xl">
              {payableRequests.length === 0 ? (
                <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
                  Document uploads unlock once a request is marked <strong>Paid</strong> by admin.
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="requestId">Paid request</Label>
                <select
                  id="requestId"
                  name="requestId"
                  required
                  disabled={payableRequests.length === 0}
                  className="border-input bg-background text-foreground h-10 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  defaultValue={payableRequests[0]?.id}
                >
                  {payableRequests.map((req) => (
                    <option key={req.id} value={req.id}>
                      {(serviceMap.get(req.service_id) ?? req.service_id) + ` · ${req.status}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceId">Link to service matter</Label>
                <select
                  id="serviceId"
                  name="serviceId"
                  required
                  disabled={payableRequests.length === 0}
                  className="border-input bg-background text-foreground h-10 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  defaultValue={payableRequests?.[0]?.service_id}
                >
                  {payableRequests.map((req) => (
                    <option key={req.id} value={req.service_id}>
                      {(serviceMap.get(req.service_id) ?? req.service_id) + ` · ${req.status}`}
                    </option>
                  ))}
                </select>
              </div>
              <input type="hidden" name="type" value="upload" />
              <div className="space-y-2">
                <Label htmlFor="file">File</Label>
                <Input id="file" name="file" type="file" required disabled={payableRequests.length === 0} />
              </div>
              <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Consent disclaimer</p>
                <p className="mt-1">
                  I confirm the uploaded file is lawful to share and I consent to secure storage and audit logging for
                  compliance.
                </p>
                <label className="mt-2 flex items-start gap-2">
                  <input type="checkbox" name="consentAccepted" required disabled={payableRequests.length === 0} className="mt-0.5" />
                  <span>I agree to document processing and compliance consent.</span>
                </label>
              </div>
              <Button type="submit" className="w-fit" disabled={payableRequests.length === 0}>
                Upload securely
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your vault</CardTitle>
          <CardDescription>Uploads and deliverables issued by Indiginie.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="uploaded">
            <TabsList>
              <TabsTrigger value="uploaded">Uploaded documents</TabsTrigger>
              <TabsTrigger value="received">Received documents</TabsTrigger>
            </TabsList>
            <TabsContent value="uploaded" className="pt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Download/View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploaded.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(doc.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {doc.signed ? (
                          <Link
                            className={cn(buttonVariants({ size: "sm", variant: "outline" }), "inline-flex")}
                            href={`/dashboard/document-view?file=${encodeURIComponent(doc.file_url)}&title=${encodeURIComponent(doc.title)}&back=${encodeURIComponent("/dashboard/user/documents")}`}
                          >
                            View
                          </Link>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="received" className="pt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Download/View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {received.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(doc.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {doc.signed ? (
                          <Link
                            className={cn(buttonVariants({ size: "sm", variant: "outline" }), "inline-flex")}
                            href={`/dashboard/document-view?file=${encodeURIComponent(doc.file_url)}&title=${encodeURIComponent(doc.title)}&back=${encodeURIComponent("/dashboard/user/documents")}`}
                          >
                            View
                          </Link>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
