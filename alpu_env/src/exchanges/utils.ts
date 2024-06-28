function getFeeData(fee: bigint): [feeMul: bigint, mul: bigint]{
    const multiplier = 10000n;

    return [multiplier - fee, multiplier]
}

export {
    getFeeData
}