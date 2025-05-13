export default function JestReport({ report }) {
  return (
    <div>
      <h2>Test Analysis Report</h2>
      <pre>{report}</pre>
    </div>
  );
}
