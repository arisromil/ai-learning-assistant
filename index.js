import axios from "axios";
import dotenv from "dotenv";
import Fastify from 'fastify';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "dummyJWTsecret";
const fastify = Fastify({ logger: true });
const PORT = process.env.PORT || 3000;

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const MODEL = "gemini-2.0-flash:generateContent";
const API_URL = `${BASE}/${MODEL}?key=${process.env.GEMINI_API_KEY}`;


const start = async () => {
    try {
        const address = await fastify.listen({ port: PORT });
        console.log(`Server running at ${address}`);
    } catch (err) {
        console.error("Server failed to start:", err);
        process.exit(1);
    }
};

async function generateResponse(prompt) {
    try {
        const { data } = await axios.post(
            API_URL,
            {
                contents: [
                    {
                        role: "user",
                        parts: [{
                            text: "You are an AI assistant that helps users " +
                                "learn programming and prepare for technical interviews. " +
                                "Provide clear explanations with examples when needed."
                        }]
                    },
                    { role: "user", parts: [{ text: prompt }] },
                ],
            },
            { headers: { "Content-Type": "application/json" } }
        );
        return (
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "No response received from AI."
        );
    } catch (error) {
        console.error("API Request Failed:", error.response?.data || error.message);
        return {
            error: "Failed to fetch AI response",
            details: error.response?.data || error.message,
        };
    
    }
}


fastify.post("/query", async (request, reply) => {
    try {
        const { prompt } = request.body;
        if (!prompt) {
            return reply.status(400).send({ error: "Prompt is required" });
        }
        const response = await generateResponse(prompt);
        reply.send({ response });
    } catch (error) {
        console.error("Gemini API Error:", error);
        reply.status(500).send({
            error: "Error communicating with Gemini API",
            details: error.message,
        });
    }
})

fastify.post("/register", async (request, reply) => {
    const { email, password } = request.body;
    if (!email || !password) {
        return reply.status(400).send({ error: "Email and password required" });
    }
    try {
        const db = await dbPromise;
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.run(
            "INSERT INTO users (userId, password, learning_profile) " +
            "VALUES (?, ?, ?)",
            [
                email,
                hashedPassword,
                JSON.stringify({ previousQueries: [], strengths: {}, weaknesses: {} }),
            ]);
        const token = jwt.sign({ userId: email }, JWT_SECRET, { expiresIn: "7d" });
        reply.send({ token });
    } catch (error) {
        console.error("Registration error:", error);
        reply.status(500).send({ error: "Failed to register user" });
    }
});