// Using built-in fetch (Node.js 18+)
const { GoogleAuth } = require("google-auth-library");
const serviceAccount = require("./serviceAccountKey.json");

// TODO: Replace with your actual project ID
const PROJECT_ID = "chat-app-14e27";

// Target device's FCM token
const fcmToken = "frXBIr44ToOsOiIA_3ymAa:APA91bFuRlUP5rDA8StTeOqq2Sgj0A6-Le8XV_3Z4Mphpsx2GCHtt9sF0M-iBVf86EhNqMfD57RUEYp9Sc7kzeHfFl25BKyqrrpTeJYl7YMYIo_tkHA7uuI";
  
// Create auth client
const auth = new GoogleAuth({
  credentials: serviceAccount,
  scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
});

async function sendNotification() {
  try {
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    const url = `https://fcm.googleapis.com/v1/projects/${PROJECT_ID}/messages:send`;

    const message = {
      message: {
        token: fcmToken,
        notification: {
          title: "Hello from HTTP v1 API",
          body: "This is a manual FCM request without Firebase Admin SDK",
        },
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
    if (response.ok) {
      console.log("✅ Notification sent successfully:", data);
    } else {
      console.error("❌ Error sending notification:", data);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

sendNotification();