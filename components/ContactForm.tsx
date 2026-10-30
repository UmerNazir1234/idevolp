"use client";

import { FormEvent, useState } from "react";
import { SITE } from "@/lib/config";

export default function ContactForm() {
  const [notice, setNotice] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const subject = encodeURIComponent(`Website inquiry from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "Not provided"}\n\n${message}`,
    );

    window.location.href = `mailto:${SITE.email}?subject=${subject}&body=${body}`;
    setNotice("Your email app should open with your message ready to send.");
  }

  const fieldClass =
    "w-full rounded-[4px] border border-brand bg-black/25 px-4 py-4 text-lg text-white outline-none transition placeholder:text-white/60 focus:border-red-500 focus:ring-2 focus:ring-brand/50";

  return (
    <form onSubmit={handleSubmit} className="mt-7 space-y-6">
      <label className="sr-only" htmlFor="contact-name">Name</label>
      <input id="contact-name" name="name" type="text" autoComplete="name" placeholder="Name" required className={fieldClass} />

      <label className="sr-only" htmlFor="contact-email">Email</label>
      <input id="contact-email" name="email" type="email" autoComplete="email" placeholder="Email" required className={fieldClass} />

      <label className="sr-only" htmlFor="contact-phone">Phone Number</label>
      <input id="contact-phone" name="phone" type="tel" autoComplete="tel" placeholder="Phone Number" className={fieldClass} />

      <label className="sr-only" htmlFor="contact-message">Message</label>
      <textarea id="contact-message" name="message" placeholder="Message" required rows={4} className={`${fieldClass} min-h-[140px] resize-y`} />

      <button type="submit" className="w-full rounded-md bg-brand py-4 font-serif text-xl font-bold uppercase text-white transition-colors hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black">
        Send
      </button>
      <p aria-live="polite" className="min-h-6 text-sm text-white/80">{notice}</p>
    </form>
  );
}
