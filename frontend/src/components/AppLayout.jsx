import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import styles from './AppLayout.module.css';

function AppLayout({ token, onAuthError }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function loadUser() {
            try {
                const response = await fetch('http://localhost:8000/users/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.status === 401) {
                    onAuthError();
                    return;
                }

                if (response.ok) setUser(await response.json());
            } catch {
                // renders without user info
            }
        }

        loadUser();
    }, [token, onAuthError]);

    // Outlet renders child route that matches current URL
    return (
        <div className={styles.layout}>
            <Sidebar user={user} />
            <TopBar user={user} />

            <main className={styles.main}>
                <Outlet />
            </main>
        </div>
    );
}

export default AppLayout;