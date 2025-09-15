import {BACKEND_URL} from "./config.js";

export async function getItems() {
  const items = await fetch(`${BACKEND_URL}/questions`).then((r) => r.json());

  return items;
}

export async function createItem(item) {
  await fetch(`${BACKEND_URL}/questions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });
}

export async function deleteItem(id) {
  await fetch(`${BACKEND_URL}/questions/${id}`, {
    method: "DELETE",
  });
}

export async function loadItem(id) {
  const response = await fetch(`${BACKEND_URL}/questions/${id}`);
  return response.json();
}

export async function updateItem(item) {
  await fetch(`${BACKEND_URL}/questions/${item._id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });
}