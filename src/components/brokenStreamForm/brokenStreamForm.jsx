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

    const es = new EventSource(`http://localhost:5000/api/brokenlink/brokenlink-stream?url=${encodeURIComponent(url)}`);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'total') {
        setProgress((prev) => ({ ...prev, total: data.total }));
      } else if (data.type === 'link') {
        setLinks((prev) => {
  const exists = prev.some((link) => link.url === data.url);
  if (exists) return prev;
  return [...prev, { url: data.url, status: data.status, ok: data.ok }];
});

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
        {links.map((link, index) => (
          <div
             key={`${link.url}-${index}`}
            className={`p-3 border rounded bg-gray-50
              ${link.ok ? 'text-green-600 border-green-300' : 'text-red-600 border-red-300'}`}
          >
           <div className="flex items-center space-x-2 mb-1">
          <span className="text-lg">{link.ok ? '✅' : '❌'}</span>
        <span className="text-sm font-medium">
          [Status: {link.status}]
        </span>
        </div>
         <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block break-words underline text-sm text-blue-700 hover:text-blue-900"
      >
        {link.url}
      </a>
      </div>
        ))}
      </div>
    </main>
  );
}
