//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

import "./IUniswapV2Pair.sol";
pragma experimental ABIEncoderV2;

interface IStableSwapPair {
    function token0() external view returns (address);

    function token1() external view returns (address);

    function getReserves()
        external
        view
        returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);

    function isStable() external view returns (bool);
}
