import { Metadata } from 'next';
import Banner from '@/components/Home/Banner/Banner';
import TrackerBar from '@/components/Home/Banner/TrackerBar';
import TopEnterprises from '@/components/Home/TopEnterprises/TopEnterprises';
import HowItWorks from '@/components/Home/HowItWorks/HowItWorks';
import OurServices from '@/components/Home/OurServices/OurServices';
import FeatureCards from '@/components/Home/FeatureCards/FeatureCards';
import Merchant from '@/components/Home/Merchant/Merchant';
import Testimonials from '@/components/Home/Testimonials/Testimonials';
import FAQ from '@/components/Home/FAQ/FAQ';
import CostCalculator from '@/components/Home/CostCalculator/CostCalculator';

export const metadata: Metadata = {
  title: 'Gram2City — Express Nationwide Logistics & Parcel Delivery',
  description:
    'Gram2City bridges the gap between village and city with fast, reliable, nationwide door-to-door parcel delivery and merchant logistics in Bangladesh.',
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function getLandingData() {
  const [bannersRes, partnersRes, servicesRes, featuresRes, testimonialsRes] = await Promise.all([
    fetch(`${apiUrl}/landing/banners`, { cache: 'no-store' })
      .then((r) => r.json())
      .catch(() => ({ data: [] })),
    fetch(`${apiUrl}/landing/partners`, { cache: 'no-store' })
      .then((r) => r.json())
      .catch(() => ({ data: [] })),
    fetch(`${apiUrl}/landing/services`, { cache: 'no-store' })
      .then((r) => r.json())
      .catch(() => ({ data: [] })),
    fetch(`${apiUrl}/landing/features`, { cache: 'no-store' })
      .then((r) => r.json())
      .catch(() => ({ data: [] })),
    fetch(`${apiUrl}/landing/testimonials`, { cache: 'no-store' })
      .then((r) => r.json())
      .catch(() => ({ data: [] })),
  ]);

  return {
    banners: bannersRes.data || [],
    partners: partnersRes.data || [],
    services: servicesRes.data || [],
    features: featuresRes.data || [],
    testimonials: testimonialsRes.data || [],
  };
}

export default async function Home() {
  const data = await getLandingData();

  return (
    <div>
      <Banner initialData={data.banners} />
      <TrackerBar />
      <TopEnterprises initialData={data.partners} />
      <OurServices initialData={data.services} />
      <CostCalculator />
      <HowItWorks />
      <FeatureCards initialData={data.features} />
      <Merchant />
      <Testimonials initialData={data.testimonials} />
      <FAQ
        limit={5}
        showSearch={false}
        showCategories={false}
        sortBy="helpful"
        title="Popular Questions"
        subtitle="Quick answers to our most frequently asked questions."
      />
    </div>
  );
}
