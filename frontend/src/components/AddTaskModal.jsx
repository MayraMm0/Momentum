import { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import Modal from './Modal';
import styles from './Modal.module.css';

function AddTaskModal({ token, onClose, onCreated }) {
    const [courses, setCourses] = useState([]);
    const [projects, setProjects] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [courseId, setCourseId] = useState('');
    const [projectId, setProjectId] = useState('');
    const [type, setType] = useState('');
    const [subtype, setSubType] = useState('');
    const [dateStart, setDateStart] = useState('');
    const [dateFinish, setDateFinish] = useState('');
    const [estimatedHours, setEstimatedHours] = useState('');
    const [location, setLocation] = useState('');
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function loadOptions() {
            const headers = { Authorization:  `Bearer ${token}` };
            const [coursesRes, projectsRes] = await Promise.all([
                fetch('http://localhost:8000/courses/list', { headers }),
                fetch('http://localhost:8000/projects/list', { headers }),
            ]);
            if (coursesRes.ok) setCourses(await coursesRes.json());
            if (projectsRes.ok) setProjects(await projectsRes.json());
        }
        loadOptions();
    }, [token]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const response = await fetch('http://localhost:8000/tasks/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    description: description || null,
                    course_id: courseId ? Number(courseId) : null,
                    project_id: projectId ? Number(projectId) : null,
                    type: type || null,
                    subtype: subtype || null,
                    date_start: dateStart || null,
                    date_finish: dateFinish || null,
                    estimated_hours: estimatedHours ? Number(estimatedHours) : null,
                    location: location || null,
                }),
            });

            if (!response.ok) throw new Error('Could not create task');

            onCreated();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Modal
            title="Create New Task"
            subtitle="ACADEMIC WORKFLOW ENGINE"
            onClose={onClose}
            footer={
                <>
                    <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
                    <button type="submit" form="add-task-form" className={styles.submitButton} disabled={submitting}>
                        <CheckCircle2 size={16} />
                        {submitting ? 'Creating...' : 'Create Task'}
                    </button>
                </>
            }
        >
            <form id="add-task-form" onSubmit={handleSubmit} className={styles.body} style={{ padding: 0 }}>
                {error && <p className={styles.errorText}>{error}</p>}

                <div className={styles.field}>
                    <span className={styles.label}>Task Title *</span>
                    <input
                        className={styles.input}
                        placeholder="e.g. Calculus II Problem Set 4"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.field}>
                    <span className={styles.label}>Description</span>
                    <textarea
                        className={styles.textarea}
                        placeholder="[Optional] Provide context, references, or specific instructions."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div className={styles.fieldRow}>
                    <div className={styles.field}>
                        <span className={styles.label}>Course</span>
                        <select className={styles.select} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                            <option value="">Select Course</option>
                            {courses.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.field}>
                        <span className={styles.label}>Project</span>
                        <select className={styles.select} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                            <option value="">None / General</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>{p.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className={styles.fieldRow}>
                    <div className={styles.field}>
                        <span className={styles.label}>Type - model predicts if not selected</span>
                        <select className={styles.select} value={type} onChange={(e) => setType(e.target.value)}>
                            <option value="">Auto-predict</option>
                            <option value="academic">Academic</option>
                            <option value="personal">Personal</option>
                            <option value="health">Health</option>
                            <option value="social">Social</option>
                        </select>
                    </div>

                    <div className={styles.field}>
                        <span className={styles.label}>Subtype</span>
                        <input
                            className={styles.input}
                            placeholder="e.g. Problem Set"
                            value={subtype}
                            onChange={(e) => setSubType(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.fieldRow}>
                    <div className={styles.field}>
                        <span className={styles.label}>Start Date & Time</span>
                        <input
                            type="datetime-local"
                            className={styles.input}
                            value={dateStart}
                            onChange={(e) => setDateStart(e.target.value)}
                        />
                    </div>
                    <div className={styles.field}>
                        <span className={styles.label}>Finish Date & Time</span>
                        <input
                            type="datetime-local"
                            className={styles.input}
                            value={dateFinish}
                            onChange={(e) => setDateFinish(e.target.value)}
                        />
                    </div>
                </div>

                <div className={styles.fieldRow}>
                    <div className={styles.field}>
                        <span className={styles.label}>Est. Hours</span>
                        <input
                            type="number"
                            step="0.5"
                            min="0"
                            className={styles.input}
                            value={estimatedHours}
                            onChange={(e) => setEstimatedHours(e.target.value)}
                        />
                    </div>
                    <div className={styles.field}>
                        <span className={styles.label}>Location</span>
                        <input
                            className={styles.input}
                            placeholder="e.g., Library Level 3, Study Room B"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                </div>
            </form>
        </Modal>
    );
}

export default AddTaskModal;