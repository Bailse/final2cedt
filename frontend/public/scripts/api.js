import BACKEND_URL from "./config.js";

export async function getItems() {
  const items = await fetch(`${BACKEND_URL}/items`).then((r) => r.json());

  return items;
}

export async function createItem(item) {
  await fetch(`${BACKEND_URL}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });
}

export async function deleteItem(id) {
  await fetch(`${BACKEND_URL}/items/${id}`, {
    method: "DELETE",
  });
}

export async function loadItem(id) {
  const response = await fetch(`${BACKEND_URL}/items/${id}`, {
    method: "GET",
  }).then(res => {return res.json()});
}

export async function updateItem(item) {
  await fetch(`${BACKEND_URL}/items/${item._id}`, {
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });
}