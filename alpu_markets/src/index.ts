import { initAribtrumHandler } from "./arbitrum";
import { MARKET_ENV } from "./environment";

async function run() {
    await getNetworkHandler()();
}

function getNetworkHandler() {
    if (MARKET_ENV.network.chainId == 42161) {
        return initAribtrumHandler;
    }

    throw new Error(`No handler for ${MARKET_ENV.network.name} (${MARKET_ENV.network.chainId})`)
}

run().then(() => {

}).catch((err: Error) => {
    console.error(err);
})