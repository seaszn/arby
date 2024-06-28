import { WebSocket, RawData } from "ws";
import { generateId } from "alpu_env/src/utils";
import { handleDataPacket } from "./packetHandler";
import { _WS_HANDLERS } from "./socketServer";

export type BufferLike =
    | string
    | Buffer
    | DataView
    | number
    | ArrayBufferView
    | Uint8Array
    | ArrayBuffer
    | SharedArrayBuffer
    | ReadonlyArray<any>
    | ReadonlyArray<number>
    | { valueOf(): ArrayBuffer }
    | { valueOf(): SharedArrayBuffer }
    | { valueOf(): Uint8Array }
    | { valueOf(): ReadonlyArray<number> }
    | { valueOf(): string }
    | { [Symbol.toPrimitive](hint: string): string };

export interface SocketHandler {
    socket: WebSocket,
    handlerId: string
}

export function configureSocketHandler(socket: WebSocket): SocketHandler {
    const handlerId = generateId(6);

    socket.on('message', (data) => onReceive(data, handlerId))
    socket.on('close', (code, reason) => onClosed(code, reason, handlerId))
    socket.on('error', (err) => onError(err, handlerId));

    return {
        socket: socket,
        handlerId: handlerId
    };
}

function onError(err: Error, handlerId: string) {
    delete _WS_HANDLERS[handlerId];
}

function onClosed(code: number, reason: Buffer, handlerId: string) {
    console.log(`${handlerId}: disconnected`)
    delete _WS_HANDLERS[handlerId];
}

function onReceive(data: RawData, handlerId: string) {
    try {
        handleDataPacket(JSON.parse(data.toString()), handlerId);
    }
    catch {
        delete _WS_HANDLERS[handlerId];
    }
}