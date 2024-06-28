import { ENV } from "../../environment";

export interface RawNetworkToken {
    id: string,
    symbol: string,
    platforms: {
        [key: string]: string
    }
}

export function getRawNetworkTokens(): RawNetworkToken[]{
    const tokens = require('./tokens.json').filter((x: any) => x.platforms[ENV.network.name] != null);
    return tokens;
}
