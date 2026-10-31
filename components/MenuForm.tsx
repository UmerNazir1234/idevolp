"use client";

import { FormEvent, useState } from "react";
import { MenuItem } from "@/lib/demo-store";

const fieldClass = "mt-2 w-full rounded-md border border-neutral-300 px-3 py-2.5 text-neutral-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
const reservedSlugs = new Set(["admin", "login", "profile", "contact"]);

function descendantsOf(id: string, items: MenuItem[]): Set<string> {
  const descendants = new Set<string>();
  const pending = [id];
  while (pending.length) {
    const parentId = pending.pop();
    items.forEach((item) => {
      if (item.parentId === parentId && !descendants.has(item.id)) {
        descendants.add(item.id);
        pending.push(item.id);
      }
    });
  }
  return descendants;
}

function routeFor(parentId: string, segment: string, items: MenuItem[]) {
  const parent = items.find((item) => item.id === parentId);
  return `${parent?.href.replace(/\/+$/, "") ?? ""}/${segment}` || "/";
}

export default function MenuForm({
  item,
  items,
  onSave,
  onCancel,
}: {
  item: MenuItem | null;
  items: MenuItem[];
  onSave: (item: MenuItem) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(item?.title ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [parentId, setParentId] = useState(item?.parentId ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const excludedParents = item ? descendantsOf(item.id, items) : new Set<string>();
  const hasChildren = item ? items.some((entry) => entry.parentId === item.id) : false;
  const availableParents = items.filter((entry) =>
    entry.id !== item?.id &&
    !excludedParents.has(entry.id) &&
    (!entry.parentId || entry.id === item?.parentId),
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const cleanTitle = title.trim();
    const cleanSlug = slug.trim().replace(/^\/+|\/+$/g, "").toLowerCase();
    if (!cleanTitle) {
      setError("Enter a name for this menu.");
      return;
    }
    const isHome = !parentId && item?.href === "/";
    if ((!cleanSlug && !isHome) || (cleanSlug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug))) {
      setError("Use lowercase letters, numbers, and hyphens in the URL segment.");
      return;
    }
    if (parentId && hasChildren) {
      setError("This parent already has child menus. Move or delete its children before making it a submenu.");
      return;
    }
    if (parentId && !availableParents.some((entry) => entry.id === parentId)) {
      setError("Choose a valid parent menu. Flyers are assigned to child menus under a parent.");
      return;
    }
    if (!parentId && reservedSlugs.has(cleanSlug) && item?.slug !== cleanSlug) {
      setError("That URL is reserved for an existing website page.");
      return;
    }
    const href = parentId
      ? routeFor(parentId, cleanSlug, items)
      : cleanSlug ? `/${cleanSlug}` : "/";
    if (items.some((entry) => entry.id !== item?.id && entry.href.toLowerCase() === href.toLowerCase())) {
      setError("A navigation item already uses that URL.");
      return;
    }

    const nextItem: MenuItem = {
      id: item?.id ?? `custom-${crypto.randomUUID()}`,
      title: cleanTitle,
      slug: cleanSlug,
      href,
      parentId: parentId || null,
      order: item?.order ?? items.filter((entry) => entry.parentId === (parentId || null)).length,
      enabled: item?.enabled ?? true,
      hasSubMenu: item?.hasSubMenu ?? false,
      flyer: item?.flyer,
      subMenus: [],
    };

    setSaving(true);
    try {
      await onSave(nextItem);
      if (!item) {
        setTitle("");
        setSlug("");
        setParentId("");
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The menu could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="h-fit rounded-2xl bg-white p-6 text-neutral-900 shadow-xl">
      <h2 className="font-serif text-2xl font-bold">{item ? "Edit menu" : parentId ? "Add child / sub menu" : "Add parent menu"}</h2>
      <p className="mt-2 text-sm text-neutral-600">Create a parent menu first, then add as many child menus as you need under it. Flyers are assigned later in Flyer Management.</p>
      <label htmlFor="nav-parent" className="mt-6 block text-sm font-bold">Parent Menu</label>
      <select id="nav-parent" value={parentId} onChange={(event) => setParentId(event.target.value)} disabled={hasChildren} className={fieldClass}>
        <option value="">No Parent — Parent / Main Menu</option>
        {availableParents.map((entry) => <option key={entry.id} value={entry.id}>{entry.title} — {entry.href}</option>)}
      </select>
      {hasChildren && <p className="mt-2 text-sm text-neutral-600">This menu has children, so it stays a parent menu.</p>}
      <label htmlFor="nav-label" className="mt-5 block text-sm font-bold">Display name</label>
      <input id="nav-label" value={title} onChange={(event) => {
        const nextTitle = event.target.value;
        setTitle(nextTitle);
        if (!item || !slug) setSlug(nextTitle.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
      }} placeholder="Training" required className={fieldClass} />
      <label htmlFor="nav-href" className="mt-5 block text-sm font-bold">URL segment</label>
      <input id="nav-href" value={slug} onChange={(event) => setSlug(event.target.value.replace(/^\/+|\/+$/g, ""))} placeholder="training" required={!(item?.href === "/" && !parentId)} className={fieldClass} />
      <p className="mt-1 break-all text-xs text-neutral-500">
        Page URL: {parentId ? routeFor(parentId, slug || "your-menu", items) : `/${slug || "your-menu"}`}
      </p>
      {error && <p role="alert" className="mt-4 text-sm font-semibold text-red-700">{error}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        <button disabled={saving} className="rounded-full bg-brand px-5 py-2.5 text-sm font-bold uppercase text-white hover:bg-brand-dark disabled:opacity-50">{saving ? "Saving…" : item ? "Save changes" : "Add item"}</button>
        {item && <button type="button" onClick={onCancel} className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-bold">Cancel</button>}
      </div>
    </form>
  );
}
