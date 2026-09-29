import { useEffect, useRef, useState } from "react";
import { checkHealth, getBrief, getDashboard, saveObservation, sendChat } from "./api.js";
import BriefPanel from "./components/BriefPanel.jsx";
import ChatMessage from "./components/ChatMessage.jsx";
import Icon from "./components/Icon.jsx";
import ShinyText from "./components/ShinyText.jsx";
import SpotlightCard from "./components/SpotlightCard.jsx";
import TypingDots from "./components/TypingDots.jsx";

const SUGGESTIONS = [
  { label: "What changed this week?", prompt: "What's changed with Mom's blood pressure this week?", icon: "pulse" },
  { label: "Review medications", prompt: "What medications is Mom on right now, and what changed?", icon: "clipboard" },
  { label: "Is the dizziness serious?", prompt: "Mom is dizzy, should I be worried?", icon: "warning" },
];

function MetricTile({ icon, label, value, note, tone = "teal", children }) {
  return (
    <div className={`metric-tile tone-${tone}`}>
      <div className="metric-top"><span className="metric-icon"><Icon name={icon} size={15} /></span><span>{label}</span><Icon name="dots" size={16} className="metric-dots" /></div>
      <div className="metric-value">{value}</div>
      <div className="metric-note">{note}</div>
      {children}
    </div>
  );
}

