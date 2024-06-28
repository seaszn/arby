import WebSocket from "ws";
import { configureSocketHandler } from "./socketHandler";
// import { _REF_PRICE_TABLE } from "../environment/_globals";
import { DataPacket } from "./packetHandler";
import { MARKET_ENV } from "../environment";

export const _WS_HANDLERS: { [key: string]: WebSocket } = {};

export function initSocketServer() {
  const wss = new WebSocket.Server({ port: 8080 });
  
  wss.on('connection', (socket: WebSocket) => {
    const handler = configureSocketHandler(socket);

    _WS_HANDLERS[handler.handlerId] = handler.socket;
    console.log(`${handler.handlerId}: connected`)
  });

  // console.clear();
  console.log('socket server initiated\n');
}


export function boadcastDailyData() {
  broadcastPacket({
    event: "update_ref_price_table",
    data: MARKET_ENV.runtimeCache.refPriceTable
  })
}

export function broadcastTx(result: any) {
  broadcastPacket({
    event: "update_tx",
    data: result
  })
}

function broadcastPacket(data: DataPacket) {
  for (var handlerId in _WS_HANDLERS) {
    try {
      _WS_HANDLERS[handlerId].send(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? `${v.toString()}_bn` : v));
    }
    catch {
      delete _WS_HANDLERS[handlerId]
    }
  }
}