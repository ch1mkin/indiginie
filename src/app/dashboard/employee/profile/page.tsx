import { updateProfileNameAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";

export default async function EmployeeProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={updateProfileNameAction} className="grid max-w-md gap-3">
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" name="full_name" defaultValue={profile?.full_name ?? ""} required />
          <Button type="submit" className="w-fit">
            Save
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
