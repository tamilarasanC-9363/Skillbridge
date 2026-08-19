import React from 'react';
import * as Icons from 'lucide-react';

const CATEGORY_STYLES = {
  'Plumbing': { icon: 'Droplets', iconColor: 'text-[#38BDF8]', iconBg: 'bg-[#38BDF8]/10' },
  'Electrical': { icon: 'Zap', iconColor: 'text-[#F59E0B]', iconBg: 'bg-[#F59E0B]/10' },
  'Carpentry': { icon: 'Hammer', iconColor: 'text-[#F97316]', iconBg: 'bg-[#F97316]/10' },
  'Mason / Construction': { icon: 'HardHat', iconColor: 'text-[#EAB308]', iconBg: 'bg-[#EAB308]/10' },
  'Painting': { icon: 'Paintbrush', iconColor: 'text-[#A855F7]', iconBg: 'bg-[#A855F7]/10' },
  'Cleaning': { icon: 'Sparkles', iconColor: 'text-[#22C55E]', iconBg: 'bg-[#22C55E]/10' }
};

export default function ServiceCard({ name, description, onClick }) {
  const meta = CATEGORY_STYLES[name] || { icon: 'Wrench', iconColor: 'text-[#8B9CFF]', iconBg: 'bg-[#8B9CFF]/10' };
  const IconComponent = Icons[meta.icon] || Icons.Wrench;

  return (
    <button 
      onClick={onClick}
      className="w-full text-left p-6 rounded-2xl border border-border-custom bg-card-bg shadow-2xs hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm transition-all duration-200 cursor-pointer flex items-start gap-4 select-none"
    >
      <div className={`flex-shrink-0 p-3 rounded-xl ${meta.iconBg} ${meta.iconColor} flex items-center justify-center w-12 h-12`}>
        <IconComponent className="w-6 h-6 stroke-[2.2px]" />
      </div>
      <div>
        <h3 className="text-base font-bold text-text-main leading-tight">{name}</h3>
        <p className="text-xs text-text-sub mt-1.5 line-clamp-2 leading-relaxed">{description}</p>
      </div>
    </button>
  );
}
