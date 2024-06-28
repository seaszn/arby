import { BigNumber, PopulatedTransaction } from "ethers";
import { LogDescription } from "ethers/lib/utils";

export enum ExchangeProtocol {
    UniswapV2,
    StableSwap,
}

export interface Exchange {
    protocol: ExchangeProtocol,
    routerAddress: string,
    factoryAddress: string,
    fees: bigint;
    minimumLiquidity: bigint;
    stableFee?: bigint;
}

export type LogParser = (args: LogParserArgs) => LogDescription;
export interface LogParserArgs {
    topics: string[],
    data: string
}

export type SwapPopulator = (amount0Out: BigNumber, amount1Out: BigNumber, recipient: string) => Promise<PopulatedTransaction>;
export type Quoter = (...args: any[]) => bigint | undefined;

export interface ExchangeHandler {
    parseLogs: LogParser;
    populateSwap: SwapPopulator,
    getAmountOut: Quoter
}

export interface ExchangeHandlerTable {
    [key: number]: ExchangeHandler,
}