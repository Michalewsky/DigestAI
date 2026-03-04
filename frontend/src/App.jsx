import { useEffect, useMemo, useRef, useState } from 'react';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function App() {
  const [title, setTitle] = useState('');
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState('text');
  const [preview, setPreview] = useState('');
  const [summary, setSummary] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [isListening, setIsListening] = useState(false);
  const textAreaRef = useRef(null);

  const isUrl = useMemo(() => /^https?:\/\//i.test(input.trim()), [input]);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    const handler = async (event) => {
      const item = [...event.clipboardData.items].find((entry) => entry.type.startsWith('image/'));
      if (!item) return;
      event.preventDefault();
      const file = item.getAsFile();
      if (!file) return;
      const dataUrl = await toDataUrl(file);
      setInput(dataUrl);
      setInputType('image');
      setToast('Image pasted successfully.');
    };

    const node = textAreaRef.current;
    node?.addEventListener('paste', handler);
    return () => node?.removeEventListener('paste', handler);
  }, []);

  async function loadHistory() {
    const res = await fetch('/api/history');
    if (!res.ok) return;
    const data = await res.json();
    setHistory(data.rows || []);
  }

  async function handlePreview() {
    try {
      setLoading(true);
      const res = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: input.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Preview failed');
      setPreview(data.previewText);
      setToast('Preview loaded.');
    } catch (error) {
      setToast(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSummarize() {
    try {
      setLoading(true);
      const effectiveType = inputType === 'text' && isUrl ? 'link' : inputType;
      const rawInput = preview || input;
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Untitled',
          inputType: effectiveType,
          rawInput,
          rawInputLink: isUrl ? input.trim() : ''
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Summarization failed');
      setSummary(data.summary);
      setToast('Saved to Google Sheet.');
      await loadHistory();
    } catch (error) {
      setToast(error.message);
    } finally {
      setLoading(false);
    }
  }

  function startVoice() {
    if (!SpeechRecognition) {
      setToast('Speech recognition is not supported on this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setToast('Voice capture failed.');
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? '';
      setInput((prev) => [prev, transcript].filter(Boolean).join(' '));
      setInputType('voice');
      setToast('Voice transcript added.');
    };
    recognition.start();
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await toDataUrl(file);
    setInput(dataUrl);
    setInputType('image');
    setToast('Image loaded.');
  }

  return (
    <main className="container">
      <h1>DigestAI</h1>
      <p className="subtitle">Ingest &amp; Get the gist</p>

      <input
        className="title"
        placeholder="Optional title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <textarea
        ref={textAreaRef}
        rows={4}
        placeholder="Type text, paste a URL, paste image, or dictate with mic"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setInputType('text');
        }}
      />

      <div className="actions">
        <button type="button" onClick={startVoice}>{isListening ? 'Listening…' : '🎤 Voice'}</button>
        <label className="upload">
          🖼️ Image
          <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
        </label>
        {isUrl && <button type="button" onClick={handlePreview} disabled={loading}>Fetch Preview</button>}
        <button type="button" className="primary" onClick={handleSummarize} disabled={loading || !input.trim()}>
          {loading ? 'Working…' : 'Summarize'}
        </button>
      </div>

      {preview && (
        <section>
          <h3>Preview</h3>
          <p>{preview}</p>
        </section>
      )}

      {summary && (
        <section>
          <h3>Latest Summary</h3>
          <pre>{summary}</pre>
        </section>
      )}

      <section>
        <h3>Last 10 Entries</h3>
        <ul>
          {history.map((row, idx) => (
            <li key={`${row.timestamp}-${idx}`}>
              <strong>{row.title || 'Untitled'}</strong> · {row.inputType} · {row.timestamp}
            </li>
          ))}
        </ul>
      </section>

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
