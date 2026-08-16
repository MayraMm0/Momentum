import { Plus } from 'lucide-react';
import styles from './TodayHeader.module.css';


function TodayHeader({ today, onAddClick }) {
    const dateHeading = formatDateHeading(today.date);
    const semester = getMostCommonSemester(today.courses);

    return (
        <div className={styles.card}>
            <div>
                <p className={styles.dateText}>{dateHeading}</p>
                {semester && <p className={styles.semesterText}>{semester}</p>}
            </div>
            <button className={styles.addButton} aria-label="Add item" onClick={onAddClick}>
                <Plus size={14} />
            </button>
        </div>
    );
}

// transform "year-month-day" to local timezone
function formatDateHeading(dateString) {
    // Split string into separate variables
    const [year, month, day] = dateString.split('-').map(Number);
    // constructure builds date in local time
    // JS Date months are zero-indexed
    const date = new Date(year, month - 1, day);

    // toLocaleDateString -> converts to user timezone for display
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    });
}

function getMostCommonSemester(courses) {
    const counts = {};
    courses.forEach((c) => {
        if (c.semester) counts[c.semester] = (counts[c.semester] || 0) + 1;
    });

    let best = null;
    let bestCount = 0;
    Object.entries(counts).forEach(([semester, count]) => {
        if (count > bestCount) {
            best = semester;
            bestCount = count;
        }
    });

    return best;
}

export default TodayHeader;