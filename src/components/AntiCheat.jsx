import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

export default function AntiCheat({ onEvent }) {
    const warningCount = useRef(0);

    useEffect(() => {
        // Tab visibility detection
        const handleVisibilityChange = () => {
            if (document.hidden) {
                warningCount.current += 1;
                toast(`⚠️ Tab switch detected (${warningCount.current})`, {
                    icon: '👁️',
                    style: { background: '#7f1d1d', color: '#fca5a5', border: '1px solid #ef4444' }
                });
                onEvent?.({ type: 'tab-switch', details: `Tab switch #${warningCount.current}` });
            }
        };

        // Window blur detection
        const handleBlur = () => {
            onEvent?.({ type: 'tab-switch', details: 'Window lost focus' });
        };

        // Paste detection
        const handleBeforePaste = (e) => {
            const target = e.target;
            if (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT') {
                toast('⚠️ Paste detected and flagged', {
                    icon: '📋',
                    style: { background: '#78350f', color: '#fcd34d', border: '1px solid #f59e0b' }
                });
                onEvent?.({ type: 'copy-paste', details: 'Paste event in answer field' });
            }
        };

        // Right-click detection
        const handleContextMenu = (e) => {
            e.preventDefault();
        };

        // DevTools detection (basic key combo)
        const handleKeyDown = (e) => {
            if (
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
                e.key === 'F12'
            ) {
                e.preventDefault();
                toast.error('DevTools access is not allowed during interview');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('paste', handleBeforePaste);
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('paste', handleBeforePaste);
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onEvent]);

    return null; // invisible component
}
