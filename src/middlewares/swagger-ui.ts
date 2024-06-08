import * as swaggerJson from '../swagger/swagger.json';
import * as swaggerUI from 'swagger-ui-express';
import { Express } from 'express';
import { configService } from '../services/config-service';

export function enableSwaggerUI(app: Express): void {

    if (configService.env.RUN_MODE === 'development') {
        app.use('/', swaggerUI.serve, swaggerUI.setup(swaggerJson, {
            customSiteTitle: 'Dev Example API',
        }));
    }
    
    if (configService.env.RUN_MODE === 'production') {
        const PROD_BASE_URL = "https://asheramit.com/codoc";
        app.use('/codoc/docs/', swaggerUI.serve, swaggerUI.setup(swaggerJson, {
            customSiteTitle: 'Codoc API',
            customCssUrl: `${PROD_BASE_URL}/swagger-ui.css`,
            customJs: [
                `${PROD_BASE_URL}/swagger-ui-bundle.js'`,
                `${PROD_BASE_URL}/swagger-ui-standalone-preset.js'`,
                `${PROD_BASE_URL}/swagger-ui.js'`,
                `${PROD_BASE_URL}/swagger-ui-init.js`
            ]
        } as any));
    }
};
