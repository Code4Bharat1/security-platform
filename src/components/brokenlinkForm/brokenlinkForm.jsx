'use client';
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  async function checkLinks() {
    setLoading(true);
    setLinks([]);
    setProgress({ done: 0, total: 0 });

    try {
      const res = await fetch(`/api/brokenlink?url=${encodeURIComponent(url)}`);
      const data = await res.json();

      if (!data.links) {
        alert('No links found or error occurred.');
        setLoading(false);
        return;
      }

      const totalLinks = data.links.length;
      setProgress({ done: 0, total: totalLinks });

      // Show results progressively as they come in
      // For this, we can fetch results one by one or in batches
      // But your API returns all at once, so we fake progress:

      // Simulate progress increment to show a bar during load
      // Here, just immediately set all links and progress done = total
      setLinks(data.links);
      setProgress({ done: totalLinks, total: totalLinks });

    } catch (err) {
      alert('Error fetching results.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">🔗 Broken Link Checker</h1>
      <input
        className="w-full border p-2 rounded mb-4"
        placeholder="Enter full website URL"
        value={url}
        onChange={e => setUrl(e.target.value)}
      />
      <div className="flex gap-4 items-center">
        <button
          onClick={checkLinks}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading || !url}
        >
          {loading ? 'Checking...' : 'Check Links'}
        </button>

        {progress.total > 0 && (
          <div className="ml-4 flex-1">
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
      </div>

      <div className="mt-6 space-y-2">
        {links.map(link => (
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
