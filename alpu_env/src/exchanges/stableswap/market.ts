import { ENV } from "../../environment";
import { Market } from "../../types";
import { UNISWAPV2_HANDLER } from "../uniswapV2";
import { getFeeData } from "../utils";

const _POW18 = (10n ** 18n).valueOf();

type StableSwapQuoteArgs = [
    reserve0: bigint,
    reserve1: bigint,
    amount: bigint,
    market: Market,
    token0: string,
    token1: string,
]

function getAmountOut(args: StableSwapQuoteArgs) {
    var [reserveIn, reserveOut, amountIn, market, token0, token1] = args

    token0 = token0.toLowerCase();
    token1 = token1.toLowerCase();

    if (amountIn <= 0n) {
        return undefined;
    }

    if (market.isStable == true) {
        const [feeMul, mul] = getFeeData(market.fee);

        const tokenInPow = ENV.runtimeCache.tokenDecimalPowers[token0];
        const tokenOutPow = ENV.runtimeCache.tokenDecimalPowers[token1];

        const amountInWithFee = ((amountIn * feeMul) / mul)
        const amountInFomatted = amountInWithFee * _POW18 / tokenInPow
        const res0 = reserveIn * _POW18 / tokenInPow;
        const res1 = reserveOut * _POW18 / tokenOutPow;

        const a = (res0 * res1) / _POW18;
        const b = (res0 * res0) / _POW18 + (res1 * res1) / _POW18;
        const xy = a * b / _POW18;

        const y = res1 - getY(amountInFomatted + res0, xy, res1);
        const result = y * tokenOutPow / _POW18;

        if (!result || result >= reserveOut || result <= 0n) {
            return undefined;
        }
    
        return result;
    }
    else {
        return UNISWAPV2_HANDLER.getAmountOut([reserveIn, reserveOut, amountIn, market])
    }
}

function getY(x0: bigint, xy: bigint, y: bigint) {
    for (var i = 0; i < 255; i++) {
        var y_prev = y;
        var k = getF(x0, y);
        if (k < xy) {
            var dy = (xy - k) * _POW18 / getD(x0, y);
            y = y + dy;
        } else {
            var dy = (k - xy) * _POW18 / getD(x0, y);
            y = y - dy;
        }
        if (y > y_prev) {
            if (y - y_prev <= 1n) {
                return y;
            }
        } else {
            if (y_prev - y <= 1n) {
                return y;
            }
        }
    }
    return y;
}

function getF(x0: bigint, y: bigint) {
    return x0 * (y * y / _POW18 * y / _POW18) / _POW18 + (x0 * x0 / _POW18 * x0 / _POW18) * y / _POW18;
}

function getD(x0: bigint, y: bigint) {
    return 3n * x0 * (y * y / _POW18) / _POW18 + (x0 * x0 / _POW18 * x0 / _POW18);
}

export {
    getAmountOut,
    StableSwapQuoteArgs
}