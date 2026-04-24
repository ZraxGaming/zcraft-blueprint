export default async function handler(req, res) {
  try {
    const { license_key, device_identifier } = req.body;

    const response = await fetch(
      "https://api.lukittu.com/client/verify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          license_key,
          device_identifier,
        }),
      }
    );

    const data = await response.json();

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      valid: false,
      error: "LICENSE_NETWORK_ERROR",
    });
  }
}
