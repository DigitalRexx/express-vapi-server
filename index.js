require('dotenv').config();
const express = require('express');

const app = express();
app.use(express.json()); // Tells Express to parse incoming JSON payloads

// FIX 1: Provide a fallback port so the server doesn't crash if .env is missing
const PORT = process.env.PORT || 3000;
const VAPI_SECRET = process.env.VAPI_SECRET;

// Health Check Route
app.get('/', (req, res) => {
  res.status(200).send("Express Server is Live!");
});

// Secure Webhook Route
app.post('/api/webhook', (req, res) => {
  // FIX 2: Ensure VAPI_SECRET actually exists in your environment variables
  if (!VAPI_SECRET) {
    console.error("CRITICAL: VAPI_SECRET is not defined in environment variables.");
    return res.status(500).json({ error: "Server misconfiguration." });
  }

  // 1. Validate the secret header (Express automatically lowercases all headers)
  if (req.headers['x-vapi-secret'] !== VAPI_SECRET) {
    return res.status(401).json({ error: "Unauthorized. Invalid signature." });
  }

  // 2. Extract payload (Simulating Vapi tool call)
  const data = req.body;
  console.log("Received Payload:", JSON.stringify(data, null, 2));

  // Extract the toolCallId that Vapi sends in its payload
  // Vapi sends this path: req.body.message.toolCalls[0].id
  const toolCallId = data?.message?.toolCalls?.[0]?.id;

  if (!toolCallId) {
    return res.status(400).json({ error: "Missing toolCallId in request." });
  }

  // 3. Return a successful response in Vapi's STRICT required format
  // FIX 3: Vapi requires a specific JSON schema to pass data back to the LLM
  return res.status(200).json({
    results: [
      {
        toolCallId: toolCallId,
        result: "Data successfully received and validated."
      }
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
