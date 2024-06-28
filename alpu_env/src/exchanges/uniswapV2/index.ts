import { BigNumber, Contract } from "ethers";
import { ExchangeHandler, LogParserArgs } from "../types";
import { getAmountOut, UniswapV2QuoteArgs } from "./market";

const UNISWAPV2_PAIR_INTERFACE = new Contract('0x0000000000000000000000000000000000000000', require('./_pair.json'));
const UNISWAPV2_HANDLER: ExchangeHandler = {
    parseLogs: parseLogs,
    populateSwap: populateSwap,
    getAmountOut: getAmountOut
}

function parseLogs(args: LogParserArgs) {
    return UNISWAPV2_PAIR_INTERFACE.interface.parseLog(args)
}

function populateSwap(amount0Out: BigNumber, amount1Out: BigNumber, recipient: string) {
    return UNISWAPV2_PAIR_INTERFACE.populateTransaction.swap(amount0Out, amount1Out, recipient, []);
}

export {
    UNISWAPV2_HANDLER,
    UniswapV2QuoteArgs
}