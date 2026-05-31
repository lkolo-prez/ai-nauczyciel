import { NavLink } from 'react-router-dom';
import { useT } from '../lib/useT';

const items = [
  { to: '/', key: 'nav.home', icon: '🏠', end: true },
  { to: '/feed', key: 'nav.feed', icon: '⚡' },
  { to: '/cwicz', key: 'nav.practice', icon: '🎯' },
  { to: '/mapa', key: 'nav.map', icon: '🗺️' },
  { to: '/tutor', key: 'nav.ai', icon: '🤖' },
];

export default function BottomNav() {
  const { t } = useT();
  return (
    <nav className="sticky bottom-0 z-20 border-t border-white/5 bg-ink/85 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                isActive ? 'text-brand-400' : 'text-white/55 hover:text-white/80'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`text-lg transition ${isActive ? 'scale-110' : ''}`}>{it.icon}</span>
                {t(it.key)}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
