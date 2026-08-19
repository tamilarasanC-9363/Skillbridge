import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, Star, Droplets, Zap, Hammer, HardHat, Paintbrush, Sparkles } from 'lucide-react';

const STATIC_CATEGORIES = [
  { name: 'Plumbing', desc: 'Leaky pipes, faucet repairs, water tanks, toilet repairs.', icon: Droplets, iconColor: 'text-[#38BDF8]', iconBg: 'bg-[#38BDF8]/10' },
  { name: 'Electrical', desc: 'Wiring, MCBs, light installs, socket repairs, short-circuits.', icon: Zap, iconColor: 'text-[#F59E0B]', iconBg: 'bg-[#F59E0B]/10' },
  { name: 'Carpentry', desc: 'Door installation, cabinet repairs, wardrobe fixing, custom woodwork.', icon: Hammer, iconColor: 'text-[#F97316]', iconBg: 'bg-[#F97316]/10' },
  { name: 'Mason / Construction', desc: 'Brickwork, plastering, tile installation, cement work, masonry repairs.', icon: HardHat, iconColor: 'text-[#EAB308]', iconBg: 'bg-[#EAB308]/10' },
  { name: 'Painting', desc: 'Interior & exterior wall painting, waterproof coatings, ceilings.', icon: Paintbrush, iconColor: 'text-[#A855F7]', iconBg: 'bg-[#A855F7]/10' },
  { name: 'Cleaning', desc: 'Home deep cleaning, kitchen & bathroom sanitation, office tidying.', icon: Sparkles, iconColor: 'text-[#22C55E]', iconBg: 'bg-[#22C55E]/10' },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fade-in">
          <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-primary/20">
            On-Demand Staffing Platform
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-text-main tracking-tight mt-6 leading-tight max-w-4xl mx-auto">
            Find Background-Verified <span className="text-gradient">Skilled Workers</span> Instantly
          </h1>
          <p className="text-base sm:text-xl text-text-sub mt-6 max-w-2xl mx-auto leading-relaxed">
            SkillBridge connects households and businesses with trusted, local professionals for plumbing, electrical, construction, painting, and cleaning services.
          </p>
          <blockquote className="text-sm font-semibold text-text-muted mt-3 italic">
            "Bridging skills, building trust."
          </blockquote>
          
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/register" className="px-6 py-3.5 text-sm font-bold text-white btn-gradient rounded-xl shadow-md">
              Get Started Now
            </Link>
            <Link to="/login" className="px-6 py-3.5 text-sm font-bold text-text-sub bg-card-bg border border-border-custom rounded-xl hover:bg-white/5 hover:text-white transition-all shadow-2xs">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 border-y border-border-custom bg-card-bg/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text-main">What service do you need?</h2>
            <p className="text-sm text-text-muted mt-2">Explore our list of vetted capabilities available on-demand.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {STATIC_CATEGORIES.map((cat, index) => {
              const Icon = cat.icon;
              return (
                <div 
                  key={index}
                  className="p-6 border border-border-custom rounded-2xl text-left bg-card-bg hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-xs transition-all duration-200 flex gap-4"
                >
                  <div className={`p-3.5 rounded-xl ${cat.iconBg} ${cat.iconColor} flex-shrink-0 flex items-center justify-center w-12 h-12`}>
                    <Icon className="w-6 h-6 stroke-[2.2px]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-text-main text-base">{cat.name}</h3>
                    <p className="text-xs text-text-sub mt-1 leading-relaxed">{cat.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust & Safety Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card-bg p-8 rounded-2xl border border-border-custom text-center md:text-left flex flex-col items-center md:items-start">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-[#8B9CFF] mb-5">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-text-main">100% Vetted Workers</h3>
              <p className="text-xs text-text-sub mt-2 leading-relaxed">
                Every professional goes through administrative identity checks and skill certifications validation before being verified.
              </p>
            </div>

            <div className="bg-card-bg p-8 rounded-2xl border border-border-custom text-center md:text-left flex flex-col items-center md:items-start">
              <div className="w-12 h-12 bg-[#FBBF24]/10 rounded-xl flex items-center justify-center text-[#FBBF24] mb-5">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-text-main">Smart Recommendation</h3>
              <p className="text-xs text-text-sub mt-2 leading-relaxed">
                Our ranking algorithm sorts workers by ratings, proximity, job fit accuracy, and experience, guaranteeing the best match.
              </p>
            </div>

            <div className="bg-card-bg p-8 rounded-2xl border border-border-custom text-center md:text-left flex flex-col items-center md:items-start">
              <div className="w-12 h-12 bg-[#4ADE80]/10 rounded-xl flex items-center justify-center text-[#4ADE80] mb-5">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-text-main">Transparent Pricing</h3>
              <p className="text-xs text-text-sub mt-2 leading-relaxed">
                Clear price estimations are provided upfront for every service type. Final deals are locked with no hidden platform fees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-12 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold">2,500+</div>
              <div className="text-xs text-indigo-100 mt-1 font-semibold uppercase tracking-wider">Completed Jobs</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold">450+</div>
              <div className="text-xs text-indigo-100 mt-1 font-semibold uppercase tracking-wider">Verified Workers</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold">4.8/5</div>
              <div className="text-xs text-indigo-100 mt-1 font-semibold uppercase tracking-wider">Customer Rating</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-extrabold">15 min</div>
              <div className="text-xs text-indigo-100 mt-1 font-semibold uppercase tracking-wider">Average Match Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action footer */}
      <section className="py-16 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-main">Join SkillBridge Today</h2>
          <p className="text-sm text-text-sub mt-3 max-w-lg mx-auto leading-relaxed">
            Whether you are looking to hire a professional for home fixes or you are a skilled worker seeking verified job contracts, SkillBridge is built for you.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/register?role=customer" className="px-6 py-3 text-sm font-bold text-white btn-gradient rounded-xl shadow-xs">
              Register as Customer
            </Link>
            <Link to="/register?role=worker" className="px-6 py-3 text-sm font-bold text-text-sub border border-border-custom hover:bg-white/5 hover:text-white rounded-xl transition-all">
              Join as Skilled Worker
            </Link>
          </div>
        </div>
      </section>

      {/* Footer copyright */}
      <footer className="bg-slate-950/80 text-text-muted py-8 text-center text-xs border-t border-border-custom">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>© {new Date().getFullYear()} SkillBridge. All rights reserved.</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
