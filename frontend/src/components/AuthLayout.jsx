import styles from './AuthLayout.module.css';
import logo from '../assets/logo.png';

function AuthLayout({ children }) {
    return (
        <div className={styles.page}>
            <div className={styles.dark}>
                <div className={styles.card}>
                    <div className={styles.logo}>
                        <img className={styles.logoImg} src={logo} alt="Momentum" />
                        <h1 className={styles.logoTitle}>Momentum</h1>
                        <span className={styles.subtitle}>Academic Productivity</span>
                    </div>

                    {children}
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

export default AuthLayout;