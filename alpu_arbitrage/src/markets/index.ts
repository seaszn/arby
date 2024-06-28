import { Market, populateSwap } from "alpu_env"
import { BigNumber } from "ethers"

async function populateTokenSwap(tokenIn: string, amountOut: bigint, recipient: string, market: Market): Promise<string> {
    var amount0Out = BigNumber.from(0)
    var amount1Out = BigNumber.from(0)

    if (tokenIn === market.tokens[0]) {
        amount1Out = BigNumber.from(amountOut.toString())
    } else if (tokenIn === market.tokens[1]) {
        amount0Out = BigNumber.from(amountOut.toString())
    } else {
        console.log(tokenIn);
        console.log(market);
        throw new Error("Bad token input address")
    }

    try {
        const populatedTransaction = await populateSwap(amount0Out, amount1Out, recipient, market)
        if (populatedTransaction == undefined || populatedTransaction.data === undefined) {
            throw new Error("HI")
        }

        return populatedTransaction.data;
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

export { populateTokenSwap }