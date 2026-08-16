import styles from './TaskCard.module.css';

function TaskCard({ task, onComplete }) {
    return (
        <div className={styles.card}>
            <button className={styles.checkbox} aria-label="Mark complete" onClick={onComplete} />
            <div className={styles.body}>
                <p className={styles.title}>{task.title}</p>
                <p className={styles.meta}>
                    <span className={styles.metaText}>{capitalize(task.type)} | </span>
                    <span className={styles.metaText}>{task.estimated_hours ? `${task.estimated_hours}h | ` : ''}</span>
                    {task.dueLabel && (
                        <span className={task.dueLabel.urgent ? styles.dueUrgent : styles.dueNormal}>
                            {' '}{task.dueLabel.text}
                        </span>
                    )}
                </p>
            </div>
        </div>
    );
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export default TaskCard;