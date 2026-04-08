import { NavLink } from 'react-router-dom';

const items = [
  { to: '/home', label: 'Home', icon: '⌂' },
  { to: '/routes', label: 'Routes', icon: '⇄' },
  { to: '/cards', label: 'Cards', icon: '▣' },
  { to: '/profile', label: 'Profile', icon: '◯' },
];

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`
          }
        >
          <span className="bottom-nav__icon">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
