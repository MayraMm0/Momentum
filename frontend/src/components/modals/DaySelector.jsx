import styles from './DaySelector.module.css';

const DAY_OPTIONS = [
    { code: 'M', label: 'M'},
    { code: 'T', label: 'T'},
    { code: 'W', label: 'W'},
    { code: 'R', label: 'Th'},
    { code: 'F', label: 'F'},
    { code: 'S', label: 'S'},
    { code: 'U', label: 'Su'},
];

function DaySelector({ value, onChange }) {
    function toggleDay(code) {
        if (value.includes(code)) {
            // removes day
            onChange(value.replace(code, ''));
        } else {
            // appends day
            onChange(value + code);
        }
    }

    return (
        <div className={styles.row}>
            {DAY_OPTIONS.map(({ code, label }) => (
                <button
                    key={code}
                    type="button"
                    className={value.includes(code) ? styles.dayActive : styles.day}
                    onClick={() => toggleDay(code)}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}

export default DaySelector;