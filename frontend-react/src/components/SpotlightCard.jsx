import { useRef } from "react";

export default function SpotlightCard({ as: Tag = "div", children, className = "", ...rest }) {
  const ref = useRef(null);

  function onMove(e) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  }

  return (
    <Tag ref={ref} className={className} onMouseMove={onMove} {...rest}>
      {children}
    </Tag>
  );
}
