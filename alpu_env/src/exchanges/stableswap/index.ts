import { BigNumber, Contract } from "ethers";
import { ExchangeHandler, LogParserArgs } from "../types";
import { getAmountOut } from "./market";
import { StableSwapQuoteArgs } from "./market";

const STABLE_PAIR_INTERFACE = new Contract('0x0000000000000000000000000000000000000000', require('./_pair.json'));
const STABLESWAP_HANDLER: ExchangeHandler = {
    parseLogs: parseLogs,
    populateSwap: populateSwap,
    getAmountOut: getAmountOut
}

function parseLogs(args: LogParserArgs) {
    return STABLE_PAIR_INTERFACE.interface.parseLog(args)
}

function populateSwap(amount0Out: BigNumber, amount1Out: BigNumber, recipient: string) {
    return STABLE_PAIR_INTERFACE.populateTransaction.swap(amount0Out, amount1Out, recipient, []);
}

export {
    STABLESWAP_HANDLER,
    StableSwapQuoteArgs
}