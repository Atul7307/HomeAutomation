const express = require("express");
const mqttClient = require("../config/mqttConfig");
const Device = require("../models/Device");
const router = express.Router();


// Enhanced SYNC response
// router.post("/", async (req, res) => {
//     const devices = await Device.find();
//     res.json({
//       requestId: req.body.requestId,
//       payload: {
//         agentUserId: "123", // Should be persistent per user
//         devices: devices.map(device => ({
//           id: device.id,
//           type: getGoogleType(device.type), // Implement mapping
//           traits: getTraits(device.type),   // Return appropriate traits
//           name: {
//             defaultNames: [device.name],
//             name: device.name,
//             nicknames: []
//           },
//           willReportState: true,
//           attributes: {},
//           deviceInfo: {
//             manufacturer: "Your Brand",
//             model: device.type,
//             hwVersion: "1.0",
//             swVersion: "1.0"
//           }
//         }))
//       }
//     });
//   });

// Enhanced SYNC response (Google Home API compliance)
router.post("/", async (req, res) => {
    try {
      const devices = await Device.find();
      res.json({
        requestId: req.body.requestId,
        payload: {
          agentUserId: "123", // Static for demo (replace with real user ID in production)
          devices: devices.map(device => ({
            id: device.id,
            type: getGoogleDeviceType(device.type),
            traits: getDeviceTraits(device.type),
            name: {
              name: device.name,
              defaultNames: ["Smart Device"],
              nicknames: [device.name]
            },
            willReportState: true,
            attributes: getDeviceAttributes(device.type), // Added attributes
            deviceInfo: {
              manufacturer: "Your Brand",
              model: device.type.toUpperCase(), // Google requires uppercase model
              hwVersion: "1.0",
              swVersion: "1.0"
            }
          }))
        }
      });
    } catch (error) {
      res.status(500).json({ error: "SYNC_FAILED" });
    }
  });
  
  
// // Device Type Mapping
// const getGoogleDeviceType = (type) => {
//     const types = {
//       light: "action.devices.types.LIGHT",
//       fan: "action.devices.types.FAN",
//       outlet: "action.devices.types.OUTLET",
//       switch: "action.devices.types.SWITCH"
//     };
//     return types[type] || "action.devices.types.SWITCH";
//   };

// ✅ Device Type Mapping 
const getGoogleDeviceType = (type) => {
    const types = {
      light: "action.devices.types.LIGHT",
      fan: "action.devices.types.FAN",
      outlet: "action.devices.types.OUTLET",
      switch: "action.devices.types.SWITCH",
      thermostat: "action.devices.types.THERMOSTAT",
      sensor: "action.devices.types.SENSOR"
    };
    return types[type.toLowerCase()] || "action.devices.types.SWITCH"; // Case-insensitive
  };

// Updated device attributes mapping
const getDeviceAttributes = (type) => {
    const attributes = {
      light: {
        colorModel: "rgb",
        commandOnlyBrightness: false
      },
      fan: {
        availableFanSpeeds: {
          speeds: [
            { speed_name: "Low", speed_value: "low" },
            { speed_name: "Medium", speed_value: "medium" },
            { speed_name: "High", speed_value: "high" }
          ],
          ordered: true
        }
      }
    };
    return attributes[type] || {};
  };

  // Traits Mapping
const getDeviceTraits = (type) => {
    const traits = {
      light: ["action.devices.traits.OnOff", "action.devices.traits.Brightness"],
      fan: ["action.devices.traits.OnOff", "action.devices.traits.FanSpeed"],
      outlet: ["action.devices.traits.OnOff"],
      switch: ["action.devices.traits.OnOff"]
    };
    return traits[type] || ["action.devices.traits.OnOff"];
  };

