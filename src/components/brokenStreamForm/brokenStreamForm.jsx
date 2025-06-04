'use client';
import { useState, useRef } from 'react';

export default function BrokenStreamForm() {
  const [url, setUrl] = useState('');
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const eventSourceRef = useRef(null);

  function startCheck() {
    if (!url) return;

    setLoading(true);
    setLinks([]);
    setProgress({ done: 0, total: 0 });

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const es = new EventSource(`/api/brokenlink-stream?url=${encodeURIComponent(url)}`);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'total') {
        setProgress((prev) => ({ ...prev, total: data.total }));
      } else if (data.type === 'link') {
        setLinks((prev) => [...prev, { url: data.url, status: data.status, ok: data.ok }]);
        setProgress((prev) => ({ ...prev, done: prev.done + 1 }));
      } else if (data.type === 'done') {
        setLoading(false);
        es.close();
      } else if (data.type === 'error') {
        alert(data.message || 'Error occurred');
        setLoading(false);
        es.close();
      }
    };

    es.onerror = () => {
      alert('Error with connection.');
      setLoading(false);
      es.close();
    };
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🔗 Broken Link Checker (Streaming)</h1>
      <input
        className="w-full border p-2 rounded mb-4"
        placeholder="Enter full website URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={loading}
      />
      <button
        onClick={startCheck}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        disabled={loading || !url}
      >
        {loading ? 'Checking...' : 'Check Links'}
      </button>

      {progress.total > 0 && (
        <div className="mt-4">
          <div className="text-sm mb-1">
            Progress: {progress.done} / {progress.total} links checked
          </div>
          <div className="w-full bg-gray-300 rounded h-2">
            <div
              className="bg-blue-600 h-2 rounded"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-6 space-y-2">
        {links.map((link) => (
          <div
            key={link.url}
            className={`p-2 border rounded ${link.ok ? 'text-green-600' : 'text-red-600'}`}
          >
            {link.ok ? '✅' : '❌'}{' '}
            <a href={link.url} target="_blank" rel="noopener noreferrer" className="underline">
              {link.url}
            </a>{' '}
            <span className="text-sm">[Status: {link.status}]</span>
          </div>
        ))}
      </div>
    </main>
  );
}
