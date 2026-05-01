"use client";

import { useMemo, useState } from "react";

import { requestServiceAction } from "@/app/actions/user-services";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RequestServiceDialog({ serviceId, serviceTitle }: { serviceId: string; serviceTitle: string }) {
  const detectedTz = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata", []);
  const [time, setTime] = useState("10:30");
  const [timezone, setTimezone] = useState(detectedTz);

  return (
    <Dialog>
      <DialogTrigger
        className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground"
      >
        Request service
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request {serviceTitle}</DialogTitle>
          <DialogDescription>Share WhatsApp and preferred call schedule for consultation.</DialogDescription>
        </DialogHeader>
        <form action={requestServiceAction} className="space-y-4">
          <input type="hidden" name="serviceId" value={serviceId} />
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label htmlFor={`wa-code-${serviceId}`}>Code</Label>
              <Input id={`wa-code-${serviceId}`} name="whatsappCountryCode" defaultValue="+91" required />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor={`wa-number-${serviceId}`}>WhatsApp number</Label>
              <Input id={`wa-number-${serviceId}`} name="whatsappNumber" placeholder="9876543210" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`call-time-${serviceId}`}>Preferred call time</Label>
            <Input
              id={`call-time-${serviceId}`}
              name="preferredCallTime"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`call-timezone-${serviceId}`}>Timezone (GMT/IST etc.)</Label>
            <Input
              id={`call-timezone-${serviceId}`}
              name="preferredCallTimezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="Asia/Kolkata (IST)"
              required
            />
          </div>

          <div className="rounded-md border bg-black p-3 font-mono text-center text-green-400">
            {time} · {timezone}
          </div>

          <DialogFooter>
            <Button type="submit">Submit request</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
