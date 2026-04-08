import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextInput } from '@/components/common/TextInput';
import { registerUser } from '@/lib/userApi';

export function SignUpPageConnected() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignUp() {
    setErrorMessage('');

    if (!username.trim() || !password) {
      setErrorMessage('Username and password are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      await registerUser({
        fullName: username.trim(),
        email: `${username.trim().toLowerCase()}@routemate.local`,
        username: username.trim(),
        password,
      });

      navigate('/', {
        replace: true,
        state: {
          signUpSuccess: 'Account created. Please log in with your new details.',
          username: username.trim(),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create account.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page auth-page">
      <button className="auth-back-button" onClick={() => navigate('/')}>
        <span aria-hidden="true">&larr;</span>
        <span>Back to Login</span>
      </button>

      <div className="auth-page__header">
        <h1 className="page-title auth-page__title">Sign Up</h1>
      </div>

      <div className="form-stack auth-form">
        <TextInput
          label="Username"
          placeholder="Enter your username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
        <TextInput
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              void handleSignUp();
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
        onClick={() => void handleSignUp()}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Signing Up...' : 'Sign Up'}
      </button>
    </div>
  );
}
