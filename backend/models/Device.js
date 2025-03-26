const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Enforce custom string IDs
  name: { type: String, required: true },
  status: { type: Boolean, default: false } // Ensure boolean type
});

// Prevent model overwrite
const Device = mongoose.models.Device || mongoose.model("Device", deviceSchema);

module.exports = Device;