"use client";

import { useMemo, useState } from "react";

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

type Props = {
  formId: string;
  triggerLabel: string;
  title: string;
  description: string;
  confirmWord?: string;
  variant?: "default" | "destructive";
  size?: "default" | "sm";
};

export function ConfirmSubmitButton({
  formId,
  triggerLabel,
  title,
  description,
  confirmWord = "confirm",
  variant = "default",
  size = "default",
}: Props) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const isMatch = useMemo(() => typed.trim().toLowerCase() === confirmWord.toLowerCase(), [typed, confirmWord]);

  const submit = () => {
    if (!isMatch) return;
    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;
    form.requestSubmit();
    setOpen(false);
    setTyped("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant={variant} size={size} className={variant === "destructive" ? "inline-flex" : ""} />
        }
      >
        {triggerLabel}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor={`confirm-${formId}`}>Type &quot;{confirmWord}&quot; to continue</Label>
          <Input id={`confirm-${formId}`} value={typed} onChange={(e) => setTyped(e.target.value)} />
        </div>
        <DialogFooter>
          <Button type="button" variant={variant} onClick={submit} disabled={!isMatch}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
