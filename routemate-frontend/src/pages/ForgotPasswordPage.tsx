import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput } from '@/components/common/TextInput';
import { forgotPassword } from '@/lib/userApi';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleResetPassword() {
    setErrorMessage('');

    const trimmedIdentity = usernameOrEmail.trim();

    if (!trimmedIdentity || !newPassword || !confirmPassword) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      await forgotPassword({
        usernameOrEmail: trimmedIdentity,
        newPassword,
      });

      navigate('/', {
        replace: true,
        state: {
          signUpSuccess: 'Password reset successful. Please log in with your new password.',
          username: trimmedIdentity,
        },
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to reset password.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page auth-page">
      <button className="auth-back-button" onClick={() => navigate('/')}>
        <span aria-hidden="true">?</span>
        <span>Back to Login</span>
      </button>

      <div className="auth-page__header">
        <h1 className="page-title auth-page__title">Forgot Password?</h1>
      </div>

      <div className="form-stack auth-form">
        <TextInput
          label="Username or Email"
          placeholder="Enter your username or email"
          value={usernameOrEmail}
          onChange={(event) => setUsernameOrEmail(event.target.value)}
        />
        <TextInput
          label="Enter New Password"
          type="password"
          placeholder="Enter your new password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
        <TextInput
          label="Re-enter New Password"
          type="password"
          placeholder="Re-enter your new password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              void handleResetPassword();
            }
          }}
        />
      </div>

      {errorMessage ? (
        <div className="auth-message auth-message--error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      <button
        className="primary-button primary-button--pill auth-submit-button"
        onClick={() => void handleResetPassword()}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Resetting...' : 'Reset Password'}
      </button>
    </div>
  );
}
