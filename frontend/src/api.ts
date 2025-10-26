const BASE = "http://127.0.0.1:8000";

export async function login(username: string, password: string) {
  const body = new URLSearchParams();
  body.set("username", username);
  body.set("password", password);

  const r = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!r.ok) throw new Error("Login failed");
  const data = await r.json();
  localStorage.setItem("token", data.access_token);
  return data;
}

export async function score(payload: any, { demo = false } = {}) {
  const url = demo ? `${BASE}/demo/score` : `${BASE}/score`;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = localStorage.getItem("token");
  if (!demo && token) headers.Authorization = `Bearer ${token}`;

  const r = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload) });
  if (!r.ok) throw new Error(`Scoring failed: ${r.status}`);
  return r.json();
}
