import SectionHeading from "./SectionHeading";
export default function VideoCard({ title, src, poster }: { title: string; src: string; poster?: string }) {
  return (
    <article className="min-w-0 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
      <SectionHeading icon>{title}</SectionHeading>
      <div className="mt-5 aspect-video overflow-hidden rounded-lg bg-black shadow-sm">
        <video controls playsInline preload="metadata" poster={poster} className="h-full w-full object-cover">
          <source src={src} type="video/mp4" />
        </video>
      </div>
    </article>
  );
}
