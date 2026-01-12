import PopularContentSection from './components/PopularContentSection';
import FeaturesSection from './components/FeaturesSection';
import HeroSection from './components/HeroSection';
import RecommendedCreatorsSection from './components/RecommendedCreatorsSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <FeaturesSection />
      <PopularContentSection />
      <RecommendedCreatorsSection />
    </div>
  );
}
