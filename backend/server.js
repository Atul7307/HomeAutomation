const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Ensure Routes are Correct
app.use("/auth", require("./routes/auth"));
app.use("/smarthome", require("./routes/googleSmartHome")); // ✅ This must exist
app.use("/devices", require("./routes/devices")); // ✅ Device management

// ✅ Test Route
app.get("/", (req, res) => res.send("✅ Smart Home Server is running!"));

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
