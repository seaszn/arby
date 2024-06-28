import { L2_MESSAGE_TYPE, RelayedData, L1_MESSAGE_TYPE } from "./types";
import { decodeTxData } from "./decoder";
import { broadcastTx } from '../networking/socketServer'
import { ReserveTableUpdate, Transaction } from "../types";
import { getMarketBalanceChanges, getMarketReserves } from "../markets";
import { ReserveTable } from "alpu_env";

async function handleStreamMessage(data: any) {
    const timer = process.hrtime();
    const dataMessage: RelayedData = JSON.parse(data);

    if (dataMessage.messages) {
        if (dataMessage.messages.length > 0) {
            const messageCollection = dataMessage.messages;
            const transactions: Transaction[] = [];
            const transactionHashes: string[] = [];
            for (var message of messageCollection.filter(x => x.message.message.header.kind == L1_MESSAGE_TYPE.L2Message)) {
                const hexData = Buffer.from(message.message.message.l2Msg, 'base64');
                const txType: L2_MESSAGE_TYPE = hexData.readInt8();

                if (txType == L2_MESSAGE_TYPE.SignedTx) {
                    const [tx, hash] = decodeTxData(hexData, message.message.message.header.sender);
                    transactions.push(tx);
                    transactionHashes.push(hash);
                }
            }

            if (transactions.length > 0) {
                const result = await handleTransactions(transactions, transactionHashes)

                if (result.affectedMarkets.length > 0) {
                    console.log(`broadcasting ${result.affectedMarkets.length} changes`)
                    broadcastTx({ ...result, txHashes: transactionHashes });
                    console.log(`tx handled in ${(process.hrtime(timer)[1] / 1000000).toFixed(4)} ms`)
                }
            }
        }
    }
}

async function handleTransactions(transactions: Transaction[], transactionHashes: string[]): Promise<ReserveTableUpdate> {
    const balanceChanges = await getMarketBalanceChanges(transactions);

    if (balanceChanges.length > 0) {
        const reserveTable = await getMarketReserves();
        const affectedMarkets = new Array<string>()
        const differences: ReserveTable = {}

        for (var balanceChange of balanceChanges) {
            if (affectedMarkets.indexOf(balanceChange.contract) == -1) {
                affectedMarkets.push(balanceChange.contract);
            }

            reserveTable[balanceChange.contract].reserve0 += balanceChange.changes.reserve0;
            reserveTable[balanceChange.contract].reserve1 += balanceChange.changes.reserve1;

            differences[balanceChange.contract] = balanceChange.differences;
        }

        return {
            affectedMarkets,
            reserveTable,
            differences
        }
    }

    return {
        affectedMarkets: [],
        reserveTable: {},
        differences: {}
    };
}

export { handleStreamMessage }