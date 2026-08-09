import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Gram2City Logistics',
  description:
    'Gram2City Logistics Terms of Service governing platform usage, parcel booking, and delivery terms.',
};

export default function TermsPage() {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content:
        'By creating an account, booking a shipment, or offering rider services on Gram2City, you agree to comply with and be bound by these Terms of Service. If you do not agree, you must discontinue platform access.',
    },
    {
      title: '2. Prohibited Items',
      content:
        'The following items are strictly prohibited from transit: illegal contraband, hazardous chemicals, firearms, explosives, unsealed perishable goods, or counterfeit currency. Gram2City reserves the right to inspect and reject suspicious parcels.',
    },
    {
      title: '3. Pricing & COD Payments',
      content:
        'Delivery costs are computed based on parcel weight, distance, and vehicle type requirements. For Cash-on-Delivery (COD) shipments, merchant funds will be transferred to your registered wallet upon verified delivery.',
    },
    {
      title: '4. Liability & Claims',
      content:
        'Gram2City covers lost or physically damaged parcels up to the maximum declared parcel value, provided claim tickets are filed within 48 hours of transit completion.',
    },
    {
      title: '5. Account Suspension',
      content:
        'We reserve the right to suspend or terminate accounts that engage in fraudulent bookings, abusive communication, or repeated delivery failures.',
    },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 font-urbanist min-h-screen py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-primary">
            User Agreement
          </span>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-2 mb-3">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500 font-medium">Last updated: August 8, 2026</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            Welcome to Gram2City Logistics. Please read these terms carefully before accessing our
            services.
          </p>

          {sections.map((s, idx) => (
            <div key={idx} className="border-t border-slate-100 dark:border-slate-800 pt-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{s.title}</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium text-sm md:text-base">
                {s.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
