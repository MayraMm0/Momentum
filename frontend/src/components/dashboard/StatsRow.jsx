import { BookOpen, CheckCircle } from 'lucide-react';
import styles from './StatsRow.module.css';

function StatsRow({ coursesActive }) {
    return (
        <div className={styles.row}>
            <div className={styles.card}>
                <div className={`${styles.iconBox} ${styles.coursesIcon}`}>
                    <BookOpen size={22} />
                </div>
                <div>
                    <p className={styles.label}>Courses Active</p>
                    <p className={styles.value}>{coursesActive}</p>
                </div>
            </div>

            <div className={styles.card}>
                 <div className={`${styles.iconBox} ${styles.tasksIcon}`}>
                    <CheckCircle size={20} />
                </div>
                <div>
                    <p className={styles.label}>Tasks Done</p>
                    <p className={styles.value}>—</p>
                </div>
            </div>
        </div>
    );
}

export default StatsRow;