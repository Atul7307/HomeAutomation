const mongoose = require("mongoose");

const DeviceSchema = new mongoose.Schema({
    name: String,
    status: String,
});

module.exports = mongoose.model("Device", DeviceSchema);
