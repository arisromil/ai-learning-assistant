import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL = "gemini-2.0-flash:generateContent";
const API_URL = `${BASE}/${MODEL}?key=${process.env.GEMINI_API_KEY}`;

async function generateResponse(prompt) {
    try {
        const { data } = await axios.post(
            API_URL,
            { contents: [{ role: "user", parts: [{ text: prompt }] }] },
            { headers: { "Content-Type": "application/json" } }
        );
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
    } catch (error) {
        return `Error: ${error.response?.data || error.message}`;
    }
}

const prompt = "In one sentence, explain Node.";
const response = await generateResponse(prompt);
console.log("AI Response:", response);