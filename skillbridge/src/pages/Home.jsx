import { Link } from 'react-router-dom';
import { Shield, CheckCircle2, Star, Droplets, Zap, Hammer, HardHat, Paintbrush, Sparkles, ArrowRight, Clock, Award } from 'lucide-react';

const STATIC_CATEGORIES = [
  { 
    name: 'Plumbing', 
    desc: 'Pipe leakages, faucet repairs, water heaters, motor pump & drainage fixes.', 
    icon: Droplets, 
    badge: 'Urgent Dispatch',
    iconBg: 'bg-[#FFA649]/15 text-[#FFA649]' 
  },
  { 
    name: 'Electrical', 
    desc: 'MCB switches, wiring, ceiling fans, short-circuits & heavy appliance wiring.', 
    icon: Zap, 
    badge: 'High Demand',
    iconBg: 'bg-[#283845]/10 dark:bg-[#283845]/40 text-[#283845] dark:text-[#FFA649]' 
  },
  { 
    name: 'Carpentry', 
    desc: 'Custom wooden doors, locks, modular cabinets, furniture fixes & restoration.', 
    icon: Hammer, 
    badge: 'Master Artisan',
    iconBg: 'bg-[#FFA649]/15 text-[#FFA649]' 
  },
  { 
    name: 'Mason & Tiles', 
    desc: 'Brick construction, plastering, ceramic & marble tile laying, waterproofing.', 
    icon: HardHat, 
    badge: 'Certified Pro',
    iconBg: 'bg-[#283845]/10 dark:bg-[#283845]/40 text-[#283845] dark:text-[#FFA649]' 
  },
  { 
    name: 'Painting & Deco', 
    desc: 'Interior emulsion, weatherproof exterior coats, texture designs & primer prep.', 
    icon: Paintbrush, 
    badge: 'Trending',
    iconBg: 'bg-[#FFA649]/15 text-[#FFA649]' 
  },
  { 
    name: 'Deep Cleaning', 
    desc: 'Full home sanitization, kitchen chimney degreasing, bathroom scrubbing.', 
    icon: Sparkles, 
    badge: 'Sanitized',
    iconBg: 'bg-[#283845]/10 dark:bg-[#283845]/40 text-[#283845] dark:text-[#FFA649]' 
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between overflow-hidden">
      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Marigold atmospheric glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#FFA649]/15 dark:bg-[#FFA649]/20 blur-[140px] rounded-full pointer-events-none -z-10 animate-pulse-glow" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#283845]/15 dark:bg-[#283845]/30 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fade-in">
          {/* Trust Banner Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFA649]/15 dark:bg-[#FFA649]/20 border border-[#FFA649]/30 dark:border-[#FFA649]/40 shadow-xs mb-8">
            <span className="w-2 h-2 rounded-full bg-[#FFA649] animate-pulse"></span>
            <span className="text-xs font-extrabold text-[#283845] dark:text-[#FFA649] tracking-wide uppercase">
              India's Premier Verified Trades Network
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-heading text-[#283845] dark:text-white max-w-5xl mx-auto leading-[1.1]">
            Hire Background-Verified <br className="hidden sm:inline" />
            <span className="text-gradient">Master Craftsmen</span> On-Demand.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-[#4A5B69] dark:text-stone-300 mt-6 max-w-2xl mx-auto leading-relaxed font-normal">
            SkillBridge connects homeowners, contractors, and enterprises with vetted professionals for plumbing, electrical, carpentry, masonry, and painting.
          </p>

          {/* Interactive CTAs */}
          <div className="mt-10 flex flex-wrap justify-center items-center gap-4">
            <Link 
              to="/register?role=customer" 
              className="px-7 py-3.5 text-sm font-extrabold text-[#11171E] btn-gradient rounded-xl shadow-lg flex items-center gap-2 group"
            >
              <span>Book a Verified Pro</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link 
              to="/login" 
              className="px-6 py-3.5 text-sm font-bold text-[#283845] dark:text-stone-200 bg-white/90 dark:bg-[#1B2731]/90 border border-[#EBE5DE] dark:border-white/10 rounded-xl hover:bg-stone-50 dark:hover:bg-[#22313E] transition-all shadow-xs"
            >
              Sign In to Account
            </Link>
          </div>

          {/* Trust Highlights Row */}
          <div className="mt-14 pt-8 border-t border-[#EBE5DE] dark:border-white/10 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="flex items-center gap-3 p-2">
              <div className="w-9 h-9 rounded-xl bg-[#FFA649]/15 text-[#FFA649] flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#283845] dark:text-white">100% Vetted</div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400">Govt ID & Certs</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2">
              <div className="w-9 h-9 rounded-xl bg-[#283845]/10 dark:bg-[#283845]/40 text-[#283845] dark:text-[#FFA649] flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#283845] dark:text-white">15 Min Dispatch</div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400">Fast Local Match</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2">
              <div className="w-9 h-9 rounded-xl bg-[#FFA649]/15 text-[#FFA649] flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#283845] dark:text-white">4.8★ Rated</div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400">Verified Reviews</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2">
              <div className="w-9 h-9 rounded-xl bg-[#283845]/10 dark:bg-[#283845]/40 text-[#283845] dark:text-[#FFA649] flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#283845] dark:text-white">Fixed Estimates</div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400">Zero Hidden Costs</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES SECTION ================= */}
      <section className="py-20 bg-stone-100/60 dark:bg-[#16202A]/70 border-y border-[#EBE5DE] dark:border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-extrabold text-[#FFA649] tracking-wider uppercase">
              Specialized Trades
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#283845] dark:text-white font-heading mt-2">
              What service do you need today?
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 mt-3">
              Direct access to top-rated craftsmen equipped with professional gear.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {STATIC_CATEGORIES.map((cat, index) => {
              const Icon = cat.icon;
              return (
                <div 
                  key={index}
                  className="p-6 rounded-2xl bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 hover:shadow-xl hover:-translate-y-1 hover:border-[#FFA649]/60 dark:hover:border-[#FFA649]/60 transition-all duration-300 text-left flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div className={`p-3.5 rounded-xl ${cat.iconBg} flex items-center justify-center w-12 h-12`}>
                        <Icon className="w-6 h-6 stroke-[2.2px]" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-stone-100 dark:bg-[#11171E] text-[#283845] dark:text-[#FFA649] border border-[#EBE5DE] dark:border-white/10">
                        {cat.badge}
                      </span>
                    </div>

                    <h3 className="font-bold text-[#283845] dark:text-white text-lg group-hover:text-[#FFA649] transition-colors font-heading">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-2 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>

                  <Link 
                    to={`/customer/search?category=${encodeURIComponent(cat.name)}`}
                    className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#283845] dark:text-[#FFA649] group-hover:text-[#FFA649]"
                  >
                    <span>View Available Pros</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= TRUST & VALUE PROPOSITION ================= */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-[#1B2731] p-8 rounded-3xl border border-[#EBE5DE] dark:border-white/10 text-left relative overflow-hidden group hover:border-[#FFA649]/60 transition-all shadow-sm">
              <div className="w-12 h-12 bg-[#FFA649]/15 text-[#FFA649] rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-6 h-6 stroke-[2.2px]" />
              </div>
              <h3 className="text-lg font-bold text-[#283845] dark:text-white font-heading">Admin-Vetted Profiles</h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-2.5 leading-relaxed">
                Zero unverified workers. Every professional undergoes background checks, Aadhaar identity authentication, and skill review before acceptance.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-[#1B2731] p-8 rounded-3xl border border-[#EBE5DE] dark:border-white/10 text-left relative overflow-hidden group hover:border-[#FFA649]/60 transition-all shadow-sm">
              <div className="w-12 h-12 bg-[#283845]/10 dark:bg-[#283845]/40 text-[#283845] dark:text-[#FFA649] rounded-2xl flex items-center justify-center mb-6">
                <CheckCircle2 className="w-6 h-6 stroke-[2.2px]" />
              </div>
              <h3 className="text-lg font-bold text-[#283845] dark:text-white font-heading">Smart Match Engine</h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-2.5 leading-relaxed">
                Our ranking algorithm matches you with the nearest expert ranked by customer ratings, job fit precision, and verifiable track record.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-[#1B2731] p-8 rounded-3xl border border-[#EBE5DE] dark:border-white/10 text-left relative overflow-hidden group hover:border-[#FFA649]/60 transition-all shadow-sm">
              <div className="w-12 h-12 bg-[#FFA649]/15 text-[#FFA649] rounded-2xl flex items-center justify-center mb-6">
                <Star className="w-6 h-6 stroke-[2.2px]" />
              </div>
              <h3 className="text-lg font-bold text-[#283845] dark:text-white font-heading">Transparent Estimates</h3>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-2.5 leading-relaxed">
                Transparent standard pricing with upfront labor estimates. No hidden surge charges or surprises at job completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= METRICS PROOF BANNER (DEEP SLATE INK & MARIGOLD) ================= */}
      <section className="py-14 bg-[#283845] text-white relative overflow-hidden shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-4">
              <div className="text-3xl sm:text-5xl font-extrabold font-heading text-[#FFA649]">2,500+</div>
              <div className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-1.5">Jobs Completed</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-5xl font-extrabold font-heading text-[#FFA649]">450+</div>
              <div className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-1.5">Verified Pros</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-5xl font-extrabold font-heading text-[#FFA649]">4.8 / 5</div>
              <div className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-1.5">Customer Trust</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-5xl font-extrabold font-heading text-[#FFA649]">&lt; 15 min</div>
              <div className="text-xs text-stone-300 font-bold uppercase tracking-wider mt-1.5">Avg Match Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FINAL CALL TO ACTION ================= */}
      <section className="py-20 text-center relative">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#283845] dark:text-white font-heading">
            Ready to experience reliable trade service?
          </h2>
          <p className="text-sm text-stone-600 dark:text-stone-300 mt-4 leading-relaxed">
            Join thousands of satisfied homeowners and registered professionals across India.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link 
              to="/register?role=customer" 
              className="px-7 py-3.5 text-sm font-extrabold text-[#11171E] btn-gradient rounded-xl shadow-md"
            >
              Hire a Pro Today
            </Link>
            <Link 
              to="/register?role=worker" 
              className="px-6 py-3.5 text-sm font-bold text-[#283845] dark:text-stone-200 bg-white dark:bg-[#1B2731] border border-[#EBE5DE] dark:border-white/10 rounded-xl hover:bg-stone-50 dark:hover:bg-[#22313E] transition-all"
            >
              Apply as Skilled Worker
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-stone-100/90 dark:bg-[#0E1319] text-stone-500 py-10 text-xs border-t border-[#EBE5DE] dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold font-heading text-[#283845] dark:text-white text-sm">SkillBridge</span>
            <span>— Bridging skills, building trust.</span>
          </div>
          <div>© {new Date().getFullYear()} SkillBridge Network. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#FFA649] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#FFA649] transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-[#FFA649] transition-colors">Safety Verification</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
