require("dotenv").config();
const express = require("express");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const { GoogleAuth } = require("google-auth-library");

const app = express();
app.use(express.json()); // allows JSON body parsing

// Parse service account from environment
let serviceAccount;
try {
  serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
} catch (e) {
  console.error("❌ Invalid SERVICE_ACCOUNT_KEY:", e.message);
  process.exit(1);
}

const PROJECT_ID = "chat-app-14e27";

// Notification function
async function sendNotification(fcmToken, title, body, payload = {}) {
  const auth = new GoogleAuth({
    credentials: serviceAccount,
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });

  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  const url = `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`;
  const message = {
    message: {
      token: fcmToken,
      notification: { title, body },
      data: payload,
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));
  return data;
}

// ✅ Endpoint Flutter can call
app.post("/send", async (req, res) => {
  const { token, title, body, payload } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ error: "Missing token, title, or body" });
  }

  try {
    const result = await sendNotification(token, title, body, payload);
    res.status(200).json({ success: true, fcm: result });
  } catch (error) {
    console.error("❌ FCM error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 FCM server listening on port ${PORT}`);
});
