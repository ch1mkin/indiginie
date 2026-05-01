import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDocumentSignedUrl } from "@/lib/documents/signed-url";
import { cn } from "@/lib/utils";

export default async function DashboardDocumentViewPage({
  searchParams,
}: {
  searchParams?: Promise<{ file?: string; title?: string; back?: string }> | { file?: string; title?: string; back?: string };
}) {
  const params = (searchParams instanceof Promise ? await searchParams : searchParams) ?? {};
  const file = params.file ?? "";
  const title = params.title ?? "Document";
  const back = params.back ?? "/dashboard";
  const signed = file ? await getDocumentSignedUrl(file, 60 * 60) : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Preview inside dashboard and download when needed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Link className={cn(buttonVariants({ variant: "outline" }))} href={back}>
              Back
            </Link>
            {signed ? (
              <a className={cn(buttonVariants())} href={signed} download target="_blank" rel="noreferrer">
                Download
              </a>
            ) : null}
          </div>
          {signed ? (
            <iframe src={signed} title={title} className="h-[70vh] w-full rounded-lg border bg-white" />
          ) : (
            <p className="text-sm text-muted-foreground">Document preview unavailable.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
