import { BigNumber } from "@ethersproject/bignumber";
import { ExchangeProtocol } from "./exchanges";
import { Network } from "./networks";
import { providers } from "ethers";

export interface Environment {
    network: Network,
    rpcProvider: providers.JsonRpcProvider,
    runtimeCache: {
        tokenDecimalPowers: { [key: string]: bigint }
    },
    config: {
        walletPrivateKey: string,
    }
    initRuntimeChache: () => void
}

export interface Token {
    symbol: string,
    contract: string,
    decimals: number,
    flashLoanEnabled: boolean,
    coinbaseSymbol?: string,
    isStableToken?: boolean,
}

export interface Market{
    router: string,
    contract: string,
    tokens: string[],
    protocol: ExchangeProtocol,
    fee: bigint,
    isStable: boolean,
    minimumLiquidity: bigint
}

export interface ReserveTable {
    [contract: string]: MarketReserves
}

export interface PriceTable {
    [contract: string]: bigint,
}

export interface MarketReserves {
    reserve0: bigint,
    reserve1: bigint,
}

export interface FeeData{
    slow: BigNumber,
    average: BigNumber,
    fast: BigNumber,
}