import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';

export class ConfigService {
    public env;

    constructor() {
        // read .env and put in process.env object
        const localEnvPath = path.resolve(__dirname, '..', '..', '.env');
        console.log(localEnvPath);
        if (fs.existsSync(localEnvPath)) {
            dotenv.config({ path: localEnvPath });
        }

        this.env = {
            PORT: parseInt(process.env.PORT || '3002'),
            RUN_MODE: process.env.RUN_MODE || 'development',
        }
    }
}

export let configService: ConfigService;
export function loadEnv() {
    configService = new ConfigService();
}