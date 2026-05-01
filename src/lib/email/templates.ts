import { APP_NAME } from "@/lib/constants";

function frame(title: string, body: string) {
  return `<!doctype html><html><body style="font-family:Inter,Arial,sans-serif;background:#faf8ff;color:#131b2e;padding:24px">
  <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #dae2fd;border-radius:16px;padding:24px">
    <h1 style="margin:0 0 12px;color:#006192">${title}</h1>
    <div style="line-height:1.6">${body}</div>
    <hr style="border:none;border-top:1px solid #dae2fd;margin:20px 0" />
    <div style="font-size:12px;color:#3f4850">${APP_NAME}</div>
  </div></body></html>`;
}

export function serviceRequestedTemplate(serviceTitle: string) {
  return frame("Service request received", `<p>Your request for <b>${serviceTitle}</b> has been logged.</p>`);
}

export function serviceAssignedTemplate(serviceTitle: string) {
  return frame("Service assignment update", `<p>Your request <b>${serviceTitle}</b> is now assigned and in progress.</p>`);
}

export function callbackTemplate() {
  return frame("Callback request received", "<p>Our team will contact you in your preferred time window.</p>");
}

export function ticketTemplate() {
  return frame("Support ticket created", "<p>Your issue has been logged. You can track replies in Support.</p>");
}

export function documentTemplate(kind: "upload" | "output") {
  return frame(kind === "output" ? "New deliverable uploaded" : "Document upload confirmed", `<p>Your document (${kind}) is now available in the vault.</p>`);
}
