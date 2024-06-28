import { ARB_ENV } from "./environment";

export async function initDataConnector() {
    const timer = setInterval(async () => {
        updateData();
    }, 24 * 60 * 60 * 1e3);

    await updateData();
}

async function updateData() {
    const [flashLoanFee, ethBalance] = await Promise.all([
        ARB_ENV.bundleExecutor.callStatic.getFlashLoanFees(),
        ARB_ENV.executorWallet.getBalance()
    ])
    
    ARB_ENV.runtimeCache.flashLoanFee = flashLoanFee.toBigInt().valueOf();
    ARB_ENV.runtimeCache.ethBalance = ethBalance.toBigInt().valueOf();
}