import { Wallet, ContractFactory, ContractInterface, BytesLike } from "ethers";
import { Interface } from "@ethersproject/abi";
import { formatEther } from "ethers/lib/utils";
import { ENV } from "../environment";

async function DeployContract(abi: Interface, byteCode: BytesLike | { object: string }, ...args: any[]) {
    ENV.initRuntimeChache();

    const wallet = new Wallet(ENV.config.walletPrivateKey, ENV.rpcProvider);
    const factory = new ContractFactory(abi, byteCode, wallet);

    const deployTransaction = await factory.getDeployTransaction(args);

    const feeData = await ENV.rpcProvider.getFeeData()
    const estimatedGas = (await ENV.rpcProvider.estimateGas(deployTransaction)).mul(2);
    console.log(`Balance required: ${formatEther(feeData.gasPrice!.mul(estimatedGas))} ${ENV.network.weth.symbol}`)

    const balance = await ENV.rpcProvider.getBalance(wallet.address, "latest");
    console.log(`Current balance: ${formatEther(balance)} ${ENV.network.weth.symbol}`)

    if (balance > estimatedGas) {
        console.log(`\nDeploying contract...`)
        const deployment = await factory.deploy(...args, {
            gasPrice: feeData.gasPrice,
            gasLimit: estimatedGas
        });

        console.log(`Waiting for deployment...`)
        await deployment.waitForDeployment();

        const address = await deployment.getAddress();
        console.log(`\nDeployed succesfully to ${address}`)
    }
    else {
        console.warn(`\nInsufficient balance for deployment...`)
        console.warn(`cancelling deployment...`)
    }
}

export { DeployContract }