// Device Query Endpoint
router.post("/query", async (req, res) => {
    try {
        const { requestId, inputs } = req.body;
        const deviceStatus = {};

        for (const device of inputs[0].payload.devices) {
            const foundDevice = await Device.findById(device.id);
            if (foundDevice) {
                deviceStatus[device.id] = {
                    online: true,
                    on: foundDevice.status,
                    status: "SUCCESS"
                };
            }
        }

        res.json({
            requestId,
            payload: {
                devices: deviceStatus
            }
        });
    } catch (error) {
        console.error("❌ Query Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// // Device Control Endpoint
// router.post("/control", async (req, res) => {
//     try {
//         console.log("📥 Received control request:", req.body);
//         const { requestId, inputs } = req.body;
//         const executionResults = [];
        
//         // Extract agentUserId from JWT or OAuth token (simplified example)
//         const agentUserId = req.headers.authorization 
//             ? extractUserIdFromToken(req.headers.authorization) 
//             : "default-user-123";

//         for (const command of inputs[0].payload.commands) {
//             for (const device of command.devices) {
//                 const newState = command.execution[0].params.on;
                
//                 // Get device details before update
//                 const originalDevice = await Device.findById(device.id);
                
//                 if (!originalDevice) {
//                     console.log(`❌ Device not found: ${device.id}`);
//                     executionResults.push({
//                         ids: [device.id],
//                         status: "OFFLINE",
//                         errorCode: "deviceNotFound"
//                     });
//                     continue;
//                 }

//                 // Update device in database
//                 const updatedDevice = await Device.findByIdAndUpdate(
//                     device.id,
//                     { 
//                         status: newState,
//                         lastUpdatedBy: agentUserId // Track who changed the state
//                     },
//                     { new: true }
//                 );

//                 // Log state change with brand info
//                 console.log(`🔄 [YourBrand] State Change - 
//                 Device: ${originalDevice.name} (${device.id}) 
//                 User: ${agentUserId}
//                 State: ${originalDevice.status ? "ON" : "OFF"} → ${newState ? "ON" : "OFF"}`);

//                 // Publish MQTT update
//                 mqttClient.publish(
//                     `home/${device.id}/state`,
//                     JSON.stringify({
//                         state: newState ? "ON" : "OFF",
//                         brand: "YourBrand",
//                         userId: agentUserId
//                     }),
//                     { qos: 1 },
//                     (err) => {
//                         if (err) {
//                             console.error(`❌ MQTT Error (${device.id}):`, err);
//                         } else {
//                             console.log(`📡 [MQTT] Sent to ${device.id}`);
//                         }
//                     }
//                 );

//                 executionResults.push({
//                     ids: [device.id],
//                     status: "SUCCESS",
//                     states: {
//                         on: updatedDevice.status,
//                         online: true
//                     }
//                 });
//             }
//         }

//         res.json({
//             requestId,
//             payload: {
//                 commands: executionResults
//             }
//         });
//     } catch (error) {
//         console.error("❌ ASM Control Error:", error);
//         res.status(500).json({ 
//             error: "Internal Server Error",
//             brand: "AMS",
//             timestamp: new Date().toISOString()
//         });
//     }
// });

// Updated CONTROL endpoint (Google command compatibility)
router.post("/control", async (req, res) => {
    try {
      const { requestId, inputs } = req.body;
      const executionResults = [];
  
      for (const command of inputs[0].payload.commands) {
        for (const device of command.devices) {
          const params = command.execution[0].params;
          const update = { status: params.on };
  
          // Handle brightness for Google Assistant
          if (params.brightness) {
            update.brightness = params.brightness;
          }
  
          const updatedDevice = await Device.findByIdAndUpdate(
            device.id,
            update,
            { new: true }
          );
  
          // MQTT message remains unchanged
          mqttClient.publish(
            `home/${device.id}/state`,
            JSON.stringify({
              state: updatedDevice.status ? "ON" : "OFF",
              ...(updatedDevice.brightness && { brightness: updatedDevice.brightness })
            }),
            { qos: 1 }
          );
  
          executionResults.push({
            ids: [device.id],
            status: "SUCCESS",
            states: {
              on: updatedDevice.status,
              ...(updatedDevice.brightness && { brightness: updatedDevice.brightness })
            }
          });
        }
      }
  
      res.json({ requestId, payload: { commands: executionResults } });
    } catch (error) {
      console.error("Control Error:", error);
      res.status(500).json({ error: "EXECUTION_ERROR" });
    }
  });

// Helper function (mock implementation)
function extractUserIdFromToken(token) {
    // In production, use JWT verification
    return token.split('-')[0] || "user-" + Math.random().toString(36).substr(2, 9);
}



module.exports = router;