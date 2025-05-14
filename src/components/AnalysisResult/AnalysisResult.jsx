'use client';
export default function AnalysisResult({ issues }) {
  if (!issues.length) return null;

  return (
    <div className="mt-6 bg-yellow-100 p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-2 text-red-700">Security Issues Found:</h3>
      <ul className="list-disc list-inside text-red-700">
        {issues.map((issue, idx) => (
          <li key={idx}>{issue.message}</li>
        ))}
      </ul>
    </div>
  );
}
