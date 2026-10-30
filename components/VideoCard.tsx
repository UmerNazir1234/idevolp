import SectionHeading from "./SectionHeading";
export default function VideoCard({ title, src, poster }: { title: string; src: string; poster?: string }) {
  return (
    <article>
      <SectionHeading icon>{title}</SectionHeading>
      <div className="mt-10 aspect-video overflow-hidden bg-black shadow-lg">
        <video controls playsInline preload="metadata" poster={poster} className="h-full w-full object-cover">
          <source src={src} type="video/mp4" />
        </video>
      </div>
    </article>
  );
}
