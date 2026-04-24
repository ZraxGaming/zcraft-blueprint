function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
}

export async function POST() {
  // Lukittu does not provide a "clear activation" endpoint via the client verify API.
  // This route exists for compatibility with the frontend licenseService.
  return json({ cleared: true });
}
