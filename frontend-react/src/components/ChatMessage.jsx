import { useState } from "react";
import Icon from "./Icon.jsx";

export default function ChatMessage({ message, onRetry }) {
  const isUser = message.role === "user";
  const [showEvidence, setShowEvidence] = useState(false);

  return (
    <div className={`message-row ${message.role}`}>
      <div className={`message-avatar ${isUser ? "user-avatar" : "anchor-avatar"}`} aria-hidden="true">
        {isUser ? <Icon name="user" size={15} /> : <Icon name="heart" size={15} />}
      </div>
      <div className="message-stack">
        <div className="message-meta">
          <span>{isUser ? "You" : "Anchor"}</span>
          <time>{message.time || "now"}</time>
        </div>
        <div className={`message-bubble ${message.error ? "message-error" : ""}`}>
          <div className="message-content">{message.content}</div>
          {message.risk && message.riskReason && (
            <div className="risk-callout" role="alert">
              <div className="risk-callout-head"><Icon name="warning" size={15} /><strong>Catch flagged a pattern</strong></div>
              <p>{message.riskReason}</p>
            </div>
          )}
          {message.evidence?.length > 0 && (
            <div className="evidence-block">
              <button type="button" className="evidence-toggle" onClick={() => setShowEvidence((open) => !open)} aria-expanded={showEvidence}>
                <span><Icon name="search" size={14} /> {message.evidence.length} memories behind this</span>
                <Icon name="chevron" size={14} className={showEvidence ? "rotate" : ""} />
              </button>
              {showEvidence && <div className="evidence-list">{message.evidence.slice(0, 4).map((item, index) => <div key={index}><span className="evidence-dot" />{item}</div>)}</div>}
            </div>
          )}
          {message.error && onRetry && (
            <button type="button" className="retry-button" onClick={() => onRetry(message.retryText)}><Icon name="refresh" size={14} /> Try again</button>
          )}
        </div>
      </div>
    </div>
  );
}
