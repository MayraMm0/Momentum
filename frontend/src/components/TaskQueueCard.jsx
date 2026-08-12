function TaskQueueCard({ task, courseName, onComplete }) {
  return (
    <div>
      <button aria-label="Mark complete" onClick={onComplete} />
      <div>
        {task.nlp_prediction && <span>prediction: {task.nlp_prediction.predicted_type.toUpperCase()}</span>}
        <span>priority: {task.priority_score}</span>

        <p>{task.title}</p>
        {task.description && <p>{task.description}</p>}

        {courseName && <span>{courseName}</span>}
        {task.estimated_hours != null && <span>{task.estimated_hours}h</span>}
        {task.date_finish && <span>{formatDueDate(task.date_finish)}</span>}
      </div>
    </div>
  );
}

function formatDueDate(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  // strips time component and returns str (e.g "Fri Aug 07 2026")
  // less precise, but works here because we just need a yes/no
  const isToday = date.toDateString() === today.toDateString();
  if (isToday) return 'TODAY';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
}

export default TaskQueueCard;