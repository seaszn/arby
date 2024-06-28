const UniswapV2Pair = (require('./UniswapV2Pair.json')).abi;
const UniswapV2Factory = (require('./UniswapV2Factory.json')).abi;
const UniswapV2Router = require('./UniswapV2Router.json');
// const UniswapQuery = (require('./FlashBotsUniswapQuery.json')).abi;
const UniswapQuery = (require('./UniswapQuery.json')).abi;
const FlashPoolAddressProvider = (require('./IPoolAddressesProvider.json')).abi;
const FlashPool = (require('./IPool.json')).abi;
const Weth = require('./ArbERC20.json')
export { Weth, UniswapV2Pair, UniswapV2Factory, UniswapQuery, UniswapV2Router, FlashPool, FlashPoolAddressProvider }