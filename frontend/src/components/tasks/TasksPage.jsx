import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import styles from './TasksPage.module.css';
import TaskFilters from './TaskFilters';
import TaskQueueCard from './TaskQueueCard';
import MotivationCard from '../dashboard/MotivationCard';
import AddTaskModal from '../modals/AddTaskModal';

function TasksPage({ token, onAuthError }) {
    const [tasks, setTasks] = useState([]);
    const [courses, setCourses] = useState([]);
    const [quote, setQuote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedCourseId, setSelectedCourseId] = useState('all');
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedPriorities, setSelectedPriorities] = useState([]);
    const [selectedHours, setSelectedHours] = useState(null);
    const [selectedFinish, setSelectedFinish] = useState([]);
    const [showAddTask, setShowAddTask] = useState(false);

    async function loadTasksPage() {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [tasksRes, coursesRes, motivationRes] = await Promise.all([
                fetch('http://localhost:8000/tasks/list/with-predictions', { headers }),
                fetch('http://localhost:8000/courses/list', { headers }),
                fetch('http://localhost:8000/motivation', { headers }),
            ]);

            if ([tasksRes, coursesRes, motivationRes].some((r) => r.status === 401)) {
                onAuthError();
                return;
            }

            if (![tasksRes, coursesRes, motivationRes].every((r) => r.ok)) {
                throw new Error('Failed to load tasks page');
            }

            setTasks(await tasksRes.json());
            setCourses(await coursesRes.json());
            setQuote((await motivationRes.json()).quote);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadTasksPage();
    }, [token, onAuthError]);

    async function handleTaskComplete(taskId) {
        try {
            const response = await fetch(`http://localhost:8000/tasks/complete/${taskId}`, {
                method: 'PATCH',
                headers: { Authorization:  `Bearer ${token}` },
            });

            if (response.status === 401) {
                onAuthError();
                return;
            }

            if(!response.ok) return;

            setTasks((prev) => prev.filter((t) => t.id !== taskId));
        } catch {
            // Silent for now
        }
    }

    if (loading) return <p>Loading tasks...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    // builds lookup obj from the courses array (.map -> [key, value], Object.fromEntries -> turns array into object)
    // this way we get course name from course_id
    const courseMap = Object.fromEntries(courses.map((c) => [c.id, c.name]));
    
    const priorityOptions = [...new Set(tasks.map((t) => t.priority_score))].sort((a, b) => a - b);

    // Checklist -> unrelated filter criteria that all need to agree independently (pass all)
    const filteredTasks = tasks.filter((t) => {
        if (selectedCourseId != 'all' && t.course_id !== selectedCourseId) return false;
        if (selectedTypes.length > 0 && !selectedTypes.includes(t.type)) return false;
        if (selectedPriorities.length > 0 && !selectedPriorities.includes(t.priority_score)) return false;
        if (selectedHours && !matchesHoursBucket(t.estimated_hours, selectedHours)) return false;
        if (selectedFinish.length > 0 && !matchesFinishDate(t.date_finish || t.date_start, selectedFinish)) return false;
        return true;
    });

    return (
        <>
            <div className={styles.page}>
                <TaskFilters
                    courses={courses}
                    selectedCourseId={selectedCourseId}
                    onCourseChange={setSelectedCourseId}
                    selectedTypes={selectedTypes}
                    onTypesChange={setSelectedTypes}
                    priorityOptions={priorityOptions}
                    selectedPriorities={selectedPriorities}
                    onPrioritiesChange={setSelectedPriorities}
                    selectedHours={selectedHours}
                    onHoursChange={setSelectedHours}
                    selectedFinish={selectedFinish}
                    onFinishChange={setSelectedFinish}
                />

                <div className={styles.main}>
                    <div className={styles.header}>
                        <div>
                            <h1 className={styles.pageTitle}>Task Queue</h1>
                            <p className={styles.pageSubtitle}>{filteredTasks.length} tasks pending</p>
                        </div>
                        <button className={styles.newTaskButton} aria-label="New task" onClick={() => setShowAddTask(true)}>
                            <Plus size={16} />
                            New Task
                        </button>
                    </div>

                    <div className={styles.taskList}>
                        {filteredTasks.length === 0 && <p className={styles.emptyState}>No tasks match these filters.</p>}
                        {filteredTasks.map((task) => (
                            <TaskQueueCard
                                key={task.id}
                                task={task}
                                courseName={task.course_id ? courseMap[task.course_id] : null}
                                onComplete={() => handleTaskComplete(task.id)}
                            />
                        ))}
                    </div>
                </div>

                <div className={styles.rightColumn}>
                    {quote && <MotivationCard quote={quote} />}
                </div>
            </div>

            {showAddTask && (
                <AddTaskModal token={token} onClose={() => setShowAddTask(false)} onCreated={loadTasksPage} />
            )}
        </>
    );
}

function matchesHoursBucket(hours, bucket) {
    if (hours == null) return false;
    if (bucket === '<1h') return hours < 1;
    if (bucket === '1-3h') return hours >= 1 && hours <= 3;
    if (bucket === '3h+') return hours > 3;
    return true;
}

function matchesFinishDate(rawDate, selectedBuckets) {
    if (!rawDate) return false;

    const today = startOfDay(new Date());
    const date = startOfDay(new Date(rawDate));
    const diffDays = Math.round((date - today) / (1000 * 60 * 60 * 24));

    return selectedBuckets.some((bucket) => {
        if (bucket === 'today') return diffDays === 0;
        if (bucket === 'thisWeek') return diffDays >= 0 && diffDays <=6;
        if(bucket === 'nextWeek') return diffDays >= 7 && diffDays <= 13;
        return false;
    });
}

function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0,0,0,0);
    return d;
}

export default TasksPage;