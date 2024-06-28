export interface RelayMessage {
    sequenceNumber: number,
    message: {
        message: {
            header: {
                kind: L1_MESSAGE_TYPE,
                sender: string,
                blockNumber: number,
                timestamp: number,
                requestId: any | null,
                baseFeeL1: any | null
            },
            l2Msg: string
        },
        delayedMessagesRead: number,
    };
    signature: string | null
}

export enum L1_MESSAGE_TYPE {
    L2Message = 3,
    EndOfBlock = 6,
    L2FundedByL1 = 7,
    RollupEvent = 8,
    SubmitRetryable = 9,
    BatchForGasEstimation = 10,
    Intiialize = 11,
    EthDeposit = 12,
    BatchPostingReport = 13,
    Invalid = 0xff
}

export enum L2_MESSAGE_TYPE {
    UnsignedUserTx = 0,
    ContractTx = 1,
    NonmutaticCall = 2,
    Batch = 3,
    SignedTx = 4,
    Heartbeat = 6 // Deprecated

}

export interface RelayedData {
    version: number,
    messages: RelayMessage[]
}
