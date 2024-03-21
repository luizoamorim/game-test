import { FastifyInstance } from "fastify";

export default async function healthAPI(fastify: FastifyInstance) {
    fastify.get("/health", async (request, reply) => {
        try {
            return reply.status(200).send({ message: "ALIVE" });
        } catch (error: any) {
            return reply.status(400).send({ message: error.message });
        }
    });
}
