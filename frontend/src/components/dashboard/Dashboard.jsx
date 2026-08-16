import { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
import TodayHeader from './TodayHeader';
import Timeline from './Timeline';
import TasksPanel from './TasksPanel';
import MotivationCard from './MotivationCard';
import StatsRow from './StatsRow';
import AddTaskModal from '../modals/AddTaskModal';
import AddScheduleItemModal from '../modals/AddScheduleItemModal';

function Dashboard({ token, onAuthError }) {
  const [today, setToday] = useState(null);
  const [quote, setQuote] = useState(null);
  const [allTasks, setAllTasks] = useState([]);
  const [coursesActiveCount, setCoursesActiveCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddSchedule, setShowAddSchedule] = useState(false);

  // Moved as a normal function so its callable on mount and onCreated callbacks (modals)
  async function loadDashboard() {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [todayRes, motivationRes, tasksRes, coursesRes] = await Promise.all([
        fetch('http://localhost:8000/today', { headers }),
        fetch('http://localhost:8000/motivation', { headers }),
        fetch('http://localhost:8000/tasks/list', { headers }),
        fetch('http://localhost:8000/courses/list', { headers }),
      ]);

      if ([todayRes, motivationRes, tasksRes, coursesRes].some((r) => r.status === 401)) {
        onAuthError();
        return;
      }

      if (![todayRes, motivationRes, tasksRes, coursesRes].every((r) => r.ok)) {
        throw new Error('Failed to load dashboard data');
      }

      const todayData = await todayRes.json();
      const motivationData = await motivationRes.json();
      const tasksData = await tasksRes.json();
      const coursesData = await coursesRes.json();

      setToday(todayData);
      setQuote(motivationData.quote);
      setAllTasks(tasksData);
      setCoursesActiveCount(coursesData.length);
    } catch (err) {
      setError(err.message);
    } finally {
       setLoading(false);
    }
  }

  useEffect(() => {
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
      // Silent error for now
    }
  }

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <>
      <div className={styles.topMain}>
        <div className={styles.schedule}>
          <TodayHeader today={today} onAddClick={() => setShowAddSchedule(true)} />
          <Timeline today={today} />
          <StatsRow coursesActive={coursesActiveCount} />
        </div>

        <div className={styles.quoteTasksItems}>
          <MotivationCard quote={quote} />
          <TasksPanel 
            tasks={allTasks}
            token={token}
            onTaskComplete={handleTaskComplete}
            onAddClick={() => setShowAddTask(true)}
          />
        </div>
      </div>
        
      {showAddTask && (
        <AddTaskModal
          token={token}
          onClose={() => setShowAddTask(false)}
          onCreated={loadDashboard}
        />
      )}
      {showAddSchedule && (
        <AddScheduleItemModal
          token={token}
          onClose={() => setShowAddSchedule(false)}
          onCreated={loadDashboard}
        />
      )}
    </>
  );
}

export default Dashboard;