function Sparkline({ points }) {
  const values = points.map((point) => point.systolic);
  const min = Math.min(...values) - 5;
  const max = Math.max(...values) + 5;
  const coords = values.map((value, index) => {
    const x = values.length === 1 ? 0 : (index / (values.length - 1)) * 240;
    const y = 68 - ((value - min) / (max - min)) * 56;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <div className="sparkline-wrap">
      <svg className="sparkline" viewBox="0 0 240 76" preserveAspectRatio="none" role="img" aria-label="Blood pressure trend rising over six readings">
        <defs><linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#c8f169" stopOpacity=".28" /><stop offset="1" stopColor="#c8f169" stopOpacity="0" /></linearGradient></defs>
        <path d={`M 0 76 L ${coords.replaceAll(" ", " L ")} L 240 76 Z`} fill="url(#spark-fill)" />
        <polyline points={coords} fill="none" stroke="#c8f169" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {values.map((value, index) => {
          const [x, y] = coords.split(" ")[index].split(",");
          return <circle key={index} cx={x} cy={y} r={index === values.length - 1 ? 4 : 2.3} fill={index === values.length - 1 ? "#ff7668" : "#c8f169"} stroke="#10151b" strokeWidth="2" />;
        })}
      </svg>
      <div className="sparkline-labels"><span>{points[0]?.date}</span><span>{points.at(-1)?.date}</span></div>
    </div>
  );
}

function SectionTitle({ eyebrow, title, action, onAction }) {
  return (
    <div className="section-title">
      <div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>
      {action && <button type="button" className="text-action" onClick={onAction}>{action}<Icon name="arrow" size={15} /></button>}
    </div>
  );
}

function AttentionCard({ item, featured = false, onAction }) {
  return (
    <div className={`attention-item severity-${item.severity} ${featured ? "attention-featured" : ""}`}>
      <div className="attention-marker"><span /></div>
      <div className="attention-copy">
        <div className="attention-label"><span>{item.label}</span><time>{item.source}</time></div>
        <h3>{item.title}</h3>
        <p>{item.detail}</p>
        <button type="button" onClick={onAction} className="inline-action">{item.action}<Icon name="arrow" size={14} /></button>
      </div>
    </div>
  );
}

function TimelineItem({ item, last }) {
  return (
    <div className={`timeline-item tone-${item.tone}`}>
      <div className="timeline-rail"><span className="timeline-dot"><Icon name={item.type === "medication" ? "tag" : item.type === "doctor" ? "stethoscope" : item.type === "symptom" ? "warning" : "pulse"} size={13} /></span>{!last && <span className="timeline-line" />}</div>
      <div className="timeline-copy"><div className="timeline-meta"><time>{item.date}</time><span>{item.day}</span><span className="timeline-type">{item.type}</span></div><h3>{item.title}</h3><p>{item.detail}</p></div>
    </div>
  );
}

function MedicationRow({ medication }) {
  return (
    <div className="medication-row">
      <span className={`medication-symbol accent-${medication.accent}`}><Icon name="plus" size={15} /></span>
      <div className="medication-name"><strong>{medication.name}</strong><span>{medication.purpose}</span></div>
      <div className="medication-dose"><strong>{medication.dose}</strong><span className={`medication-status status-${medication.status}`}>{medication.status}</span></div>
    </div>
  );
}

function ObservationModal({ onClose, onSaved }) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("daily note");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(event) {
    event.preventDefault();
    if (!content.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await saveObservation({ content: content.trim(), category });
      onSaved({ content: content.trim(), category });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="observation-modal" onSubmit={submit}>
        <div className="modal-top"><div><span className="eyebrow">New memory</span><h2>Capture an observation</h2></div><button type="button" className="icon-button" onClick={onClose} aria-label="Close"><Icon name="x" size={18} /></button></div>
        <p>Small details become useful when Anchor can connect them over time.</p>
        <label>What did you notice?<textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="e.g. Margaret slept through the night and ate breakfast." maxLength={1000} autoFocus /></label>
        <label>Memory type<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="daily note">Daily note</option><option value="symptom">Symptom</option><option value="medication">Medication</option><option value="appointment">Appointment</option></select></label>
        {error && <div className="error-note" role="alert"><Icon name="warning" size={15} /> {error}</div>}
        <div className="modal-actions"><button type="button" className="text-action" onClick={onClose}>Cancel</button><button type="submit" className="action-button action-primary" disabled={busy || !content.trim()}>{busy ? <ShinyText>Saving…</ShinyText> : <><Icon name="plus" size={15} /> Add to memory</>}</button></div>
      </form>
    </div>
  );
}

function LoadingState() {
  return <div className="loading-screen"><div className="loading-orbit"><Icon name="heart" size={30} /></div><p>Opening the family memory…</p></div>;
}

export default function App() {
  const [dashboard, setDashboard] = useState(null);
  const [messages, setMessages] = useState(() => {
    try { return JSON.parse(localStorage.getItem("anchor-conversation") || "[]"); } catch { return []; }
  });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [health, setHealth] = useState(null);
  const [activeView, setActiveView] = useState("today");
  const [showObservation, setShowObservation] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([checkHealth(controller.signal), getDashboard(controller.signal)])
      .then(([isHealthy, data]) => { setHealth(isHealthy); setDashboard(data); })
      .catch(() => { setHealth(false); })
      .finally(() => controller.signal.aborted || undefined);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    try { localStorage.setItem("anchor-conversation", JSON.stringify(messages.slice(-30))); } catch { /* storage is optional */ }
  }, [messages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  function jumpTo(view) {
    setActiveView(view);
    const target = document.getElementById(view === "visit" ? "visit" : view === "memory" ? "memory" : view === "team" ? "team" : "today");
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submit(text) {
    const message = (text ?? input).trim();
    if (!message || busy) return;
    setInput("");
    const time = new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    setMessages((current) => [...current, { role: "user", content: message, time }]);
    setBusy(true);
    try {
      const data = await sendChat(message);
      setMessages((current) => [...current, { role: "assistant", content: data.answer, time: "now", risk: data.risk, riskReason: data.risk_reason, evidence: data.evidence }]);
    } catch (err) {
      setMessages((current) => [...current, { role: "assistant", content: `I couldn't reach the memory service. ${err.message}`, time: "now", error: true, retryText: message }]);
    } finally {
      setBusy(false);
    }
  }

  function onObservationSaved(note) {
    setDashboard((current) => ({
      ...current,
      memory: { ...current.memory, total: current.memory.total + 1, this_week: current.memory.this_week + 1, last_synced: "just now" },
      timeline: [{ id: `note-${Date.now()}`, date: "Today", day: "Just now", type: note.category, tone: "teal", title: "Caregiver note added", detail: note.content }, ...current.timeline],
    }));
    setShowObservation(false);
    jumpTo("memory");
  }

  if (!dashboard) return <LoadingState />;

  const urgentCount = dashboard.attention.filter((item) => item.severity === "urgent").length;
  const currentViewLabel = activeView === "today" ? "Today" : activeView === "memory" ? "Memory stream" : activeView === "visit" ? "Visit prep" : "Care team";

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" aria-hidden="true" /><div className="ambient ambient-two" aria-hidden="true" /><div className="grid-noise" aria-hidden="true" />
      <header className="app-header">
        <div className="brand-lockup"><div className="brand-mark"><Icon name="heart" size={21} /></div><div><div className="brand-name">anchor<span>/care</span></div><div className="brand-subtitle">family memory, made useful</div></div></div>
        <div className="header-context"><span className="context-label">Caring for</span><strong>{dashboard.patient.name}</strong><span className="header-divider" /><span className="memory-status"><i className={health ? "online" : "offline"} />{health ? "Memory live" : "Reconnect memory"}</span></div>
        <div className="header-actions"><button type="button" className="round-button" aria-label="Notifications"><Icon name="bell" size={17} /><span className="notification-dot">{urgentCount}</span></button><button type="button" className="profile-button"><span>LM</span><Icon name="chevron" size={14} /></button></div>
      </header>

      <div className="app-layout">
        <aside className="side-rail">
          <div className="rail-label">Workspace</div>
          <nav className="rail-nav" aria-label="Primary navigation">
            <button className={activeView === "today" ? "active" : ""} onClick={() => jumpTo("today")}><Icon name="home" size={17} /><span>Today</span><b>01</b></button>
            <button className={activeView === "memory" ? "active" : ""} onClick={() => jumpTo("memory")}><Icon name="pulse" size={17} /><span>Memory stream</span><b>{dashboard.memory.total}</b></button>
            <button className={activeView === "visit" ? "active" : ""} onClick={() => jumpTo("visit")}><Icon name="clipboard" size={17} /><span>Visit prep</span><b>04</b></button>
            <button className={activeView === "team" ? "active" : ""} onClick={() => jumpTo("team")}><Icon name="user" size={17} /><span>Care team</span><b>02</b></button>
          </nav>
          <div className="rail-rule" />
          <div className="rail-profile"><div className="patient-avatar">{dashboard.patient.initials}</div><div><strong>{dashboard.patient.name}</strong><span>{dashboard.patient.age} years · Mom</span></div><button type="button" aria-label="Patient menu"><Icon name="dots" size={16} /></button></div>
          <button type="button" className="rail-add" onClick={() => setShowObservation(true)}><span><Icon name="plus" size={16} /></span><div><strong>Add observation</strong><small>Keep the story moving</small></div></button>
          <div className="rail-footer"><Icon name="shield" size={15} /><span>Private by design<br /><em>Demo data only</em></span></div>
        </aside>

        <main className="main-content" id="today">
          <div className="breadcrumb"><span>Family workspace</span><Icon name="chevron" size={13} /><strong>{currentViewLabel}</strong><span className="breadcrumb-date">Memory window · Sep 1—18, 2026</span></div>
          <section className="hero-row">
            <div><span className="eyebrow hero-eyebrow"><span className="live-pulse" /> Monday, September 21</span><h1>See the whole story.<br /><em>Not just today.</em></h1><p>Anchor connects the small moments in Margaret's care so you can take the next right step with confidence.</p></div>
            <div className="hero-orb"><div className="orb-ring ring-one" /><div className="orb-ring ring-two" /><div className="orb-core"><Icon name="heart" size={33} /><span>24</span></div><span className="orb-label">memories held</span></div>
          </section>

          <section className="metric-grid" aria-label="Care snapshot">
            <MetricTile icon="pulse" label="Blood pressure" value={dashboard.metrics.latest_bp} note={<><span className="delta-up">↑ {dashboard.metrics.bp_delta}</span> vs baseline</>} tone="lime"><span className="metric-status">needs review</span></MetricTile>
            <MetricTile icon="calendar" label="Last check-in" value="Today" note={dashboard.metrics.last_check} tone="blue"><span className="metric-status quiet">caregiver logged</span></MetricTile>
            <MetricTile icon="tag" label="Active medications" value={dashboard.metrics.active_medications} note="1 recent change" tone="violet"><span className="metric-status violet-status">track closely</span></MetricTile>
            <MetricTile icon="shield" label="Memory health" value="100%" note={`${dashboard.memory.this_week} memories this week`} tone="teal"><span className="metric-status quiet">synced just now</span></MetricTile>
          </section>

          <section className="command-grid">
            <SpotlightCard className="surface attention-card" as="section">
              <div className="card-heading"><div><span className="eyebrow eyebrow-alert"><Icon name="warning" size={13} /> Safety radar</span><h2>Needs your attention</h2></div><span className="alert-count">{urgentCount} urgent</span></div>
              <div className="attention-list">{dashboard.attention.map((item, index) => <AttentionCard key={item.id} item={item} featured={index === 0} onAction={() => index === 2 ? jumpTo("visit") : submit("Mom is dizzy, should I be worried?")} />)}</div>
            </SpotlightCard>
            <SpotlightCard className="surface trend-card" as="section">
              <div className="card-heading"><div><span className="eyebrow"><Icon name="pulse" size={13} /> Pattern detected</span><h2>Blood pressure</h2></div><span className="trend-badge">6 readings</span></div>
              <div className="trend-big"><strong>+27%</strong><span>rising trend<br />over the last week</span></div>
              <Sparkline points={dashboard.metrics.bp_points} />
              <div className="trend-legend"><span><i className="legend-dot latest" />Latest <strong>165/92</strong></span><span><i className="legend-dot baseline" />Baseline <strong>130/80</strong></span></div>
              <div className="trend-foot"><Icon name="spark" size={14} /> Anchor noticed the change before it became a single alarming number.</div>
            </SpotlightCard>
          </section>

          <section className="workspace-grid">
            <SpotlightCard className="surface chat-card" as="section" id="chat">
              <div className="card-heading chat-heading"><div><span className="eyebrow"><span className="anchor-dot" /> Ask Anchor</span><h2>A second set of eyes for care.</h2></div><span className="card-index">01</span></div>
              <div className="chat-context"><span><Icon name="shield" size={14} /> Grounded in {dashboard.memory.total} family memories</span><span><i className="green-dot" /> Ready</span></div>
              <div className="chat-scroll" ref={scrollRef} aria-live="polite">
                {messages.length === 0 && !busy && <div className="chat-empty"><div className="empty-icon"><Icon name="message" size={22} /></div><div><strong>What do you want to understand?</strong><p>Ask in plain language. Anchor will connect symptoms, medications and changes across time.</p></div></div>}
                {messages.map((message, index) => <ChatMessage key={`${message.time}-${index}`} message={message} onRetry={submit} />)}
                {busy && <div className="message-row assistant"><div className="message-avatar anchor-avatar"><Icon name="heart" size={15} /></div><div className="message-stack"><div className="message-meta"><span>Anchor</span><time>recalling memory…</time></div><div className="message-bubble typing-bubble"><TypingDots label="Recalling memory" /></div></div></div>}
              </div>
              <div className="prompt-grid">{SUGGESTIONS.map((suggestion) => <button key={suggestion.label} type="button" className="prompt-card" onClick={() => submit(suggestion.prompt)} disabled={busy}><Icon name={suggestion.icon} size={15} /><span>{suggestion.label}</span><Icon name="arrow" size={14} className="prompt-arrow" /></button>)}</div>
              <form className="composer" onSubmit={(event) => { event.preventDefault(); submit(); }}><div className="composer-input"><Icon name="message" size={17} /><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about Margaret's care…" aria-label="Message to Anchor" maxLength={2000} /><span>{input.length}/2000</span></div><button className="send-button" type="submit" disabled={busy || !input.trim()} aria-label="Send message"><Icon name="send" size={17} /></button></form>
              <div className="composer-note"><Icon name="shield" size={12} /> Anchor supports your decisions — it never replaces a clinician.</div>
            </SpotlightCard>

            <SpotlightCard className="surface timeline-card" as="section" id="memory">
              <SectionTitle eyebrow="Longitudinal record" title="Memory stream" action="See all" onAction={() => jumpTo("memory")} />
              <p className="section-copy">The moments that changed the picture, in order.</p>
              <div className="timeline-list">{dashboard.timeline.map((item, index) => <TimelineItem key={item.id} item={item} last={index === dashboard.timeline.length - 1} />)}</div>
              <button type="button" className="timeline-end" onClick={() => setShowObservation(true)}><span><Icon name="plus" size={14} /></span> Add today's observation</button>
            </SpotlightCard>
          </section>

          <section className="detail-grid" id="team">
            <SpotlightCard className="surface medication-card" as="section">
              <SectionTitle eyebrow="Medication cabinet" title="What she's taking" action="Ask Anchor" onAction={() => submit("What medications is Mom on right now, and what changed?")} />
              <p className="section-copy">The current list, with changes called out.</p>
              <div className="medication-list">{dashboard.medications.map((medication) => <MedicationRow key={medication.name} medication={medication} />)}</div>
              <div className="medication-note"><Icon name="warning" size={14} /><span><strong>One change to discuss:</strong> Metoprolol moved to 50mg on Sep 15.</span></div>
            </SpotlightCard>
            <SpotlightCard className="surface team-card" as="section">
              <SectionTitle eyebrow="People around the table" title="Care team" action="Call" onAction={() => window.open("tel:5550102233", "_self")} />
              <p className="section-copy">Keep the right person one tap away.</p>
              <div className="team-list">{dashboard.care_team.map((member, index) => <div className="team-member" key={member.name}><div className={`team-avatar team-${index}`}>{member.name.split(" ").map((part) => part[0]).join("")}</div><div><strong>{member.name}</strong><span>{member.role}</span></div><a href={`tel:${member.phone.replace(/[^\d]/g, "")}`} aria-label={`Call ${member.name}`}><Icon name="message" size={15} /></a></div>)}</div>
              <div className="next-action"><span className="next-action-icon"><Icon name="arrow" size={15} /></span><div><span>Suggested next move</span><strong>Call Dr. Patel before the next dose change.</strong></div></div>
            </SpotlightCard>
          </section>

          <BriefPanel getBrief={getBrief} ShinyText={ShinyText} />
          <footer className="app-footer"><div className="footer-brand"><span className="footer-heart"><Icon name="heart" size={13} /></span><strong>anchor/care</strong></div><span>Built for the moments between appointments.</span><span className="footer-safe"><Icon name="shield" size={12} /> Synthetic family data · private by design</span></footer>
        </main>
      </div>
      {showObservation && <ObservationModal onClose={() => setShowObservation(false)} onSaved={onObservationSaved} />}
    </div>
  );
}
