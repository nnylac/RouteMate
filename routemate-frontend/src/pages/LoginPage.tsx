import { useNavigate } from 'react-router-dom';
import { TextInput } from '@/components/common/TextInput';

export function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="page page--centered login-page">
      <div className="avatar-placeholder avatar-placeholder--lg" />
      <h1 className="brand-title">RouteMate</h1>

      <div className="form-stack">
        <TextInput label="Username" placeholder="Enter your username" />
        <TextInput label="Password" type="password" placeholder="Enter your password" />
      </div>

      <button className="text-muted-button" onClick={() => navigate('/forgot-password')}>
        Forgot Password?
      </button>

      <button className="primary-button primary-button--pill" onClick={() => navigate('/home')}>
        Login
      </button>

      <p className="muted-text">
        or <button className="link-button" onClick={() => navigate('/sign-up')}>Sign Up</button>
      </p>
    </div>
  );
}
