import SectionHeading from "./SectionHeading";
import { ABOUT, SITE } from "@/lib/config";
export default function AboutContactSection() {
  return (
    <section className="bg-white py-9 sm:py-12">
      <div className="site-container grid gap-6 md:grid-cols-[1.6fr_1fr]">
      <div className="min-w-0 rounded-xl border border-neutral-200 bg-page p-5 sm:p-7">
        <SectionHeading>About Us</SectionHeading>
        <p className="mt-5 text-base leading-7 text-neutral-700 sm:text-[17px] sm:leading-8">{ABOUT}</p>
      </div>
      <div className="min-w-0 rounded-xl border border-neutral-200 bg-page p-5 sm:p-7">
        <SectionHeading>Contact Us</SectionHeading>
        <address className="mt-5 space-y-4 break-words text-base leading-7 not-italic text-neutral-700 sm:text-[17px]">
          <p>{SITE.city}</p>
          <p><a href={`mailto:${SITE.email}`} className="font-medium text-brand hover:underline">{SITE.email}</a></p>
          <p>Tel: <a href={`tel:${SITE.phone.replace(/\./g, "")}`} className="font-medium text-brand hover:underline">{SITE.phone}</a></p>
        </address>
      </div>
      </div>
    </section>
  );
}
