import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/smarthome/control";
const DEVICES_API = "http://localhost:5000/devices";

export default function App() {
    const [devices, setDevices] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editDevice, setEditDevice] = useState(null);
    const [newDevice, setNewDevice] = useState({ name: "", type: "light" });

    // Fetch devices from backend
    useEffect(() => {
        fetchDevices();
    }, []);

    const fetchDevices = async () => {
        try {
            const response = await axios.get(`${DEVICES_API}/list`);
            setDevices(response.data.map(device => ({
                id: device._id,
                name: device.name,
                state: device.status
            })));
        } catch (error) {
            console.error("Error fetching devices:", error);
        }
    };

    const toggleDevice = async (device) => {
        const originalState = device.state;
        const newState = !originalState;
        
        setDevices(devices.map(d => 
            d.id === device.id ? { ...d, state: newState } : d
        ));

        try {
            await axios.post(API_URL, {
                requestId: "123",
                inputs: [{
                    intent: "action.devices.EXECUTE",
                    payload: {
                        commands: [{
                            devices: [{ id: device.id }],
                            execution: [{
                                command: "action.devices.commands.OnOff",
                                params: { on: newState }
                            }]
                        }]
                    }
                }]
            });
        } catch (error) {
            console.error("API Error:", error);
            setDevices(devices.map(d => 
                d.id === device.id ? { ...d, state: originalState } : d
            ));
        }
    };

    const handleAddDevice = async (e) => {
        e.preventDefault();
        try {
            const deviceId = `${newDevice.type}-${Date.now()}`;
            await axios.post(`${DEVICES_API}/add`, {
                id: deviceId,
                name: newDevice.name
            });
            setShowAddForm(false);
            setNewDevice({ name: "", type: "light" });
            fetchDevices();
        } catch (error) {
            alert("Failed to add device");
        }
    };

    const handleUpdateDevice = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${DEVICES_API}/update`, {
                id: editDevice.id,
                name: editDevice.name
            });
            setEditDevice(null);
            fetchDevices();
        } catch (error) {
            alert("Failed to update device");
        }
    };

    const handleDeleteDevice = async (id) => {
        if (window.confirm("Delete this device permanently?")) {
            try {
                await axios.delete(`${DEVICES_API}/delete/${id}`);
                fetchDevices();
            } catch (error) {
                alert("Failed to delete device");
            }
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
            <h1 className="text-3xl font-bold mb-8">Smart Home Controller</h1>

            {/* Add Device Form */}
            <div className="w-full max-w-md mb-6">
                {!showAddForm ? (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="w-full p-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                    >
                        ➕ Add New Device
                    </button>
                ) : (
                    <form onSubmit={handleAddDevice} className="bg-gray-800 p-4 rounded-lg space-y-4">
                        <div>
                            <label className="block mb-2">Device Name</label>
                            <input
                                type="text"
                                required
                                className="w-full p-2 rounded text-black"
                                value={newDevice.name}
                                onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block mb-2">Device Type</label>
                            <select
                                className="w-full p-2 rounded text-black"
                                value={newDevice.type}
                                onChange={(e) => setNewDevice({...newDevice, type: e.target.value})}
                            >
                                <option value="light">Light</option>
                                <option value="fan">Fan</option>
                                <option value="outlet">Outlet</option>
                                <option value="sensor">Sensor</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" className="flex-1 bg-green-600 hover:bg-green-700 p-2 rounded">
                                Create
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 p-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Edit Device Modal */}
            {editDevice && (
                <div className="fixed top-0  bg-black/50 flex items-center justify-center">
                    <div className="bg-gray-800 p-6 rounded-lg w-96">
                        <h2 className="text-xl mb-4">Edit Device</h2>
                        <form onSubmit={handleUpdateDevice}>
                            <input
                                type="text"
                                value={editDevice.name}
                                onChange={(e) => setEditDevice({...editDevice, name: e.target.value})}
                                className="w-full p-2 mb-4 text-black rounded"
                            />
                            <div className="flex gap-2">
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 p-2 rounded">
                                    Save
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setEditDevice(null)}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 p-2 rounded"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Devices List */}
            <div className="w-full max-w-md space-y-2">
                {devices.map(device => (
                    <div key={device.id} className="group relative">
                        <button
                            onClick={() => toggleDevice(device)}
                            className={`w-full p-4 rounded-lg flex justify-between items-center transition-colors ${
                                device.state ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                            }`}
                        >
                            <span className="font-medium">{device.name}</span>
                            <span>{device.state ? "🔵 ON" : "⚫ OFF"}</span>
                        </button>
                        
                        <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => setEditDevice(device)}
                                className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded-l"
                            >
                                ✏️
                            </button>
                            <button
                                onClick={() => handleDeleteDevice(device.id)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-r"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}