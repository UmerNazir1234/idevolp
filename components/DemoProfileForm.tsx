"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import {
  getDemoPassword,
  getDemoProfile,
  setDemoPassword,
  setDemoProfile,
} from "@/lib/demo-store";
import PasswordInput from "@/components/PasswordInput";

export default function DemoProfileForm() {
  const [profile, setProfile] = useState(getDemoProfile);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  function chooseAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setNotice("");
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file for your profile picture.");
      event.target.value = "";
      return;
    }
    if (file.size > 1024 * 1024) {
      setError("Profile pictures must be 1 MB or smaller.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const avatar = reader.result;
      if (typeof avatar !== "string") {
        setError("This image could not be loaded. Please try another file.");
        return;
      }
      setProfile((current) => ({ ...current, avatar }));
      setNotice("Picture selected. Save your profile to apply it.");
    };
    reader.onerror = () => setError("This image could not be loaded. Please try another file.");
    reader.readAsDataURL(file);
  }

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    if (!name || !email) {
      setError("Enter your name and a valid email address.");
      return;
    }
    const updated = { ...profile, name, email };
    setDemoProfile(updated);
    setProfile(updated);
    setNotice("Profile updated.");
  }

  function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setError("");
    const form = new FormData(event.currentTarget);
    const current = String(form.get("current-password") ?? "");
    const next = String(form.get("new-password") ?? "");
    if (current !== getDemoPassword()) {
      setError("The current password does not match.");
      return;
    }
    if (next.length < 8) {
      setError("Your new password must be at least 8 characters.");
      return;
    }
    setDemoPassword(next);
    event.currentTarget.reset();
    setNotice("Demo password updated.");
  }

  const field = "mt-2 w-full rounded-md border border-black bg-white px-4 py-3 text-neutral-900 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form id="profile-details" onSubmit={saveProfile} className="rounded-2xl bg-white p-6 text-neutral-900 shadow-xl sm:p-8">
        <h2 className="font-serif text-2xl font-bold">Profile details</h2>
        <p className="mt-2 text-sm text-neutral-600">Update the name and email shown on your demo account.</p>
        <div className="mt-6 flex items-center gap-4">
          {profile.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar} alt="Profile preview" className="h-16 w-16 rounded-full object-cover ring-2 ring-brand/20" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand font-serif text-2xl font-bold text-white" aria-label="Profile initials">
              {profile.name.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div>
            <label htmlFor="profile-avatar" className="cursor-pointer rounded-full border border-brand px-4 py-2 text-sm font-bold text-brand hover:bg-brand hover:text-white">Choose picture</label>
            <input id="profile-avatar" type="file" accept="image/*" onChange={chooseAvatar} className="sr-only" />
            <p className="mt-2 text-xs text-neutral-500">Image file, up to 1 MB</p>
          </div>
        </div>
        <label className="mt-6 block text-sm font-bold" htmlFor="profile-name">Name</label>
        <input id="profile-name" name="name" defaultValue={profile.name} required className={field} />
        <label className="mt-5 block text-sm font-bold" htmlFor="profile-email">Email</label>
        <input id="profile-email" name="email" type="email" defaultValue={profile.email} required className={field} />
        <button className="mt-6 rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase text-white hover:bg-brand-dark">Save profile</button>
      </form>

      <form onSubmit={changePassword} className="rounded-2xl bg-white p-6 text-neutral-900 shadow-xl sm:p-8">
        <h2 className="font-serif text-2xl font-bold">Change password</h2>
        <p className="mt-2 text-sm text-neutral-600">Password changes are saved in this browser for the demo only.</p>
        <label className="mt-6 block text-sm font-bold" htmlFor="current-password">Current password</label>
        <PasswordInput id="current-password" name="current-password" autoComplete="current-password" required className={field} />
        <label className="mt-5 block text-sm font-bold" htmlFor="new-password">New password</label>
        <PasswordInput id="new-password" name="new-password" autoComplete="new-password" minLength={8} required className={field} />
        <button className="mt-6 rounded-full border border-brand px-6 py-3 text-sm font-bold uppercase text-brand hover:bg-brand hover:text-white">Update password</button>
      </form>

      <div aria-live="polite" className="lg:col-span-2">
        {error && <p role="alert" className="rounded-md bg-red-950 px-4 py-3 text-white">{error}</p>}
        {notice && <p className="rounded-md bg-green-900 px-4 py-3 text-white">{notice}</p>}
      </div>
    </div>
  );
}
