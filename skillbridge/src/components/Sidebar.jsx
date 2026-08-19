import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ links = [], title }) {
  return (
    <aside className="w-full md:w-64 bg-card-bg border-r border-border-custom flex-shrink-0 md:min-h-[calc(100vh-4rem)]">
      <div className="p-6">
        {title && <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">{title}</h2>}
        <nav className="mt-4 space-y-1.5">
          {links.map((link, idx) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={idx}
                to={link.path}
                end={link.end}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 select-none ${
                    isActive
                      ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-bold shadow-md shadow-indigo-500/25 border border-indigo-400/40 scale-[1.02]'
                      : 'text-text-sub hover:text-white hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                    <span>{link.label}</span>
                    {link.badge > 0 && (
                      <span className={`ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-primary text-white'
                      }`}>
                        {link.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
