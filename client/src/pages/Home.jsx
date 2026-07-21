import Hero from "../components/home/Hero/Hero";
import About from "../components/home/About/About";
import Packages from "../components/home/Packages/Packages";
import Services from "../components/home/Services/Services";
import Banner from "../components/home/Banner/Banner";
import Gallery from "../components/home/Gallery/Gallery";
import Reviews from "../components/home/Reviews/Reviews";
import BookingBanner from "../components/home/booking/BookingBanner";
import Contact from "../components/Contact/Contact";
export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Packages />
      <Services />
      <Banner />
      <Gallery />
      <Reviews />
      <BookingBanner />
      <Contact />
    </>
  );
}
