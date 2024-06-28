import WebSocket from 'ws'
import { Executor } from '../types';
import { generateId } from '../utils';
import { ARB_ENV } from '../environment';
import { ReserveTable } from 'alpu_env';
import {
    callbackTable,
    handleMarketInitiation,
    handleMarketReservesResponse,
    handleReferencePriceTableUpdate,
    handleTransactionUpdate
} from './packetHandler';
import { DataPacket } from './types';

var socket: WebSocket;
function initDataFeed(callback: Executor) {
    socket = new WebSocket(ARB_ENV.config.feedEndpoint);

    socket.on('open', () => {
        socket.on('message', (data) => {
            const parsedData = JSON.parse(data.toString(), (_, value) => value.toString().slice(-3) == '_bn' ? BigInt(value.slice(0, value.length - 3)).valueOf() : value)
            onMessageReceived(parsedData, callback)
        });

        socket.send(JSON.stringify({
            event: "req_init_markets",
            data: {}
        }));
    })
}

async function onMessageReceived(packet: DataPacket, callback: Executor) {
    if (packet.event == "res_init_markets") {
        await handleMarketInitiation(packet.data)
    }
    else if (packet.event == "res_marketReserves") {
        await handleMarketReservesResponse(packet.data);
    }
    else if (packet.event == 'update_ref_price_table') {
        await handleReferencePriceTableUpdate(packet.data)
    }
    else if (packet.event == "update_tx") {
        await handleTransactionUpdate(packet.data, callback);
    }
    else {
        // console.log(packet);
    }
}

// TODO: remove this
function getMarketReserves(callback: (reserveTable: ReserveTable) => void) {
    const id = generateId(6);
    callbackTable[id] = callback;

    socket.send(JSON.stringify({
        event: "req_marketReserves",
        data: {
            id: id
        }
    }));
}

export { getMarketReserves, initDataFeed }