require("dotenv").config();
const mqtt = require("mqtt");

const brokerUrl = `mqtts://${process.env.MQTT_BROKER}:${process.env.MQTT_PORT}`;

const client = mqtt.connect(brokerUrl, {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  rejectUnauthorized: false, // Important for HiveMQ Cloud (Self-Signed Certs)
});

client.on("connect", () => console.log("✅ MQTT Connected to HiveMQ"));
client.on("error", err => console.error("❌ MQTT Error:", err));

module.exports = client;
