import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TextInput } from '@/components/common/TextInput';
import { getUserById, loginUser } from '@/lib/userApi';

interface LoginLocationState {
  signUpSuccess?: string;
  username?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state as LoginLocationState | null) ?? null;
  const [usernameOrEmail, setUsernameOrEmail] = useState(locationState?.username ?? '');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState(locationState?.signUpSuccess ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!locationState?.signUpSuccess && !locationState?.username) {
      return;
    }

    navigate(location.pathname, { replace: true });
  }, [location.pathname, locationState?.signUpSuccess, locationState?.username, navigate]);

  async function handleLogin() {
    setErrorMessage('');
    setSuccessMessage('');

    if (!usernameOrEmail.trim() || !password) {
      setErrorMessage('Username or Password entered is incorrect. Try Again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await loginUser({
        usernameOrEmail: usernameOrEmail.trim(),
        password,
      });

      const user = await getUserById(response.user.id);
      localStorage.setItem('routemate-user', JSON.stringify(user));
      navigate('/home');
    } catch {
      setErrorMessage('Username or Password enetered is incorrect. Try Again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page page--centered login-page">
      <div className="avatar-placeholder avatar-placeholder--lg" />
      <h1 className="brand-title">RouteMate</h1>

      <div className="form-stack">
        <TextInput
          label="Username"
          placeholder="Enter your username"
          value={usernameOrEmail}
          onChange={(event) => setUsernameOrEmail(event.target.value)}
        />
        <TextInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              void handleLogin();
            }
          }}
        />
      </div>

      {successMessage ? (
        <div className="auth-message auth-message--success" role="status">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="auth-message auth-message--error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      <button className="text-muted-button" onClick={() => navigate('/forgot-password')}>
        Forgot Password?
      </button>

      <button
        className="primary-button primary-button--pill"
        onClick={() => void handleLogin()}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Logging In...' : 'Login'}
      </button>

      <p className="muted-text">
        or <button className="link-button" onClick={() => navigate('/sign-up')}>Sign Up</button>
      </p>
    </div>
  );
}
