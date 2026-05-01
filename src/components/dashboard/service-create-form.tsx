"use client";

import { useMemo, useState } from "react";

import { upsertServiceAction } from "@/app/actions/services-admin";
import { Badge } from "@/components/ui/badge";
import { ConfirmSubmitButton } from "@/components/dashboard/confirm-submit-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ServiceCreateForm() {
  const formId = "admin-create-service-form";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priceType, setPriceType] = useState<"fixed" | "custom">("custom");
  const [timelineEstimate, setTimelineEstimate] = useState("");
  const [requiredDocs, setRequiredDocs] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const docsPreview = useMemo(
    () =>
      requiredDocs
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
    [requiredDocs]
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form id={formId} action={upsertServiceAction} className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            required
            minLength={2}
            placeholder="Portfolio aggregation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Institutional-grade scope"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="detailed_description">Detailed description</Label>
          <Textarea id="detailed_description" name="detailed_description" rows={4} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
          <Input
            id="thumbnail_url"
            name="thumbnail_url"
            type="url"
            placeholder="https://..."
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="thumbnail_file">Thumbnail upload</Label>
          <Input id="thumbnail_file" name="thumbnail_file" type="file" accept="image/*" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timeline_estimate">Timeline estimate</Label>
          <Input
            id="timeline_estimate"
            name="timeline_estimate"
            placeholder="5-10 business days"
            value={timelineEstimate}
            onChange={(e) => setTimelineEstimate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="required_documents">Required documents (comma separated)</Label>
          <Input
            id="required_documents"
            name="required_documents"
            placeholder="PAN, Passport, Property deed"
            value={requiredDocs}
            onChange={(e) => setRequiredDocs(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price_type">Pricing</Label>
          <select
            id="price_type"
            name="price_type"
            className="border-input bg-background text-foreground h-10 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            value={priceType}
            onChange={(e) => setPriceType(e.target.value as "fixed" | "custom")}
          >
            <option value="fixed">Fixed</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <ConfirmSubmitButton
          formId={formId}
          triggerLabel="Publish service"
          title="Create this service?"
          description="This will add the service to public catalog and dashboards."
          size="sm"
        />
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Preview service card</CardTitle>
          <CardDescription>Live preview of what users will see.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnailUrl} alt="Preview" className="h-40 w-full rounded-md object-cover" />
          ) : (
            <div className="flex h-40 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              Thumbnail preview
            </div>
          )}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title || "Service title"}</h3>
            <Badge variant="outline" className="capitalize">
              {priceType}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{description || "Service description preview"}</p>
          <p className="text-xs text-muted-foreground">Timeline: {timelineEstimate || "Custom"}</p>
          <ul className="list-disc pl-5 text-xs text-muted-foreground">
            {(docsPreview.length > 0 ? docsPreview : ["Required documents will appear here."]).map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
