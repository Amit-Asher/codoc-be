import bodyParser from "body-parser";
import cors from "cors";
import { Express } from "express";
import helmet from "helmet";

export function enableSecurity(app: Express) {
    // setup cors
    app.use(cors({
        credentials: true,
        // allowing CORS for any origin and any request
        origin: (origin, callback) => callback(null, true)
    }));

    // setup helmet (for security headers and other)
    app.use(helmet()); // default helmet settings
    app.use(helmet.xssFilter()); // X-XSS-Protection
    app.use(helmet.frameguard({ action: 'sameorigin' })); // allow iframes from same origin only
    app.use(helmet.hidePoweredBy()); // hide header X-Powered-By
    app.use(helmet.ieNoOpen()); // sets X-Download-Options for: noopen
    app.use(helmet.noSniff()); // sets X-Content-Type-Options: nosniff

    // parse and limit requests of content-type - application/json
    app.use(bodyParser.json({ limit: '100mb' }));
}