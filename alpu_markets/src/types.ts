import { ReserveTable } from "alpu_env";
import { MarketReserves } from "alpu_env/src/types";

export interface TokenTransfer{
    from: string,
    to: string,
    amount: bigint;
    contract: string;

}

export interface MarketBalanceChange {
    contract: string,
    changes: MarketReserves,
    differences: MarketReserves
}

export interface ReserveTableUpdate{
    affectedMarkets: string[],
    reserveTable: ReserveTable,
    differences: ReserveTable
}


export interface LegacyTransaction {
    // nonce: number,
    // gasPriceBid: BigNumber,
    // gasLimit: number,
    from: string | null,
    to: string,
    value: string,
    data: string,
    // v: string,
    // r: string,
    // s: string,
}

export interface EIP1559Transaction {
    from: string | null,
    // chainId: number,
    to: string,
    value: string,
    data: string,
    // nonce: number,
    maxPriorityFeePerGas: string,
    maxFeePerGas: string,
    gasLimit: number,
    // v: string,
    // r: string,
    // s: string,
}

export type Transaction = LegacyTransaction | EIP1559Transaction;
