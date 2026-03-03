import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

export default function VoiceInput({ onTranscript }) {
    const [isListening, setIsListening] = useState(false);
    const [interimText, setInterimText] = useState('');
    const [supported, setSupported] = useState(!!SpeechRecognition);
    const recognitionRef = useRef(null);

    useEffect(() => {
        if (!SpeechRecognition) { setSupported(false); return; }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            let interim = '';
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    final += transcript + ' ';
                } else {
                    interim += transcript;
                }
            }
            if (final) onTranscript(final.trim());
            setInterimText(interim);
        };

        recognition.onerror = (event) => {
            if (event.error !== 'aborted') {
                toast.error(`Speech error: ${event.error}`);
            }
            setIsListening(false);
            setInterimText('');
        };

        recognition.onend = () => {
            setIsListening(false);
            setInterimText('');
        };

        recognitionRef.current = recognition;

        return () => {
            recognition.stop();
        };
    }, [onTranscript]);

    const toggleListening = () => {
        if (!supported) return toast.error('Speech recognition not supported in this browser. Use Chrome.');

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current?.start();
                setIsListening(true);
                toast('Listening... speak now', { icon: '🎤' });
            } catch {
                toast.error('Could not start microphone');
            }
        }
    };

    if (!supported) return (
        <div className="glass rounded-xl p-4 text-center text-gray-500 text-sm">
            🎤 Voice input requires Chrome browser. You can type your answer directly.
        </div>
    );

    return (
        <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-4">
                <button
                    onClick={toggleListening}
                    className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 font-bold flex-shrink-0
            ${isListening
                            ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/40'
                            : 'bg-primary-600 hover:bg-primary-500 shadow-lg shadow-primary-500/30'
                        }`}
                    title={isListening ? 'Stop listening' : 'Start voice input'}
                >
                    {isListening && (
                        <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-40"></span>
                    )}
                    <span className="text-white text-lg relative z-10">{isListening ? '⏹' : '🎤'}</span>
                </button>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-300">Voice Input</span>
                        {isListening && (
                            <span className="flex items-center gap-1 text-xs text-red-400">
                                <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></span>
                                Recording
                            </span>
                        )}
                    </div>
                    {interimText ? (
                        <p className="text-xs text-gray-400 italic">{interimText}</p>
                    ) : (
                        <p className="text-xs text-gray-600">
                            {isListening ? 'Speak clearly... your words will appear in the answer box' : 'Click microphone to speak your answer'}
                        </p>
                    )}
                </div>

                {/* Sound bars when listening */}
                {isListening && (
                    <div className="flex items-end gap-0.5 h-6">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div
                                key={i}
                                className="w-1 bg-red-400 rounded-full"
                                style={{
                                    animation: `soundBar ${0.5 + i * 0.1}s ease-in-out infinite alternate`,
                                    height: `${20 + i * 8}%`,
                                }}
                            ></div>
                        ))}
                    </div>
                )}
            </div>

            <style>{`
        @keyframes soundBar {
          from { transform: scaleY(0.3); }
          to { transform: scaleY(1); }
        }
      `}</style>
        </div>
    );
}
