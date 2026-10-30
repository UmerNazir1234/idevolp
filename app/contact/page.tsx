import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { FlyerSection } from "@/components/FlyerManagement";
import { SITE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Contact Us | iDeveloped Skills Academy",
  description: "Contact iDeveloped Skills Academy in Baton Rouge, Louisiana.",
};

function ContactIcon({ type }: { type: "location" | "phone" | "email" }) {
  const paths = {
    location: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    phone: <path d="M6.6 3.5 9 3l2 5-2.2 1.5a15 15 0 0 0 5.7 5.7L16 13l5 2-.5 2.4a3 3 0 0 1-3.3 2.4A17.5 17.5 0 0 1 4.2 6.8 3 3 0 0 1 6.6 3.5Z" />,
    email: <><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m4 7 8 6 8-6" /></>,
  };

  return (
    <span className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-full border-[3px] border-brand text-brand">
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {paths[type]}
      </svg>
    </span>
  );
}

export default function ContactPage() {
  const addressQuery = encodeURIComponent(SITE.address);

  return (
    <>
      <Header />
      <main>
        <section className="bg-site relative isolate overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 -z-10 bg-black/80" />
          <div className="mx-auto grid max-w-[1500px] gap-12 px-5 py-10 sm:px-8 sm:py-12 lg:grid-cols-2 lg:gap-8 lg:px-6 lg:py-8">
            <div>
              <h1 className="font-serif text-3xl font-bold sm:text-4xl">Contact Us</h1>
              <div className="mt-5 h-[6px] w-full bg-brand" />

              <address className="not-italic">
                <div className="flex gap-5 border-b border-white/10 py-7 sm:gap-6">
                  <ContactIcon type="location" />
                  <div className="min-w-0">
                    <h2 className="font-serif text-2xl font-bold">Address</h2>
                    <p className="mt-3 text-xl font-bold leading-snug sm:text-2xl lg:text-[28px]">{SITE.address}</p>
                  </div>
                </div>
                <div className="flex gap-5 border-b border-white/10 py-7 sm:gap-6">
                  <ContactIcon type="phone" />
                  <div>
                    <h2 className="font-serif text-2xl font-bold">Phone</h2>
                    <a href={`tel:${SITE.phone.replace(/\./g, "")}`} className="mt-3 inline-block text-2xl font-bold hover:text-white/80 sm:text-[28px]">{SITE.phone}</a>
                  </div>
                </div>
                <div className="flex gap-5 border-b border-white/10 py-7 sm:gap-6">
                  <ContactIcon type="email" />
                  <div className="min-w-0">
                    <h2 className="font-serif text-2xl font-bold">Email</h2>
                    <a href={`mailto:${SITE.email}`} className="mt-3 inline-block break-all text-xl font-bold hover:text-white/80 sm:text-2xl lg:text-[28px]">{SITE.email}</a>
                  </div>
                </div>
              </address>
            </div>

            <div>
              <h2 className="font-serif text-3xl font-bold sm:text-4xl">Send Us a Message</h2>
              <ContactForm />
            </div>
          </div>
        </section>

        <section aria-label="Our location" className="bg-[#100909] px-4 py-8 sm:px-5 sm:py-10">
          <div className="mx-auto max-w-[1500px] border-b-[6px] border-brand pb-5">
            <iframe
              title="Map showing iDeveloped Skills Academy in Baton Rouge"
              src={`https://maps.google.com/maps?q=${addressQuery}&output=embed`}
              className="h-[340px] w-full border-0 sm:h-[440px] lg:h-[520px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>
        <FlyerSection pageId="default-contact" pageLabel="Contact" />
      </main>
      <Footer />
    </>
  );
}
