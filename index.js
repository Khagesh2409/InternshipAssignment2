import express, { response } from "express";
import fetch from "node-fetch";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
const app = express();
const PORT = 5000;
app.use(cors());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const workSchema = new mongoose.Schema({
    name: String,
    last: Number,
    buy: Number,
    sell: Number,
    volume: Number,
    base_unit: String,
});

const Work = mongoose.model('Work', workSchema);


app.get("/fetchData", async (req, res) => {
    try {
        const content = await fetch("https://api.wazirx.com/api/v2/tickers");
        const data = await content.json();
        res.status(200).json(data);
    } catch (error) {
        console.log(error);
        res.status(500).send("Error in fetching data.");
    }
});

app.get("/storeData", async (req, res) => {
    try {
        const content = await fetch("https://api.wazirx.com/api/v2/tickers");
        const data = await content.json();
        const top10Array = Object.values(data);
        const top10 = top10Array.slice(0, 10);
        await Work.insertMany(top10);
        res.status(200).send("Data Stored Successfully.");

    } catch (error) {
        console.error('Error storing data in MongoDB:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get("/retrieveData", async (req, res) => {
    try {
        const storedData = Work.find().limit(10);
        res.status(200).send("Data fetching successful");
    } catch (error) {
        console.error('Error retrieving data from MongoDB:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    try {
        console.log(`Server started on port ${PORT}`)
    } catch (error) {
        console.error(error)
    }
});