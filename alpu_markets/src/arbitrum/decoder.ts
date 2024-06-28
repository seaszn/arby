import { Transaction } from '../types';
import { RLP, keccak256 } from 'ethers/lib/utils'
import { BigNumber } from 'ethers';

export function sliceHexData(data: string){
    const txData: string[] = RLP.decode(data);
    
    return txData
    // return txData;
}
export function decodeTxData(hexData: Buffer, from: string): [Transaction, string] {
    const dataBuffer = Buffer.from(hexData.toString('hex').slice(2), 'hex');
    const txHash = keccak256(dataBuffer);
    var result!: Transaction

    try {
        const txData: string[] = RLP.decode(dataBuffer);
        result = {
            // txHash: txHash,
            // nonce: parseInt(txData[0], 16),
            // gasPriceBid: BigNumber.from(txData[1]),
            // gasLimit: parseInt(txData[2], 16),
            to: txData[3],
            // from: null,
            from: '0xf977814e90da44bfa03b6295a0616a897441acec',
            // from: from,
            value: BigNumber.from(txData[4] == '0x' ? '0x0' : txData[4]).toHexString(),
            data: txData[5],
            // v: txData[6],
            // r: txData[7],
            // s: txData[8],
        }
    }
    catch {
        const txData: string[] = RLP.decode(Buffer.from(hexData.toString('hex').slice(4), 'hex'));
        result = {
            // txHash: txHash,
            // from: from,
            from: '0xf977814e90da44bfa03b6295a0616a897441acec',
            // chainid: parseInt(txData[0], 16),
            // nonce: parseInt(txData[1], 16),
            // maxPriorityFeePerGas: BigNumber.from( txData[2] == '0x' ? '0x0' : txData[2]).toHexString().replace("0x0", "0x"),
            // maxFeePerGas: BigNumber.from(txData[3] == '0x' ? '0x0' : txData[3]).toHexString().replace("0x0", "0x"),
            // gasLimit: parseInt(txData[4], 16),
            to: txData[5],
            value: BigNumber.from(txData[6] == '0x' ? '0x0' : txData[6]).toHexString(),
            data: txData[7],
            // v: txData[9],
            // r: txData[10],
            // s: txData[11],
        };
    }

    return [ {...result, value: result.value.replace("0x0", "0x")}, txHash]
}
