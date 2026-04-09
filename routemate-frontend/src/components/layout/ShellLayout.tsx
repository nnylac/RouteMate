import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';

const hideNavRoutes = ['/'];

export function ShellLayout() {
  const location = useLocation();
  const hideNav = hideNavRoutes.includes(location.pathname);

  return (
    <div className="app-shell">
      <div className="phone-frame">
        <main className="page-content">
          <Outlet />
        </main>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
