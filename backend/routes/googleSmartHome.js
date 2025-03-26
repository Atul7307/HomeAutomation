const express = require("express");
const mqttClient = require("../config/mqttConfig");

const router = express.Router();

// Google Smart Home Sync Devices
router.post("/", (req, res) => {
    const { requestId } = req.body;

    res.json({
        requestId,
        payload: {
            agentUserId: "12345",
            devices: [
                { id: "light-1", type: "action.devices.types.LIGHT", traits: ["action.devices.traits.OnOff"], name: { name: "Smart Light" }, willReportState: true },
                { id: "fan-1", type: "action.devices.types.FAN", traits: ["action.devices.traits.OnOff"], name: { name: "Smart Fan" }, willReportState: true }
            ]
        }
    });
});

// Google Smart Home Control Devices
router.post("/control", (req, res) => {
    const { requestId, inputs } = req.body;

    let commands = inputs[0].payload.commands;
    commands.forEach(command => {
        command.devices.forEach(device => {
            const state = command.execution[0].params.on ? "ON" : "OFF";
            
            // Publish to MQTT
            mqttClient.publish(`home/${device.id}`, state, () => {
                console.log(`📡 MQTT Published: home/${device.id} -> ${state}`);
            });

            // Log action in the backend
            console.log(`🛠️ Device ${device.id} is now ${state}`);
        });
    });

    res.json({ requestId, payload: { commands } });
});

module.exports = router;
