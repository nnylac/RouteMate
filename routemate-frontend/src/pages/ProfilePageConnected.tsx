import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight01Icon,
  LogoutSquare01Icon,
  PencilEdit01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { PageTopBar } from '@/components/common/PageTopBar';
import { clearStoredUser, readStoredUser } from '@/lib/authStorage';
import type { User } from '@/lib/userApi';

export function ProfilePageConnected() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(readStoredUser());
  }, []);

  return (
    <div className="page">
      <PageTopBar title="Profile" titleAlign="center" />

      <div className="profile-header page-section">
        <div className="profile-avatar-wrap">
          <div className="avatar-placeholder profile-avatar-placeholder" />
          <button
            type="button"
            className="profile-edit-pencil"
            aria-label="Edit profile"
            onClick={() => navigate('/profile/edit')}
          >
            <HugeiconsIcon icon={PencilEdit01Icon} size={18} strokeWidth={1.8} />
          </button>
        </div>
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
          <HugeiconsIcon icon={ArrowRight01Icon} size={24} strokeWidth={1.8} />
        </button>
        <button className="settings-row">
          <span>Notification Preferences</span>
          <HugeiconsIcon icon={ArrowRight01Icon} size={24} strokeWidth={1.8} />
        </button>
      </div>

      <button
        className="logout-button"
        onClick={() => {
          clearStoredUser();
          navigate('/');
        }}
      >
        Logout
        <HugeiconsIcon icon={LogoutSquare01Icon} size={24} strokeWidth={1.8} />
      </button>
    </div>
  );
}
