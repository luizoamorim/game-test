require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
import "reflect-metadata";
import Fastify from "fastify";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";

function createServer() {
    const fastify = Fastify({ logger: true });

    // CSRF protection
    /**
     * The necessity of using CSRF protection alongside JWT (JSON Web Tokens) depends on how the JWT
     * is being used and stored in your application. Let's break down the scenarios:
     * - JWT Stored in HTTPOnly Cookies
     *      If you're storing your JWT in HTTPOnly cookies, then CSRF protection is recommended. HTTPOnly
     *      cookies are automatically sent with every HTTP request to the domain that set the cookie, which
     *      makes them vulnerable to CSRF attacks. In this case, adding CSRF tokens adds an extra layer
     *      of security by ensuring that the request is intentionally made by the user.
     * - JWT Stored in Local Storage or Session Storage
     *      If your JWT is stored in local storage or session storage and is sent as a bearer token in the
     *      Authorization header of your HTTP requests, CSRF protection is generally not necessary. This is
     *      because local storage and session storage are not automatically sent with every request, unlike cookies.
     *      The token must be explicitly attached to the headers, which is something a CSRF attacker generally cannot do.
     */
    // fastify.register(require("@fastify/csrf-protection"), {
    //     getToken: (req: any) => req.headers["csrf-token"],
    // });

    // Remove 'x-powered-by' header
    /**
     * Removing the X-Powered-By header in web applications, including those built with Fastify,
     * is a common security practice. The purpose of this is to obscure details about the backend
     * technology powering your application. Here's why this is often recommended:
     * - Security Through Obscurity
     *      - Reducing Fingerprinting: The X-Powered-By header typically reveals the technology or
     *        framework used on the server (e.g., Express, PHP, Fastify). By removing or modifying this header,
     *        you make it slightly harder for potential attackers to determine what software your server is running.
     *        This is a concept known as "security through obscurity."
     *      - Preventing Targeted Attacks: If attackers are unaware of the backend technology, it's more
     *        challenging for them to tailor attacks to exploit specific vulnerabilities of that technology.
     */
    fastify.addHook("onRequest", (request, reply, done) => {
        reply.header("x-powered-by", "");
        done();
    });

    // Swagger setup
    fastify.register(require("@fastify/swagger"), {
        exposeRoute: true,
        routePrefix: "/docs",
        swagger: {
            info: {
                title: "Betchchain swagger",
                description: "Describe our API endpoints",
                version: "0.1.0",
            },
        },
    });

    // Token middleware
    // fastify.addHook("preHandler", (request: any, reply, done) => {
    //     if (
    //         request.raw.url.startsWith("/api/waitlist") ||
    //         request.raw.url.startsWith("/api/health")
    //     ) {
    //         done();
    //     } else {
    //         tokenMiddleware(request, reply, done);
    //     }
    // });

    // Routes
    // fastify.register(waitlistRoutes, { prefix: "/api" });
    // fastify.register(healthAPI, { prefix: "/api" });

    // Secure Headers with Helmet
    fastify.register(helmet, {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
            },
        },
        /**
         * HSTS (HTTP Strict Transport Security)
         * Purpose: Ensures that all communication between the browser and the server is encrypted over HTTPS.
         *
         * maxAge
         *  - Purpose: Specifies the number of seconds that the browser should remember that this site is only to be accessed using HTTPS.
         *    Value: 31536000 seconds is equivalent to 1 year. This means that once a browser accesses your site, it should remember to only
         *    use HTTPS to connect to your site for the next year.
         * includeSubDomains
         *  - Purpose: Indicates whether this rule applies to all of the site's subdomains as well.
         *    Value: true means that HSTS policy is also enforced on all subdomains of the main domain.
         *    So, if your main site is example.com, the HSTS policy will also apply to subdomain.example.com, another.example.com, etc.
         *
         * How It Works
         *  - When a user visits your site for the first time, the server sends the HSTS header in its response.
         *    The browser then knows to only use HTTPS, not HTTP, for all future requests to your site for the specified maxAge.
         *    This helps to ensure that communications between the user and your site are encrypted and more secure, even if the user types http:// or clicks on an HTTP link.
         *
         * Security Benefits
         *  - Prevents Downgrade Attacks: It prevents attackers from downgrading connections from HTTPS to HTTP, which can be a vulnerability.
         *  - Cookie Protection: Secures cookies (and other sensitive data) since they are transmitted over HTTPS.
         *
         * Best Practices
         *  - Testing on Subdomains: Before enforcing HSTS on all subdomains (includeSubDomains: true),
         *    ensure that every subdomain supports HTTPS. Otherwise, you risk making those subdomains inaccessible.
         *  - Gradual Rollout: Consider starting with a shorter maxAge and increase it as you confirm that everything works correctly.
         *  - Preloading: For maximum security, you can consider adding your domain to the HSTS preload list, a list
         *    maintained by browser vendors that enforces HTTPS on your domain in supported browsers even before the first visit.
         */
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
        },
        /**
         * The X-Content-Type-Options:
         *
         * nosniff header is a simple yet effective security measure to mitigate certain types of web-based attacks.
         * It is part of the set of best practices for securing HTTP responses and is especially relevant for websites that handle user-generated content.
         * By using Helmet in Fastify, you automatically benefit from this security best practice.
         * Default Setting: In Fastify applications using @fastify/helmet, this header is set by default for added security.
         * Typical Value
         *  - nosniff: This is the only meaningful value for this header. It ensures that browsers do not try to guess the MIME type and instead
         *    rely on the declared content type.
         */
    });

    fastify.register(cors, {
        // Define your CORS configuration options here
        origin: process.env.BLOG_URL, // Allow only this domain to make requests
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
