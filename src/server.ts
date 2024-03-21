import dotenv from "dotenv";
dotenv.config({ path: `./.env.${process.env.NODE_ENV}` });
import Fastify from "fastify";
import cors from "@fastify/cors";
import healthAPI from "./routes/health";
import itemAPI from "./routes/item";
import characterAPI from "./routes/character";

function createServer() {
    const fastify = Fastify({ logger: true });

    fastify.register(healthAPI, { prefix: "/api" });
    fastify.register(itemAPI, { prefix: "/api/item" });
    fastify.register(characterAPI, { prefix: "/api/character" });

    fastify.register(cors, {
        origin: "*",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        exposedHeaders: ["Content-Type", "Authorization"],
        maxAge: 600,
    });

    return fastify;
}

// Check if the file is being imported or run directly
if (require.main === module) {
    const PORT = parseInt(process.env.PORT || "5001", 10);
    const fastify = createServer();

    // Run the server!
    fastify.listen({ port: PORT, host: "0.0.0.0" }, (err, address) => {
        if (err) {
            fastify.log.error(err);
            process.exit(1);
        }
        console.log(`Server listening on ${address}`);
    });
}

export default createServer;
