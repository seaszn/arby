import { ENV, Environment, Market, PriceTable } from "alpu_env";
import { QueriedNetwork } from "../networks";
import { ARBITRUM } from "../networks/arbitrum";
import { Contract } from "ethers";
import { UniswapQuery } from "../abi";
import { formatUnits } from 'ethers/lib/utils'
import { getExchangeMarkets } from "../exchanges";
import { getReserveTable } from "../markets";

const CHAIN_ID = parseInt(process.env.CHAIN_ID || "1");
const MIN_MARKET_RESERVES = parseFloat(process.env.MIN_MARKET_RESERVES || "0.1");
const FEED_ENDPOINT = process.env.FEED ? `ws://${process.env.FEED}:9642` : (process.env.FEED_ENDPOINT || "");

const QUERIED_NETWORK_TABLE: { [key: number]: QueriedNetwork } = {
    [ARBITRUM.chainId]: ARBITRUM
}

interface MarketEnvironment extends Environment {
    network: QueriedNetwork,
    uniswapQuery: Contract
    runtimeCache: {
        tokenDecimalPowers: { [key: string]: bigint },
        markets: Market[],
        marketAddressess: string[],
        refPriceTable: PriceTable
    },
    config: {
        walletPrivateKey: string,
        feedEndpoint: string,
        minMarketReserves: number,
    },
    initRuntimeChache: () => Promise<void>
}

const MARKET_ENV: MarketEnvironment = {
    ...ENV,
    network: QUERIED_NETWORK_TABLE[CHAIN_ID],
    uniswapQuery: new Contract(QUERIED_NETWORK_TABLE[CHAIN_ID].uniswapQueryAddress, UniswapQuery, ENV.rpcProvider),
    runtimeCache: {
        ...ENV.runtimeCache,
        markets: [],
        marketAddressess: [],
        refPriceTable: {}
    },
    config: {
        ...ENV.config,
        feedEndpoint: FEED_ENDPOINT,
        minMarketReserves: MIN_MARKET_RESERVES,
    },
    initRuntimeChache
}

async function initRuntimeChache() {
    ENV.initRuntimeChache();

    await initMarketTable();
}

async function initMarketTable() {
    const queries = new Array<Promise<{ markets: Market[], router: string }>>();

    for (var exchange of MARKET_ENV.network.exchanges) {
        queries.push(getExchangeMarkets(exchange))
    }

    const routerQueries: { markets: Array<Market>, router: string }[] = (await Promise.all(queries));
    const reservesTable = await getReserveTable(routerQueries.map(x => x.markets.map(x => x.contract)).flat());

    const minMarketReserve = MARKET_ENV.config.minMarketReserves;

    for (var i = 0; i < routerQueries.length; i++) {
        const markets = routerQueries[i].markets;

        for (var market of markets) {
            const reserves = reservesTable[market.contract];

            const token0 = MARKET_ENV.network.tokens.find(x => x.contract.toLowerCase() === market.tokens[0].toLowerCase())!;
            const token1 = MARKET_ENV.network.tokens.find(x => x.contract.toLowerCase() === market.tokens[1].toLowerCase())!;
            const reserve0Frag = parseFloat(formatUnits(reserves.reserve0, token0.decimals));
            const reserve1Frag = parseFloat(formatUnits(reserves.reserve1, token1.decimals));

            if (reserve0Frag >= minMarketReserve && reserve1Frag >= minMarketReserve) {
                MARKET_ENV.runtimeCache.markets.push(market)
                MARKET_ENV.runtimeCache.marketAddressess.push(market.contract.toLowerCase())
            }
        }

    }
}

export { MARKET_ENV }