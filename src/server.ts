import express, { Express } from "express";
import { initLogger, logger } from "./framework/logger";
import { configService, loadEnv } from "./services/config-service";
import http from 'http';
import { enableSecurity } from "./middlewares/security";
import { enableMonitoring } from "./middlewares/monitoring";
import { RegisterRoutes } from "./swagger/routes";
import { enableErrorHandling } from "./middlewares/error-handling";
import { enableSwaggerUI } from "./middlewares/swagger-ui";
import { webSocketService } from "./services/ws-service";

async function run() {

    console.log(`
_________________________________________________________________________________
    _   ______  ____  ______            ____  ___   ________ __ _______   ______ 
   / | / / __  / __  / ____/           / __ )/   | / ____/ //_// ____/ | / / __ 
  /  |/ / / / / / / / __/    ______   / __  / /| |/ /   / ,<  / __/ /  |/ / / / /
 / /|  / /_/ / /_/ / /___   /_____/  / /_/ / ___ / /___/ /| |/ /___/ /|  / /_/ / 
/_/ |_/ ____/_____/_____/           /_____/_/  |_ ____/_/ |_/_____/_/ |_/_____/  

---------------------------------------------------------------------------------
_________________________________________________________________________________
`);

    // load env variables (config service)
    console.log('loading environment variables...');
    loadEnv();
    console.log(`loading environment variables completed successfully: ${JSON.stringify(configService.env, null, 2)}`);

    // initialize logger
    console.log('initializing logger...');
    initLogger();
    console.log(`logger initialized successfully. using transports: ${logger.transports.map((t: any) => t.name).join(', ')}`);

    // create new express app
    const app: Express = express();
    const PORT = configService.env.PORT;

    // setup cors, helmet and body-parser
    logger.info(`enabling cors, helmet and body-parser...`);
    enableSecurity(app);
    logger.info(`enabling cors, helmet and body-parser completed successfully.`);

    // monitor activity, performance and errors
    logger.info(`monitor every new request, for telemetry and debugging purposes...`);
    enableMonitoring(app);
    logger.info(`monitor started successfully.`);

    // include API routes from controllers
    logger.info(`registering routes from TSOA...`);
    RegisterRoutes(app); // tsoa util function to register the controllers
    logger.info(`registering routes completed successfully.`);

    // enable error handling
    logger.info(`enabling error handling...`);
    enableErrorHandling(app);
    logger.info(`enabling error handling completed successfully.`);

    // enable swagger ui at /docs for development only (not in production)
    logger.info(`enabling swagger ui...`);
    enableSwaggerUI(app);
    logger.info(`swagger ui available at http://localhost:${PORT}`);

    // enable web sockets service
    logger.info(`enabling web sockets service...`);
    webSocketService.listen(3004);
    logger.info(`web sockets service started successfully.`);

    // start listening
    const server = http.createServer(app);
    server.listen(PORT, () => {
        logger.info(`🚀 🚀 🚀 server started at http://localhost:${PORT} 🚀 🚀 🚀`);
    });
}

run();