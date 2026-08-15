import { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

function Modal({ title, subtitle, onClose, children, footer }) {
    useEffect(() => {
        function handleEscape(e) {
            if (e.key === 'Escape') onClose();
        }
        window.addEventListener('keydown', handleEscape);
        // cleanup function, when an effect sets up something global it needs to be torn down when component unmounts
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    // .stopPropagation -> stops click event from triggering close handler, so form field doesnt close modal
    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>{title}</h2>
                        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                    </div>
                    <button className={styles.closeButton} aria-label="Close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>

                <div className={styles.body}>{children}</div>

                {footer && <div className={styles.footer}>{footer}</div>}
            </div>
        </div>
    );
}

export default Modal;