import VideoCard from "./VideoCard";
import { VIDEOS } from "@/lib/config";
export default function VideoSection() {
  return (
    <section className="bg-page py-9 sm:py-12">
      <div className="site-container grid gap-6 sm:gap-7 md:grid-cols-3">
        {VIDEOS.map((v) => <VideoCard key={v.title} {...v} />)}
      </div>
    </section>
  );
}
