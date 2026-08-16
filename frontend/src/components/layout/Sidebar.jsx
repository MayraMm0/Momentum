// NavLink knows current URL
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Calendar, CheckSquare, Rocket, Settings, HelpCircle} from 'lucide-react';
import styles from './Sidebar.module.css';
import logoMark from '../../assets/logo.png';

function Sidebar({ user }) {
    // grabs the first two characters of the username string
    const initials = user?.username ? user.username.slice(0, 2).toUpperCase(): '?';

    const navItems = [
        { label: 'Today', icon: LayoutGrid, path: '/today' },
        { label: 'Week', icon: Calendar, path: null },
        { label: 'Tasks', icon: CheckSquare, path: '/tasks' },
        { label: 'Motivation', icon: Rocket, path: null },
    ];

    const bottomItems = [
        { label: 'Settings', icon: Settings},
        { label: 'More', icon: HelpCircle},
    ];

    return (
        <nav className={styles.sidebar}>
            <div className={styles.logoRow}>
                <img className={styles.logoMark} src={logoMark} alt="Momentum" />
                <span className={styles.logoText}>Momentum</span>
            </div>

            <div className={styles.profileCard}>
                <div className={styles.avatarPlaceholder}>{initials}</div>
                <div className={styles.profileText}>
                    <span className={styles.profileName}>{ user?.username}</span>
                    <span className={styles.profileDegree}>{user?.degree}</span>
                </div>
            </div>

            <ul className={styles.navList}>
                {/* Icon in destructuring (each icon is a component) */}
                {navItems.map(({ label, icon: Icon, path }) => (
                    <li key={label}>
                        {path ? (
                            <NavLink
                                to={path}
                                className={({ isActive }) => (isActive ? styles.navItemActive : styles.navItem)}
                            >
                                <Icon size={18} />
                                <span>{label}</span>
                            </NavLink>
                        ) : (
                            <span className={styles.navItem}>
                                <Icon size={18} />
                                <span>{label}</span>
                            </span>
                        )}
                    </li>
                ))}
            </ul>

            <ul className={styles.bottomNav}>
                {bottomItems.map(({ label, icon: Icon}) => (
                    <li key={label} className={styles.navItem}>
                        <Icon size={18} />
                        <span>{label}</span>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default Sidebar;