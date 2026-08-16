import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import Modal from './Modal';
import DaySelector from './DaySelector';
import styles from './Modal.module.css';
import tabStyles from './AddScheduleItemModal.module.css';
import { API_BASE_URL } from '../../config';

const TABS = ['course', 'meeting', 'extracurricular'];
const RECURRENCE_OPTIONS = ['one_time', 'weekly', 'biweekly', 'monthly'];

function AddScheduleItemModal({ token, onClose, onCreated }) {
    const [tab, setTab] = useState('meeting');

    const [name, setName] = useState('');
    const [withWhom, setWithWhom] = useState('');
    const [professor, setProfessor] = useState('');
    const [room, setRoom] = useState('');
    const [location, setLocation] = useState('');
    const [days, setDays] = useState('');
    const [timeStart, setTimeStart] = useState('');
    const [timeEnd, setTimeEnd] = useState('');
    const [semester, setSemester] = useState('');
    const [difficultyRank, setDifficultyRank] = useState('');
    const [recurrenceType, setRecurrenceType] = useState('one_time');
    const [activeUntil, setActiveUntil] = useState('');
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        const { url, body } = buildRequest();

        try {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error('Could not create item');

            onCreated();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    // Centralized which endpoint -> which fields based on a tab
    function buildRequest() {
        const shared = {
            days: days || null,
            time_start: timeStart || null,
            time_end: timeEnd || null,
        };

        if (tab === 'course') {
            return {
                url: '/courses/add',
                body: {
                    ...shared,
                    name,
                    professor: professor || null,
                    room: room || null,
                    semester: semester || null,
                    difficulty_rank: difficultyRank ? Number(difficultyRank) : 0,
                },
            };
        }

        if (tab === 'meeting') {
            return {
                url: '/meetings/add',
                body: {
                ...shared,
                title: name,
                with_whom: withWhom || null,
                location: location || null,
                recurrence_type: recurrenceType,
                active_until: activeUntil || null,
                },
            };
        }

        return {
            url: '/extracurriculars/add',
            body: {
                ...shared,
                name,
                location: location || null,
                active_until: activeUntil || null,
            },
        };
    }

    return (
        <Modal
        title="New Schedule Item"
        subtitle="Add a new event to your academic calendar"
        onClose={onClose}
        footer={
            <>
            <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
            <button type="submit" form="add-schedule-form" className={styles.submitButton} disabled={submitting}>
                <CheckCircle2 size={16} />
                {submitting ? 'Creating...' : 'Create Item'}
            </button>
            </>
        }
        >
            <div className={tabStyles.tabs}>
                {TABS.map((t) => (
                <button
                    key={t}
                    type="button"
                    className={t === tab ? tabStyles.tabActive : tabStyles.tab}
                    onClick={() => setTab(t)}
                >
                    {capitalize(t)}
                </button>
                ))}
            </div>

            <form id="add-schedule-form" onSubmit={handleSubmit} className={styles.body} style={{ padding: 0 }}>
                {error && <p className={styles.errorText}>{error}</p>}

                <div className={styles.field}>
                    <span className={styles.label}>{tab === 'meeting' ? 'Title *' : 'Name *'}</span>
                    <input
                        className={styles.input}
                        placeholder={tab === 'meeting' ? 'Weekly Sync, Study Group...' : 'e.g., Thermodynamics'}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>

                {tab === 'meeting' && (
                <div className={styles.fieldRow}>
                    <div className={styles.field}>
                        <span className={styles.label}>With Whom</span>
                        <input
                            className={styles.input}
                            placeholder="Enter names or emails..."
                            value={withWhom}
                            onChange={(e) => setWithWhom(e.target.value)}
                        />
                    </div>
                    <div className={styles.field}>
                        <span className={styles.label}>Location</span>
                        <input
                            className={styles.input}
                            placeholder="Room or URL"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                </div>
                )}

                {tab === 'course' && (
                <div className={styles.fieldRow}>
                    <div className={styles.field}>
                        <span className={styles.label}>Professor</span>
                        <input className={styles.input} value={professor} onChange={(e) => setProfessor(e.target.value)} />
                    </div>
                    <div className={styles.field}>
                        <span className={styles.label}>Room</span>
                        <input className={styles.input} value={room} onChange={(e) => setRoom(e.target.value)} />
                    </div>
                </div>
                )}

                {tab === 'extracurricular' && (
                <div className={styles.field}>
                    <span className={styles.label}>Location</span>
                    <input
                    className={styles.input}
                    placeholder="Room or URL"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    />
                </div>
                )}

                <div className={styles.field}>
                    <span className={styles.label}>Days</span>
                    <DaySelector value={days} onChange={setDays} />
                </div>

                <div className={styles.fieldRow}>
                <div className={styles.field}>
                    <span className={styles.label}>Time (Start – End)</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input type="time" className={styles.input} value={timeStart} onChange={(e) => setTimeStart(e.target.value)} />
                        <span>to</span>
                        <input type="time" className={styles.input} value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} />
                    </div>
                </div>

                {tab === 'meeting' && (
                    <div className={styles.field}>
                        <span className={styles.label}>Recurrence *</span>
                        <select className={styles.select} value={recurrenceType} onChange={(e) => setRecurrenceType(e.target.value)}>
                            {RECURRENCE_OPTIONS.map((r) => (
                            <option key={r} value={r}>{r.replace('_', ' ')}</option>
                            ))}
                        </select>
                    </div>
                )}

                {tab === 'course' && (
                    <div className={styles.field}>
                        <span className={styles.label}>Semester</span>
                        <input className={styles.input} placeholder="e.g., Fall 2026" value={semester} onChange={(e) => setSemester(e.target.value)} />
                    </div>
                )}
                </div>

                {tab === 'course' && (
                <div className={styles.fieldRow}>
                    <div className={styles.field}>
                        <span className={styles.label}>Difficulty (0–5)</span>
                        <input
                            type="number" min="0" max="5" className={styles.input}
                            value={difficultyRank} onChange={(e) => setDifficultyRank(e.target.value)}
                        />
                    </div>
                </div>
                )}

                {(tab === 'meeting' || tab === 'extracurricular') && (
                <div className={styles.field}>
                    <span className={styles.label}>Active Until</span>
                    <input type="date" className={styles.input} value={activeUntil} onChange={(e) => setActiveUntil(e.target.value)} />
                </div>
                )}
            </form>
        </Modal>
    );
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export default AddScheduleItemModal;