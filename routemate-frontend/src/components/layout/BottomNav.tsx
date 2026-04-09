import {
  CreditCardIcon,
  Home01Icon,
  MapsLocation01Icon,
  SingLeftIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { NavLink } from 'react-router-dom';

const items = [
  { to: '/home', label: 'Home', icon: Home01Icon },
  { to: '/routes', label: 'Routes', icon: MapsLocation01Icon },
  { to: '/cards', label: 'Cards', icon: CreditCardIcon },
  { to: '/profile', label: 'Profile', icon: SingLeftIcon },
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
          <span className="bottom-nav__icon">
            <HugeiconsIcon icon={item.icon} size={28} strokeWidth={1.8} />
          </span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
