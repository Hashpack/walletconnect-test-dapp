import { useLogger, type LogEntry } from "../hooks/useLogger";

function LogMessage({ entry }: { entry: LogEntry }) {
  const time = entry.timestamp.toLocaleTimeString();
  return (
    <div className="log-entry">
      <div className="log-header">
        <span className="log-label">{entry.label}</span>
        <span className="log-time">{time}</span>
      </div>
      {entry.detail && <div className="log-detail">{entry.detail}</div>}
      {entry.data !== undefined && (
        <pre className="log-data">
          {typeof entry.data === "string"
            ? entry.data
            : JSON.stringify(entry.data, null, 2)}
        </pre>
      )}
    </div>
  );
}

export function Logger() {
  const { messages, clear } = useLogger();

  return (
    <div className="logger">
      <div className="logger-toolbar">
        <button onClick={clear} disabled={messages.length === 0}>
          Clear
        </button>
      </div>
      {messages.length === 0 ? (
        <p className="logger-empty">No log messages yet.</p>
      ) : (
        messages.map((entry, i) => <LogMessage key={i} entry={entry} />)
      )}
    </div>
  );
}
