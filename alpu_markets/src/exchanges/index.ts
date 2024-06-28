import { Exchange, ExchangeProtocol } from "alpu_env";
import { STABLESWAP_MARKET_HANDLER } from "./stableSwap";
import { UNISWAPV2_MARKET_HANDLER } from "./uniswapV2";

const exchangeHandlerTable = {
    [ExchangeProtocol.StableSwap]: STABLESWAP_MARKET_HANDLER,
    [ExchangeProtocol.UniswapV2]: UNISWAPV2_MARKET_HANDLER,
}

function getExchangeMarkets(exchange: Exchange) {
    return exchangeHandlerTable[exchange.protocol].getMarkets(exchange, { batchSize: 500 });
}

export {
    getExchangeMarkets,
}