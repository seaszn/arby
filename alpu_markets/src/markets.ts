import { BigNumber } from "ethers";
import { hexZeroPad } from "ethers/lib/utils";
import { MARKET_ENV } from "./environment";
import { MarketBalanceChange, Transaction } from "./types";
import { numberArrayToHex } from "./utils";
import { parseLogs, ReserveTable } from "alpu_env";

async function getMarketReserves(batchSize = 200, batchCount: number = -1) {
    const queries = []
    const marketAddressess = MARKET_ENV.runtimeCache.marketAddressess;
    const totalLength = (batchCount == -1 ? marketAddressess.length : batchCount * batchSize)

    for (var i = 0; i < totalLength; i += batchSize) {
        queries.push(getReserveTable(marketAddressess.slice(i, Math.min(i + batchSize, marketAddressess.length))))
    }

    const reserveTables = await Promise.all(queries);

    const result: ReserveTable = {}
    for (var table of reserveTables) {
        for (var market in table) {
            result[market.toLowerCase()] = table[market];
        }
    }

    return result;
}

async function getReserveTable(marketAddressess: Array<string>) {
    const marketReserves: ReserveTable = {};

    try {
        const reserves: Array<Array<BigNumber>> = (await MARKET_ENV.uniswapQuery.functions.getReservesByPairs(marketAddressess))[0];

        for (let i = 0; i < marketAddressess.length; i++) {
            marketReserves[marketAddressess[i]] = {
                reserve0: reserves[i][0].toBigInt().valueOf(),
                reserve1: reserves[i][1].toBigInt().valueOf(),
            }
        }
    } catch { }

    return marketReserves;
}

async function getMarketBalanceChanges(transactions: Transaction[]) {
    const logQueries: Promise<MarketBalanceChange[]>[] = [];

    for (var tx of transactions) {
        logQueries.push(new Promise<MarketBalanceChange[]>(async res => {
            const assetBalanceChanges: ReserveTable = {};
            const assetDifferences: ReserveTable = {};

            try {
                const transactionTrace = await MARKET_ENV.rpcProvider.send("debug_traceCall", [
                    {
                        // from: tx.to,
                        to: tx.to,
                        data: tx.data,
                        value: tx.value,
                    },
                    "latest",
                    {
                        "tracer": "{\n" +
                            "    data: [],\n" +
                            "    fault: function (log) {\n" +
                            "    },\n" +
                            "    step: function (log) {\n" +
                            "        var topicCount = (log.op.toString().match(/LOG(\\d)/) || [])[1];\n" +
                            "        if (topicCount) {\n" +
                            "            const res = {\n" +
                            "                address: log.contract.getAddress(),\n" +
                            "                data: log.memory.slice(parseInt(log.stack.peek(0)), parseInt(log.stack.peek(0)) + parseInt(log.stack.peek(1))),\n" +
                            "            };\n" +
                            "            for (var i = 0; i < topicCount; i++)\n" +
                            "                res['topic' + i.toString()] = log.stack.peek(i + 2);\n" +
                            "            this.data.push(res);\n" +
                            "        }\n" +
                            "    },\n" +
                            "    result: function () {\n" +
                            "        return this.data;\n" +
                            "    }\n" +
                            "}",
                        "enableMemory": true,
                        "enableReturnData": true,
                        "disableStorage": false
                    }
                ]);

                for (var call of transactionTrace) {
                    call.address = numberArrayToHex((Object.values(call.address))).toLowerCase()
                    const index = MARKET_ENV.runtimeCache.marketAddressess.indexOf(call.address)

                    if (index !== -1) {
                        const market = MARKET_ENV.runtimeCache.markets[index];
                        call.data = numberArrayToHex((Object.values(call.data)))

                        const hexTopics: string[] = [];
                        const topics = Object.keys(call).filter(x => x.includes("topic"));

                        for (var key of topics) {
                            const hex = BigNumber.from(call[key]).toHexString();
                            hexTopics.push(hexZeroPad(hex, 32));
                        }

                        const transactionLogs = parseLogs(market, {
                            data: call.data,
                            topics: hexTopics
                        })

                        if (transactionLogs.name == 'Swap') {
                            const amount0In: bigint = transactionLogs.args[1].toBigInt().valueOf();
                            const amount1In: bigint = transactionLogs.args[2].toBigInt().valueOf()
                            const amount0Out: bigint = transactionLogs.args[3].toBigInt().valueOf()
                            const amount1Out: bigint = transactionLogs.args[4].toBigInt().valueOf()
                            // const recipient = transactionLogs.args[5].toLowerCase();

                            const reserves = assetBalanceChanges[call.address] || { reserve0: 0n, reserve1: 0n }

                            reserves.reserve0 += (amount0In - amount0Out);
                            reserves.reserve1 += (amount1In - amount1Out);

                            assetDifferences[call.address] = {
                                reserve0: amount0In - amount0Out,
                                reserve1: amount1In - amount1Out
                            }

                            assetBalanceChanges[call.address] = reserves;
                        }
                    }
                }
            }
            catch (err: any) { }

            const result: MarketBalanceChange[] = [];
            for (var key in assetBalanceChanges) {
                result.push({
                    contract: key,
                    changes: assetBalanceChanges[key],
                    differences: assetDifferences[key]
                })
            }

            res(result);
        }));
    }

    return (await Promise.all(logQueries)).flat()
}

export { getMarketReserves, getReserveTable, getMarketBalanceChanges }

