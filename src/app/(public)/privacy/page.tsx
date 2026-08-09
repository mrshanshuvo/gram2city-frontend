import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Gram2City Logistics',
  description:
    'Gram2City Logistics Privacy Policy detailing data collection, processing, and protection practices.',
};

export default function PrivacyPage() {
  const sections = [
    {
      id: 'collection',
      title: '1. Information We Collect',
      content:
        'We collect information you provide directly to us when creating an account, booking a parcel shipment, requesting rider onboarding, or contacting customer support. This includes your full name, email address, phone number, delivery addresses, and payment transaction details.',
    },
    {
      id: 'usage',
      title: '2. How We Use Your Information',
      content:
        'We use collected data to facilitate parcel bookings, assign riders, calculate delivery fees, process COD payouts, provide tracking updates, send operational notifications, and enhance system performance.',
    },
    {
      id: 'sharing',
      title: '3. Data Sharing & Third Parties',
      content:
        'We do not sell your personal data. We share necessary recipient contact and address details only with assigned riders and third-party infrastructure providers (e.g., Stripe for payments, Firebase for authentication) strictly for service fulfillment.',
    },
    {
      id: 'security',
      title: '4. Data Security',
      content:
        'We employ industry-standard encryption, tokenized authentication via Firebase, and secure MongoDB data storage to safeguard your information against unauthorized access or disclosure.',
    },
    {
      id: 'rights',
      title: '5. Your Data Rights',
      content:
        'You have the right to inspect, update, or request the deletion of your personal account information at any time through your dashboard settings or by reaching out to our support team.',
    },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-950 font-urbanist min-h-screen py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-primary">
            Legal & Transparency
          </span>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-2 mb-3">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500 font-medium">Last updated: August 8, 2026</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            At Gram2City Logistics, we take your privacy seriously. This document outlines how we
            collect, store, process, and protect your personal information across our website and
            mobile application.
          </p>

          {sections.map((s) => (
            <div
              key={s.id}
              id={s.id}
              className="border-t border-slate-100 dark:border-slate-800 pt-6"
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{s.title}</h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium text-sm md:text-base">
                {s.content}
              </p>
            </div>
          ))}

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">6. Contact Us</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium text-sm">
              If you have questions regarding this Privacy Policy, please contact our Data Officer
              at{' '}
              <a
                href="mailto:privacy@gram2city.com"
                className="text-secondary font-bold hover:underline"
              >
                privacy@gram2city.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
