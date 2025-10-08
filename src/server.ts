import Fastify from "fastify";
import { TrackingAPI } from "./app.js";
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

const app = Fastify();
const api = new TrackingAPI();
api.registerRoutes(app);

app.listen({ port }, (err: any, address: string) => {
    if (err) {
        console.error("Error starting server:", err);
        process.exit(1);
    }
    console.log(`Server running at ${address}`);
});