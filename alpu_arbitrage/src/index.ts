import { getMarketReserves, initDataFeed } from "./dataFeed";
import { RouteResult } from "./routes";
import { BigNumber } from "ethers";
import { initDataConnector } from "./dataConnector";
import { ARB_ENV } from "./environment";
import { populateTokenSwap } from "./markets";
import { TransactionPacket } from "./dataFeed/types";
import { parseUnits } from "@ethersproject/units";

async function run() {
    console.clear();

    ARB_ENV.initRuntimeChache();

    await initDataConnector().then(() => {
        initDataFeed(executeTradeRoute);
    });
}

async function executeTradeRoute(routeResult: RouteResult, tradeId: string, txHashes: string[], packetData: TransactionPacket) {
    if (!ARB_ENV.runtimeCache.isProcessingTrade) {
        ARB_ENV.runtimeCache.isProcessingTrade = true;

        const volume = routeResult.startBalance;
        const flashLoanFee = ARB_ENV.runtimeCache.flashLoanFee * volume / 10000n;

        const swapTimer = process.hrtime();
        const [swapTargets, swapPayloads] = await populateSwaps(routeResult);
        console.log(`populated swaps in ${(process.hrtime(swapTimer)[1] / 1000000).toFixed(2)} ms`)

        const transaction = await ARB_ENV.bundleExecutor.populateTransaction.executeTxBundle(
            routeResult.baseToken,
            BigNumber.from(volume.toString()),
            swapTargets,
            swapPayloads,
            { gasPrice: parseUnits("0.1", "gwei") },
        );

        // console.log(transaction.gasPrice);
        // console.log(ARB_ENV.bundleExecutor.address);
        const f = await Promise.all(txHashes.map(tx => ARB_ENV.rpcProvider.waitForTransaction(tx, 1, 30e3)))
        const block = f.map(x => x.blockNumber).reduce((a, b) => Math.max(a, b));

        console.log('trigger tx finalized on block: ' + block)

        const estimateGas = await ARB_ENV.rpcProvider.send("debug_traceCall", [
            {
                to: transaction.to,
                data: transaction.data,
                value: transaction.value,
                from: ARB_ENV.executorWallet.address,
            },
            "latest",
        ]);

        if (estimateGas.failed == false) {
            console.log('required gas: ' + estimateGas.gas);
        }
        else {
            if (estimateGas.returnValue.includes("4641494c4544")) {
                // Transaction failed

                // for (var i = 0; i < routeResult.transactions.length; i++) {
                //     const tx = routeResult.transactions[i];

                //     const inIs0 = tx.tokenIn.toLowerCase() == tx.market.tokens[0].toLowerCase()
                //     var amountIn0 = inIs0 ? tx.inAmount : 0n;
                //     var amountIn1 = inIs0 ? 0n : tx.inAmount;
                //     var amountOut0 = inIs0 ? 0n : tx.outAmount;
                //     var amountOut1 = inIs0 ? tx.outAmount : 0n;

                //     console.log('tx ' + i)
                //     console.log({
                //         router: tx.market.router,
                //         reserveIn: inIs0 ? routeResult.routeReserves[i].reserve0 : routeResult.routeReserves[i].reserve1,
                //         reserveOut: inIs0 ? routeResult.routeReserves[i].reserve1 : routeResult.routeReserves[i].reserve0,
                //         amountIn0,
                //         amountIn1,
                //         amountOut0,
                //         amountOut1
                //     })
                // }
                getMarketReserves((newReserves) => {
                    for (var key of routeResult.transactions.map(x => x.market.contract.toLowerCase())) {
                        if (packetData.reserveTable[key].reserve0 !== newReserves[key].reserve0 || packetData.reserveTable[key].reserve1 !== newReserves[key].reserve1) {
                            console.log([key, packetData.affectedMarkets.includes(key)])
                            console.log({
                                reserve0: packetData.reserveTable[key].reserve0 - newReserves[key].reserve0,
                                reserve1: packetData.reserveTable[key].reserve1 - newReserves[key].reserve1,
                            })
                            console.log(packetData.differences[key]);
                        }
                    }

                    console.log('estimate gas failed');
                    // process.exit();
                })
            }
            else {
                console.log('unkown return value');
            }
        }

        // Test the synchronization to the actual markets

        ARB_ENV.runtimeCache.isProcessingTrade = false;
        return false;
        // return false;

        // const totalGasCost = transaction.gasLimit.div(2).mul(parseUnits("0.1", "gwei")).toBigInt().valueOf();
        // if (routeResult.referenceProfitLoss > totalGasCost) {
        //     try {
        //         const f = await ARB_ENV.executorWallet.sendTransaction(transaction);
        //         // console.log(f)
        //         const d = await f.wait(1);
        //         console.log('res')
        //         console.log(d);
        //     } catch (err: any) {
        //         if (err.reason == 'transaction failed') {
        //             console.log(`Trade discarded, outcompeted [${tradeId}]`);

        //             ARB_ENV.runtimeCache.isProcessingTrade = false;
        //             return false;
        //         }
        //         else {
        //             console.log('err');
        //             console.log(err);
        //         }
        //     }

        //     ARB_ENV.runtimeCache.isProcessingTrade = false;
        //     return true;
        // }
        // else {
        //     console.log(`Trade discarded, failed against gas fees [${tradeId}]`);
        // }
    }

    ARB_ENV.runtimeCache.isProcessingTrade = false;
    return false;

    //#region dorment
    // if (!_processingTrade) {
    //     _processingTrade = true;

    //     const volume = bestRouteResult.startBalance;
    //     const flashLoanFee = ARB_ENV.runtimeCache.flashLoanFee * volume / 10000n;
    //     const ethBalance = ARB_ENV.runtimeCache.ethBalance;

    //     const targets = new Array<string>();
    //     const payloads = new Array<string>();
    //     let transactionBalance = volume;

    //     const timer = process.hrtime();

    //     // Generate transaction payloads
    //     for (let i = 0; i < bestRouteResult.transactions.length; i++) {
    //         const transaction = bestRouteResult.transactions[i];

    //         if (i < bestRouteResult.transactions.length - 1) {
    //             const buyCalls = await sellTokensToNextMarket(transaction.tokenIn, transaction.outAmount, bestRouteResult.transactions[i + 1].market.contract, transaction.market);
    //             targets.push(...buyCalls.targets);
    //             payloads.push(...buyCalls.data);
    //         }
    //         else {
    //             const sellCallData = await sellTokens(transaction.tokenIn, transaction.outAmount, ARB_ENV.config.bundleExecutorAddress, transaction.market)
    //             targets.push(transaction.market.contract);
    //             payloads.push(sellCallData)
    //         }

    //         transactionBalance = transaction.outAmount;
    //     }

    //     console.log(`populated swaps in ${(process.hrtime(timer)[1] / 1000000).toFixed(2)} ms`)


    //     const estimatedProfit = transactionBalance - (volume + flashLoanFee);

    //     if (estimatedProfit > 0) {
    //         var refGrossProfit = BigNumber.from(getRefrencePrice(bestRouteResult.baseToken, estimatedProfit));
    //         const transaction = await ARB_ENV.bundleExecutor.populateTransaction.executeTxBundle(
    //             bestRouteResult.baseToken,
    //             BigNumber.from(volume.toString()),
    //             targets,
    //             payloads,
    //             {
    //                 // gasLimit: BigNumber.from(100000),
    //                 gasPrice: BigNumber.from(275520000)
    //             }
    //         );

    //         // Try to estimate the bundle gas consumption
    //         try {
    //             const estimateGas = await ARB_ENV.rpcProvider.estimateGas({
    //                 ...transaction,
    //                 from: ARB_ENV.executorWallet.address
    //             })

    //             transaction.gasLimit = estimateGas.mul(2);
    //             console.log(transaction.gasLimit)
    //         }
    //         catch (err: any) {
    //             if (err.reason == `execution reverted: 27`) {
    //                 console.log(`Estimate gas failure, cancelled transaction (asset not available for loan) [${tradeId}]`);
    //                 _processingTrade = false;
    //                 return false;
    //             }
    //             else if (err.reason == 'execution reverted: FAILED') {
    //                 console.log(`Estimate gas failure, cancelled transaction (out of range) [${tradeId}]`);


    //                 console.log(bestRouteResult.transactions.map(x => x.market.router));
    //                 for (var i = 0; i < bestRouteResult.routeReserves!.length; i++) {
    //                     // console.log(`TX ${i + 1}`)

    //                     // var resIn;
    //                     // var resOut;
    //                     // if(bestRouteResult.transactions[i].tokenIn == bestRouteResult.transactions[i].market.tokens[0]){
    //                     //     resIn =  bestRouteResult.routeReserves![i].reserve0;
    //                     //     resOut =  bestRouteResult.routeReserves![i].reserve1;
    //                     // }
    //                     // else{
    //                     //     resIn =  bestRouteResult.routeReserves![i].reserve1;
    //                     //     resOut =  bestRouteResult.routeReserves![i].reserve0;
    //                     // }

    //                     // console.log({
    //                     //     stable: bestRouteResult.transactions[i].market.isStable,
    //                     //     router: bestRouteResult.transactions[i].market.router.toString(),
    //                     //     tokenIn: bestRouteResult.transactions[i].tokenIn,
    //                     //     tokenOut: bestRouteResult.transactions[i].tokenOut,
    //                     //     inAmount: bestRouteResult.transactions[i].inAmount,
    //                     //     outAmout: bestRouteResult.transactions[i].outAmount,
    //                     //     reserveIn: resIn,
    //                     //     reserveOut: resOut,
    //                     // });

    //                 }

    //                 _processingTrade = false;
    //                 return false;
    //             }
    //             else if (err.reason == 'execution reverted: no profit made') {
    //                 console.log(`Estimate gas failure, cancelled transaction (no profit made) [${tradeId}]`);
    //                 _processingTrade = false;
    //                 return false;
    //             }
    //             else {
    //                 console.log(`Estimate gas failed, cancelling transaction`)
    //                 console.log(err);
    //                 process.exit(1);
    //             }
    //         }

    //         if (!transaction.gasLimit) {
    //             _processingTrade = false;
    //             return false;
    //         }

    //         var totalGasCost: BigNumber = transaction.gasLimit.div(2).mul(parseUnits("0.1", "gwei"));
    //         console.log(`Estimated gas required: ${formatUnits(totalGasCost, ARB_ENV.network.weth.decimals)} ETHER [${tradeId}]`)

    //         if (refGrossProfit.gt(totalGasCost)) {
    //             try {
    //                 const f = await ARB_ENV.executorWallet.sendTransaction(transaction);
    //                 // console.log(f)
    //                 const d = await f.wait(1);
    //                 console.log('res')
    //                 console.log(d);
    //             } catch (err: any) {
    //                 if (err.reason == 'transaction failed') {
    //                     console.log(`Trade discarded, outcompeted [${tradeId}]`);

    //                     _processingTrade = false;
    //                     return false;
    //                 }
    //                 else {
    //                     console.log('err');
    //                     console.log(err);
    //                 }
    //             }

    //             _processingTrade = false;
    //             return true;
    //         }
    //         else {
    //             console.log(`Trade discarded, failed against gas fees [${tradeId}]`);
    //         }
    //     }
    //     else {
    //         console.log(`Trade discarded, failed against flash fees [${tradeId}]`);
    //     }
    // }
    // else {
    //     console.log(`Trade discarded (already processing trade) [${tradeId}]`)
    // }

    // _processingTrade = false;
    // return false;
    //#endregion
}

async function populateSwaps(routeResult: RouteResult) {
    const targets = new Array<string>();
    const payloads = new Array<string>();
    const transactions = routeResult.transactions;

    for (let i = 0; i < transactions.length; i++) {
        const swap = transactions[i];

        if (i < transactions.length - 1) {
            const callData = await populateTokenSwap(swap.tokenIn, swap.outAmount, transactions[i + 1].market.contract, swap.market)
            targets.push(swap.market.contract);
            payloads.push(callData);
        }
        else {
            const callData = await populateTokenSwap(swap.tokenIn, swap.outAmount, ARB_ENV.config.bundleExecutorAddress, swap.market);
            targets.push(swap.market.contract);
            payloads.push(callData)
        }
    }

    return [targets, payloads];
}

run();
// test();