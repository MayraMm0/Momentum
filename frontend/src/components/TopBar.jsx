import styles from './TopBar.module.css';

function TopBar({ user }) {
    // grabs the first two characters of the username string
    const initials = user?.username ? user.username.slice(0, 2).toUpperCase(): '?';

    // area-label -> text description for screen readers (accessibility)
    return (
        <header className={styles.topbar}>
            <nav className={styles.tabs}>
                <span className={styles.tabInactive}>Weekly</span>
                <span className={styles.tabActive}>Daily</span>
            </nav>
            
            <div className={styles.actions}>
                <div className={styles.avatar} aria-label="User avatar">{initials}</div>
            </div>
        </header>
    );
}

export default TopBar;