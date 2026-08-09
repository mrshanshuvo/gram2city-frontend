import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Truck, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | Gram2City Logistics',
  description:
    'Learn about Gram2City Logistics — connecting rural producers and urban consumers with express, reliable nationwide parcel delivery.',
};

export default function AboutPage() {
  const stats = [
    { label: 'Parcels Delivered', value: '500,000+' },
    { label: 'Districts Covered', value: '64 / 64' },
    { label: 'Active Riders', value: '2,500+' },
    { label: 'Merchant Partners', value: '10,000+' },
  ];

  const values = [
    {
      icon: <Truck className="w-8 h-8 text-primary" />,
      title: 'Speed & Reliability',
      desc: 'Same-day and next-day door-to-door delivery connecting remote villages to bustling urban hubs.',
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-secondary" />,
      title: 'Guaranteed Protection',
      desc: 'Real-time GPS tracking and 100% insured transit policy for every item shipped through our network.',
    },
    {
      icon: <Users className="w-8 h-8 text-accent" />,
      title: 'Empowering Communities',
      desc: 'Creating sustainable earning opportunities for thousands of freelance and full-time delivery riders.',
    },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 font-urbanist min-h-screen">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-20 md:py-28 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-4">
            Our Story
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            Bridging the Gap Between <br />
            <span className="text-primary">Gram</span> &{' '}
            <span className="text-secondary">City</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            We are building Bangladesh’s most reliable, tech-driven logistics infrastructure —
            empowering small businesses, artisans, and everyday senders.
          </p>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-black text-secondary mb-1">
                {stat.value}
              </div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-6">
              Empowering Commerce Across Every District
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed mb-4">
              Gram2City was born out of a simple vision: to eliminate geographic barriers in
              e-commerce and personal logistics. Whether you’re sending hand-woven goods from a
              rural village or delivering high-value electronics in the heart of Dhaka, we ensure
              safe and swift movement.
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
              Our automated dispatch routing, rider tracking technology, and transparent COD payout
              system make logistics hassle-free for merchants of all sizes.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-start gap-4"
              >
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl shrink-0">
                  {v.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    {v.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-6xl mx-auto px-6 pb-20">
        <div className="bg-primary text-white rounded-3xl p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
            Ready to Ship Your First Parcel?
          </h2>
          <p className="text-primary-foreground/80 max-w-lg mx-auto text-base mb-8">
            Create an account in less than 2 minutes and experience doorstep parcel collection
            today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/addParcel"
              className="px-8 py-4 bg-white text-primary font-black rounded-2xl shadow-lg hover:bg-slate-100 transition-all"
            >
              Book a Shipment
            </Link>
            <Link
              href="/beARider"
              className="px-8 py-4 bg-secondary text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 transition-all"
            >
              Become a Rider
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
