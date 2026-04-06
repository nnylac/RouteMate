import { PageTopBar } from '@/components/common/PageTopBar';
import { TextInput } from '@/components/common/TextInput';

export function EditProfilePage() {
  return (
    <div className="page">
      <PageTopBar title="Edit Profile" titleAlign="left" showBack showNotifications={false} />

      <div className="profile-header page-section">
        <div className="avatar-placeholder" />
        <div className="profile-edit-pencil">✎</div>
        <div className="profile-name">John Doe</div>
      </div>

      <div className="form-stack form-stack--full page-section">
        <TextInput label="Full Name" icon="👤" defaultValue="John Doe" />
        <TextInput label="Password" icon="🔒" type="password" defaultValue="************" />
        <TextInput label="E-mail" icon="✉" defaultValue="johndoe@gmail.com" />
        <TextInput label="Phone No." icon="☎" defaultValue="+65 8123 4567" />
      </div>

      <button className="primary-button primary-button--pill profile-action-button">Edit Profile</button>
    </div>
  );
}
