import { useState, useEffect, useRef } from 'react';

export default function Timer({ duration = 180, running = true, onTimeUp }) {
    const [timeLeft, setTimeLeft] = useState(duration);
    const intervalRef = useRef(null);
    const hasCalledTimeUp = useRef(false);

    useEffect(() => {
        setTimeLeft(duration);
        hasCalledTimeUp.current = false;
    }, [duration]);

    useEffect(() => {
        if (!running) {
            clearInterval(intervalRef.current);
            return;
        }
        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    if (!hasCalledTimeUp.current) {
                        hasCalledTimeUp.current = true;
                        onTimeUp?.();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, [running, onTimeUp]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const pct = (timeLeft / duration) * 100;

    const color = timeLeft > 60 ? '#6366f1'
        : timeLeft > 30 ? '#f59e0b'
            : '#ef4444';

    const bgColor = timeLeft > 60 ? 'bg-primary-500/20'
        : timeLeft > 30 ? 'bg-amber-500/20'
            : 'bg-red-500/20';

    const textColor = timeLeft > 60 ? 'text-primary-300'
        : timeLeft > 30 ? 'text-amber-300'
            : 'text-red-300';

    const size = 52;
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const strokeDash = (pct / 100) * circumference;

    return (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${bgColor} transition-colors duration-500`}>
            <svg width={size} height={size} className="rotate-[-90deg]">
                <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="3" fill="none" />
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke={color}
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={`${strokeDash} ${circumference}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.5s ease, stroke 0.5s ease' }}
                />
            </svg>
            <div>
                <div className={`font-mono font-bold text-lg leading-none ${textColor} ${timeLeft <= 30 ? 'animate-pulse' : ''}`}>
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
                <div className="text-gray-600 text-xs">remaining</div>
            </div>
        </div>
    );
}
