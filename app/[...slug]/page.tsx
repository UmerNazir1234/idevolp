import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DynamicPublicPage from "@/components/DynamicPublicPage";

export default function GeneratedPage({ params }: { params: { slug: string[] } }) {
  return (
    <>
      <Header />
      <DynamicPublicPage slug={params.slug} />
      <Footer />
    </>
  );
}
