import { deleteServiceAction, upsertServiceAction } from "@/app/actions/services-admin";
import { ConfirmSubmitButton } from "@/components/dashboard/confirm-submit-button";
import { ServiceCreateForm } from "@/components/dashboard/service-create-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/server";

export default async function AdminServicesPage() {
  const supabase = await createClient();
  const { data: services } = await supabase.from("services").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Create service</CardTitle>
          <CardDescription>Instantly surfaces in the client catalog and public services page.</CardDescription>
        </CardHeader>
        <CardContent>
          <ServiceCreateForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Catalog</CardTitle>
          <CardDescription>Edit in place or retire offerings.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(services ?? []).map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="min-w-[320px]">
                    <form action={upsertServiceAction} className="space-y-3">
                      <input type="hidden" name="id" value={service.id} />
                      <Input name="title" defaultValue={service.title} required />
                      <Textarea name="description" rows={3} defaultValue={service.description ?? ""} />
                      <Textarea name="detailed_description" rows={4} defaultValue={service.detailed_description ?? ""} />
                      <Input name="thumbnail_url" type="url" defaultValue={service.thumbnail_url ?? ""} />
                      <Input name="thumbnail_file" type="file" accept="image/*" />
                      <Input name="timeline_estimate" defaultValue={service.timeline_estimate ?? ""} />
                      <Input
                        name="required_documents"
                        defaultValue={Array.isArray(service.required_documents) ? service.required_documents.join(", ") : ""}
                      />
                      <select
                        name="price_type"
                        defaultValue={service.price_type}
                        className="border-input bg-background text-foreground h-9 w-full rounded-md border px-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      >
                        <option value="fixed">Fixed</option>
                        <option value="custom">Custom</option>
                      </select>
                      <Button size="sm" type="submit">
                        Save changes
                      </Button>
                    </form>
                  </TableCell>
                  <TableCell className="align-top text-sm capitalize text-muted-foreground">{service.price_type}</TableCell>
                  <TableCell className="align-top text-right">
                    <form id={`delete-service-${service.id}`} action={deleteServiceAction}>
                      <input type="hidden" name="id" value={service.id} />
                      <ConfirmSubmitButton
                        formId={`delete-service-${service.id}`}
                        triggerLabel="Delete"
                        title="Delete this service?"
                        description="This action is irreversible and removes it from catalog immediately."
                        variant="destructive"
                        size="sm"
                      />
                    </form>
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
