import { docEngine, WSTopic } from "./documents-service";
import { webSocketService } from "./ws-service";
import WebSocket from 'ws';

export function handleCursorTracking(ws: WebSocket, sessionId: string, payload: any) {
    webSocketService?.clients?.forEach((client: WebSocket) => {
        if (client !== ws) {
            client.send(JSON.stringify({
                topic: WSTopic.CursorTracking,
                data: {
                    sessionId,
                    x: payload.x,
                    y: payload.y
                }
            }));
        }
    });
}

export function handlePostRevision(ws: WebSocket, sessionId: string, payload: any) {
    const { number, operations } = payload;
    // apply the revision to the document
    const transformedRevision = docEngine.apply({ number, operations });
    // publish the new transformed revision to all clients
    webSocketService?.clients?.forEach((client: WebSocket) => {
        client.send(JSON.stringify({
            topic: WSTopic.PublishRevision,
            data: transformedRevision
        }));
    });
}