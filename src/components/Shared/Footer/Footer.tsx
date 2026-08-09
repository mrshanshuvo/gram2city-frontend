'use client';

import React, { useState, useEffect } from 'react';
import { ChevronUp, Phone, MapPin, Mail } from 'lucide-react';
import Gram2CityLogo from '@/components/Shared/Gram2CityLogo/Gram2CityLogo';
import { FooterProps } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { axiosPublic } from '@/api/axios';
import { toast } from 'sonner';
import {
  FaWhatsapp,
  FaXTwitter,
  FaFacebook,
  FaLinkedin,
  FaInstagram,
  FaYoutube,
} from 'react-icons/fa6';

const Footer: React.FC<FooterProps> = ({ foundingYear = 2024 }) => {
  const currentYear = new Date().getFullYear();
  const [isVisible, setIsVisible] = useState(false);

  const { data: config } = useQuery({
    queryKey: ['landing-config'],
    queryFn: async () => {
      const res = await axiosPublic.get('/landing/config');
      return res.data.data;
    },
  });

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const socialLinks = [
    {
      name: 'X',
      url: config?.socialLinks?.twitter || '#',
      icon: <FaXTwitter size={18} />,
    },
    {
      name: 'YouTube',
      url: config?.socialLinks?.youtube || '#',
      icon: <FaYoutube size={18} />,
    },
    {
      name: 'Facebook',
      url: config?.socialLinks?.facebook || '#',
      icon: <FaFacebook size={18} />,
    },
    {
      name: 'LinkedIn',
      url: config?.socialLinks?.linkedin || '#',
      icon: <FaLinkedin size={18} />,
    },
    {
      name: 'Instagram',
      url: config?.socialLinks?.instagram || '#',
      icon: <FaInstagram size={18} />,
    },
  ];

  const footerGroups = [
    {
      title: 'Solutions',
      links: [
        { name: 'Express Delivery', path: '/addParcel' },
        { name: 'Rider Onboarding', path: '/beARider' },
        { name: 'Coverage Map', path: '/coverage' },
        { name: 'Merchant Portal', path: '/dashboard/merchantParcels' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', path: '/about' },
        { name: 'Service Areas', path: '/coverage' },
        { name: 'Careers & Join Us', path: '/beARider' },
        { name: 'Contact Support', path: '/contact' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', path: '/faqs' },
        { name: 'Track Order', path: '/dashboard/trackParcel' },
        { name: 'Privacy Policy', path: '/privacy' },
        { name: 'Terms of Service', path: '/terms' },
      ],
    },
  ];

  return (
    <footer className="bg-[#0B0F19] text-gray-400 pt-16 pb-8 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-125 h-125 bg-secondary/5 blur-[120px] rounded-full -mr-64 -mt-64" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-13 gap-30 pb-6">
          <div className="lg:col-span-4 space-y-4">
            <div className="scale-110 origin-left">
              <Gram2CityLogo />
            </div>
            <p className="text-gray-400 text-lg leading-relaxed font-medium">
              Bridging the gap between village and city with the fastest, most reliable logistics
              network in the nation.
            </p>

            {/* Newsletter Section */}
            <div className="space-y-2">
              <div className="space-y-1">
                <h4 className="text-gray-300 text-md font-black tracking-tight">
                  Get the latest updates, offers and logistics.
                </h4>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const target = e.target as HTMLFormElement;
                  const email = (target.elements.namedItem('email') as HTMLInputElement).value;
                  try {
                    const res = await axiosPublic.post('/landing/subscribe', {
                      email,
                    });
                    if (res.data.success) {
                      target.reset();
                      toast.success('Welcome to the family! 🚀');
                    }
                  } catch (err: unknown) {
                    toast.error(
                      (err as { response?: { data?: { message?: string } } }).response?.data
                        ?.message || 'Something went wrong',
                    );
                  }
                }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Email address"
                  className="flex-1 px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold placeholder:text-gray-600 focus:outline-none focus:border-accent transition-all text-sm"
                />
                <button className="px-6 py-3.5 bg-accent text-black font-black rounded-xl hover:bg-white transition-all duration-500 shadow-xl shadow-accent/20 text-sm uppercase tracking-widest">
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 mb-16">
              {footerGroups.map((group) => (
                <div key={group.title}>
                  <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-8">
                    {group.title}
                  </h3>
                  <ul className="space-y-4">
                    {group.links.map((link) => (
                      <li key={link.name}>
                        <a
                          href={link.path}
                          className="text-gray-400 hover:text-white hover:translate-x-2 inline-block transition-all duration-300 font-bold"
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-2">
            {/* Address - Maps Link */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('Plot 45, Gulshan Avenue, Dhaka, Bangladesh')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <div className="p-3 rounded-full flex items-center justify-center text-gray-400 shrink-0">
                <MapPin size={20} />
              </div>
              <span className="text-sm font-semibold whitespace-pre-line pt-2.5 leading-relaxed">
                {config?.contactInfo?.address || 'Plot 45, Gulshan Avenue,\nDhaka, BD'}
              </span>
            </a>

            {/* Phone - tel: link */}
            <a
              href={`tel:${config?.contactInfo?.phone || '+8801700000000'}`}
              className="flex items-center gap-2"
            >
              <div className="p-3 rounded-full flex items-center justify-center text-gray-400 shrink-0">
                <Phone size={18} />
              </div>
              <span className="text-sm font-semibold">
                {config?.contactInfo?.phone || '+880 1700 000 000'}
              </span>
            </a>

            {/* WhatsApp - wa.me link */}
            <a
              href={`https://wa.me/${(config?.contactInfo?.whatsapp || '8801700000000').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <div className="p-3 rounded-full flex items-center justify-center text-gray-400 shrink-0">
                <FaWhatsapp size={18} />
              </div>
              <span className="text-sm font-semibold">
                {config?.contactInfo?.whatsapp || '+880 1700 000 000'}
              </span>
            </a>

            {/* Email - mailto: link */}
            <a
              href={`mailto:${config?.contactInfo?.email || 'support@gram2city.com'}`}
              className="flex items-center gap-2"
            >
              <div className="p-3 rounded-full flex items-center justify-center text-gray-400 shrink-0">
                <Mail size={18} />
              </div>
              <span className="text-sm font-semibold">
                {config?.contactInfo?.email || 'support@gram2city.com'}
              </span>
            </a>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-12">
            <p className="text-gray-500 text-sm font-bold">
              &copy; {foundingYear}-{currentYear} Gram2City Logistics. All rights reserved.
            </p>
            <div className="flex gap-8">
              <a
                href="/terms"
                className="text-gray-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors"
              >
                Terms
              </a>
              <a
                href="/privacy"
                className="text-gray-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors"
              >
                Privacy
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:bg-accent hover:text-black hover:border-accent hover:-translate-y-1 transition-all duration-300"
                title={social.name}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-28 right-10 w-14 h-14 bg-primary text-white rounded-2xl shadow-[0_10px_30px_rgba(46,125,50,0.3)] flex items-center justify-center hover:bg-secondary hover:shadow-[0_10px_30px_rgba(30,90,168,0.3)] hover:-translate-y-2 transition-all z-50 group"
          aria-label="Scroll to top"
        >
          <ChevronUp className="group-hover:animate-bounce" size={24} />
        </button>
      )}
    </footer>
  );
};

export default Footer;
