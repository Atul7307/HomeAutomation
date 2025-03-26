const express = require("express");
const Device = require("../models/Device");

const router = express.Router();

// ✅ Add a New Device
router.post("/add", async (req, res) => {
    const { id, name } = req.body; // Require ID from frontend
    const newDevice = new Device({ 
        _id: id, // Use custom ID
        name, 
        status: false // Default to boolean false
    });
    
    try {
        await newDevice.save();
        res.json({ message: "Device added!", device: newDevice });
    } catch (error) {
        res.status(400).json({ error: "Device ID must be unique" });
    }
});
// ✅ Get All Devices
router.get("/all", async (req, res) => {
    const devices = await Device.find();
    res.json(devices);
});

router.get("/list", async (req, res) => {
    try {
        const devices = await Device.find();
        res.json(devices);
    } catch (error) {
        console.error("Error fetching devices:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Update Device
router.put("/update", async (req, res) => { // Changed to PUT method
    try {
        const { id, name } = req.body;
        const updatedDevice = await Device.findByIdAndUpdate(
            id,
            { name },
            { new: true, runValidators: true }
        );

        if (!updatedDevice) {
            return res.status(404).json({ error: "Device not found" });
        }

        res.json({ message: "Device updated!", device: updatedDevice });
    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ error: "Server error during update" });
    }
});

// ✅ Delete a Device
router.delete("/delete/:id", async (req, res) => { // Use DELETE method and URL param
    try {
        const { id } = req.params;
        const deletedDevice = await Device.findByIdAndDelete(id);

        if (!deletedDevice) {
            return res.status(404).json({ error: "Device not found" });
        }

        res.json({ message: "Device deleted!", device: deletedDevice });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({ error: "Server error during deletion" });
    }
});


module.exports = router;
