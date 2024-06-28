import { Market, PriceTable, ReserveTable } from "alpu_env";

export interface TransactionPacket {
    affectedMarkets: string[],
    reserveTable: ReserveTable,
    differences: ReserveTable,
    txHashes: string[]
}

export interface MarketInitiationPacket{
    markets: Market[],
    priceTable: PriceTable
}

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
