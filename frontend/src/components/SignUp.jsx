import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import styles from './AuthForm.module.css';

function SignUp({ setToken }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [degree, setDegree] = useState('');
  const [gender, setGender] = useState('neutral');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const registerRes = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          degree: degree || 'general',
          gender,
        }),
      });

      if (!registerRes.ok) {
        const body = await registerRes.json().catch(() => null);
        throw new Error(body?.detail || 'Registration failed');
      }

      // Register and immediately log in using credentials -> get token
      const loginRes = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

     // Conditional redirect if login fails after registration
      if (!loginRes.ok) {
        navigate('/login');
        return;
      }

      const loginData = await loginRes.json();
      setToken(loginData.access_token);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AuthLayout>
      <form className={styles.form} onSubmit={handleSubmit}>
        {error && <p className={styles.errorText}>{error}</p>}

        <div className={styles.field}>
          <span className={styles.label}>Username</span>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              className={styles.input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Email</span>
          <div className={styles.inputWrapper}>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Password</span>
          <div className={styles.inputWrapper}>
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Confirm Password</span>
          <div className={styles.inputWrapper}>
            <input
              type="password"
              className={styles.input}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Degree (optional)</span>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. Aerospace Engineering"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Gender</span>
          <div className={styles.inputWrapper}>
            <select className={styles.select} value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="neutral">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <button type="submit" className={styles.submitButton}>Create Account →</button>

        <div className={styles.divider}>
          <p className={styles.footerLine}>
            Already have an account? <Link to="/login" className={styles.switchLink}>Log In</Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

export default SignUp;