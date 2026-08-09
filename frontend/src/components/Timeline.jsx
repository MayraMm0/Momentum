import styles from './Timeline.module.css';

const PIXELS_PER_HOUR = 80;

function Timeline({ today }) {
  const { startHour, endHour, positionedItems, untimedItems } = buildTimelineData(today);
  const totalHeight = (endHour - startHour) * PIXELS_PER_HOUR;
  const hourCount = endHour - startHour;

  return (
    <div className={styles.timelineWrapper}>
      <div className={styles.grid} style={{ height: totalHeight, '--hour-height': `${PIXELS_PER_HOUR}px` }}>
        <div className={styles.hourColumn}>
          {Array.from({ length: hourCount }, (_, i) => startHour + i).map((hour) => (
            <div key={hour} className={styles.hourRow} style={{ height: PIXELS_PER_HOUR }}>
              <span className={styles.timeLabel}>{formatHourLabel(hour)}</span>
              <div className={styles.connector} />
            </div>
          ))}
        </div>

        <div className={styles.eventsColumn}>
          {positionedItems.map((item) => (
            <div
              key={item.key}
              className={`${styles.eventBlock} ${styles[item.kind]}`}
              style={{ top: item.top, height: item.height }}
            >
              <p className={styles.eventTitle}>{item.label}</p>
              {item.subtitle && <p className={styles.eventSubtitle}>{item.subtitle}</p>}
              <div className={styles.accentBar} />
            </div>
          ))}
        </div>
      </div>

      {untimedItems.length > 0 && (
        <div className={styles.untimedSection}>
          <p className={styles.untimedHeading}>No time set</p>
          <div className={styles.untimedList}>
            {untimedItems.map((item) => (
              <div key={item.key} className={`${styles.untimedItem} ${styles[item.kind]}`}>
                <p className={styles.eventTitle}>{item.label}</p>
                {item.subtitle && <p className={styles.eventSubtitle}>{item.subtitle}</p>}
                <div className={styles.accentBar} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function buildTimelineData(today) {
  const rawItems = [];

  today.courses.forEach((c) =>
    rawItems.push({ key: `course-${c.id}`, kind: 'course', label: c.name, subtitle: c.room, timeStart: c.time_start, timeEnd: c.time_end })
  );
  today.extracurriculars.forEach((e) =>
    rawItems.push({ key: `extra-${e.id}`, kind: 'extracurricular', label: e.name, subtitle: e.location, timeStart: e.time_start, timeEnd: e.time_end })
  );
  today.meetings.forEach((m) =>
    rawItems.push({ key: `meeting-${m.id}`, kind: 'meeting', label: m.title, subtitle: m.location, timeStart: m.time_start, timeEnd: m.time_end })
  );

  const timedItems = rawItems.filter((item) => item.timeStart);
  const untimedItems = rawItems.filter((item) => !item.timeStart);

  if (timedItems.length === 0) {
    return { startHour: 8, endHour: 20, positionedItems: [], untimedItems };
  }

  const startsInMinutes = timedItems.map((item) => toMinutes(item.timeStart));
  const endsInMinutes = timedItems.map((item) =>
    item.timeEnd ? toMinutes(item.timeEnd) : toMinutes(item.timeStart) + 60
  );

  const startHour = Math.floor(Math.min(...startsInMinutes) / 60);
  const endHour = Math.ceil(Math.max(...endsInMinutes) / 60);

  const positionedItems = timedItems.map((item) => {
    const startMin = toMinutes(item.timeStart);
    const endMin = item.timeEnd ? toMinutes(item.timeEnd) : startMin + 60;

    const top = ((startMin - startHour * 60) / 60) * PIXELS_PER_HOUR;
    const height = Math.max(((endMin - startMin) / 60) * PIXELS_PER_HOUR, 40);

    return { ...item, top, height };
  });

  return { startHour, endHour, positionedItems, untimedItems };
}

function toMinutes(timeString) {
  const [h, m] = timeString.split(':').map(Number);
  return h * 60 + m;
}

function formatHourLabel(hour) {
  return `${hour.toString().padStart(2, '0')}:00`;
}

export default Timeline;