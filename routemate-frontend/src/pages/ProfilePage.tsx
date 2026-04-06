import { PageTopBar } from '@/components/common/PageTopBar';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <PageTopBar title="Profile" titleAlign="left" />

      <div className="profile-header page-section">
        <div className="avatar-placeholder" />
        <div className="profile-edit-pencil">✎</div>
        <div className="profile-name">John Doe</div>
        <button className="primary-button primary-button--pill profile-action-button" onClick={() => navigate('/profile/edit')}>
          Edit Profile
        </button>
      </div>

      <div className="settings-list page-section">
        <button className="settings-row">
          <span>Payment Method</span>
          <span>›</span>
        </button>
        <button className="settings-row">
          <span>Notification Preferences</span>
          <span>›</span>
        </button>
      </div>

      <button className="logout-button">⇲ Logout</button>
    </div>
  );
}
