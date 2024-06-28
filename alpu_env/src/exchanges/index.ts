import { Market } from "../types";
import { BigNumber } from "ethers";
import { Exchange, ExchangeHandler, ExchangeHandlerTable, ExchangeProtocol, LogParserArgs } from "./types";
import { STABLESWAP_HANDLER, StableSwapQuoteArgs } from "./stableswap";
import { UNISWAPV2_HANDLER, UniswapV2QuoteArgs } from "./uniswapV2";

const exchangeHandlerTable: ExchangeHandlerTable = {
    [ExchangeProtocol.UniswapV2]: UNISWAPV2_HANDLER,
    [ExchangeProtocol.StableSwap]: STABLESWAP_HANDLER
}

function getAmountOut(protocol: ExchangeProtocol, args: UniswapV2QuoteArgs | StableSwapQuoteArgs) {
    return exchangeHandlerTable[protocol].getAmountOut(args);
}

// function getAmountIn(protocol: ExchangeProtocol, args: UniswapV2QuoteArgs | StableSwapQuoteArgs) {
//     if (exchangeHandlerTable[protocol].getAmountIn) {
//         return exchangeHandlerTable[protocol].getAmountIn!(args);
//     }

//     throw new Error(`getAmountIn is not support for protocol ${protocol.toString()}`)
// }

function parseLogs(market: Market, args: LogParserArgs) {
    return exchangeHandlerTable[market.protocol].parseLogs(args);
}

function populateSwap(amount0Out: BigNumber, amount1Out: BigNumber, recipient: string, market: Market) {
    return exchangeHandlerTable[market.protocol].populateSwap(amount0Out, amount1Out, recipient)
}

export {
    populateSwap,
    parseLogs,
    // getAmountIn,
    getAmountOut,
    
    ExchangeProtocol,
    Exchange,
    ExchangeHandler
}