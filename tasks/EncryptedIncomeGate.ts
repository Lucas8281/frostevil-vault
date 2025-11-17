import { task } from "hardhat/config";
import * as fs from "fs";
import * as path from "path";

/**
 * @task deploy-encrypted-income-gate
 * @description Deploys the EncryptedIncomeGate contract and saves deployment info.
 */
task("deploy-encrypted-income-gate", "Deploy EncryptedIncomeGate contract").setAction(async (taskArgs, hre) => {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  // 获取合约工厂
  const EncryptedIncomeGate = await hre.ethers.getContractFactory("EncryptedIncomeGate");
  // 部署合约
  const encryptedIncomeGate = await EncryptedIncomeGate.deploy();
  // 等待部署完成
  await encryptedIncomeGate.waitForDeployment();
  const contractAddress = await encryptedIncomeGate.getAddress();
  console.log("EncryptedIncomeGate deployed to:", contractAddress);
  // 构建部署信息
  const deploymentInfo = {
    EncryptedIncomeGate: {
      address: contractAddress,
      deployer: deployer.address,
      network: hre.network.name,
      deploymentTime: new Date().toISOString(),
    },
  };
  // 确保部署目录存在
  const deploymentsDir = path.join(__dirname, "..", "deployments", hre.network.name);
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  // 保存部署信息到文件
  fs.writeFileSync(path.join(deploymentsDir, "EncryptedIncomeGate.json"), JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to ${path.join(deploymentsDir, "EncryptedIncomeGate.json")}`);
});

/**
 * @task verify-income-threshold
 * @description Verifies if an address's submitted income meets or exceeds a threshold.
 * @param address The user's address to verify.
 * @param threshold The income threshold to check against (e.g., 5500).
 */
task("verify-income-threshold", "Verify if an address's income meets a threshold")
  .addParam("address", "The address of the user to verify")
  .addParam("threshold", "The income threshold to check against (e.g., 5500)")
  .setAction(async (taskArgs, hre) => {
    const { address, threshold } = taskArgs;
    // 构建部署文件路径
    const deploymentFilePath = path.join(__dirname, "..", "deployments", hre.network.name, "EncryptedIncomeGate.json");
    // 检查部署文件是否存在
    if (!fs.existsSync(deploymentFilePath)) {
      console.error(`Deployment file not found for network ${hre.network.name}. Please deploy the contract first.`);
      return;
    }
    // 读取部署信息
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const deployment = require(deploymentFilePath);
    const contractAddress = deployment.EncryptedIncomeGate.address;
    console.log(`Verifying income threshold for address ${address} against ${threshold}...`);
    console.log(`Using contract at: ${contractAddress}`);
    // 获取合约实例
    const EncryptedIncomeGate = await hre.ethers.getContractFactory("EncryptedIncomeGate");
    const contract = EncryptedIncomeGate.attach(contractAddress);
    // 检查用户是否提交过收入
    try {
      const hasSubmitted = await contract.hasUserSubmitted(address);
      console.log(`Address ${address} has submitted income:`, hasSubmitted);
      if (hasSubmitted) {
        // 执行收入验证
        const isAboveThreshold = await contract.verifyIncomeThreshold(threshold);
        console.log(
          `\nResult: Address ${address}'s income is ${isAboveThreshold ? "AT OR ABOVE" : "BELOW"} the threshold of ${threshold}.`,
        );
      } else {
        console.log(`\nCannot verify: Address ${address} has not submitted any income.`);
      }
    } catch (error) {
      console.error("Error verifying income threshold:", error);
    }
  });
