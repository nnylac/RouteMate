import { useEffect, useState } from 'react';
import { Mail01Icon, PencilEdit01Icon, SquareLock02Icon, User03Icon, Call02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { PageTopBar } from '@/components/common/PageTopBar';
import { TextInput } from '@/components/common/TextInput';
import { clearStoredUser, readStoredUser, writeStoredUser } from '@/lib/authStorage';
import { updateUser, type User } from '@/lib/userApi';

export function EditProfilePageConnected() {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedUser = readStoredUser();

    if (!storedUser) {
      setErrorMessage('No signed-in user found. Please log in again.');
      return;
    }

    setUser(storedUser);
    setFullName(storedUser.fullName ?? '');
    setEmail(storedUser.email ?? '');
    setPhoneNumber(storedUser.phoneNumber ?? '');
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
      const trimmedPhoneNumber = phoneNumber.trim();
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

      const wantsPasswordChange = password.length > 0;

      if (wantsPasswordChange) {
        setErrorMessage('Password changes are not supported from this screen yet.');
        setIsSubmitting(false);
        return;
      }

      const nextStoredUser = writeStoredUser({
        ...nextUser,
        phoneNumber: trimmedPhoneNumber || user.phoneNumber,
      });
      setUser(nextStoredUser);
      setPassword('');
      setSuccessMessage('Profile updated successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update profile.';
      if (message === 'No signed-in user found. Please log in again.') {
        clearStoredUser();
      }
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page">
      <PageTopBar title="Edit Profile" titleAlign="center" showBack showNotifications={false} />

      <div className="profile-header page-section">
        <div className="profile-avatar-wrap">
          <div className="avatar-placeholder profile-avatar-placeholder" />
          <button type="button" className="profile-edit-pencil" aria-label="Edit profile">
            <HugeiconsIcon icon={PencilEdit01Icon} size={18} strokeWidth={1.8} />
          </button>
        </div>
        <div className="profile-name">{user?.fullName ?? 'Profile'}</div>
      </div>

      <div className="form-stack form-stack--full page-section profile-edit-form">
        <TextInput
          label="Full Name"
          icon={<HugeiconsIcon icon={User03Icon} size={20} strokeWidth={1.8} />}
          placeholder={user?.fullName ?? 'John Doe'}
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        />
        <TextInput
          label="Password"
          type="password"
          icon={<HugeiconsIcon icon={SquareLock02Icon} size={20} strokeWidth={1.8} />}
          placeholder="****************"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <TextInput
          label="E-mail"
          type="email"
          icon={<HugeiconsIcon icon={Mail01Icon} size={20} strokeWidth={1.8} />}
          placeholder={user?.email ?? 'johndoe@gmail.com'}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <TextInput
          label="Phone No."
          type="tel"
          icon={<HugeiconsIcon icon={Call02Icon} size={20} strokeWidth={1.8} />}
          placeholder={user?.phoneNumber ?? '+65 8123 4567'}
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
        />
      </div>

      {errorMessage ? (
        <div className="auth-message auth-message--error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      <div className="profile-actions">
        <button
          className="primary-button primary-button--pill profile-action-button profile-action-button--edit"
          onClick={() => void handleSave()}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </button>
        {successMessage ? (
          <div className="auth-message auth-message--success" role="status">
            {successMessage}
          </div>
        ) : null}
      </div>
    </div>
  );
}
