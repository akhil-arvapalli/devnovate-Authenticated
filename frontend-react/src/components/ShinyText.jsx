export default function ShinyText({ children, className = "" }) {
  return <span className={`shiny ${className}`.trim()}>{children}</span>;
}
