"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import FlyerViewer from "@/components/FlyerViewer";
import { FlyerSection } from "@/components/FlyerManagement";
import { MenuItem } from "@/lib/demo-store";
import { getMenuItems } from "@/lib/menu-service";
import { subscribeToDemoChanges } from "@/lib/demo-store";

function NotFound() {
  return (
    <main className="bg-site relative isolate flex min-h-[55vh] items-center justify-center px-4 py-20 text-center text-white">
      <div className="absolute inset-0 -z-10 bg-black/80" />
      <div>
        <p className="font-serif text-7xl font-bold text-brand">404</p>
        <h1 className="mt-3 font-serif text-3xl font-bold">Page not found</h1>
        <p className="mt-3 text-white/70">This page does not exist or is no longer available.</p>
        <Link href="/" className="mt-7 inline-block rounded-full bg-brand px-6 py-3 font-bold uppercase text-white">Back to home</Link>
      </div>
    </main>
  );
}

export default function DynamicPublicPage({ slug }: { slug: string | string[] }) {
  const path = Array.isArray(slug) ? slug.join("/") : slug;
  const href = `/${path.replace(/^\/+|\/+$/g, "")}`;
  const [menu, setMenu] = useState<MenuItem | null | undefined>(undefined);
  const [children, setChildren] = useState<MenuItem[]>([]);
  const [parent, setParent] = useState<MenuItem | undefined>();

  useEffect(() => {
    const refresh = () => {
      const items = getMenuItems();
      const current = items.find((item) => item.href === href && item.enabled) ?? null;
      setMenu(current);
      setChildren(current ? items.filter((item) => item.parentId === current.id && item.enabled).sort((a, b) => a.order - b.order) : []);
      setParent(current?.parentId ? items.find((item) => item.id === current.parentId) : undefined);
    };
    refresh();
    return subscribeToDemoChanges(refresh);
  }, [href]);

  if (menu === undefined) {
    return <main className="min-h-[40vh] bg-[#150b0b] px-4 py-24 text-center text-white" role="status">Loading page…</main>;
  }
  if (!menu) return <NotFound />;

  return (
    <main className="bg-site relative isolate min-h-[calc(100vh-5rem)] px-4 py-8 text-white sm:px-8">
      <div className="absolute inset-0 -z-10 bg-black/75" />
      <div className="mx-auto max-w-6xl">
        {parent && <Link href={parent.href} className="inline-flex rounded text-sm font-bold text-red-200 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">← {parent.title}</Link>}
        <h1 className="mb-6 mt-4 font-serif text-3xl font-bold sm:text-4xl">{menu.title}</h1>
        {children.length > 0 && (
          <nav aria-label={`${menu.title} pages`} className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {children.map((child) => (
              <Link key={child.id} href={child.href} className="rounded-xl border border-white/15 bg-black/25 p-5 font-semibold text-white transition hover:border-brand hover:bg-black/40">
                {child.title} <span aria-hidden="true" className="float-right text-red-200">→</span>
              </Link>
            ))}
          </nav>
        )}
        {menu.flyer && <div className="mb-8"><FlyerViewer flyer={menu.flyer} title={menu.title} /></div>}
        <FlyerSection pageId={menu.id} pageLabel={menu.title} fullScreen={!children.length && !menu.flyer} />
      </div>
    </main>
  );
}
