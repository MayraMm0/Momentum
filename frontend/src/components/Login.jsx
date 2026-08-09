import { useState } from 'react';
import styles from './Login.module.css';
import logo from '../assets/logo.png';

// setToken -> receives obj and pulls key as local variable
function Login({ setToken }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(e) {
        // stops entire page reload on form submition so func can run
        e.preventDefault();
        setError(null);

        try {
            // function on pause until fetch (a promise) resolves, without blocking page
            const response = await fetch('http://localhost:8000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            // Catches all error codes (401 or 404)
            if (!response.ok) {
                throw new Error('Invalid username or password');
            }

            const data = await response.json();
            setToken(data.access_token);
        } catch (err) {
            setError(err.message);
            setPassword('');
        }
    }

    // both inputs are "Controlled components" -> use "value" & "onChange" React state is single source of truth
    return (
        <div className={styles.page}>
            <div className={styles.dark}>
                <div className={styles.card}>
                    <div className={styles.logo}>
                        <img src={logo} alt="Momentum" className={styles.logoImg} />
                        <h1 className={styles.logoTitle}>Momentum</h1>
                        <span className={styles.subtitle}>Academic Productivity</span>
                    </div>

                    <form className={styles.form} onSubmit={handleSubmit}>

                        {error && <p className={styles.errorText}>{error}</p>}

                        <div className={styles.field}>
                            <span className={styles.label}>Username</span>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}>
                                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="8" r="4" />
                                        <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
                                    </svg>
                                </span>
                                <input
                                type="text"
                                className={styles.input}
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                />
                            </div>
                        </div>

                        <div className={styles.field}>
                            <div className={styles.labelRow}>
                                <span className={styles.label}>Password</span>
                            </div>
                            <div className={styles.inputWrapper}>
                                <span className={styles.inputIcon}>
                                    <svg width="14" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="4" y="11" width="16" height="10" rx="2" />
                                        <path d="M8 11V7a4 4 0 1 1 8 0v4" />
                                    </svg>
                                </span>
                                <input
                                type={showPassword ? 'text' : 'password'}
                                className={styles.input}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                />
                                <button
                                type="button"
                                className={styles.toggleVisibility}
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    <svg width="18" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <button type="submit" className={styles.submitButton}>
                        Login
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M13 6l6 6-6 6" />
                            </svg>
                        </button>

                        <div className={styles.divider}>
                            <p className={styles.footerLine}>
                                Don't have an account? <a href="#" className={styles.signUpLink}>Sign Up</a>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            <footer className={styles.siteFooter}>
                <span className={styles.siteFooterBrand}>Momentum</span>
                <span className={styles.siteFooterCopyright}>© 2026 Momentum Productivity. Built for Students.</span>
                <div className={styles.siteFooterLinks}>
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Help Center</a>
                    <a href="#">Contact Us</a>
                </div>
            </footer>
        </div>
    );
}

export default Login;