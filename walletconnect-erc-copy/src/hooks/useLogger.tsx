import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface LogEntry {
  label: string;
  detail: string;
  data?: unknown;
  timestamp: Date;
}

interface LoggerContextValue {
  messages: LogEntry[];
  addMessage: (label: string, detail: string, data?: unknown) => void;
  clear: () => void;
}

const LoggerContext = createContext<LoggerContextValue | null>(null);

export function LoggerProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<LogEntry[]>([]);

  const addMessage = useCallback((label: string, detail: string, data?: unknown) => {
    setMessages((prev) => [
      { label, detail, data, timestamp: new Date() },
      ...prev,
    ]);
  }, []);

  const clear = useCallback(() => setMessages([]), []);

  return (
    <LoggerContext.Provider value={{ messages, addMessage, clear }}>
      {children}
    </LoggerContext.Provider>
  );
}

export function useLogger() {
  const ctx = useContext(LoggerContext);
  if (!ctx) throw new Error("useLogger must be used within LoggerProvider");
  return ctx;
}
