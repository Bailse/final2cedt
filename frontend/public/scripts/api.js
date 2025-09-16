
import { BACKEND_URL } from "./config.js";

async function handle(res, label) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${label} ${res.status} ${text || ""}`.trim());
  }
  return res.json();
}

export async function getItems() {
  const r = await fetch(`${BACKEND_URL}/questions`);
  return handle(r, "GET /questions");
}

export async function createItem(item) {
  const r = await fetch(`${BACKEND_URL}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  return handle(r, "POST /questions"); // <-- returns the CREATED doc (with _id)
}

export async function deleteItem(id) {
  const r = await fetch(`${BACKEND_URL}/questions/${id}`, { method: "DELETE" });
  return handle(r, "DELETE /questions/:id");
}

export async function loadItem(id) {
  const r = await fetch(`${BACKEND_URL}/questions/${id}`);
  return handle(r, "GET /questions/:id");
}

export async function updateItem(id, item) {
  const r = await fetch(`${BACKEND_URL}/questions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
  return handle(r, "PUT /questions/:id");
}
