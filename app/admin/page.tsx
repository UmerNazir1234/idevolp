"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import DemoProfileForm from "@/components/DemoProfileForm";
import Footer from "@/components/Footer";
import { FlyerManager } from "@/components/FlyerManagement";
import Header from "@/components/Header";
import NavigationManager from "@/components/NavigationManager";
import ProtectedDemoPage from "@/components/ProtectedDemoPage";
import { getNavigationItems, setDemoSession } from "@/lib/demo-store";

type Tab = "overview" | "navigation" | "flyers" | "profile";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const router = useRouter();

  function logout() {
    setDemoSession(null);
    router.push("/");
  }

  return (
    <>
      <Header />
      <ProtectedDemoPage>
        {(user) => {
          const enabledCount = getNavigationItems().filter((item) => item.enabled).length;
          const tabClass = (selected: boolean) =>
            `rounded-lg px-4 py-3 text-left text-sm font-bold transition ${selected ? "bg-brand text-white" : "text-white/75 hover:bg-white/10 hover:text-white"}`;
          return (
            <main className="bg-site relative isolate min-h-[72vh] text-white">
              <div className="absolute inset-0 -z-10 bg-black/80" />
              <div className="mx-auto grid max-w-[1500px] gap-8 px-4 py-8 sm:px-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:py-12">
                <aside className="h-fit rounded-2xl bg-[#1a1111]/95 p-4 shadow-xl">
                  <p className="px-3 py-3 text-xs font-bold uppercase tracking-[.2em] text-red-300">Admin dashboard</p>
                  <nav aria-label="Dashboard" className="grid gap-1">
                    <button onClick={() => setTab("overview")} className={tabClass(tab === "overview")}>Dashboard Overview</button>
                    <button onClick={() => setTab("navigation")} className={tabClass(tab === "navigation")}>Navigation Management</button>
                    <button onClick={() => setTab("flyers")} className={tabClass(tab === "flyers")}>Flyer Management</button>
                    <button onClick={() => setTab("profile")} className={tabClass(tab === "profile")}>My Profile</button>
                    <button onClick={logout} className="rounded-lg px-4 py-3 text-left text-sm font-bold text-white/75 hover:bg-white/10 hover:text-white">Logout</button>
                  </nav>
                </aside>

                <section className="min-w-0">
                  {tab === "overview" && (
                    <>
                      <p className="text-sm font-bold uppercase tracking-[.2em] text-red-300">Welcome back</p>
                      <h1 className="mt-2 font-serif text-4xl font-bold">Hello, {user.name}</h1>
                      <p className="mt-3 text-white/70">Manage your website navigation and demo account settings.</p>
                      <div className="mt-8 grid gap-5 sm:grid-cols-2">
                        <article className="rounded-2xl bg-white p-6 text-neutral-900 shadow-xl">
                          <p className="text-sm font-bold uppercase tracking-wide text-neutral-500">Navigation items</p>
                          <p className="mt-2 font-serif text-4xl font-bold text-brand">{enabledCount}</p>
                          <button onClick={() => setTab("navigation")} className="mt-5 text-sm font-bold text-brand hover:underline">Manage navigation →</button>
                        </article>
                        <article className="rounded-2xl bg-white p-6 text-neutral-900 shadow-xl">
                          <p className="text-sm font-bold uppercase tracking-wide text-neutral-500">Signed in as</p>
                          <p className="mt-3 break-all font-bold">{user.email}</p>
                          <button onClick={() => setTab("profile")} className="mt-5 text-sm font-bold text-brand hover:underline">Edit profile →</button>
                        </article>
                      </div>
                      <div className="mt-8 rounded-xl border border-amber-300/30 bg-amber-950/50 p-4 text-sm text-amber-100">
                        Demo mode: changes are stored only in this browser and are not protected by a real server.
                      </div>
                    </>
                  )}
                  {tab === "navigation" && (
                    <>
                      <h1 className="mb-6 font-serif text-4xl font-bold">Navigation Management</h1>
                      <NavigationManager />
                    </>
                  )}
                  {tab === "flyers" && (
                    <>
                      <h1 className="font-serif text-4xl font-bold">Flyer Management</h1>
                      <p className="mb-6 mt-2 text-white/70">Create and preview flyers assigned to any menu or submenu page.</p>
                      <FlyerManager />
                    </>
                  )}
                  {tab === "profile" && (
                    <>
                      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                        <div>
                          <h1 className="font-serif text-4xl font-bold">My Profile</h1>
                          <p className="mt-2 text-white/70">Manage your account information.</p>
                        </div>
                        <Link href="/profile" className="text-sm font-bold text-red-200 hover:underline">Open profile page →</Link>
                      </div>
                      <DemoProfileForm />
                    </>
                  )}
                </section>
              </div>
            </main>
          );
        }}
      </ProtectedDemoPage>
      <Footer />
    </>
  );
}
