import { useState, useEffect } from "react";
import axios from "axios";

// const API_URL = "https://your-render-server-url/smarthome/control";
const API_URL = "http://localhost:5000/smarthome/control";

export default function App() {
    const [devices, setDevices] = useState([
        { id: "light-1", name: "Smart Light", state: false },
        { id: "fan-1", name: "Smart Fan", state: false },
    ]);

    const toggleDevice = async (device) => {
        const newState = !device.state;
        setDevices(devices.map(d => d.id === device.id ? { ...d, state: newState } : d));

        await axios.post(API_URL, {
            requestId: "123",
            inputs: [{ payload: { commands: [{ devices: [{ id: device.id }], execution: [{ command: "action.devices.commands.OnOff", params: { on: newState } }] }] } }]
        });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
            <h1 className="text-3xl font-bold mb-4">Home Automation</h1>
            {devices.map(device => (
                <button key={device.id} onClick={() => toggleDevice(device)}
                    className="px-6 py-3 my-2 bg-blue-500 hover:bg-blue-700 text-white rounded-lg">
                    {device.name} {device.state ? "🔵 ON" : "⚫ OFF"}
                </button>
            ))}
        </div>
    );
}
