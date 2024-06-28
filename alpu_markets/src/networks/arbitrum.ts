import { QueriedNetwork } from "./types"
import { ARBITRUM_NETWORK } from "alpu_env"

export const ARBITRUM: QueriedNetwork  = {
    ...ARBITRUM_NETWORK,
    uniswapQueryAddress: '0x70FeDD23788d69FDB2B24fcbf2e49eD3b80Ec1F9'
    // uniswapQueryAddress: '0x9CdB40cd9aB850C62546fF2de29E506527375447' // old
}