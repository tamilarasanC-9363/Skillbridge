import { NavLink } from 'react-router-dom';

export default function Sidebar({ links = [], title }) {
  return (
    <aside className="w-full md:w-64 bg-white/80 dark:bg-[#1B2731] backdrop-blur-xl border border-[#EBE5DE] dark:border-white/10 rounded-3xl flex-shrink-0 md:min-h-[calc(100vh-6rem)] shadow-sm">
      <div className="p-5">
        {title && (
          <h2 className="text-[11px] font-extrabold text-[#283845] dark:text-[#FFA649] uppercase tracking-wider mb-3 px-2">
            {title}
          </h2>
        )}
        <nav className="space-y-1">
          {links.map((link, idx) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={idx}
                to={link.path}
                end={link.end}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-2xl transition-all duration-200 select-none ${
                    isActive
                      ? 'bg-[#FFA649]/15 text-[#283845] dark:text-[#FFA649] font-extrabold shadow-xs'
                      : 'text-stone-600 dark:text-stone-400 hover:text-[#283845] dark:hover:text-white hover:bg-stone-100/80 dark:hover:bg-stone-800/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#FFA649]' : 'text-stone-400'}`} />}
                    <span>{link.label}</span>
                    {link.badge > 0 && (
                      <span className="ml-auto text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FFA649] text-[#11171E]">
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
