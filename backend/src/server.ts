import { serverConfig } from "./config/configs.js";
import app from "./app.js";
import { connectSequelize } from "./config/sequelize.js";

async function start() {
    console.log("Initializing server...");

    const finalPort = serverConfig.port;

    // Start server immediately for health checks
    app.listen(Number(finalPort), "0.0.0.0", () => {
        console.log(`Server listening on port ${finalPort}`);
        console.log(`Health check available at: http://0.0.0.0:${finalPort}/health`);
    });

    // Load configurations and connect to DB asynchronously
    try {
        await connectSequelize();
        // await seedAdminUser(); // access seedAdminUser from proper service if needed
        console.log("Database ready!");
    } catch (err) {
        console.error("Failed to connect to database:", err);
    }
}
start();