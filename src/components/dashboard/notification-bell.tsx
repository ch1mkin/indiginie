"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import type { NotificationRow } from "@/lib/types";

export function NotificationBell() {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<NotificationRow[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);
      if (mounted) setItems((data as NotificationRow[]) ?? []);
    };
    load();
    const timer = setInterval(load, 15000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [supabase]);

  const unread = items.filter((x) => !x.read_at).length;

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
    setItems((curr) => curr.map((x) => (x.id === id ? { ...x, read_at: new Date().toISOString() } : x)));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground relative inline-flex size-8 items-center justify-center rounded-md border shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
        <Bell className="size-4" />
        {unread > 0 ? (
          <span className="absolute -top-1 -right-1 rounded-full bg-primary px-1.5 text-[10px] text-white">{unread}</span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-2 py-1 text-xs font-medium text-muted-foreground">Notifications</div>
        {items.length === 0 ? (
          <DropdownMenuItem>Nothing new</DropdownMenuItem>
        ) : (
          items.map((item) => (
            <DropdownMenuItem key={item.id} onClick={() => markRead(item.id)}>
              <div className="flex flex-col">
                <span className="font-medium">{item.title}</span>
                <span className="text-xs text-muted-foreground">{item.body}</span>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
