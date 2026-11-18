import { CategoriesSection } from "@/components/home/categories-section";
import { CtaSection } from "@/components/home/cta-section";
import { FeaturedServices } from "@/components/home/featured-services";
import { FeaturedVendors } from "@/components/home/featured-vendors";
import { Hero } from "@/components/home/hero";
import { Testimonials } from "@/components/home/testimonials";
import { HowItWorks, WhyChoose } from "@/components/home/why-choose";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedServices />
      <CategoriesSection />
      <WhyChoose />
      <HowItWorks />
      <FeaturedVendors />
      <Testimonials />
      <CtaSection />
    </>
  );
}
