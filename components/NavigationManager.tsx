"use client";

import { useEffect, useState } from "react";
import MenuForm from "@/components/MenuForm";
import { deleteMenuFlyer, getMenuItems, setMenuItems } from "@/lib/menu-service";
import { MenuItem } from "@/lib/demo-store";
import ToastNotification, { useToast } from "@/components/ToastNotification";
import { deleteFlyersForPage, subscribeToDemoChanges } from "@/lib/demo-store";

function descendantIds(id: string, items: MenuItem[]): Set<string> {
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

function itemDepth(item: MenuItem, items: MenuItem[]) {
  let depth = 0;
  let parentId = item.parentId;
  const visited = new Set<string>();
  while (parentId && !visited.has(parentId)) {
    visited.add(parentId);
    const parent = items.find((entry) => entry.id === parentId);
    if (!parent) break;
    depth += 1;
    parentId = parent.parentId;
  }
  return depth;
}

export default function NavigationManager() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const { toast, showToast, dismissToast } = useToast();

  useEffect(() => {
    const refresh = () => setItems(getMenuItems());
    refresh();
    return subscribeToDemoChanges(refresh);
  }, []);

  function persist(nextItems: MenuItem[]) {
    const ordered = nextItems.map((item, order) => ({ ...item, order }));
    try {
      setMenuItems(ordered);
      setItems(ordered);
    } catch {
      throw new Error("Navigation changes could not be saved in this browser.");
    }
  }

  async function saveItem(item: MenuItem) {
    const wasEditing = Boolean(editingId);
    const nextItems = wasEditing
      ? items.map((entry) => entry.id === editingId ? item : entry)
      : [...items, item];
    persist(nextItems);
    setEditingId(null);
    setError("");
    showToast(wasEditing ? "Navigation item updated." : "Navigation item added.");
  }

  function startEdit(item: MenuItem) {
    setEditingId(item.id);
    setError("");
    showToast(`Editing "${item.title}". Save changes when finished.`, "info");
  }

  async function remove(item: MenuItem) {
    const removedIds = descendantIds(item.id, items);
    removedIds.add(item.id);
    const removedItems = items.filter((entry) => removedIds.has(entry.id));
    if (!window.confirm(`Delete "${item.title}"${removedItems.length > 1 ? " and its nested menus" : ""}? Flyers assigned to these pages will also be removed.`)) return;
    try {
      persist(items.filter((entry) => !removedIds.has(entry.id)));
      setEditingId((current) => current && removedIds.has(current) ? null : current);
    } catch {
      const message = "Navigation item could not be deleted from this browser.";
      setError(message);
      showToast(message, "error");
      return;
    }
    try {
      await Promise.all(removedItems.flatMap((entry) => [
        deleteMenuFlyer(entry.flyer),
        Promise.resolve(deleteFlyersForPage(entry.id)),
      ]));
      showToast(`"${item.title}" and its nested menus deleted.`);
    } catch (reason) {
      const message = reason instanceof Error ? `Menu removed, but a flyer could not be deleted: ${reason.message}` : "Menu removed, but a flyer could not be deleted.";
      setError(message);
      showToast(message, "error");
    }
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...items];
    const destination = index + direction;
    if (destination < 0 || destination >= next.length) return;
    [next[index], next[destination]] = [next[destination], next[index]];
    try {
      persist(next);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Navigation order could not be saved.";
      setError(message);
      showToast(message, "error");
    }
  }

  function toggle(item: MenuItem) {
    try {
      persist(items.map((entry) => entry.id === item.id ? { ...entry, enabled: !entry.enabled } : entry));
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Navigation status could not be saved.";
      setError(message);
      showToast(message, "error");
    }
  }

  const editingItem = items.find((item) => item.id === editingId) ?? null;

  return (
    <>
    <ToastNotification toast={toast} onDismiss={dismissToast} />
    <div className="grid gap-7 xl:grid-cols-[minmax(280px,.8fr)_minmax(0,1.5fr)]">
      <MenuForm key={editingItem?.id ?? "new-menu"} item={editingItem} items={items} onSave={saveItem} onCancel={() => { setEditingId(null); setError(""); }} />

      <section className="overflow-hidden rounded-2xl bg-white text-neutral-900 shadow-xl">
        <div className="border-b border-neutral-200 px-5 py-5 sm:px-6">
          <h2 className="font-serif text-2xl font-bold">Website navigation</h2>
          <p className="mt-1 text-sm text-neutral-600">Add a parent menu, then add unlimited child menus under it. Use the arrows to change display order. Disabled links are hidden from visitors.</p>
        </div>
        {error && <p role="alert" className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-800">{error}</p>}
        <ul className="divide-y divide-neutral-200">
          {items.map((item, index) => (
            <li key={item.id} className="flex flex-wrap items-center gap-3 px-4 py-4 sm:px-6">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="w-6 text-sm text-neutral-500">{index + 1}.</span>
                <div className="min-w-0" style={{ paddingLeft: `${itemDepth(item, items) * 16}px` }}>
                  <p className="truncate font-bold">
                    {item.title}
                    {item.parentId
                      ? <span className="ml-2 text-xs font-medium text-neutral-500">(sub menu)</span>
                      : items.some((child) => child.parentId === item.id)
                        ? <span className="ml-2 text-xs font-medium text-brand">(parent · {items.filter((child) => child.parentId === item.id).length} children)</span>
                        : <span className="ml-2 text-xs font-medium text-neutral-500">(parent)</span>}
                  </p>
                  <p className="truncate text-sm text-neutral-500">{item.href}</p>
                </div>
              </div>
              <button type="button" aria-label={`Move ${item.title} up`} disabled={index === 0} onClick={() => move(index, -1)} className="rounded border px-2.5 py-1.5 disabled:opacity-30">↑</button>
              <button type="button" aria-label={`Move ${item.title} down`} disabled={index === items.length - 1} onClick={() => move(index, 1)} className="rounded border px-2.5 py-1.5 disabled:opacity-30">↓</button>
              <button type="button" onClick={() => toggle(item)} className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase ${item.enabled ? "bg-green-100 text-green-800" : "bg-neutral-200 text-neutral-600"}`}>{item.enabled ? "Enabled" : "Disabled"}</button>
              <button type="button" onClick={() => startEdit(item)} className="text-sm font-bold text-brand hover:underline">Edit</button>
              <button type="button" onClick={() => remove(item)} className="text-sm font-bold text-red-700 hover:underline">Delete</button>
            </li>
          ))}
          {items.length === 0 && <li className="px-6 py-10 text-center text-neutral-500">No navigation items. Add one to get started.</li>}
        </ul>
      </section>
    </div>
    </>
  );
}
