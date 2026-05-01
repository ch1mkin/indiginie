import { RequestServiceDialog } from "@/components/dashboard/request-service-dialog";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/lib/supabase/server";
import { formatLabel } from "@/lib/format";

export default async function UserServicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: services } = await supabase.from("services").select("*").order("created_at", { ascending: false });

  const { data: mine } = await supabase
    .from("user_services")
    .select(
      "id, status, created_at, service_id, assigned_employee, whatsapp_country_code, whatsapp_number, preferred_call_time, preferred_call_timezone, payment_status, call_completed"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  const { data: profiles } = await supabase.from("profiles").select("id, full_name");
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  const serviceMap = new Map((services ?? []).map((s) => [s.id, s]));

  return (
    <div className="space-y-10">
      <Tabs defaultValue="catalog">
        <TabsList>
          <TabsTrigger value="catalog">Service catalog</TabsTrigger>
          <TabsTrigger value="requested">My requests</TabsTrigger>
        </TabsList>
        <TabsContent value="catalog" className="pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {(services ?? []).map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <Badge variant="outline" className="capitalize">
                      {service.price_type}
                    </Badge>
                  </div>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2">
                  <RequestServiceDialog serviceId={service.id} serviceTitle={service.title} />
                  <a className="inline-flex items-center text-sm font-semibold text-primary" href={`/dashboard/user/services/${service.id}`}>
                    View details
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="requested" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>My Services</CardTitle>
              <CardDescription>Status, assignment, and timeline at a glance.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned employee</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(mine ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-sm text-muted-foreground">
                        No requests yet — start with the catalog tab.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (mine ?? []).map((row) => {
                      const svc = serviceMap.get(row.service_id);
                      return (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{svc?.title ?? "Service"}</TableCell>
                          <TableCell>
                            <StatusBadge value={row.status} />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {row.assigned_employee
                              ? profileMap.get(row.assigned_employee) ?? "Assigned"
                              : "Pending assignment"}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(row.created_at).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                              <span>Call: {row.call_completed ? "Done" : "Pending"}</span>
                              <span>Payment: {formatLabel(row.payment_status ?? "not_paid")}</span>
                              <a href={`/dashboard/user/services/${row.service_id}`} className="text-sm font-semibold text-primary">
                                View details
                              </a>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
