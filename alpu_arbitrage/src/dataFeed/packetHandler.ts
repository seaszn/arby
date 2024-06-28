import { ARB_ENV } from "../environment";
import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { generateId } from "../utils";
import { RouteResult, generateRoutesFromToken, getBestRouteResult } from "../routes";
import { MarketInitiationPacket, TransactionPacket } from "./types";
import { Executor } from "../types";
import { PriceTable, ReserveTable } from "alpu_env";

async function handleTransactionUpdate(packetData: TransactionPacket, callback: Executor) {
    if (ARB_ENV.runtimeCache.markets.length > 0) {
        const tradeId = generateId(8);

        const routeTimer = process.hrtime();
        const bestRouteResult: RouteResult | undefined = getBestRouteResult(packetData.reserveTable, packetData.affectedMarkets, tradeId);
        console.log(`calculated route results in ${(process.hrtime(routeTimer)[1] / 1000000).toFixed(2)} ms [${tradeId}]`);

        const processTimer = process.hrtime();
        if (bestRouteResult && bestRouteResult.referenceProfitLoss > 0n) {
            const baseToken = ARB_ENV.network.tokens.find(x => x.contract.toLowerCase() == bestRouteResult.baseToken.toLowerCase())!;
            console.log(`profitable trade route found (${formatUnits(BigNumber.from(BigInt(bestRouteResult.profitLoss)), baseToken.decimals)} ${baseToken.symbol}) [${tradeId}]`)

            const executed = await callback(bestRouteResult, tradeId, packetData.txHashes, packetData);

            if (executed) {
                console.log(`CHECK THE CONTRACT ${ARB_ENV.config.bundleExecutorAddress}`);
                console.log(`trade processed in ${(process.hrtime(routeTimer)[1] / 1000000).toFixed(2)} ms [${tradeId}]`);
                process.exit(1);
            }
        }
        else {
            console.log(`no profitable trade found [${tradeId}]`);
        }

        console.log('\n------------------ \n')
    }
}

async function handleReferencePriceTableUpdate(data: PriceTable) {
    ARB_ENV.runtimeCache.priceTable = data;
}

async function handleMarketInitiation(data: MarketInitiationPacket) {
    for (var i = 0; i < data.markets.length; i++) {
        ARB_ENV.runtimeCache.markets.push(data.markets[i]);
    }

    for (var token of ARB_ENV.network.tokens.filter(x => x.flashLoanEnabled == true)) {
        // {
        generateRoutesFromToken(ARB_ENV.runtimeCache.markets, token.contract, token.contract);
        // for (var route of tokenRoutes) {
        // ARB_ENV.runtimeCache.marketRoutes.push(route);
        // }
        // }
    }

    for (var key in data.priceTable) {
        ARB_ENV.runtimeCache.priceTable[key] = data.priceTable[key]
    }

    console.log(`loaded ${ARB_ENV.runtimeCache.markets.length} markets`);
    console.log(`generated ${ARB_ENV.runtimeCache.marketRoutes.length} routes`)

    console.log('\n------------------ \n')
}

//TODO: Remove this
const callbackTable: { [key: string]: (reserveTable: ReserveTable) => void } = {}
async function handleMarketReservesResponse(data: { id: string, data: ReserveTable }) {
    if (callbackTable[data.id]) {
        callbackTable[data.id](data.data);
        delete callbackTable[data.id]
    }
}

export { handleTransactionUpdate, handleReferencePriceTableUpdate, handleMarketReservesResponse, handleMarketInitiation, callbackTable }