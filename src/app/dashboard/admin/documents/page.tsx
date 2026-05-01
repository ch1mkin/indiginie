import Link from "next/link";

import { uploadDocumentAction } from "@/app/actions/documents";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDocumentSignedUrl } from "@/lib/documents/signed-url";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export default async function AdminDocumentsPage() {
  const supabase = await createClient();

  const [{ data: docs }, { data: requests }, { data: services }, { data: profiles }] = await Promise.all([
    supabase.from("documents").select("*").order("created_at", { ascending: false }).limit(200),
    supabase.from("user_services").select("id, user_id, service_id, status").order("created_at", { ascending: false }),
    supabase.from("services").select("id, title"),
    supabase.from("profiles").select("id, full_name"),
  ]);

  const serviceMap = new Map((services ?? []).map((s) => [s.id, s.title]));
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  const rows = await Promise.all(
    (docs ?? []).map(async (doc) => ({
      ...doc,
      signed: await getDocumentSignedUrl(doc.file_url),
      client: profileMap.get(doc.user_id) ?? doc.user_id,
      service: serviceMap.get(doc.service_id) ?? doc.service_id,
    }))
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload deliverable</CardTitle>
          <CardDescription>Outputs are written to the client&apos;s private prefix with audit metadata.</CardDescription>
        </CardHeader>
        <CardContent>
          {(requests ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No service requests yet.</p>
          ) : (
            <form action={uploadDocumentAction} className="grid gap-4 md:max-w-2xl">
              <input type="hidden" name="type" value="output" />
              <div className="space-y-2">
                <Label htmlFor="ownerUserId">Client</Label>
                <select
                  id="ownerUserId"
                  name="ownerUserId"
                  required
                  className="border-input bg-background text-foreground h-10 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  defaultValue={requests?.[0]?.user_id}
                >
                  {Array.from(new Set((requests ?? []).map((r) => r.user_id))).map((userId) => (
                    <option key={userId} value={userId}>
                      {profileMap.get(userId) ?? userId}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="serviceId">Service matter</Label>
                <select
                  id="serviceId"
                  name="serviceId"
                  required
                  className="border-input bg-background text-foreground h-10 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  defaultValue={requests?.[0]?.service_id}
                >
                  {(requests ?? []).map((req) => (
                    <option key={req.id} value={req.service_id}>
                      {(profileMap.get(req.user_id) ?? req.user_id) + " · " + (serviceMap.get(req.service_id) ?? "")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">File</Label>
                <Input id="file" name="file" type="file" required />
              </div>
              <Button type="submit" className="w-fit">
                Upload output
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent files</CardTitle>
          <CardDescription>Latest {rows.length} entries across the ledger.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.client}</TableCell>
                  <TableCell>{doc.service}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {doc.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(doc.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {doc.signed ? (
                      <Link
                        className={cn(buttonVariants({ size: "sm", variant: "outline" }), "inline-flex")}
                        href={`/dashboard/document-view?file=${encodeURIComponent(doc.file_url)}&title=${encodeURIComponent(doc.service)}&back=${encodeURIComponent("/dashboard/admin/documents")}`}
                      >
                        View
                      </Link>
                    ) : (
                      <span className="text-xs text-muted-foreground">Unavailable</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
