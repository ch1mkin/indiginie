"use client";

import { useState } from "react";

import { updateProfileNameAction } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Profile } from "@/lib/types";

export function UserProfileForm({ profile, email }: { profile: Profile | null; email: string }) {
  const [timeZone, setTimeZone] = useState(
    profile?.time_zone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? ""
  );

  return (
    <form action={updateProfileNameAction} className="grid max-w-3xl gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="full_name">Full name</Label>
        <Input id="full_name" name="full_name" defaultValue={profile?.full_name ?? ""} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email_display">Email address</Label>
        <Input id="email_display" value={email} readOnly />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone_country_code">Phone country code</Label>
        <Input id="phone_country_code" name="phone_country_code" defaultValue={profile?.phone_country_code ?? "+91"} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone_number">Phone number</Label>
        <Input id="phone_number" name="phone_number" defaultValue={profile?.phone_number ?? ""} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="alternate_phone">Alternate phone (optional)</Label>
        <Input id="alternate_phone" name="alternate_phone" defaultValue={profile?.alternate_phone ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="country_of_residence">Country of residence</Label>
        <Input id="country_of_residence" name="country_of_residence" defaultValue={profile?.country_of_residence ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="time_zone">Time zone (auto-detected, editable)</Label>
        <Input id="time_zone" name="time_zone" value={timeZone} onChange={(e) => setTimeZone(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="preferred_contact_method">Preferred contact method</Label>
        <select
          id="preferred_contact_method"
          name="preferred_contact_method"
          defaultValue={profile?.preferred_contact_method ?? "email"}
          className="border-input bg-background text-foreground h-10 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option value="email">Email</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="phone">Phone</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="date_of_birth">Date of birth</Label>
        <Input id="date_of_birth" name="date_of_birth" type="date" defaultValue={profile?.date_of_birth ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nationality">Nationality</Label>
        <Input id="nationality" name="nationality" defaultValue={profile?.nationality ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="passport_number">Passport number (optional)</Label>
        <Input id="passport_number" name="passport_number" defaultValue={profile?.passport_number ?? ""} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="india_address">Address in India (if any)</Label>
        <Input id="india_address" name="india_address" defaultValue={profile?.india_address ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="property_location">Property location (optional)</Label>
        <Input id="property_location" name="property_location" defaultValue={profile?.property_location ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="service_purpose">Purpose of using services</Label>
        <select
          id="service_purpose"
          name="service_purpose"
          defaultValue={profile?.service_purpose ?? "property"}
          className="border-input bg-background text-foreground h-10 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option value="property">Property</option>
          <option value="legal">Legal</option>
          <option value="documentation">Documentation</option>
          <option value="other">Other</option>
        </select>
      </div>
      <Button type="submit" className="w-fit">
        Save profile
      </Button>
    </form>
  );
}
