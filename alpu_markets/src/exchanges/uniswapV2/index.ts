import { Contract } from "ethers";
import { ExchangeMarketHandler, MarketQueryResult } from "../types";
import { Exchange, Market } from "alpu_env";
import { MARKET_ENV } from "../../environment";

const factoryAbi = (require('./_factory.json'));

const UNISWAPV2_MARKET_HANDLER: ExchangeMarketHandler ={
    getMarkets: getMarkets
}

async function getMarkets(exchange: Exchange, options = { batchSize: 500 }): Promise<MarketQueryResult> {
    const factoryContract = new Contract(exchange.factoryAddress, factoryAbi, MARKET_ENV.rpcProvider);
    const poolCount = (await factoryContract.allPairsLength()).toNumber();

    const batchCountLimit = Math.round(poolCount / options.batchSize) + 1;
    console.log(`getting markets from factory: ${exchange.factoryAddress} (batch count: ${batchCountLimit})`)

    const promises = new Array<Promise<Market[]>>;
    for (let i = 0; i < batchCountLimit * options.batchSize; i += options.batchSize) {
        promises.push(new Promise<Market[]>(async (res, err) => {
            const markets = new Array<Market>();
            if (i < poolCount) {
                const pairs: Array<Array<string>> = (await MARKET_ENV.uniswapQuery.functions.getUniswapV2Markets(exchange.factoryAddress, i, Math.min(poolCount, i + options.batchSize)))[0];
                for (let i = 0; i < pairs.length; i++) {
                    const pair = pairs[i];
                    const marketAddress = pair[2];

                    const pair0 = pair[0];
                    const pair1 = pair[1];

                    const token0 = MARKET_ENV.network.tokens.find(x => x.contract.toLowerCase() === pair0.toLowerCase());
                    const token1 = MARKET_ENV.network.tokens.find(x => x.contract.toLowerCase() === pair1.toLowerCase());

                    if (token0 && token1) {
                        markets.push({
                            router: exchange.routerAddress.toLowerCase(),
                            contract: marketAddress,
                            tokens: [pair0, pair1],
                            protocol: exchange.protocol,
                            fee: exchange.fees,
                            isStable: false,
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

export { UNISWAPV2_MARKET_HANDLER }