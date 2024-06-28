import { ReserveTable } from "alpu_env";
import { RouteResult } from "./routes/types";
import { TransactionPacket } from "./dataFeed/types";

//TODO: remove differences & reserveTable
export type Executor = (bestRouteResult: RouteResult, tradeId: string, txHashes: string[], packetData: TransactionPacket) => Promise<boolean>