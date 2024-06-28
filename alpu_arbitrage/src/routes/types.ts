import { Market } from "alpu_env";

export type MarketReserveList = {
    token0: string
    token1: string;
    reserve0: bigint;
    reserve1: bigint;
}[]

export interface SwapTransaction {
    market: Market,
    tokenIn: string,
    tokenOut: string,
    inAmount: bigint,
    outAmount: bigint,
}

export interface RouteResult {
    transactions: Array<SwapTransaction>;
    baseToken: string;
    startBalance: bigint;
    endBalance: bigint;
    profitLoss: bigint;
    referenceProfitLoss: bigint;
    routeReserves: MarketReserveList,
}

export interface MarketRoute {
    markets: Market[],
    marketContracts: Array<string>,
    baseToken: string
}

export type ListableReserve = {
    token0: string
    token1: string;
    reserve0: bigint;
    reserve1: bigint;
    fee: bigint;
}