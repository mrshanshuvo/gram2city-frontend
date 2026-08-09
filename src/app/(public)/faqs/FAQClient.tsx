'use client';

import React from 'react';
import FAQ from '@/components/Home/FAQ/FAQ';
import { motion } from 'framer-motion';
import {
  MdLocalShipping,
  MdAccountBalanceWallet,
  MdSecurity,
  MdChat,
  MdEmail,
  MdPhone,
  MdContactSupport,
} from 'react-icons/md';

const TOPICS = [
  { icon: <MdLocalShipping />, title: 'Shipping', desc: 'Tracking & Delivery' },
  {
    icon: <MdAccountBalanceWallet />,
    title: 'Payments',
    desc: 'Billing & Fees',
  },
  { icon: <MdSecurity />, title: 'Safety', desc: 'Goods Protection' },
];

export default function FAQClient() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-urbanist">
      {/* Header / Hero */}
      <div className="bg-[#0B0F19] py-16 border-b border-white/5">
        <div className="max-w-350 mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary text-[10px] font-black uppercase tracking-[0.2em]"
              >
                Help Center
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-black text-white tracking-tight"
              >
                Help <span className="text-secondary">Center</span>
              </motion.h1>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-400 text-base md:text-lg max-w-md md:text-right font-medium leading-relaxed"
            >
              Everything you need to know about our services, tracking, and more. We're here to help
              you move your goods safely.
            </motion.p>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-350 mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Sidebar - Navigation & Topics */}
          <aside className="lg:w-1/4 space-y-12">
            {/* Quick Topics */}
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#0B0F19] dark:text-white">
                Quick Topics
              </h3>
              <div className="space-y-3">
                {TOPICS.map((topic, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-slate-900 border border-transparent hover:border-secondary/20 transition-all cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-gray-400 group-hover:text-secondary transition-colors shadow-sm">
                      {topic.icon}
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#0B0F19] dark:text-white">
                        {topic.title}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {topic.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Support Box */}
            <div className="bg-[#0B0F19] rounded-2xl p-6 text-white space-y-6 relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-secondary/20 rounded-full blur-2xl" />
              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl text-secondary">
                  <MdContactSupport />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black">Need More Help?</h4>
                  <p className="text-gray-400 text-xs font-medium leading-relaxed">
                    Our support team is available 24/7 to assist you.
                  </p>
                </div>
                <div className="space-y-2 pt-2">
                  {[
                    { icon: <MdChat />, label: 'Live Chat' },
                    { icon: <MdEmail />, label: 'Email Support' },
                    { icon: <MdPhone />, label: 'Call Us' },
                  ].map((item, i) => (
                    <button
                      key={i}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group cursor-pointer"
                    >
                      <span className="text-secondary group-hover:scale-110 transition-transform">
                        {item.icon}
                      </span>
                      <span className="text-xs font-bold">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Right Content - Search & FAQs */}
          <main className="flex-1">
            <FAQ
              limit={50}
              showSearch={true}
              showCategories={true}
              title="Global Knowledge Base"
              subtitle="Search through our curated list of frequently asked questions and detailed answers."
            />
          </main>
        </div>
      </div>
    </div>
  );
}
