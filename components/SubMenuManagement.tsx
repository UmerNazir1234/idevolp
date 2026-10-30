"use client";

import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { MenuFlyer, SubMenu } from "@/lib/demo-store";
import { resolveMenuFlyerUrl, saveMenuFlyer } from "@/lib/menu-service";
import ToastNotification, { useToast } from "@/components/ToastNotification";

const fieldClass = "mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export function MenuFlyerPreview({ flyer }: { flyer?: MenuFlyer }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let objectUrl = "";
    setUrl("");
    setError("");
    if (!flyer) return;
    resolveMenuFlyerUrl(flyer).then((resolved) => {
      objectUrl = resolved.startsWith("blob:") ? resolved : "";
      if (active) setUrl(resolved);
      else if (objectUrl) URL.revokeObjectURL(objectUrl);
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "The flyer preview could not be loaded.");
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [flyer]);

  if (!flyer) return <p className="text-xs text-neutral-500">No flyer uploaded.</p>;
  if (error) return <p role="alert" className="text-xs text-red-700">{error}</p>;
  if (!url) return <p className="text-xs text-neutral-500">Loading flyer preview…</p>;
  return flyer.type === "pdf" ? (
    <a href={url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-brand underline">{flyer.name} (PDF)</a>
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={`${flyer.name} preview`} className="h-16 w-16 rounded border border-neutral-200 object-cover" />
  );
}

