import { Network } from "../types";
import { ExchangeProtocol } from "../../exchanges";

const tokens = require('./tokens.json');

export const ARBITRUM_NETWORK: Network = {
    chainId: 42161,
    name: 'arbitrum',
    flashLoanPoolAddressProvider: '0xa97684ead0e402dC232d5A977953DF7ECBaB3CDb',
    tokens: tokens,
    weth: {
        symbol: 'WETH',
        contract: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        decimals: 18,
        flashLoanEnabled: true,
        coinbaseSymbol: 'ETH'
    },
    exchanges: [
        { // Sushiswap
            routerAddress: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
            factoryAddress: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
            protocol: ExchangeProtocol.UniswapV2,
            minimumLiquidity: 1000n,
            fees: 30n,
        },
        { // Zyberswap
            routerAddress: '0x16e71B13fE6079B4312063F7E81F76d165Ad32Ad',
            factoryAddress: '0xaC2ee06A14c52570Ef3B9812Ed240BCe359772e7',
            protocol: ExchangeProtocol.UniswapV2,
            minimumLiquidity: 1000n,
            fees: 25n
        },
        { // Trader Joe V1
            routerAddress: '0xbeE5c10Cf6E4F68f831E11C1D9E59B43560B3642',
            factoryAddress: '0xaE4EC9901c3076D0DdBe76A520F9E90a6227aCB7',
            protocol: ExchangeProtocol.UniswapV2,
            minimumLiquidity: 1000n,
            fees: 30n
        },
        { // Arbidex
            routerAddress: '0x7238FB45146BD8FcB2c463Dc119A53494be57Aac',
            factoryAddress: '0x1C6E968f2E6c9DEC61DB874E28589fd5CE3E1f2c',
            protocol: ExchangeProtocol.UniswapV2,
            minimumLiquidity: 1000n,
            fees: 25n
        },
        { // Magicswap
            routerAddress: '0x23805449f91bB2d2054D9Ba288FdC8f09B5eAc79',
            factoryAddress: '0x015e379Ce0Ff195228b3A9eBDFA13F9afC155Dd7',
            protocol: ExchangeProtocol.UniswapV2,
            minimumLiquidity: 1000n,
            fees: 300n,
        },
        { // Arbswap
            routerAddress: '0xD01319f4b65b79124549dE409D36F25e04B3e551',
            factoryAddress: '0xd394E9CC20f43d2651293756F8D320668E850F1b',
            protocol: ExchangeProtocol.UniswapV2,
            minimumLiquidity: 1000n,
            fees: 30n
        },
        { // Alien.fi
            routerAddress: '0x863e9610E9E0C3986DCc6fb2cD335e11D88f7D5f',
            factoryAddress: '0xac9d019B7c8B7a4bbAC64b2Dbf6791ED672ba98B',
            protocol: ExchangeProtocol.UniswapV2,
            minimumLiquidity: 1000n,
            fees: 25n,
        },
        { // Apeswap
            routerAddress: '0x7d13268144adcdbEBDf94F654085CC15502849Ff',
            factoryAddress: '0xCf083Be4164828f00cAE704EC15a36D711491284',
            protocol: ExchangeProtocol.UniswapV2,
            minimumLiquidity: 1000n,
            fees: 20n,
        },
        { // Chronos
            routerAddress: '0xE708aA9E887980750C040a6A2Cb901c37Aa34f3b',
            factoryAddress: '0xCe9240869391928253Ed9cc9Bcb8cb98CB5B0722',
            protocol: ExchangeProtocol.StableSwap,
            minimumLiquidity: 1000n,
            fees: 20n,
            stableFee: 4n,
        },
        { // Oreoswap
            routerAddress: '0x38eEd6a71A4ddA9d7f776946e3cfa4ec43781AE6',
            factoryAddress: '0x20fAfD2B0Ba599416D75Eb54f48cda9812964f46',
            protocol: ExchangeProtocol.UniswapV2,
            minimumLiquidity: 1000n,
            fees: 25n,
        },
        // { // Mindgames
        //     routerAddress: '0x750eD5cF0f5278be9C6562399f0791dD221C4f83',
        //     factoryAddress: '0x7C7F1c8E2b38d4C06218565BC4C9D8231b0628c0',
        //     protocol: ExchangeProtocol.UniswapV2,
        //     minimumLiquidity: 
        //     fees: 30n
        // },
        // { // 3xcaliber
        //     routerAddress: '0x8e72bf5A45F800E182362bDF906DFB13d5D5cb5d',
        //     factoryAddress: '0xD158bd9E8b6efd3ca76830B66715Aa2b7Bad2218',
        //     protocol: ExchangeProtocol.Stableswap,
        // },
        // { // Camelot
        //     routerAddress: '0xc873fEcbd354f5A56E00E710B90EF4201db2448d',
        //     factoryAddress: '0x6EcCab422D763aC031210895C81787E87B43A652',
        //     protocol: ExchangeProtocol.UniswapV2,
        //     fees: 20n
        // },
    ],
}