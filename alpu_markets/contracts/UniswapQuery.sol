//SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.19;

pragma experimental ABIEncoderV2;

import "./interfaces/IUniswapV2Pair.sol";
import "./interfaces/IStableSwapPair.sol";

abstract contract UniswapV2Factory {
    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    function allPairsLength() external view virtual returns (uint);
}

// In order to quickly load up data from Uniswap-like market, this contract allows easy iteration with a single eth_call
contract UniswapQuery {
    function getReservesByPairs(
        IUniswapV2Pair[] calldata _pairs
    ) external view returns (uint256[3][] memory) {
        uint256[3][] memory result = new uint256[3][](_pairs.length);
        uint256 i = 0;

        do {
            unchecked {
                (result[i][0], result[i][1], result[i][2]) = _pairs[i]
                    .getReserves();
                ++i;
            }
        } while (i < _pairs.length);
        return result;
    }

    function getStableSwapMarkets(
        UniswapV2Factory _uniswapFactory,
        uint256 _start,
        uint256 _stop
    ) external view returns (address[4][] memory) {
        uint256 _allPairsLength = _uniswapFactory.allPairsLength();
        if (_stop > _allPairsLength) {
            _stop = _allPairsLength;
        }
        require(_stop >= _start, "start cannot be higher than stop");
        uint256 _qty = _stop - _start;
        address[4][] memory result = new address[4][](_qty);

        for (uint i = 0; i < _qty; i++) {
            IStableSwapPair _uniswapPair = IStableSwapPair(
                _uniswapFactory.allPairs(_start + i)
            );

            address stableAddress;
            if (_uniswapPair.isStable()) {
                stableAddress = address(1);
            } else {
                stableAddress = address(0);
            }

            result[i][0] = _uniswapPair.token0();
            result[i][1] = _uniswapPair.token1();
            result[i][2] = stableAddress;
            result[i][3] = address(_uniswapPair);
        }
        return result;
    }

    function getUniswapV2Markets(
        UniswapV2Factory _uniswapFactory,
        uint256 _start,
        uint256 _stop
    ) external view returns (address[3][] memory) {
        uint256 _allPairsLength = _uniswapFactory.allPairsLength();
        if (_stop > _allPairsLength) {
            _stop = _allPairsLength;
        }
        require(_stop >= _start, "start cannot be higher than stop");
        uint256 _qty = _stop - _start;
        address[3][] memory result = new address[3][](_qty);
        for (uint i = 0; i < _qty; i++) {
            IUniswapV2Pair _uniswapPair = IUniswapV2Pair(
                _uniswapFactory.allPairs(_start + i)
            );
            result[i][0] = _uniswapPair.token0();
            result[i][1] = _uniswapPair.token1();
            result[i][2] = address(_uniswapPair);
        }
        return result;
    }
}