export function FlyerUploader({
  flyer,
  onChange,
}: {
  flyer?: MenuFlyer;
  onChange: (flyer?: MenuFlyer) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    setLoading(true);
    try {
      const saved = await saveMenuFlyer(file);
      onChange(saved);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The flyer could not be uploaded.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf" onChange={selectFile} className="sr-only" aria-label="Upload sub-menu flyer" />
      {flyer && <MenuFlyerPreview flyer={flyer} />}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={loading} onClick={() => inputRef.current?.click()} className="rounded border border-neutral-300 px-3 py-1.5 text-xs font-bold hover:bg-neutral-50 disabled:opacity-50">
          {loading ? "Uploading…" : flyer ? "Replace flyer" : "Upload flyer"}
        </button>
        {flyer && <button type="button" disabled={loading} onClick={() => onChange(undefined)} className="rounded border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-50">Remove flyer</button>}
      </div>
      <p className="text-xs text-neutral-500">JPG, PNG, WebP, or PDF. Maximum 5 MB.</p>
      {error && <p role="alert" className="text-xs font-semibold text-red-700">{error}</p>}
    </div>
  );
}

export function SubMenuRow({
  item,
  parentPath,
  index,
  count,
  onEdit,
  onDelete,
  onMove,
}: {
  item: SubMenu;
  parentPath: string;
  index: number;
  count: number;
  onEdit: () => void;
  onDelete: () => void;
  onMove: (direction: -1 | 1) => void;
}) {
  return (
    <li className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 p-3">
      <MenuFlyerPreview flyer={item.flyer} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{item.title}</p>
        <p className="truncate text-xs text-neutral-500">/{[parentPath, item.slug].filter(Boolean).join("/")}</p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" aria-label={`Move ${item.title} up`} disabled={index === 0} onClick={() => onMove(-1)} className="rounded border px-2 py-1 text-sm disabled:opacity-30">↑</button>
        <button type="button" aria-label={`Move ${item.title} down`} disabled={index === count - 1} onClick={() => onMove(1)} className="rounded border px-2 py-1 text-sm disabled:opacity-30">↓</button>
        <button type="button" onClick={onEdit} className="text-sm font-bold text-brand hover:underline">Edit</button>
        <button type="button" onClick={onDelete} className="text-sm font-bold text-red-700 hover:underline">Delete</button>
      </div>
    </li>
  );
}

export function SubMenuManager({
  items,
  parentPath,
  onChange,
}: {
  items: SubMenu[];
  parentPath: string;
  onChange: (items: SubMenu[]) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [flyer, setFlyer] = useState<MenuFlyer | undefined>();
  const [error, setError] = useState("");
  const { toast, showToast, dismissToast } = useToast();
  const orderedItems = [...items].sort((a, b) => a.order - b.order);

  function resetEditor() {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setFlyer(undefined);
    setError("");
  }

  function saveSubMenu() {
    setError("");
    const cleanTitle = title.trim();
    const cleanSlug = slug.trim().toLowerCase().replace(/^\/+|\/+$/g, "");
    if (!cleanTitle) {
      setError("Enter a name for the sub-menu.");
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSlug)) {
      setError("Enter a slug using lowercase letters, numbers, and hyphens.");
      return;
    }
    if (orderedItems.some((item) => item.id !== editingId && item.slug.toLowerCase() === cleanSlug)) {
      setError("Each sub-menu must have a unique slug within this menu.");
      return;
    }
    if (!flyer) {
      setError("Upload a flyer for this sub-menu.");
      return;
    }

    const nextItem: SubMenu = {
      id: editingId ?? `submenu-${crypto.randomUUID()}`,
      title: cleanTitle,
      slug: cleanSlug,
      order: editingId ? orderedItems.find((item) => item.id === editingId)?.order ?? orderedItems.length : orderedItems.length,
      flyer,
    };
    const nextItems = editingId
      ? orderedItems.map((item) => item.id === editingId ? nextItem : item)
      : [...orderedItems, nextItem];
    onChange(nextItems.map((item, order) => ({ ...item, order })));
    showToast(editingId ? "Sub-menu updated. Save menu changes to publish." : "Sub-menu added. Save menu changes to publish.");
    resetEditor();
  }

  function editItem(item: SubMenu) {
    setEditingId(item.id);
    setTitle(item.title);
    setSlug(item.slug);
    setFlyer(item.flyer);
    setError("");
  }

  function removeItem(item: SubMenu) {
    onChange(orderedItems.filter((entry) => entry.id !== item.id).map((entry, order) => ({ ...entry, order })));
    if (editingId === item.id) resetEditor();
    showToast(`"${item.title}" removed from the menu.`);
  }

  function moveItem(index: number, direction: -1 | 1) {
    const destination = index + direction;
    if (destination < 0 || destination >= orderedItems.length) return;
    const next = [...orderedItems];
    [next[index], next[destination]] = [next[destination], next[index]];
    onChange(next.map((item, order) => ({ ...item, order })));
  }

  return (
    <section className="mt-5 space-y-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4" aria-label="Sub-menu manager">
      <ToastNotification toast={toast} onDismiss={dismissToast} />
      <div>
        <h3 className="font-bold">Sub-menus</h3>
        <p className="mt-1 text-sm text-neutral-600">Each sub-menu has its own public page and flyer. Uploads are stored in this browser.</p>
      </div>
      {orderedItems.length ? (
        <ul className="space-y-2">
          {orderedItems.map((item, index) => (
            <SubMenuRow key={item.id} item={item} parentPath={parentPath} index={index} count={orderedItems.length} onEdit={() => editItem(item)} onDelete={() => removeItem(item)} onMove={(direction) => moveItem(index, direction)} />
          ))}
        </ul>
      ) : <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">No sub-menus yet. Add one to get started.</p>}

      <div
        onKeyDown={(event: KeyboardEvent<HTMLDivElement>) => {
          if (event.key === "Enter" && event.target instanceof HTMLInputElement) {
            event.preventDefault();
            saveSubMenu();
          }
        }}
        className="space-y-3 rounded-lg border border-neutral-200 bg-white p-4"
      >
        <h4 className="text-sm font-bold">{editingId ? "Edit sub-menu" : "Add a sub-menu"}</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">Name
            <input value={title} onChange={(event) => {
              const nextTitle = event.target.value;
              setTitle(nextTitle);
              if (!editingId) setSlug(nextTitle.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
            }} className={fieldClass} placeholder="Summer Camp" />
          </label>
          <label className="text-sm font-semibold">URL segment
            <input value={slug} onChange={(event) => setSlug(event.target.value)} className={fieldClass} placeholder="summer-camp" />
            <span className="mt-1 block truncate text-xs font-normal text-neutral-500">
              Public URL: /{[parentPath, slug.trim().replace(/^\/+|\/+$/g, "")].filter(Boolean).join("/")}
            </span>
          </label>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Flyer <span className="text-red-700">*</span></p>
          <FlyerUploader flyer={flyer} onChange={setFlyer} />
        </div>
        {error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={saveSubMenu} className="rounded-full bg-brand px-4 py-2 text-sm font-bold text-white hover:bg-brand-dark">{editingId ? "Save sub-menu" : "+ Add sub-menu"}</button>
          {editingId && <button type="button" onClick={resetEditor} className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-bold">Cancel edit</button>}
        </div>
      </div>
    </section>
  );
}
