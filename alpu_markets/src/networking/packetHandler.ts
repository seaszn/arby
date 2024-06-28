import { MARKET_ENV } from "../environment";
import { getMarketReserves } from "../markets";
import { _WS_HANDLERS } from "./socketServer";

export type DataEvent =
    // requests
    | "req_init_markets"
    | "req_marketReserves"

    // responses
    | "res_init_markets"
    | "res_marketReserves"

    // update methods
    | "update_tx"
    | "update_ref_price_table";

export interface DataPacket {
    event: DataEvent,
    data: any
}

export function handleDataPacket(packet: DataPacket, handlerId: string) {
    if (packet.event == 'req_init_markets') {
        _WS_HANDLERS[handlerId].send(JSON.stringify({
            event: "res_init_markets",
            data: {
                markets: MARKET_ENV.runtimeCache.markets,
                priceTable: MARKET_ENV.runtimeCache.refPriceTable
            },
        }, (_, v) => typeof v === 'bigint' ? `${v.toString()}_bn` : v));
    }
    else if (packet.event == 'req_marketReserves') {
        getMarketReserves().then(x => {
            _WS_HANDLERS[handlerId].send(JSON.stringify({
                event: "res_marketReserves",
                data: {
                    id: packet.data.id,
                    data: x
                }
            }, (_, v) => typeof v === 'bigint' ? `${v.toString()}_bn` : v));
        })
    }
}