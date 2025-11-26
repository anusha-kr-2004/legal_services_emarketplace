import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/axiosSetup';
import { useAuth } from '../context/AuthContext.jsx';
import { useNotification } from '../components/NotificationProvider.jsx';
import './Auth.css';

const roles = [
  { value: 'citizen', label: 'Citizen' },
  { value: 'advocate', label: 'Advocate' },
  { value: 'mediator', label: 'Mediator' },
  { value: 'arbitrator', label: 'Arbitrator' },
  { value: 'notary', label: 'Notary' },
  { value: 'document_writer', label: 'Document Writer' }
];

const initialLoginState = { email: '', password: '' };
const initialSignupState = {
  fullName: '',
  email: '',
  mobile: '',
  password: '',
  confirmPassword: '',
  role: 'citizen'
};

function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState(searchParams.get('mode') === 'signup' ? 'signup' : 'login');
  const [loginData, setLoginData] = useState(initialLoginState);
  const [signupData, setSignupData] = useState(initialSignupState);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const { notify } = useNotification();

  useEffect(() => {
    const urlMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
    if (urlMode !== mode) {
      setMode(urlMode);
    }
  }, [searchParams, mode]);

  const setModeWithUrl = nextMode => {
    setMode(nextMode);
    setSearchParams({ mode: nextMode });
    setFormError('');
  };

  const handleChange = e => {
    const { name, value } = e.target;
    if (mode === 'login') {
      setLoginData(prev => ({ ...prev, [name]: value }));
    } else {
      setSignupData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      let response;

      if (mode === 'login') {
        response = await api.post('/api/users/login', loginData);
      } else {
        if (signupData.password !== signupData.confirmPassword) {
          setFormError('Passwords do not match');
          notify({ type: 'error', message: 'Passwords do not match' });
          setSubmitting(false);
          return;
        }
        if (!/^\d{10}$/.test(signupData.mobile)) {
          setFormError('Enter a valid 10-digit mobile number');
          notify({ type: 'error', message: 'Enter a valid 10-digit mobile number' });
          setSubmitting(false);
          return;
        }

        const registerPayload = {
          fullName: signupData.fullName.trim(),
          name: signupData.fullName.trim(),
          email: signupData.email.trim().toLowerCase(),
          mobile: signupData.mobile.trim(),
          password: signupData.password,
          role: signupData.role
        };
        response = await api.post('/api/users/register', registerPayload);
      }

      const { token, user } = response.data;
      if (!token) {
        throw new Error('Authentication token missing from response');
      }
      setAuth({ token, user });
      setLoginData(initialLoginState);
      setSignupData(initialSignupState);
      notify({
        type: 'success',
        title: mode === 'login' ? 'Welcome back!' : 'Sign up complete',
        message: mode === 'login'
          ? 'You are now signed in.'
          : 'You are now signed in and can start booking services.'
      });
      navigate('/dashboard');
    } catch (err) {
      const action = mode === 'login' ? 'Login' : 'Signup';
      const errorMessage = err.response?.data?.message || `${action} failed`;
      setFormError(errorMessage);
      notify({ type: 'error', message: errorMessage });
    } finally {
      setSubmitting(false);
    }
  };

  const activeData = mode === 'login' ? loginData : signupData;
  const headline = mode === 'login' ? 'Welcome back' : 'Create your account';
  const helperText = mode === 'login'
    ? 'Enter your credentials to access your dashboard.'
    : 'Tell us a bit about yourself so we can personalise the workspace.';

  const stats = useMemo(
    () => [
      { label: 'Verified experts', value: '250+' },
      { label: 'Citizen requests', value: '1.2k' },
      { label: 'Avg. response time', value: '< 2 hrs' }
    ],
    []
  );

  return (
    <div className="auth-page">
      <section className="auth-hero">
        <p className="label">LegalConnect</p>
        <h1>One workspace for every legal conversation</h1>
        <p>
          Compare providers, raise service queries, chat securely, and track every action from
          a single dashboard built for citizens and legal experts.
        </p>
        <div className="auth-badges">
          {stats.map(stat => (
            <span key={stat.label} className="auth-badge">
              <strong>{stat.value}</strong> {stat.label}
            </span>
          ))}
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setModeWithUrl('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => setModeWithUrl('signup')}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <h2>{headline}</h2>
          <p className="form-helper">{helperText}</p>

          {mode === 'signup' && (
            <>
              <input
                name="fullName"
                placeholder="Full name"
                value={activeData.fullName}
                onChange={handleChange}
                required
              />
              <input
                name="mobile"
                placeholder="Mobile number"
                value={activeData.mobile}
                onChange={handleChange}
                required
              />
              <select name="role" value={activeData.role} onChange={handleChange}>
                {roles.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </>
          )}

          <input
            name="email"
            placeholder="Email address"
            type="email"
            value={activeData.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            placeholder="Password"
            type="password"
            value={activeData.password}
            onChange={handleChange}
            required
          />

          {mode === 'signup' && (
            <input
              name="confirmPassword"
              placeholder="Confirm password"
              type="password"
              value={activeData.confirmPassword}
              onChange={handleChange}
              required
            />
          )}

          {formError && <p className="form-error">{formError}</p>}

          <button type="submit" disabled={submitting}>
            {submitting ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>

        {mode === 'login' ? (
          <p className="auth-hint">
            New to LegalConnect?{' '}
            <button type="button" onClick={() => setModeWithUrl('signup')}>
              Create a free account
            </button>
          </p>
        ) : (
          <p className="auth-hint">
            Already registered?{' '}
            <button type="button" onClick={() => setModeWithUrl('login')}>
              Sign in here
            </button>
          </p>
        )}
      </section>
    </div>
  );
}

export default Login;
