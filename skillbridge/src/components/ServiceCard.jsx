import * as Icons from 'lucide-react';

const CATEGORY_STYLES = {
  'Plumbing': { icon: 'Droplets', iconColor: 'text-[#FFA649]', iconBg: 'bg-[#FFA649]/15' },
  'Electrical': { icon: 'Zap', iconColor: 'text-[#283845] dark:text-[#FFA649]', iconBg: 'bg-[#283845]/10 dark:bg-[#283845]/40' },
  'Carpentry': { icon: 'Hammer', iconColor: 'text-[#FFA649]', iconBg: 'bg-[#FFA649]/15' },
  'Mason / Construction': { icon: 'HardHat', iconColor: 'text-[#283845] dark:text-[#FFA649]', iconBg: 'bg-[#283845]/10 dark:bg-[#283845]/40' },
  'Painting': { icon: 'Paintbrush', iconColor: 'text-[#FFA649]', iconBg: 'bg-[#FFA649]/15' },
  'Cleaning': { icon: 'Sparkles', iconColor: 'text-[#283845] dark:text-[#FFA649]', iconBg: 'bg-[#283845]/10 dark:bg-[#283845]/40' }
};

export default function ServiceCard({ name, description, onClick }) {
  const meta = CATEGORY_STYLES[name] || { icon: 'Wrench', iconColor: 'text-[#FFA649]', iconBg: 'bg-[#FFA649]/15' };
  const IconComponent = Icons[meta.icon] || Icons.Wrench;

  return (
    <button 
      onClick={onClick}
      className="w-full text-left p-5 sm:p-6 rounded-2xl border border-[#EBE5DE] dark:border-white/10 bg-white dark:bg-[#1B2731] hover:-translate-y-1 hover:border-[#FFA649]/60 dark:hover:border-[#FFA649]/60 hover:shadow-lg transition-all duration-300 cursor-pointer flex items-start gap-4 select-none group"
    >
      <div className={`flex-shrink-0 p-3 rounded-2xl ${meta.iconBg} ${meta.iconColor} flex items-center justify-center w-12 h-12 group-hover:scale-105 transition-transform`}>
        <IconComponent className="w-6 h-6 stroke-[2.2px]" />
      </div>
      <div>
        <h3 className="text-base font-bold text-[#283845] dark:text-white leading-tight font-heading group-hover:text-[#FFA649] transition-colors">
          {name}
        </h3>
        <p className="text-xs text-[#4A5B69] dark:text-stone-300 mt-1.5 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>
    </button>
  );
}
