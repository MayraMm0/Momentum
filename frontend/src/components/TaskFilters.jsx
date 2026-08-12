import { Filter } from 'lucide-react';
import styles from './TaskFilters.module.css';

function TaskFilters({
  courses, selectedCourseId, onCourseChange,
  selectedTypes, onTypesChange,
  priorityOptions, selectedPriorities, onPrioritiesChange,
  selectedHours, onHoursChange,
  selectedFinish, onFinishChange,
}) {
  const taskTypes = ['academic', 'personal', 'health', 'social'];
  const hoursBuckets = ['<1h', '1-3h', '3h+'];
  const finishOptions = [
    { key: 'today', label: 'Today' },
    { key: 'thisWeek', label: 'This Week' },
    { key: 'nextWeek', label: 'Next Week' },
  ];

  function toggleInArray(array, value, onChange) {
    if (array.includes(value)) {
      onChange(array.filter((v) => v !== value));
    } else {
      onChange([...array, value]);
    }
  }

  return (
    <aside className={styles.filters}>
      <p className={styles.heading}>
        <Filter size={20} />
        Filters
      </p>

      <div className={styles.group}>
        <p className={styles.groupLabel}>Courses</p>
        <select
          className={styles.select}
          value={selectedCourseId}
          onChange={(e) => onCourseChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
        >
          <option value="all">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className={styles.group}>
        <p className={styles.groupLabel}>Task Type</p>
        {taskTypes.map((type) => (
          <label key={type} className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={selectedTypes.includes(type)}
              onChange={() => toggleInArray(selectedTypes, type, onTypesChange)}
            />
            {capitalize(type)}
          </label>
        ))}
      </div>

      <div className={styles.group}>
        <p className={styles.groupLabel}>Priority</p>
        <div className={styles.pillGroup}>
          {priorityOptions.length === 0 && <span className={styles.emptyNote}>No data yet</span>}
          {priorityOptions.map((p) => (
            <button
              key={p}
              className={selectedPriorities.includes(p) ? styles.pillActive : styles.pill}
              onClick={() => toggleInArray(selectedPriorities, p, onPrioritiesChange)}
              aria-pressed={selectedPriorities.includes(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <p className={styles.groupLabel}>Estimated Hours</p>
        <div className={styles.pillGroup}>
          {hoursBuckets.map((bucket) => (
            <button
              key={bucket}
              className={selectedHours === bucket ? styles.pillActive : styles.pill}
              onClick={() => onHoursChange(selectedHours === bucket ? null : bucket)}
              aria-pressed={selectedHours === bucket}
            >
              {bucket}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.group}>
        <p className={styles.groupLabel}>Finish Date</p>
        {finishOptions.map(({ key, label }) => (
          <label key={key} className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={selectedFinish.includes(key)}
              onChange={() => toggleInArray(selectedFinish, key, onFinishChange)}
            />
            {label}
          </label>
        ))}
      </div>
    </aside>
  );
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default TaskFilters;