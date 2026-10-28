import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import 'prismjs/themes/prism-tomorrow.css'; 

function App() {
  const userName = "User"; 

  const [messages, setMessages] = useState(() => {
    const savedChat = localStorage.getItem('vertex_quantum_filament');
    return savedChat ? JSON.parse(savedChat) : [];
  });
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false); // Speech-to-Text state
  const [isMuted, setIsMuted] = useState(false); // Text-to-Speech mute state
  
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition (Speech-to-Text) on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onerror = () => setIsListening(false);
      
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + (prev ? ' ' : '') + transcript);
      };
      recognitionRef.current = rec;
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('vertex_quantum_filament', JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle Voice Output (Text-to-Speech)
  const speak = (text) => {
    if (isMuted || !window.speechSynthesis) return;
    
    // Stop any ongoing speech before starting a new one
    window.speechSynthesis.cancel();
    
    // Clean up markdown formatting for cleaner speech reading
    const cleanText = text.replace(/[*_`#]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05; // Slightly faster for a natural, snappy vibe
    utterance.pitch = 0.95; // Slightly deeper tone for a premium assistant feel
    
    window.speechSynthesis.speak(utterance);
  };

  // Toggle Microphone listener
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Try Chrome or Safari!");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Toggle Assistant Mute settings
  const toggleMute = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Stop speaking immediately if muted
    }
    setIsMuted(!isMuted);
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear this conversation?")) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      localStorage.removeItem('vertex_quantum_filament');
      setMessages([]);
    }
  };

  const processChat = async (textToSend) => {
    if (!textToSend.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: 'user', text: textToSend.trim() }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        let words = data.reply.split(" ");
        let currentWordIndex = 0;
        let currentText = "";

        setMessages((prev) => [...prev, { role: 'assistant', text: '' }]);

        const typingInterval = setInterval(() => {
          if (currentWordIndex < words.length) {
            currentText += (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex];
            currentWordIndex++;
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: 'assistant', text: currentText };
              return updated;
            });
          } else {
            clearInterval(typingInterval);
            setIsLoading(false);
            speak(data.reply); // Read out the completed response
          }
        }, 12);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', text: '`[ERROR: Connection to server degraded]`' }]);
        setIsLoading(false);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', text: '`[ERROR: Could not reach the server]`' }]);
      setIsLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input;
    setInput('');
    processChat(text);
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Advanced Ambient Telemetry Overlay */}
      <div style={styles.ambientGlow} />
      <div style={styles.hudGridMesh} />
      <div className="vertex-sigil-backdrop">V</div>

      <style>{`
        /* Global layout adjustments for better mobile behavior */
        body, html {
          margin: 0; padding: 0; min-height: 100vh; width: 100%; height: auto;
          overflow: auto; background-color: #02040a;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #f8fafc; -webkit-font-smoothing: antialiased;
          -webkit-tap-highlight-color: transparent;
        }
        #root { width: 100%; min-height: 100vh; }

        /* Advanced Animations */
        @keyframes vertexPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 15px rgba(0, 240, 255, 0.2); }
          50% { transform: scale(1.05); box-shadow: 0 0 25px rgba(0, 240, 255, 0.6), inset 0 0 10px rgba(0,240,255,0.4); }
        }

        @keyframes floatingSigil {
          0%, 100% { transform: translate(-50%, -50%) scale(1) translateY(0); opacity: 0.015; }
          50% { transform: translate(-50%, -50%) scale(1.03) translateY(-20px); opacity: 0.03; filter: drop-shadow(0 0 50px rgba(0, 240, 255, 0.3)); }
        }

        @keyframes micPulse {
          0%, 100% { transform: scale(1); background: rgba(255, 0, 127, 0.2); border-color: #ff007f; box-shadow: 0 0 10px rgba(255, 0, 127, 0.4); }
          50% { transform: scale(1.1); background: rgba(255, 0, 127, 0.4); border-color: #ff007f; box-shadow: 0 0 20px rgba(255, 0, 127, 0.8); }
        }

        .vertex-sigil-backdrop {
          position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
          font-size: 85vh; font-weight: 900; color: transparent;
          -webkit-text-stroke: 2px rgba(0, 240, 255, 0.8);
          font-family: 'Impact', sans-serif; pointer-events: none; z-index: 1;
          user-select: none; animation: floatingSigil 14s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          opacity: 0.03; /* slightly more visible on large screens for ambience */
        }

        /* Identity System */
        .vertex-brand-identity {
          display: flex; align-items: center; gap: 16px; user-select: none;
        }

        .vertex-logo-mark {
          position: relative; width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(0, 240, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(0, 240, 255, 0.2);
          box-shadow: 0 0 15px rgba(0, 240, 255, 0.1);
        }
        .vertex-logo-wing-left {
          position: absolute; width: 3px; height: 18px; background: #00f0ff;
          transform: rotate(-35deg); left: 8px; border-radius: 2px;
          box-shadow: 0 0 8px rgba(0, 240, 255, 0.8);
        }
        .vertex-logo-wing-right {
          position: absolute; width: 3px; height: 18px; background: rgba(0, 240, 255, 0.5);
          transform: rotate(35deg); right: 8px; border-radius: 2px;
        }
        .vertex-logo-core {
          position: absolute; bottom: 4px; width: 5px; height: 5px;
          background: #ffffff; border-radius: 50%; box-shadow: 0 0 10px #ffffff;
        }

        .vertex-brand-text {
          font-family: 'SF Pro Display', sans-serif; font-size: 15px; font-weight: 800;
          letter-spacing: 5px; color: #ffffff; text-shadow: 0 2px 10px rgba(255,255,255,0.3);
        }

        /* Glassmorphic Input Filament */
        .quantum-filament-input {
          background: rgba(10, 15, 25, 0.6);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(0, 240, 255, 0.15);
          border-radius: 100px;
          padding: 8px 12px;
          display: flex; align-items: center; width: 100%; box-sizing: border-box;
          gap: 8px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(0, 240, 255, 0.02);
        }
        .quantum-filament-input:focus-within {
          border-color: rgba(0, 240, 255, 0.6);
          background: rgba(15, 22, 35, 0.7);
          box-shadow: 0 15px 40px -10px rgba(0, 240, 255, 0.15), inset 0 0 20px rgba(0, 240, 255, 0.05);
          transform: translateY(-2px);
        }

        /* Controller Buttons */
        .vertex-input-btn {
          width: 44px; height: 44px; border-radius: 50%;
          background: rgba(255, 255, 255, 0.03); 
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #94a3b8; display: flex;
          align-items: center; justify-content: center; cursor: pointer;
          transition: all 0.3s ease;
        }
        .vertex-input-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
          transform: scale(1.05);
        }

        .vertex-core-igniter {
          background: rgba(0, 240, 255, 0.1); 
          border: 1px solid rgba(0, 240, 255, 0.4);
          color: #00f0ff; 
          animation: vertexPulse 3s infinite;
        }
        .vertex-core-igniter:hover:not(:disabled) {
          background: rgba(0, 240, 255, 0.25);
          border-color: #00f0ff;
          color: #ffffff;
        }
        .vertex-core-igniter:disabled {
          background: transparent; border: 1px solid rgba(255, 255, 255, 0.05); 
          color: rgba(255, 255, 255, 0.1);
          animation: none; box-shadow: none;
        }

        .vertex-mic-active {
          animation: micPulse 1.2s infinite !important;
          color: #ffffff !important;
        }

        /* Chat Bubbles */
        .floating-user-projection {
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.03) 100%);
          border-right: 3px solid #00f0ff;
          border-radius: 8px 0 0 8px;
          padding: 16px 24px; max-width: 80%; align-self: flex-end;
          line-height: 1.7; font-size: 15px; font-weight: 400; color: #f1f5f9;
          box-shadow: 10px 0 20px -10px rgba(0, 240, 255, 0.1);
        }

        .vertex-mainframe-projection {
          display: flex; gap: 24px; align-self: flex-start; width: 100%;
          background: rgba(2, 4, 10, 0.4);
          padding: 24px; border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.03);
          box-shadow: inset 0 0 30px rgba(0,0,0,0.5);
        }

        .vertex-index-tag {
          font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #00f0ff;
          font-weight: 700; letter-spacing: 3px; padding-top: 4px; flex-shrink: 0;
          text-shadow: 0 0 15px rgba(0, 240, 255, 0.6);
          text-transform: uppercase;
        }

        /* Enhanced Markdown Styling */
        .markdown-hologram-feed pre {
          background: #050810 !important;
          border: 1px solid rgba(0, 240, 255, 0.15);
          border-radius: 8px;
          padding: 20px; overflow-x: auto; margin: 20px 0;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          position: relative;
        }
        .markdown-hologram-feed code {
          font-family: 'JetBrains Mono', 'Menlo', monospace; color: #00ffcc; font-size: 14px;
        }
        .markdown-hologram-feed p {
          margin: 0 0 16px 0; line-height: 1.8; font-size: 15px; color: #94a3b8;
        }
        .markdown-hologram-feed p:last-child { margin-bottom: 0; }
        .markdown-hologram-feed li { margin-bottom: 12px; line-height: 1.8; color: #94a3b8; }
          
        /* Premium Loading Indicator */
        .singularity-quantum-spin {
          width: 12px; height: 12px; 
          background: transparent; 
          border: 2px solid rgba(0, 240, 255, 0.2);
          border-top-color: #00f0ff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          box-shadow: 0 0 15px rgba(0,240,255,0.5);
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* Sleek Scrollbar */
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        ::-webkit-scrollbar-thumb { background: rgba(0, 240, 255, 0.3); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0, 240, 255, 0.6); }

        /* Responsive tweaks */
        @media (max-width: 1024px) {
          .contentConstrain { padding: 0 18px; max-width: 720px; }
          .topNav { padding: 0 24px; }
          .vertex-sigil-backdrop { opacity: 0.02; }
        }

        @media (max-width: 768px) {
          .vertex-sigil-backdrop { font-size: 48vh; top: 40%; left: 50%; transform: translate(-50%, -40%); }
          .topNav { height: 64px; padding: 0 12px; }
          .vertex-brand-text { display: none; }
          .vertex-logo-mark { width: 28px; height: 28px; }
          .contentConstrain { padding: 0 12px; max-width: 100%; }
          .quantum-filament-input { padding: 6px 8px; gap: 6px; }
          .vertex-input-btn { width: 40px; height: 40px; }
          .vertex-mainframe-projection, .floating-user-projection { max-width: 92%; padding: 12px; font-size: 14px; }
          .vertex-index-tag { display: none; }
          .vertex-core-igniter { width: 40px; height: 40px; }
          .vertex-sigil-backdrop { display: block; }
          body, html { -webkit-overflow-scrolling: touch; }
        }

        @media (max-width: 420px) {
          .vertex-sigil-backdrop { font-size: 38vh; opacity: 0.02; }
          .quantum-filament-input { padding: 6px; }
          .floating-user-projection { padding: 12px; }
        }

        /* Accessibility helpers */
        .quantum-filament-input input:focus { outline: 2px solid rgba(0,240,255,0.2); border-radius: 6px; }
        .vertex-input-btn:focus { outline: 2px solid rgba(0,240,255,0.12); }
      `}</style>
      <div style={styles.appShell}>
        
        {/* Upper Architecture Header */}
        <header style={styles.topNav}>
          <div className="vertex-brand-identity">
            <div className="vertex-logo-mark">
              <div className="vertex-logo-wing-left" />
              <div className="vertex-logo-wing-right" />
              <div className="vertex-logo-core" />
            </div>
            <span className="vertex-brand-text">VERTEX</span>
          </div>

          <div style={styles.utilityActionRow}>
            {/* Audio Readout Toggle */}
            <button 
              onClick={toggleMute} 
              style={isMuted ? styles.headerAudioBtnMuted : styles.headerAudioBtn}
              title={isMuted ? "Unmute Voice" : "Mute Voice"}
              aria-pressed={isMuted}
              aria-label={isMuted ? "Unmute voice" : "Mute voice"}
            >
              {isMuted ? (
                /* Speaker Muted (Off) Icon */
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
              ) : (
                /* Speaker Active (On) Icon */
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              )}
              <span style={{ fontSize: '9px', fontWeight: 'bold', letterSpacing: '1px' }}>
                {isMuted ? "VOICE OFF" : "VOICE ON"}
              </span>
            </button>

            <button onClick={handleClearChat} style={styles.purgeTrigger}>
              CLEAR CHAT
            </button>
          </div>
        </header>

        {/* Core Stream Matrix */}
        <div style={styles.scrollWindow}>
          <div style={styles.contentConstrain}>
            
            {messages.length === 0 ? (
              /* CLEAN EMPTY STATE */
              <div style={styles.welcomeBox}>
                <div style={styles.quantumStandby}>WELCOME, {userName.toUpperCase()}</div>
                <div style={styles.subtextGreeting}>
                  How can I assist you today? Try typing or speaking to me!
                </div>
              </div>
            ) : (
              /* STREAM CHAT NODES */
              <div style={styles.chatStream} role="list">
                {messages.map((msg, index) => (
                  msg.role === 'user' ? (
                    <div key={index} className="floating-user-projection" role="listitem" tabIndex={0} aria-label="User message">
                      {msg.text}
                    </div>
                  ) : (
                    <div key={index} className="vertex-mainframe-projection" role="listitem" tabIndex={0} aria-label="Assistant message">
                      <div className="vertex-index-tag">VERTEX</div>
                      <div className="markdown-hologram-feed" style={{ flexGrow: 1, overflow: 'hidden' }} aria-live="polite">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    </div>
                  )
                ))}
                
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                  <div className="vertex-mainframe-projection" style={{ alignItems: 'center' }}>
                    <div className="vertex-index-tag" style={{ color: '#94a3b8' }}>THINKING...</div>
                    <div className="singularity-quantum-spin" />
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}

          </div>
        </div>

        {/* Floating Minimal Input Core */}
        <footer style={styles.inputStickyZone}>
          <div style={styles.contentConstrain}>
            <form onSubmit={handleSend}>
              <div className="quantum-filament-input">
                {/* Voice Record Button */}
                <button 
                  type="button" 
                  onClick={toggleListening} 
                  className={`vertex-input-btn ${isListening ? 'vertex-mic-active' : ''}`}
                  title={isListening ? "Listening... click to stop" : "Use Voice Input"}
                  aria-pressed={isListening}
                  aria-label={isListening ? "Stop voice input" : "Start voice input"}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                </button>

                <input 
                  id="message-input"
                  type="text"
                  inputMode="text"
                  aria-label="Message input"
                  autoComplete="off"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isListening ? "Listening to your voice..." : "Type your message here..."}
                  disabled={isLoading}
                  style={styles.cleanInputField}
                />
                
                <button 
                  type="submit" 
                  aria-label="Send message"
                  disabled={!input.trim() || isLoading} 
                  className="vertex-input-btn vertex-core-igniter"
                >
                  ✦
                </button>
              </div>
            </form>
          </div>
        </footer>

      </div>
    </div>
  );
}

const styles = {
  pageWrapper: {
    width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', 
    backgroundColor: '#02040a', position: 'relative', overflow: 'hidden'
  },
  ambientGlow: {
    position: 'absolute', inset: 0, zIndex: 0,
    background: 'radial-gradient(circle at 50% 0%, rgba(0, 240, 255, 0.03) 0%, transparent 60%)',
    pointerEvents: 'none'
  },
  hudGridMesh: {
    position: 'absolute', inset: 0, 
    backgroundImage: `
      linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)
    `,
    backgroundSize: '50px 50px', pointerEvents: 'none', zIndex: 1,
    maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)',
    WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 80%)'
  },
  appShell: {
    display: 'flex', flexDirection: 'column', height: '100%', width: '100%', position: 'relative', zIndex: 5
  },
  topNav: {
    height: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
    padding: '0 48px', backgroundColor: 'transparent',
    borderBottom: '1px solid rgba(255,255,255,0.02)'
  },
  utilityActionRow: {
    display: 'flex', alignItems: 'center', gap: '12px'
  },
  headerAudioBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.2)',
    color: '#00f0ff', fontSize: '10px', cursor: 'pointer', fontFamily: 'monospace',
    padding: '8px 14px', borderRadius: '4px', transition: 'all 0.2s',
    boxShadow: '0 0 10px rgba(0, 240, 255, 0.1)'
  },
  headerAudioBtnMuted: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)',
    color: '#64748b', fontSize: '10px', cursor: 'pointer', fontFamily: 'monospace',
    padding: '8px 14px', borderRadius: '4px', transition: 'all 0.2s'
  },
  purgeTrigger: {
    background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)',
    color: 'rgba(255, 255, 255, 0.5)', fontSize: '10px', fontWeight: '700', 
    letterSpacing: '2px', cursor: 'pointer', fontFamily: 'monospace', 
    padding: '8px 16px', borderRadius: '4px', transition: 'all 0.2s'
  },
  scrollWindow: {
    flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', 
    alignItems: 'center', width: '100%', scrollBehavior: 'smooth'
  },
  contentConstrain: {
    width: '100%', maxWidth: '800px', padding: '0 24px', boxSizing: 'border-box'
  },
  welcomeBox: {
    height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', 
    justifyContent: 'center', textAlign: 'center'
  },
  quantumStandby: {
    fontSize: '14px', fontFamily: 'monospace', color: '#00f0ff', 
    letterSpacing: '4px', marginBottom: '16px', textShadow: '0 0 15px rgba(0,240,255,0.5)'
  },
  subtextGreeting: {
    fontSize: '16px', fontWeight: '300', color: '#64748b', 
    letterSpacing: '0.5px', maxWidth: '540px', lineHeight: '1.8'
  },
  chatStream: {
    display: 'flex', flexDirection: 'column', gap: '32px', paddingTop: '40px', paddingBottom: '40px'
  },
  inputStickyZone: {
    width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', 
    background: 'linear-gradient(to top, #02040a 60%, transparent 100%)', 
    paddingBottom: '48px', paddingTop: '32px'
  },
  cleanInputField: {
    flexGrow: 1, background: 'transparent', border: 'none', color: '#f8fafc', 
    fontSize: '15px', outline: 'none', padding: '12px 0', letterSpacing: '0.5px', 
    fontWeight: '400', fontFamily: 'inherit'
  }
};

export default App;