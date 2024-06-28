import { ARB_ENV } from "./environment";

function getRefrencePrice(tokenAddress: string, amount: bigint) {
    return ((amount * ARB_ENV.runtimeCache.priceTable[tokenAddress]) / ARB_ENV.runtimeCache.tokenDecimalPowers[tokenAddress.toLowerCase()]);
}

export { getRefrencePrice }