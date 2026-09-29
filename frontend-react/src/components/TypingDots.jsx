export default function TypingDots({ label }) {
  return (
    <div className="bubble typing" role="status" aria-label={label || "Thinking"}>
      <i />
      <i />
      <i />
    </div>
  );
}
