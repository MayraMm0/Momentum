import { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import TodayHeader from './TodayHeader';
import Timeline from './Timeline';
import TasksPanel from './TasksPanel';
import MotivationCard from './MotivationCard';
import StatsRow from './StatsRow';

function Dashboard({ token, onAuthError }) {
    const [today, setToday] = useState(null);
    const [quote, setQuote] = useState(null);
    const [allTasks, setAllTasks] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [coursesActiveCount, setCoursesActiveCount] = useState(0);

    // handle communication with api
    useEffect(() => {
        async function loadDashboard() {
            try {
                const headers = {Authorization: `Bearer ${token}` };

                // Promise.all -> fires all at once (independent fetches) and returns array of results in the same order
                const [todayRes, motivationRes, tasksRes, userRes, coursesRes] = await Promise.all([
                    fetch('http://localhost:8000/today', { headers }),
                    fetch('http://localhost:8000/motivation', { headers }),
                    fetch('http://localhost:8000/tasks/list', { headers }),
                    fetch('http://localhost:8000/users/me', { headers }),
                    fetch('http://localhost:8000/courses/list', { headers }),
                ]);


                if ([todayRes, motivationRes, tasksRes, userRes, coursesRes].some((r) => r.status === 401)) {
                    // Log out, not an error message
                    onAuthError();
                    return;
                }

                if (![todayRes, motivationRes, tasksRes, userRes, coursesRes].every((r) => r.ok)) {
                    throw new Error('Failed to load dashboard data');
                }

                const todayData = await todayRes.json();
                const motivationData = await motivationRes.json();
                const tasksData = await tasksRes.json();
                const userData = await userRes.json();
                const coursesData = await coursesRes.json();

                setToday(todayData);
                setQuote(motivationData.quote);
                setAllTasks(tasksData);
                setUser(userData);
                setCoursesActiveCount(coursesData.length);

            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadDashboard();
    }, [token, onAuthError]);

    async function handleTaskComplete(taskId) {
        try {
            const response = await fetch(`http://localhost:8000/tasks/complete/${taskId}`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.status === 401) {
                onAuthError();
                return;
            }

            if (!response.ok) return;

            setAllTasks((prev) => prev.filter((t) => t.id !== taskId));
        } catch {
            // Silent error for now, not an error screen
        }
    }


    if (loading) return <p>Loading dashboard...</p>;
    if (error) return <p style={{color: 'red'}}>{error}</p>;


    return (
        <div className={styles.layout}>
            <Sidebar user={user} />
            <TopBar user={user} />
            
            <main className={styles.main}>
                <div className={styles.topMain}>
                    <div className={styles.schedule}>
                        <TodayHeader today={today} />
                        <Timeline today={today} />
                        <StatsRow coursesActive={coursesActiveCount} />
                    </div>
                    
                    <div className={styles.quoteTasksItems}>
                        <MotivationCard quote={quote} />
                        <TasksPanel tasks={allTasks} token={token} onTaskComplete={handleTaskComplete} />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;

