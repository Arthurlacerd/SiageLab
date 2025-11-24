const JSON_HEADERS = { "Content-Type": "application/json" };

async function parseResponse(response) {
  let data = null;
  try {
    data = await response.json();
  } catch (err) {
    // queda silenciosa para mensagens genéricas
  }

  if (!response.ok) {
    const message = data?.error?.message || response.statusText || "Erro ao processar requisição";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

async function fetchJSON(url, options = {}) {
  const resp = await fetch(url, options);
  return parseResponse(resp);
}

export function getFamilias() {
  return fetchJSON("/familias");
}

export function getFamilia(id) {
  return fetchJSON(`/familias/${id}`);
}

export function enviarDiagnostico(payload) {
  return fetchJSON("/api/diagnostico", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
}

export function gerarCronograma(payload) {
  return fetchJSON("/cronograma", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
}
