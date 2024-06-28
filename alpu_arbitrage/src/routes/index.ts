import _ from "lodash";
import { ARB_ENV } from "../environment";
import { BigSqrt, includesAny } from "../utils";
import { Market, getAmountOut, ReserveTable } from "alpu_env";
import { SwapTransaction, RouteResult, MarketRoute, ListableReserve } from "./types";
import { getFeeData } from "alpu_env/src/exchanges/utils";
import { getRefrencePrice } from "../priceOracle";

function generateRoutesFromToken(markets: Market[], tokenIn: string, tokenOut: string, maxHops: number = ARB_ENV.config.maxRouteLength, routeMarkets: Market[] = []) {
    for (let market of markets) {
        let currentTokenOut: string;
        var token0 = market.tokens[0];
        var token1 = market.tokens[1];

        if (token0 == tokenIn || token1 == tokenIn) {
            if (tokenIn == token0) {
                currentTokenOut = token1;
            }
            else {
                currentTokenOut = token0;
            }

            if (currentTokenOut == tokenOut && (routeMarkets.length + 1) >= ARB_ENV.config.minRouteLength) {
                let baseToken = ARB_ENV.network.tokens.find(x => x.contract.toLowerCase() == tokenOut.toLowerCase())
                if (baseToken) {
                    ARB_ENV.runtimeCache.marketRoutes.push({
                        markets: routeMarkets.concat(market),
                        marketContracts: routeMarkets.concat(market).map(x => x.contract.toLowerCase()),
                        baseToken: tokenOut,
                    });
                }
            }
            else if (maxHops > 1 && markets.length > 1) {
                generateRoutesFromToken(markets.filter(x => x.contract != market.contract), currentTokenOut, tokenOut, maxHops - 1, routeMarkets.concat(market))
                // generateRoutesFromToken(markets, currentTokenOut, tokenOut, maxHops - 1, routeMarkets.concat(market))
            }
        }
    }
}

function getBestRouteResult(reserveTable: ReserveTable, filters: string[] = [], tradeId: string): RouteResult | undefined {
    var affectRoutesCount = 0;
    var affectiveRoutesCount = 0;
    const routeResults: RouteResult[] = [];

    for (var route of ARB_ENV.runtimeCache.marketRoutes) {
        const routeReserves: ListableReserve[] = []

        if (includesAny(route.marketContracts, filters)) {
            for (var market of route.markets) {
                const reserves = reserveTable[market.contract.toLowerCase()];
                routeReserves.push({
                    token0: market.tokens[0],
                    token1: market.tokens[1],
                    reserve0: reserves.reserve0,
                    reserve1: reserves.reserve1,
                    fee: market.fee
                })
            }

            const routeResult = calculateRouteResult(routeReserves, route);
            if (routeResult) {
                affectiveRoutesCount += 1;

                routeResults.push(routeResult);
            }

            affectRoutesCount += 1;
        }
    }

    console.log(`triggered routes (${affectiveRoutesCount} / ${affectRoutesCount}) [${tradeId}]`);

    // If any routes where triggered, return the most profitable of all, else return undefined 
    if (routeResults.length == 0) {
        return undefined;
    }
    else {
        // Sort on the refernce profit loss in descending order
        routeResults.sort((a, b) => Number(b.referenceProfitLoss - a.referenceProfitLoss))

        // Return the most profitable route
        return routeResults[0];
    }
}

function calculateRouteResult(reserves: ListableReserve[], route: MarketRoute) {
    const [liqidity0, liqidity1] = calculateRouteLiquidity(reserves, route.baseToken)
    const [feeMul, mul] = getFeeData(reserves[0].fee)

    const optimalInput = ((BigSqrt((liqidity0 * liqidity1 * feeMul) / mul) - liqidity0) * mul) / feeMul

    if (optimalInput > 0) {
        return calculateRouteProfit(route, reserves, optimalInput, route.baseToken);
    }

    return undefined;
}

function calculateRouteProfit(route: MarketRoute, reserves: ListableReserve[], inputAmount: bigint, tokenIn: string): RouteResult | undefined {
    const startBalance = inputAmount;
    const swapTransactions: Array<SwapTransaction> = [];

    for (var i = 0; i < route.markets.length; i++) {
        const swapAmount = inputAmount;
        const inputToken = tokenIn;

        const market = route.markets[i]
        const marketReserves = reserves[i];

        const token0 = market.tokens[0];
        const token1 = market.tokens[1];

        if (tokenIn == token0) {
            const amount = getAmountOut(market.protocol, [marketReserves.reserve0, marketReserves.reserve1, inputAmount, market, token0, token1])

            if (!amount) {
                return undefined
            }

            // reserves[i].reserve0 += inputAmount;
            // reserves[i].reserve1 -= amount;

            inputAmount = amount;
            tokenIn = token1
        }
        else if (tokenIn == token1) {
            const amount = getAmountOut(market.protocol, [marketReserves.reserve1, marketReserves.reserve0, inputAmount, market, token1, token0])

            if (!amount) {
                return undefined
            }

            // reserves[i].reserve0 -= inputAmount;
            // reserves[i].reserve1 += amount;

            inputAmount = amount;
            tokenIn = token0;
        }
        else {
            console.log('the is no available reserve for this token in this market');
            console.log(market.tokens);
            console.log(tokenIn);
        }

        swapTransactions.push({
            market: market,
            tokenIn: inputToken,
            tokenOut: tokenIn,
            inAmount: swapAmount,
            outAmount: inputAmount
        })
    }

    return {
        baseToken: route.baseToken,
        startBalance: startBalance,
        endBalance: inputAmount,
        profitLoss: inputAmount - startBalance,
        referenceProfitLoss: getRefrencePrice(route.baseToken, inputAmount - startBalance),
        routeReserves: reserves,
        transactions: swapTransactions,
    }
}

function calculateRouteLiquidity(reserves: ListableReserve[], tokenIn: string) {
    const firstReserve = reserves[0];
    const f0 = firstReserve.token0 == tokenIn ? firstReserve.reserve0 : firstReserve.reserve1;
    const f1 = firstReserve.token0 == tokenIn ? firstReserve.reserve1 : firstReserve.reserve0;
    tokenIn = firstReserve.token0 == tokenIn ? firstReserve.token0 : firstReserve.token1;

    var a0 = f0;
    var a1 = f1;

    for (var i = 1; i < reserves.length; i++) {
        const marketReserves = reserves[i];

        const [feeMul, mul] = getFeeData(marketReserves.fee);

        if (tokenIn == marketReserves.token0) {
            const delta = marketReserves.reserve0 + ((feeMul * a1) / mul)

            a0 = (a0 * marketReserves.reserve0) / delta
            a1 = (feeMul * a1 * marketReserves.reserve1 / mul) / delta;
            tokenIn = marketReserves.token1;
        }
        else {
            const delta = marketReserves.reserve1 + ((feeMul * a1) / mul)
            a0 = (a0 * marketReserves.reserve0) / delta
            a1 = (feeMul * a1 * marketReserves.reserve0 / mul) / delta;
            tokenIn = marketReserves.token0;
        }
    }

    return [a0, a1]
}


export { generateRoutesFromToken, getBestRouteResult, RouteResult, MarketRoute }
