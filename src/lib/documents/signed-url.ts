import { DOCUMENTS_BUCKET } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export async function getDocumentSignedUrl(path: string, expiresInSeconds = 60 * 30) {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
