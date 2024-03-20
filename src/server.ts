require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
import Fastify from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import healthAPI from "./routes/health";
import itemAPI from "./routes/item";

function createServer() {
    const fastify = Fastify({ logger: true });

    fastify.register(healthAPI, { prefix: "/api" });
    fastify.register(itemAPI, { prefix: "/api" });

    fastify.register(cors, {
        // Define your CORS configuration options here
        origin: "*", // Allow only this domain to make requests
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
    const PORT = parseInt(process.env.PORT || "3333", 10);
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
