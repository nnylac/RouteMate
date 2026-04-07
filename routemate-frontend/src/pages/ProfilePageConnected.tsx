import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTopBar } from '@/components/common/PageTopBar';
import type { User } from '@/lib/userApi';

export function ProfilePageConnected() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('routemate-user');

    if (!storedUser) {
      return;
    }

    try {
      setUser(JSON.parse(storedUser) as User);
    } catch {
      localStorage.removeItem('routemate-user');
    }
  }, []);

  return (
    <div className="page">
      <PageTopBar title="Profile" titleAlign="left" />

      <div className="profile-header page-section">
        <div className="avatar-placeholder" />
        <div className="profile-edit-pencil">+</div>
        <div className="profile-name">{user?.fullName ?? 'John Doe'}</div>
        <button
          className="primary-button primary-button--pill profile-action-button"
          onClick={() => navigate('/profile/edit')}
        >
          Edit Profile
        </button>
      </div>

      <div className="settings-list page-section">
        <button className="settings-row">
          <span>Payment Method</span>
          <span>&gt;</span>
        </button>
        <button className="settings-row">
          <span>Notification Preferences</span>
          <span>&gt;</span>
        </button>
      </div>

      <button
        className="logout-button"
        onClick={() => {
          localStorage.removeItem('routemate-user');
          navigate('/');
        }}
      >
        Logout
      </button>
    </div>
  );
}
