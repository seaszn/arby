import { Exchange, Market } from "alpu_env";
import { ExchangeMarketHandler, MarketQueryResult } from "../types";
import { Contract } from "ethers";
import { Interface } from "ethers/lib/utils";
import { MARKET_ENV } from "../../environment";

const factoryAbi = (require('./_factory.json'));
const pairAbi = (require('./_pair.json'));

const STABLE_ADDRESS = "0x0000000000000000000000000000000000000001";

const STABLESWAP_MARKET_HANDLER: ExchangeMarketHandler = {
    getMarkets: getMarkets
}

async function getMarkets(exchange: Exchange, options = { batchSize: 500 }): Promise<MarketQueryResult> {
    const factoryContract = new Contract(exchange.factoryAddress, factoryAbi, MARKET_ENV.rpcProvider);
    const poolCount = (await factoryContract.allPairsLength()).toNumber();

    const batchCountLimit = Math.round(poolCount / options.batchSize) + 1;
    console.log(`getting markets from factory: ${exchange.factoryAddress} (batch count: ${batchCountLimit})`)

    const promises = new Array<Promise<Market[]>>;
    for (let i = 0; i < batchCountLimit * options.batchSize; i += options.batchSize) {
        promises.push(new Promise<Market[]>(async res => {
            const markets = new Array<Market>();
            if (i < poolCount) {
                const pairs: Array<Array<string>> = (await MARKET_ENV.uniswapQuery.functions.getStableSwapMarkets(exchange.factoryAddress, i, Math.min(poolCount, i + options.batchSize)))[0];
                for (let i = 0; i < pairs.length; i++) {
                    const pair = pairs[i];

                    const pair0 = pair[0];
                    const pair1 = pair[1];
                    const stableAddress = pair[2];
                    const marketAddress = pair[3];

                    const token0 = MARKET_ENV.network.tokens.find(x => x.contract.toLowerCase() === pair0.toLowerCase());
                    const token1 = MARKET_ENV.network.tokens.find(x => x.contract.toLowerCase() === pair1.toLowerCase());

                    if (token0 && token1) {
                        const isStable = stableAddress == STABLE_ADDRESS
                        markets.push({
                            router: exchange.routerAddress.toLowerCase(),
                            contract: marketAddress,
                            tokens: [pair0, pair1],
                            protocol: exchange.protocol,
                            fee: isStable ? exchange.stableFee! : exchange.fees,
                            isStable: isStable,
                            minimumLiquidity: exchange.minimumLiquidity
                        });
                    }

                }
            }

            res(markets)
        }));
    }

    return { markets: (await Promise.all(promises)).flat(), router: exchange.routerAddress };
}

export { STABLESWAP_MARKET_HANDLER }