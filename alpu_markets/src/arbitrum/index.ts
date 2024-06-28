import WebSocket from "ws";
import { initSocketServer } from "../networking";
import { handleStreamMessage } from "./handler";
import { initDailyDataTable } from "../priceOracle";
import { MARKET_ENV } from "../environment";


export async function initAribtrumHandler() {
    const socket = new WebSocket(MARKET_ENV.config.feedEndpoint);
    const rpcNetwork = await MARKET_ENV.rpcProvider.ready;
    
    console.log(`running on ${rpcNetwork.name} network`);
    console.log('initiating market table..\n');
    
    await MARKET_ENV.initRuntimeChache();

    // initialize the market table
    console.log(`\nloaded ${MARKET_ENV.network.tokens.length} tokens...`)
    console.log(`found ${MARKET_ENV.runtimeCache.markets.length} markets...`)

    // initialize the reference price table
    await initDailyDataTable();
    console.log('\ninitiated data table...')

    initSocketServer();
    socket.on("message", handleStreamMessage);
}