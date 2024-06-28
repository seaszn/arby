require('dotenv').config();

import { providers } from "ethers";
import { ARBITRUM_NETWORK } from "./networks";
import { Network } from "./networks/types";
import { Environment } from "./types";

// network settings
const CHAIN_ID = parseInt(process.env.CHAIN_ID || "137");
const RPC_ENDPOINT = process.env.RPC ? `http://${process.env.RPC}:8547` : (process.env.RPC_ENDPOINT || "");

// user settings
const WALLET_PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY || "";

const NETWORK_TABLE: { [key: number]: Network } = {
    [ARBITRUM_NETWORK.chainId]: ARBITRUM_NETWORK
}

const ENV: Environment = {
    network: NETWORK_TABLE[CHAIN_ID],
    rpcProvider: new providers.JsonRpcProvider(RPC_ENDPOINT),
    runtimeCache: {
        tokenDecimalPowers: {}
    },
    config: {
        walletPrivateKey: WALLET_PRIVATE_KEY,
    },
    initRuntimeChache
}

function initRuntimeChache() {
    initTokenDecimalPowers()
}

function initTokenDecimalPowers() {
    for (var token of NETWORK_TABLE[CHAIN_ID].tokens.filter(x => x.flashLoanEnabled !== undefined)) {
        ENV.runtimeCache.tokenDecimalPowers[token.contract.toLowerCase()] = (10n ** BigInt(token.decimals).valueOf())
    }
}

export { ENV };