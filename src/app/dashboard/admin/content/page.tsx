import {
  addLandingTestimonialAction,
  addFaqAction,
  deleteFaqAction,
  deleteLandingTestimonialAction,
  setWatermarkToggleAction,
  updateLandingContentAction,
  uploadLandingAssetAction,
} from "@/app/actions/content-admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/server";
import { formatLabel } from "@/lib/format";

const coreKeys = ["hero_title", "hero_subtitle", "hero_primary_cta", "hero_secondary_cta", "services_title", "services_subtitle"];
const flowKeys = ["how_title", "how_step_1_title", "how_step_1_body", "how_step_2_title", "how_step_2_body", "how_step_3_title", "how_step_3_body"];
const trustKeys = ["trust_1", "trust_2", "trust_3", "trust_4", "final_cta_title", "final_cta_body"];
const brandKeys = ["site_logo_url", "site_favicon_url"];

export default async function AdminContentPage() {
  const supabase = await createClient();
  const [{ data: content }, { data: testimonials }, { data: settings }, { data: faqs }] = await Promise.all([
    supabase.from("landing_content").select("*"),
    supabase.from("landing_testimonials").select("*").order("created_at", { ascending: false }),
    supabase.from("app_settings").select("key, value").eq("key", "enable_pdf_watermark"),
    supabase.from("faqs").select("*").order("sort_order", { ascending: true }),
  ]);
  const valueMap = new Map((content ?? []).map((x) => [x.key, x.value]));
  const watermarkEnabled = settings?.[0]?.value !== "false";

  return (
    <Tabs defaultValue="content" className="space-y-4">
      <TabsList variant="line" className="w-full justify-start overflow-x-auto">
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="assets">Assets & Brand</TabsTrigger>
        <TabsTrigger value="faq">FAQ</TabsTrigger>
        <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="content">
        <Card>
          <CardHeader>
            <CardTitle>Landing content management</CardTitle>
            <CardDescription>Core copy blocks grouped for faster updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {[coreKeys, flowKeys, trustKeys].map((group, idx) => (
              <div key={idx} className="grid gap-3 md:grid-cols-2">
                {group.map((key) => (
                  <form key={key} action={updateLandingContentAction} className="rounded-lg border p-3">
                    <input type="hidden" name="key" value={key} />
                    <Label htmlFor={key}>{formatLabel(key)}</Label>
                    <div className="mt-2 flex gap-2">
                      <Input id={key} name="value" defaultValue={valueMap.get(key) ?? ""} />
                      <Button type="submit" size="sm">
                        Save
                      </Button>
                    </div>
                  </form>
                ))}
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="assets">
        <Card>
          <CardHeader>
            <CardTitle>Landing images and branding</CardTitle>
            <CardDescription>Upload hero image, site logo, and favicon.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form action={uploadLandingAssetAction} className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="asset-key">Target key</Label>
                <select
                  id="asset-key"
                  name="key"
                  className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
                  defaultValue="hero_image_url"
                >
                  <option value="hero_image_url">hero_image_url</option>
                  <option value="site_logo_url">site_logo_url</option>
                  <option value="site_favicon_url">site_favicon_url</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="asset-file">Image file</Label>
                <Input id="asset-file" name="file" type="file" accept="image/*" required />
              </div>
              <div className="flex items-end md:col-span-1">
                <Button type="submit">Upload image</Button>
              </div>
            </form>

            <div className="grid gap-3 md:grid-cols-2">
              {brandKeys.map((key) => (
                <form key={key} action={updateLandingContentAction} className="rounded-lg border p-3">
                  <input type="hidden" name="key" value={key} />
                  <Label htmlFor={key}>{formatLabel(key)} (URL)</Label>
                  <div className="mt-2 flex gap-2">
                    <Input id={key} name="value" defaultValue={valueMap.get(key) ?? ""} />
                    <Button type="submit" size="sm">
                      Save
                    </Button>
                  </div>
                </form>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {valueMap.get("hero_image_url") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={valueMap.get("hero_image_url")} alt="Hero asset" className="h-40 w-full rounded-md object-cover" />
              ) : null}
              {valueMap.get("site_logo_url") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={valueMap.get("site_logo_url")} alt="Site logo asset" className="h-40 w-full rounded-md object-contain bg-white p-4" />
              ) : null}
              {valueMap.get("site_favicon_url") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={valueMap.get("site_favicon_url")} alt="Site favicon asset" className="h-40 w-full rounded-md object-contain bg-white p-6" />
              ) : null}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="faq">
        <Card>
          <CardHeader>
            <CardTitle>FAQ Management</CardTitle>
            <CardDescription>Create and remove FAQs shown on website in reveal-answer format.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form action={addFaqAction} className="grid gap-3">
              <Input name="question" placeholder="Question" required />
              <Textarea name="answer" placeholder="Answer" required />
              <Input name="sort_order" type="number" placeholder="Sort order (e.g. 10)" />
              <Button type="submit" className="w-fit">
                Add FAQ
              </Button>
            </form>
            <div className="space-y-3">
              {(faqs ?? []).map((faq) => (
                <div key={faq.id} className="rounded-lg border p-3">
                  <p className="font-semibold">{faq.question}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{faq.answer}</p>
                  <form action={deleteFaqAction} className="mt-3">
                    <input type="hidden" name="id" value={faq.id} />
                    <Button size="sm" variant="destructive" type="submit">
                      Remove
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="testimonials">
        <Card>
          <CardHeader>
            <CardTitle>Testimonials</CardTitle>
            <CardDescription>Add/refresh homepage testimonials.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form action={addLandingTestimonialAction} className="grid gap-3 md:grid-cols-2">
              <Input name="name" placeholder="Name" required />
              <Input name="role" placeholder="Role / designation" required />
              <Textarea name="quote" placeholder="Quote" className="md:col-span-2" required />
              <Button type="submit" className="w-fit">
                Add testimonial
              </Button>
            </form>
            <div className="space-y-3">
              {(testimonials ?? []).map((t) => (
                <div key={t.id} className="rounded-lg border p-3">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                  <p className="mt-2 text-sm">{t.quote}</p>
                  <form action={deleteLandingTestimonialAction} className="mt-3">
                    <input type="hidden" name="id" value={t.id} />
                    <Button size="sm" variant="destructive" type="submit">
                      Remove
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>Document watermark control</CardTitle>
            <CardDescription>Master switch for admin-uploaded PDF watermarking.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={setWatermarkToggleAction} className="flex flex-wrap items-center gap-3">
              <input type="hidden" name="enabled" value={watermarkEnabled ? "false" : "true"} />
              <Button type="submit" variant={watermarkEnabled ? "destructive" : "default"}>
                {watermarkEnabled ? "Disable Watermark" : "Enable Watermark"}
              </Button>
              <span className="text-sm text-muted-foreground">
                Current status: <strong>{watermarkEnabled ? "Enabled" : "Disabled"}</strong>
              </span>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
