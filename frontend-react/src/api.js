const BASE = "";

async function request(path, options = {}) {
  const resp = await fetch(`${BASE}${path}`, options);
  if (!resp.ok) {
    const detail = await resp.text().catch(() => resp.statusText);
    throw new Error(`Backend error ${resp.status}: ${detail}`);
  }
  return resp.json();
}

export function sendChat(message, signal, bankId) {
  return request("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, ...(bankId ? { bank_id: bankId } : {}) }),
    signal,
  });
}

export function getBrief(signal, bankId) {
  const query = bankId ? `?bank_id=${encodeURIComponent(bankId)}` : "";
  return request(`/brief${query}`, { signal });
}

export function getDashboard(signal) {
  return request("/dashboard", { signal });
}

export function saveObservation(payload, signal) {
  return request("/observations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal,
  });
}

export async function checkHealth(signal) {
  try {
    await request("/health", { signal });
    return true;
  } catch {
    return false;
  }
}
