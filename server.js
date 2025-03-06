require("dotenv").config(); 
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.static(__dirname)); 
app.use(express.json()); 

const WaterData = require("./db");

app.get("/data", async (req, res) => {
    try {
        const data = await WaterData.aggregate([
            { 
                $group: {
                    _id: { location: "$location", pH: "$pH", turbidity: "$turbidity", temperature: "$temperature" },
                    uniqueId: { $first: "$_id" }
                }
            },
            {
                $project: {
                    _id: "$uniqueId",
                    location: "$_id.location",
                    pH: "$_id.pH",
                    turbidity: "$_id.turbidity",
                    temperature: "$_id.temperature"
                }
            }
        ]);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.post("/add-data", async (req, res) => {
    const { location, pH, turbidity, temperature } = req.body;
    try {
        const existingData = await WaterData.findOne({ location, pH, turbidity, temperature });
        if (existingData) {
            return res.status(400).json({ message: "Duplicate entry detected" });
        }
        const newData = new WaterData({ location, pH, turbidity, temperature });
        await newData.save();
        res.status(201).json({ message: "Data added successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to add data" });
    }
});

app.delete("/remove-duplicates", async (req, res) => {
    try {
        const duplicates = await WaterData.aggregate([
            { 
                $group: {
                    _id: { location: "$location", pH: "$pH", turbidity: "$turbidity", temperature: "$temperature" },
                    ids: { $push: "$_id" },
                    count: { $sum: 1 }
                }
            },
            { $match: { count: { $gt: 1 } } }
        ]);

        for (const record of duplicates) {
            const idsToDelete = record.ids.slice(1); // Keep one, delete rest
            await WaterData.deleteMany({ _id: { $in: idsToDelete } });
        }
        res.json({ message: "Duplicate records removed" });
    } catch (error) {
        res.status(500).json({ error: "Failed to remove duplicates" });
    }
});

app.get("/database", (req, res) => {
    res.sendFile(path.join(__dirname, "database.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
