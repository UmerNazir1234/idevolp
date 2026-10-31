"use client";

import Link from "next/link";
import { FocusEvent, KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { NavigationNode } from "@/lib/demo-store";

function hasActiveDescendant(item: NavigationNode, active: (href: string) => boolean): boolean {
  return item.children.some((child) => active(child.href) || hasActiveDescendant(child, active));
}

export default function NavDropdown({
  item,
  active,
  className,
  side = false,
}: {
  item: NavigationNode;
  active: (href: string) => boolean;
  className: string;
  side?: boolean;
}) {
  const children = [...item.children].sort((a, b) => a.order - b.order);
  const activeSubMenu = children.some((child) => active(child.href) || hasActiveDescendant(child, active));
  const selected = active(item.href) || activeSubMenu;
  const [open, setOpen] = useState(activeSubMenu);
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const linksRef = useRef<Array<HTMLAnchorElement | null>>([]);

  useEffect(() => {
    if (activeSubMenu) setOpen(true);
  }, [activeSubMenu]);

  function onBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const currentIndex = linksRef.current.findIndex((link) => link === document.activeElement);
    if (currentIndex === -1) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        setOpen(true);
        const index = event.key === "ArrowDown" ? 0 : linksRef.current.length - 1;
        window.requestAnimationFrame(() => linksRef.current[index]?.focus());
      }
      return;
    }
    event.preventDefault();
    const direction = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex = (currentIndex + direction + linksRef.current.length) % linksRef.current.length;
    linksRef.current[nextIndex]?.focus();
  }

  return (
    <div className={`group relative ${side ? "w-full" : ""}`} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onKeyDown={onKeyDown} onBlur={onBlur}>
      <div className="flex items-center">
        <button
          ref={triggerRef}
          type="button"
          aria-label={`${open ? "Hide" : "Show"} ${item.label} sub-menus`}
          aria-haspopup="true"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(true)}
          className={`${className} flex w-full items-center justify-between gap-2 text-left ${selected ? "text-brand after:scale-x-100" : ""}`}
        >
          {item.label}
          <svg aria-hidden="true" viewBox="0 0 12 12" className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" fill="none" /></svg>
        </button>
      </div>
      <ul id={id} className={`${open ? "visible translate-y-0 opacity-100" : "invisible translate-y-2 opacity-0"} absolute z-50 ${side ? "left-full top-0" : "left-0 top-full"} min-w-56 rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/5 transition-all`}>
        {children.map((child, index) => {
          const selected = active(child.href);
          return (
            <li key={child.id}>
              {child.children.length ? (
                <NavDropdown item={child} active={active} className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-800 hover:bg-brand/10 hover:text-brand" side />
              ) : (
                <Link
                  ref={(element) => { linksRef.current[index] = element; }}
                  href={child.href}
                  aria-current={selected ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand/10 hover:text-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${selected ? "bg-brand/10 text-brand" : "text-neutral-800"}`}
                >
                  {child.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
