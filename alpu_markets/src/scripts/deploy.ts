import { Wallet, ethers, providers } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { Environment, Deployer } from "alpu_env";


async function main() {
    const name = process.argv[2];
    console.log(name);

    if (name == 'BundleExecutor') {
        const provider = new providers.JsonRpcProvider(Environment.rpcEndpoint);
        const arbitrageSigningWallet = new Wallet(Environment.walletPrivateKey, provider);
        const executorAddress = await arbitrageSigningWallet.getAddress();

        const gasPrice = (await provider.getGasPrice()).mul(2);
        const balance = await arbitrageSigningWallet.getBalance();

        const requiredGas = 2000000;

        const totalGasCost = gasPrice.mul(requiredGas);

        console.log(totalGasCost.sub(balance).toString())
        if (totalGasCost.gt(balance)) {
            console.error(`Not enough balance: (required: ${ethers.utils.formatEther(totalGasCost)}, have ${ethers.utils.formatEther(balance)})`)
            process.exit(1);
        }
        else {

            await Deployer.DepoyContract(name, executorAddress, Environment.network.flashLoanPoolAddressProvider, { gasLimit: requiredGas, gasPrice: gasPrice });
        }
    }
    else if (name == 'BundleExecutorV2') {
        const provider = new providers.JsonRpcProvider(Environment.rpcEndpoint);
        const arbitrageSigningWallet = new Wallet(Environment.walletPrivateKey, provider);
        const executorAddress = await arbitrageSigningWallet.getAddress();

        const gasPrice = (await provider.getGasPrice());
        const balance = await arbitrageSigningWallet.getBalance();

        const requiredGas = 2000000;

        const totalGasCost = gasPrice.mul(requiredGas);

        console.log(totalGasCost.sub(balance).toString())
        if (totalGasCost.gt(balance)) {
            console.log(`Not enough balance: (required: ${ethers.utils.formatEther(totalGasCost)}, have ${ethers.utils.formatEther(balance)})`)
            process.exit(1);
        }
        else {

            await Deployer.DepoyContract(name, executorAddress, Environment.network.flashLoanPoolAddressProvider, { gasLimit: requiredGas, gasPrice: gasPrice });
        }
    }
    else if (name == 'FlashBotsUniswapQuery') {
        const provider = new providers.JsonRpcProvider(Environment.rpcEndpoint);
        console.log('test');
        const gasPrice = parseUnits("0.1", "gwei")
            // const gasPrice = (await provider.getGasPrice());


            await Deployer.DepoyContract(name, { gasLimit: 16000000, gasPrice: gasPrice });
    }
}

main();