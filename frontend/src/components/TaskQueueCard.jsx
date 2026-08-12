import styles from './TaskQueueCard.module.css';

const ALT_TYPES = new Set(['personal', 'social']);

function TaskQueueCard({ task, courseName, onComplete }) {
  const isDueToday = task.date_finish && isToday(new Date(task.date_finish));

  return (
    <div className={styles.card}>
      <button className={styles.checkbox} aria-label="Mark complete" onClick={onComplete} />
      <div className ={styles.body}>
        <div className={styles.badgeRow}>
          {task.nlp_prediction && task.nlp_prediction.user_overrode_type ? (
            <span className={ALT_TYPES.has(task.type) ? styles.badgeAlt : styles.badge}>
              {task.type.toUpperCase()}
            </span>
          ) : (
            task.nlp_prediction && (
              <span className={ALT_TYPES.has(task.nlp_prediction.predicted_type) ? styles.badgeAlt : styles.badge}>
                prediction: {task.nlp_prediction.predicted_type.toUpperCase()}
              </span>
            )
          )}
          <span className={styles.priorityBadge}>priority: {task.priority_score}</span>
        </div>

        <p className={styles.title}>{task.title}</p>
        {task.description && <p className={styles.description}>{task.description}</p>}

        <div className={styles.metaRow}>
          {courseName && <span className={styles.metaItem}>{courseName}</span>}
          {task.estimated_hours != null && <span className={styles.metaItem}>{task.estimated_hours}h</span>}
          {task.date_finish && (
            <span className={isDueToday ? styles.dueToday : styles.metaItem}>
              {formatDueDate(task.date_finish)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function isToday(date) {
  // strips time component and returns str (e.g "Fri Aug 07 2026")
  // less precise, but works here because we just need a yes/no
  return date.toDateString() === new Date().toDateString();
}

function formatDueDate(dateString) {
  const date = new Date(dateString);
  if (isToday) return 'TODAY';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
}

export default TaskQueueCard;