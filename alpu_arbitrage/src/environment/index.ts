import { ENV, Environment, Market, PriceTable } from "alpu_env"
import { Contract, Wallet } from "ethers";
import { BundleExecutorV2 } from "../abi";
import { MarketRoute } from "../routes";

const BUNDLE_EXECUTOR_ADDRESS = process.env.BUNDLE_EXECUTOR_ADDRESS || "";
const MIN_ROUTE_LENGTH = Math.max(3, (parseInt(process.env.MIN_ROUTE_LENGTH || "0")));
const MAX_ROUTE_LENGTH = Math.max(3, (parseInt(process.env.MAX_ROUTE_LENGTH || "0")));

const FEED_ENDPOINT = process.env.FEED ? `ws://${process.env.FEED}:8080` : (process.env.FEED_ENDPOINT || "");

interface ArbitrageEnvironment extends Environment {
    bundleExecutor: Contract
    executorWallet: Wallet,
    runtimeCache: {
        tokenDecimalPowers: { [key: string]: bigint },
        markets: Market[],
        marketRoutes: MarketRoute[],
        priceTable: PriceTable,
        ethBalance: bigint,
        flashLoanFee: bigint,
        isProcessingTrade: boolean
    },
    config: {
        walletPrivateKey: string
        bundleExecutorAddress: string,
        minRouteLength: number,
        maxRouteLength: number,
        feedEndpoint: string,
    },
}

const ARB_ENV: ArbitrageEnvironment = {
    ...ENV,
    bundleExecutor: new Contract(BUNDLE_EXECUTOR_ADDRESS, BundleExecutorV2, ENV.rpcProvider),
    executorWallet: new Wallet(ENV.config.walletPrivateKey, ENV.rpcProvider),
    runtimeCache: {
        ...ENV.runtimeCache,
        markets: [],
        marketRoutes: [],
        priceTable: {},
        ethBalance: 0n,
        flashLoanFee: 0n,
        isProcessingTrade: false
    },
    config: {
        ...ENV.config,
        bundleExecutorAddress: BUNDLE_EXECUTOR_ADDRESS,
        minRouteLength: MIN_ROUTE_LENGTH,
        maxRouteLength: MAX_ROUTE_LENGTH,
        feedEndpoint: FEED_ENDPOINT
    },
}

export { ARB_ENV }