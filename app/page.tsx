import Header from "@/components/Header";
import HeroSlider from "@/components/HeroSlider";
import MissionSection from "@/components/MissionSection";
import VideoSection from "@/components/VideoSection";
import AboutContactSection from "@/components/AboutContactSection";
import Footer from "@/components/Footer";
import { FlyerSection } from "@/components/FlyerManagement";
export default function Home() {
  return (<div className="home-page"><Header /><main><HeroSlider /><FlyerSection pageId="default-home" pageLabel="Home" /><MissionSection /><VideoSection /><AboutContactSection /></main><Footer /></div>);
}
