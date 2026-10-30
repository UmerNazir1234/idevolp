import VideoCard from "./VideoCard";
import { VIDEOS } from "@/lib/config";
export default function VideoSection() {
  return (
    <section className="border-t border-white/10 bg-page px-4 pb-14 pt-14 sm:px-5">
      <div className="grid gap-12 md:grid-cols-3 md:gap-9">
        {VIDEOS.map((v) => <VideoCard key={v.title} {...v} />)}
      </div>
    </section>
  );
}
