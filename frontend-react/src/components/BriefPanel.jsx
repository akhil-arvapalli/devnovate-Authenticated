import { useState } from "react";
import Icon from "./Icon.jsx";
import SpotlightCard from "./SpotlightCard.jsx";

function renderBrief(markdown) {
  const blocks = [];
  let list = null;
  for (const raw of markdown.split("\n")) {
    const line = raw.trim();
    if (line.startsWith("- ")) {
      if (!list) {
        list = [];
        blocks.push({ type: "ul", items: list });
      }
      list.push(line.slice(2));
    } else if (line.startsWith("# ") || line.startsWith("## ")) {
      list = null;
      blocks.push({ type: "h3", text: line.replace(/^#+\s/, "") });
    } else if (line.startsWith("_") && line.endsWith("_")) {
      list = null;
      blocks.push({ type: "foot", text: line.replaceAll("_", "") });
    } else if (line) {
      list = null;
      blocks.push({ type: "p", text: line });
    }
  }
  return blocks;
}

export default function BriefPanel({ getBrief, ShinyText }) {
  const [brief, setBrief] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const data = await getBrief();
      setBrief(data.brief);
    } catch (err) {
      setError(`Could not generate brief: ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  async function copyBrief() {
    if (!brief) return;
    try {
      await navigator.clipboard.writeText(brief);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Copy is unavailable in this browser. Use print instead.");
    }
  }

  return (
    <SpotlightCard className="surface brief-card" as="section" id="visit">
      <div className="card-heading">
        <div>
          <span className="eyebrow"><Icon name="clipboard" size={13} /> Visit prep</span>
          <h2>Doctor brief</h2>
        </div>
        <span className="card-index">04</span>
      </div>
      <p className="card-intro">A clean handoff for the next appointment, assembled from the family memory.</p>

      <div className="brief-actions">
        <button type="button" className="action-button action-primary" onClick={generate} disabled={busy}>
          <Icon name="spark" size={15} />
          {busy ? <ShinyText>Assembling…</ShinyText> : brief ? "Refresh brief" : "Generate brief"}
        </button>
        {brief && (
          <>
            <button type="button" className="icon-button" onClick={copyBrief} aria-label="Copy doctor brief" title="Copy brief">
              <Icon name={copied ? "check" : "copy"} size={16} />
            </button>
            <button type="button" className="icon-button" onClick={() => window.print()} aria-label="Print doctor brief" title="Print brief">
              <Icon name="download" size={16} />
            </button>
          </>
        )}
      </div>

      {error && <div className="error-note" role="alert"><Icon name="warning" size={15} /> {error}</div>}

      {!brief && !error && !busy && (
        <div className="brief-preview">
          <div className="document-sheen" aria-hidden="true"><Icon name="file" size={28} /></div>
          <div>
            <strong>One page. No retelling.</strong>
            <p>Medications, conditions, observations and the care team — ready when you are.</p>
          </div>
        </div>
      )}

      {brief && (
        <div className="brief-body">
          <div className="brief-meta"><span><Icon name="check" size={13} /> Grounded in Anchor memory</span><span>Generated just now</span></div>
          {renderBrief(brief).map((block, index) => {
            if (block.type === "h3") return <h3 key={index}>{block.text}</h3>;
            if (block.type === "ul") return <ul key={index}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</ul>;
            if (block.type === "foot") return <p key={index} className="brief-foot">{block.text}</p>;
            return <p key={index}>{block.text}</p>;
          })}
        </div>
      )}
    </SpotlightCard>
  );
}
