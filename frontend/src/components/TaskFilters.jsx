function TaskFilters({
  courses, selectedCourseId, onCourseChange,
  selectedTypes, onTypesChange,
  priorityOptions, selectedPriorities, onPrioritiesChange,
  selectedHours, onHoursChange,
  selectedFinish, onFinishChange,
  quote,
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
    <aside>
      <p>Filters</p>

      <div>
        <p>Courses</p>
        <select
          value={selectedCourseId}
          onChange={(e) => onCourseChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
        >
          <option value="all">All Courses</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <p>Task Type</p>
        {taskTypes.map((type) => (
          <label key={type}>
            <input
              type="checkbox"
              checked={selectedTypes.includes(type)}
              onChange={() => toggleInArray(selectedTypes, type, onTypesChange)}
            />
            {capitalize(type)}
          </label>
        ))}
      </div>

      <div>
        <p>Priority</p>
        {priorityOptions.length === 0 && <span>No data yet</span>}
        {priorityOptions.map((p) => (
          <button
            key={p}
            onClick={() => toggleInArray(selectedPriorities, p, onPrioritiesChange)}
            aria-pressed={selectedPriorities.includes(p)}
          >
            {p}
          </button>
        ))}
      </div>

      <div>
        <p>Estimated Hours</p>
        {hoursBuckets.map((bucket) => (
          <button
            key={bucket}
            onClick={() => onHoursChange(selectedHours === bucket ? null : bucket)}
            aria-pressed={selectedHours === bucket}
          >
            {bucket}
          </button>
        ))}
      </div>

      <div>
        <p>Finish Date</p>
        {finishOptions.map(({ key, label }) => (
          <label key={key}>
            <input
              type="checkbox"
              checked={selectedFinish.includes(key)}
              onChange={() => toggleInArray(selectedFinish, key, onFinishChange)}
            />
            {label}
          </label>
        ))}
      </div>

      {quote && <p>"{quote}"</p>}
    </aside>
  );
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default TaskFilters;