"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { NavigationNode } from "@/lib/demo-store";

function hasActiveDescendant(item: NavigationNode, active: (href: string) => boolean): boolean {
  return item.children.some((child) => active(child.href) || hasActiveDescendant(child, active));
}

export default function MobileAccordion({
  item,
  active,
  onNavigate,
}: {
  item: NavigationNode;
  active: (href: string) => boolean;
  onNavigate: () => void;
}) {
  const children = [...item.children].sort((a, b) => a.order - b.order);
  const activeSubMenu = hasActiveDescendant(item, active);
  const [open, setOpen] = useState(activeSubMenu);
  const id = useId();

  useEffect(() => {
    if (activeSubMenu) setOpen(true);
  }, [activeSubMenu]);

  return (
    <div className="border-b border-neutral-100">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between py-3 text-left text-[15px] font-bold uppercase ${active(item.href) ? "text-brand" : "text-neutral-800"}`}
      >
          {item.label}
        <svg aria-hidden="true" viewBox="0 0 12 12" className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" fill="none" /></svg>
      </button>
      <div id={id} hidden={!open} className="space-y-1 pb-2 pl-4">
        <Link href={item.href} onClick={onNavigate} aria-current={active(item.href) ? "page" : undefined} className="block rounded-md px-3 py-2 text-xs font-semibold text-neutral-500 hover:bg-neutral-50">
          View {item.label}
        </Link>
        {children.map((child) => child.children.length ? (
          <MobileAccordion key={child.id} item={child} active={active} onNavigate={onNavigate} />
        ) : (
          <Link key={child.id} href={child.href} onClick={onNavigate} aria-current={active(child.href) ? "page" : undefined} className={`block rounded-md px-3 py-2 text-sm font-semibold ${active(child.href) ? "bg-brand/10 text-brand" : "text-neutral-700 hover:bg-neutral-50"}`}>
            {child.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
