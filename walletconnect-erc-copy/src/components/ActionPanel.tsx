import { useState } from "react";
import { SignMessage } from "./SignMessage";
import { SendTransaction } from "./SendTransaction";

type Section = "transactions" | "sign" | "jsonrpc" | null;

export function ActionPanel() {
  const [open, setOpen] = useState<Section>(null);

  const toggle = (section: Section) =>
    setOpen((prev) => (prev === section ? null : section));

  return (
    <div className="action-panel">
      <div className="accordion">
        <button
          className={`accordion-header ${open === "transactions" ? "open" : ""}`}
          onClick={() => toggle("transactions")}
        >
          <span className="accordion-title">Transactions</span>
          <span className="accordion-desc">Send and manage transactions</span>
        </button>
        {open === "transactions" && (
          <div className="accordion-body">
            <SendTransaction />
          </div>
        )}
      </div>

      <div className="accordion">
        <button
          className={`accordion-header ${open === "sign" ? "open" : ""}`}
          onClick={() => toggle("sign")}
        >
          <span className="accordion-title">Sign Message</span>
          <span className="accordion-desc">Sign messages</span>
        </button>
        {open === "sign" && (
          <div className="accordion-body">
            <SignMessage />
          </div>
        )}
      </div>

      <div className="accordion">
        <button
          className={`accordion-header ${open === "jsonrpc" ? "open" : ""}`}
          onClick={() => toggle("jsonrpc")}
        >
          <span className="accordion-title">JSON-RPC</span>
          <span className="accordion-desc">Send and manage JSON-RPC requests</span>
        </button>
        {open === "jsonrpc" && (
          <div className="accordion-body">
            <p className="logger-empty">No actions yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
