// import { Contract, providers } from "ethers";
// import { getRawNetworkTokens } from "../networks/tokens";
// import { ERC20 } from "../abi";
// import { ARBITRUM_NETWORK } from "../networks";
// import { writeFile } from "fs";
// import { ENV } from "../environment";
// import { Token } from "../types";

// // async function getTokens() {
    
// //     console.log(ENV.network)
// //     const preConfiguredTokens = ENV.network.tokens.map(x => { return { ...x, contract: String(x.contract).toLowerCase() } });
// //     const rpcUrl = getNetworkRpc();

// //     return;
// //     if (rpcUrl) {
// //         const rpcProvider = new providers.JsonRpcProvider(rpcUrl);
// //         const rawNetworkTokens = getRawNetworkTokens();
// //         const networkName = ENV.network.name;
// //         const formattedTokens: Token[] = ENV.network.tokens;
// //         var index = 0;

// //         for (var rawToken of rawNetworkTokens) {
// //             const contractAddress = rawToken.platforms[networkName].toString();
// //             console.log(`checking token ${++index} / ${rawNetworkTokens.length}`)

// //             if (preConfiguredTokens.find(x => x.contract != contractAddress.toLowerCase())) {
// //                 const callContract = new Contract(contractAddress, ERC20, rpcProvider)

// //                 try {

// //                     const [decimals, symbol] = await Promise.all([
// //                         callContract.decimals(),
// //                         callContract.symbol()
// //                     ])

// //                     formattedTokens.push({
// //                         contract: contractAddress,
// //                         symbol: symbol,
// //                         decimals: decimals,
// //                         flashLoanEnabled: false
// //                     })
// //                 } catch { }
// //             }

// //         }

// //         if (formattedTokens.length > 0) {
// //             console.log('found', formattedTokens.length, 'tokens')

// //             writeFile(`./src/networks/${ENV.network.name}/tokens_${new Date().toDateString()}.json`, JSON.stringify(formattedTokens), () => {
// //                 console.log('done')
// //             });
// //         }
// //     }
// // }

// // function getNetworkRpc() {
// //     if (ENV.network.chainId == ARBITRUM_NETWORK.chainId) {
// //         return 'https://rpc.ankr.com/arbitrum'
// //     }
// // }

// // getTokens();