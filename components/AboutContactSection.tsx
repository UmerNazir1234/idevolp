import SectionHeading from "./SectionHeading";
import { ABOUT, SITE } from "@/lib/config";
export default function AboutContactSection() {
  return (
    <section className="grid gap-12 bg-page px-4 pb-32 pt-10 sm:px-3 md:grid-cols-[1.6fr_1fr]">
      <div>
        <SectionHeading>About Us</SectionHeading>
        <p className="mt-10 px-1 text-justify text-[17px] leading-[1.85] sm:px-3">{ABOUT}</p>
      </div>
      <div>
        <SectionHeading>Contact Us</SectionHeading>
        <address className="mt-10 space-y-6 text-[17px] not-italic">
          <p>{SITE.city}</p>
          <p><a href={`mailto:${SITE.email}`} className="hover:underline">{SITE.email}</a></p>
          <p>Tel:<a href={`tel:${SITE.phone.replace(/\./g, "")}`} className="hover:underline">{SITE.phone}</a></p>
        </address>
      </div>
    </section>
  );
}
