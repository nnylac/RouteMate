import { useNavigate } from 'react-router-dom';
import { TextInput } from '@/components/common/TextInput';

export function SignUpPage() {
  const navigate = useNavigate();

  return (
    <div className="page auth-page">
      <button className="auth-back-button" onClick={() => navigate('/')}>
        <span aria-hidden="true">←</span>
        <span>Back to Login</span>
      </button>

      <div className="auth-page__header">
        <h1 className="page-title auth-page__title">Sign Up</h1>
      </div>

      <div className="form-stack auth-form">
        <TextInput label="Username" placeholder="Enter your username" />
        <TextInput label="Password" type="password" placeholder="Enter your password" />
        <TextInput label="Email" type="email" placeholder="Enter your email" />
        <TextInput label="Phone Number" type="tel" placeholder="+65 8123 4567" />
      </div>

      <button className="primary-button primary-button--pill auth-submit-button" onClick={() => navigate('/')}>
        Sign Up
      </button>
    </div>
  );
}
