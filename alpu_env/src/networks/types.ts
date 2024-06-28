import { Exchange } from "../exchanges";
import { Token } from "../types";

export interface Network {
    name: string,
    chainId: number;
    weth: Token;
    tokens: Array<Token>,
    exchanges: Array<Exchange>;
    flashLoanPoolAddressProvider: string,

}