"use client";

import DemoProfileForm from "@/components/DemoProfileForm";
import ProtectedDemoPage from "@/components/ProtectedDemoPage";

export default function ProfileClient() {
  return (
    <ProtectedDemoPage>
      {(user) => (
        <main className="bg-site relative isolate min-h-[65vh] px-4 py-12 sm:px-8">
          <div className="absolute inset-0 -z-10 bg-black/80" />
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-sm font-bold uppercase tracking-[.2em] text-red-300">Account</p>
                <h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">My Profile</h1>
                <p className="mt-3 text-white/75">Manage your account details and password.</p>
              </div>
              <a href="#profile-details" className="rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase text-white transition hover:bg-brand-dark">Edit Profile</a>
            </div>
            <section className="mb-8 flex flex-wrap items-center gap-5 rounded-2xl border border-white/10 bg-[#1a1111]/90 p-6 shadow-xl sm:p-8" aria-label="Account summary">
              {user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt={`${user.name}'s profile`} className="h-20 w-20 rounded-full object-cover ring-2 ring-brand" />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand font-serif text-3xl font-bold text-white">{user.name.slice(0, 1).toUpperCase()}</span>
              )}
              <div className="min-w-0">
                <p className="font-serif text-2xl font-bold">{user.name}</p>
                <p className="mt-1 break-all text-white/70">{user.email}</p>
                <span className="mt-3 inline-block rounded-full bg-brand/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-200">Administrator</span>
              </div>
            </section>
            <DemoProfileForm />
            <p className="mt-6 rounded-xl border border-amber-300/25 bg-amber-950/40 p-4 text-sm text-amber-100">
              Demo profile: updates are saved to this browser only and are not sent to a server.
            </p>
          </div>
        </main>
      )}
    </ProtectedDemoPage>
  );
}
