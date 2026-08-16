import { Star, Share2 } from 'lucide-react';
import styles from './MotivationCard.module.css';
import bg1 from '../../assets/motivation-bg-1.jpg';
import bg2 from '../../assets/motivation-bg-2.jpg';
import bg3 from '../../assets/motivation-bg-3.jpg';

const BACKGROUNDS = [bg1, bg2, bg3];

function MotivationCard({ quote }) {
    const bgImage = getBackgroundImage(quote);

    return (
        <div className={styles.card}>
            <img src={bgImage} alt="" className={styles.bgImage} />
            <div className={styles.overlay} />
            <div className={styles.content}>
                <p className={styles.quoteText}>{quote}</p>
                <div className={styles.accentLine}/>
            </div>
            <div className={styles.actions}>
                <button className={styles.iconButton} aria-label="Save quote" disabled>
                    <Star size={16} />
                </button>
                <button className={styles.iconButton} aria-label="Share quote" disabled>
                    <Share2 size={16} />
                </button>
            </div>
        </div>
    );
}

// deterministic: the exact same quote string always produces the exact same index
function getBackgroundImage(quote) {
    if (!quote) return BACKGROUNDS[0];

    let hash = 0;
    for (let i = 0; i < quote.length; i++) {
        hash = (hash + quote.charCodeAt(i)) % BACKGROUNDS.length;
    }

    return BACKGROUNDS[hash];
}

export default MotivationCard;