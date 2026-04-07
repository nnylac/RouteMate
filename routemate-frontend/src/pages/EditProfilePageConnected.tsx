import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTopBar } from '@/components/common/PageTopBar';
import { TextInput } from '@/components/common/TextInput';
import { changePassword, updateUser, type User } from '@/lib/userApi';

export function EditProfilePageConnected() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('routemate-user');

    if (!storedUser) {
      setErrorMessage('No signed-in user found. Please log in again.');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser) as User;
      setUser(parsedUser);
      setFullName(parsedUser.fullName ?? '');
      setEmail(parsedUser.email ?? '');
    } catch {
      localStorage.removeItem('routemate-user');
      setErrorMessage('Unable to load your profile. Please log in again.');
    }
  }, []);

  async function handleSave() {
    if (!user) {
      setErrorMessage('No signed-in user found. Please log in again.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      let nextUser = user;
      const trimmedFullName = fullName.trim();
      const trimmedEmail = email.trim();
      const profileChanges: { fullName?: string; email?: string } = {};

      if (trimmedFullName && trimmedFullName !== user.fullName) {
        profileChanges.fullName = trimmedFullName;
      }

      if (trimmedEmail && trimmedEmail !== user.email) {
        profileChanges.email = trimmedEmail;
      }

      if (Object.keys(profileChanges).length > 0) {
        nextUser = await updateUser(user.id, profileChanges);
      }

      const wantsPasswordChange = currentPassword.length > 0 || newPassword.length > 0;

      if (wantsPasswordChange) {
        if (!currentPassword || !newPassword) {
          setErrorMessage('Enter both current and new password to update your password.');
          setIsSubmitting(false);
          return;
        }

        await changePassword(user.id, {
          currentPassword,
          newPassword,
        });
      }

      localStorage.setItem('routemate-user', JSON.stringify(nextUser));
      setUser(nextUser);
      setCurrentPassword('');
      setNewPassword('');
      setSuccessMessage('Profile updated successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update profile.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page">
      <PageTopBar title="Edit Profile" titleAlign="left" showBack showNotifications={false} />

      <div className="profile-header page-section">
        <div className="avatar-placeholder" />
        <div className="profile-edit-pencil">+</div>
        <div className="profile-name">{user?.fullName ?? 'Profile'}</div>
      </div>

      <div className="form-stack form-stack--full page-section">
        <TextInput label="Full Name" value={fullName} onChange={(event) => setFullName(event.target.value)} />
        <TextInput label="E-mail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <TextInput
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
        <TextInput
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
      </div>

      {errorMessage ? (
        <div className="auth-message auth-message--error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="auth-message auth-message--success" role="status">
          {successMessage}
        </div>
      ) : null}

      <div className="profile-actions">
        <button
          className="primary-button primary-button--pill profile-action-button"
          onClick={() => void handleSave()}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
        <button className="text-muted-button" onClick={() => navigate('/profile')}>
          Back to Profile
        </button>
      </div>
    </div>
  );
}
