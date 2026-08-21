import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';

export default function FullScreenLoader({
  visible = false,
  title = 'Almost there!',
  subtitle = 'Setting everything up for you…',
  customProgress = null
}) {
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  useEffect(() => {
    if (!visible || customProgress !== null) return;

    const timer = setTimeout(() => {
      setSimulatedProgress(12);
    }, 50);

    const interval = setInterval(() => {
      setSimulatedProgress((prev) => {
        if (prev >= 96) return prev;
        const increment = Math.max(1, Math.floor((100 - prev) * 0.12));
        return Math.min(96, prev + increment);
      });
    }, 120);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [visible, customProgress]);

  if (!visible) return null;

  const progress = customProgress !== null ? Math.min(100, Math.max(0, customProgress)) : simulatedProgress;

  // SVG Circular Ring calculations
  const size = 160;
  const strokeWidth = 8;
  const center = size / 2;
  const radius = center - strokeWidth - 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Loading..."
    >
      {/* Centered Rounded Dark Modal */}
      <div className="bg-[#18222B] border border-white/15 rounded-3xl p-8 sm:p-9 max-w-sm w-full text-center shadow-2xl relative overflow-hidden backdrop-blur-2xl animate-scale-up">
        {/* Top subtle gold glow accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#FFA649]/15 rounded-full blur-3xl pointer-events-none" />

        {/* 1. SkillBridge Logo and Tagline at Top */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#283845] via-[#384F60] to-[#FFA649] p-[1.5px] shadow-lg mb-2.5">
            <div className="w-full h-full bg-[#283845] rounded-[14px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#FFA649]" />
            </div>
          </div>
          <h2 className="text-xl font-extrabold font-heading text-gradient tracking-tight">
            SkillBridge
          </h2>
          <p className="text-[11px] font-medium text-stone-400 dark:text-stone-400 mt-0.5 tracking-wide">
            Bridging Skills, Building Trust
          </p>
        </div>

        {/* 2. Large Glowing Gold Circular Progress Ring with 0-100% counter */}
        <div className="relative flex items-center justify-center my-6">
          <svg
            width={size}
            height={size}
            className="transform -rotate-90 filter drop-shadow-[0_0_16px_rgba(255,166,73,0.35)]"
          >
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFA649" />
                <stop offset="50%" stopColor="#FFC837" />
                <stop offset="100%" stopColor="#FF8A00" />
              </linearGradient>
            </defs>

            {/* Background Ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Glowing Active Progress Ring */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              stroke="url(#goldGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-[stroke-dashoffset] duration-300 ease-out"
            />
          </svg>

          {/* Counter inside the circle */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-extrabold text-white font-mono tracking-tight">
              {progress}%
            </span>
          </div>
        </div>

        {/* 3. “Almost there!” below the ring */}
        <div className="space-y-1 mt-2">
          <h3 className="text-base font-bold text-white font-heading tracking-tight">
            {title}
          </h3>

          {/* 4. “Setting everything up for you…” at the bottom */}
          <p className="text-xs text-stone-400 leading-relaxed font-normal">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
