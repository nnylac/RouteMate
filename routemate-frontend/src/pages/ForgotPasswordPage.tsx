import { useNavigate } from 'react-router-dom';
import { TextInput } from '@/components/common/TextInput';

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  return (
    <div className="page auth-page">
      <button className="auth-back-button" onClick={() => navigate('/')}>
        <span aria-hidden="true">←</span>
        <span>Back to Login</span>
      </button>

      <div className="auth-page__header">
        <h1 className="page-title auth-page__title">Forget Password?</h1>
      </div>

      <div className="form-stack auth-form">
        <TextInput
          label="Enter New Password"
          type="password"
          placeholder="Enter your new password"
        />
        <TextInput
          label="Re-enter New Password"
          type="password"
          placeholder="Re-enter your new password"
        />
      </div>

      <button className="primary-button primary-button--pill auth-submit-button" onClick={() => navigate('/')}>
        Reset Password
      </button>
    </div>
  );
}
