import { startTransition, useState } from 'react';
import { ListChecks, Plus } from 'lucide-react';
import TaskCard from './TaskCard';
import styles from './TasksPanel.module.css';

function TasksPanel({ tasks, token, onTaskComplete, onAddClick }) {
    const [activeCategory, setActiveCategory] = useState('All');

    const relevantTasks = getRelevantTasks(tasks);
    const categories = ['All', ...new Set(relevantTasks.map((t) => t.type))];
    const visibleTasks =
        activeCategory === 'All' ? relevantTasks : relevantTasks.filter((t) => t.type === activeCategory);

    return (
        <div className={styles.panel}>
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <ListChecks size={18} color="white" />
                    <span className={styles.headerTitle}>Tasks</span>
                </div>
                <div className={styles.headerRight}>
                    <div className={styles.divider} />
                    <button className={styles.addButton} aria-label="Add task" onClick={onAddClick}>
                        <Plus size={14} />
                    </button>
                </div>
            </div>

            <div className={styles.body}>
                {visibleTasks.length === 0 && <p className={styles.empty}>No tasks to show</p>}
                {visibleTasks.map((task) => (
                        <TaskCard key={task.id} task={task} onComplete={() => onTaskComplete(task.id)} />
                ))}
            </div>
            
            <div className={styles.footer}>
                {categories.map((cat) => (
                    <button 
                        key={cat}
                        className={cat === activeCategory ? styles.pillActive : styles.pill}
                        onClick={() => setActiveCategory(cat)} >
                            {cat === 'All' ? 'All' : capitalize(cat)}
                    </button>
                ))}
            </div>
        </div>
    );
}

function getRelevantTasks(tasks) {
    const today = startOfDay(new Date());
    const windowEnd = new Date(today);
    windowEnd.setDate(today.getDate() + 6);
    windowEnd.setHours(23, 59, 59, 999);

    const withMeta = tasks.map((t) => {
        const rawDate = t.date_finish || t.date_start;
        const refDate = rawDate ? startOfDay(new Date(rawDate)) : null;
        return { ...t, refDate, dueLabel: getDueLabel(refDate, today) };
    });

    // keep undated tasks always
    // keep dated tasks today + 6 days (so list doesnt cut short on friday, and the user can see further tasks)
    // and sort
    const relevant = withMeta.filter((t) => !t.refDate || t.refDate <= windowEnd);

    relevant.sort((a, b) => {
        if (!a.refDate && !b.refDate) return 0;
        if(!a.refDate) return 1;
        if(!b.refDate) return -1;
        return a.refDate - b.refDate;
    });

    console.log('relevant tasks:', relevant);
    return relevant;
}

function startOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

// JS getDay -> Sunday = 0
function getEndOfWeek(today) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return weekEnd;
}


function getDueLabel(refDate, today) {
    if (!refDate) return null;
    // diffDays is the gap between a task's reference date and today, in whole days
    const diffDays = Math.round((refDate - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: 'Overdue', urgent: true };
    if (diffDays === 0) return { text: 'Due Today', urgent: true };
    if (diffDays === 1) return { text: 'Due Tomorrow', urgent: false };
    return null;
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export default TasksPanel;