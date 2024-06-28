// import { Market, ReserveTable } from "alpu_env/src/types";
// import { LogDescription, Result,TransactionDescription  } from "ethers/lib/utils";
// import { BigNumberish } from 'ethers'
// import { Exchange, ExchangeHandler } from "alpu_env";

import { Exchange, Market } from "alpu_env";
import { Result } from "ethers/lib/utils";

export interface Transaction {
    gasPrice: bigint,
    router: string;
    signature: string;
    value: bigint
    args: Result,
}

export interface MarketQueryOptions{
    batchSize: 500
}
export interface MarketQueryResult{
    markets: Array<Market>,
    router: string
}

export interface ExchangeMarketHandler {
    getMarkets: (exchange: Exchange, options: MarketQueryOptions) => Promise<MarketQueryResult>
}
