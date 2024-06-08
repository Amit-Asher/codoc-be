import WebSocket from 'ws';
import { WSTopic } from './documents-service';
import { IncomingMessage } from 'http';
import {
    handleCursorTracking,
    handlePostRevision,
} from './ws-handlers';

class WebSocketService {

    wss: WebSocket.Server<typeof WebSocket, typeof IncomingMessage>;

    clients: WebSocket[];

    handlers: { [key in WSTopic]?: (ws: WebSocket, sessionId: string, payload: any) => void } = {
        [WSTopic.CursorTracking]: handleCursorTracking,
        [WSTopic.PostRevision]: handlePostRevision,
    }

    listen(port: number) {
        this.wss = new WebSocket.Server({ port });
        this.clients = [];
    
        this.wss.on('connection', (ws: WebSocket) => {
            console.log('connected');
            this.clients.push(ws);
    
            ws.on('message', (message) => {
                console.log('received: %s', message);
                const json = JSON.parse(message.toString());
                const topic = json.topic as WSTopic;
                const handler = this.handlers[topic];
                if (handler) {
                    handler(ws, json.sessionId, json.data);
                }
            });
    
            ws.on('close', () => {
                console.log('disconnected');
                const index = this.clients.indexOf(ws);
                if (index > -1) {
                    this.clients.splice(index, 1);
                }
            });
        });
    }
}

export const webSocketService = new WebSocketService();