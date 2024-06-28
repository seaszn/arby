import { Market } from "../../types";
import { getFeeData } from "../utils";

type UniswapV2QuoteArgs = [
    reserve0: bigint,
    reserve1: bigint,
    amount: bigint,
    market: Market
]

function getAmountOut(args: UniswapV2QuoteArgs) {
    const [reserveIn, reserveOut, amountIn, market] = args;

    if (amountIn <= 0n) {
        return undefined;
    }

    const [feeMul, mul] = getFeeData(market.fee);

    const amountInWithFee = amountIn * feeMul;

    const numerator = amountInWithFee * reserveOut;
    const denominator = (reserveIn * mul) + amountInWithFee;
    const result = numerator / denominator;

    if (result < 0n) {
        return undefined
    }

    //double check with minimum liquidity
    if (result > reserveOut) {
        return undefined;
    }

    return result;
}

// function getAmountIn(args: UniswapV2QuoteArgs) {
//     const [reserveIn, reserveOut, amountOut, market] = args;

//     if (amountOut <= 0n) {
//         return undefined;
//     }

//     const [feeMul, mul] = getFeeData(market.fee);

//     const numerator = reserveIn * amountOut * mul;
//     const denominator = (reserveOut - amountOut) * feeMul;
//     const result = (numerator / denominator) + 1n;

//     if (result <= 0n) {
//         return undefined;
//     }

//     return result;
// }

export {
    getAmountOut,
    UniswapV2QuoteArgs
}