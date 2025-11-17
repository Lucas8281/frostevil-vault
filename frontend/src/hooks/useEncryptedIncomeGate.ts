import { ref } from "vue";
import { useFHEVM } from "./useFHEVM"; // 复用之前的钱包连接Hook

export function useEncryptedIncomeGate() {
  const { isConnected, account } = useFHEVM();
  const isLoading = ref(false);
  // 模拟：存储用户提交的模拟加密收入（前端本地临时存储，刷新后消失）
  const mockUserIncomeStore = ref({});

  // -------------------------- 核心模拟函数 --------------------------
  /**
   * 模拟提交加密收入
   * @param rawIncome 模拟的原始收入（实际场景是加密后的密文，这里简化为直接传原始值）
   * @param proof 模拟的零知识证明（这里用空数据占位）
   */
  const submitEncryptedIncome = async (rawIncome, proof) => {
    if (!isConnected.value || !account.value) {
      throw new Error("请先连接钱包");
    }
    isLoading.value = true;
    try {
      // 模拟链上交互延迟（1.5秒）
      await new Promise((resolve) => setTimeout(resolve, 1500));
      // 模拟：存储用户提交的收入（前端本地临时存，模拟链上存储）
      mockUserIncomeStore.value[account.value] = {
        income: rawIncome, // 模拟加密后的收入（实际是原始值，仅作演示）
        submittedAt: new Date().toISOString(),
        txHash: `0x${Math.random().toString(16).substring(2, 34)}`, // 模拟交易哈希
      };
      console.log("【模拟】提交加密收入成功", {
        account: account.value,
        rawIncome,
        txHash: mockUserIncomeStore.value[account.value].txHash,
      });
      return {
        success: true,
        txHash: mockUserIncomeStore.value[account.value].txHash,
      };
    } catch (error) {
      console.error("【模拟】提交加密收入失败:", error);
      throw new Error("提交失败：" + error.message);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 模拟验证收入是否达到门槛（如5500）
   * @param threshold 收入门槛（如5500）
   */
  const verifyIncomeThreshold = async (threshold) => {
    if (!isConnected.value || !account.value) {
      throw new Error("请先连接钱包");
    }
    isLoading.value = true;
    try {
      // 模拟链上查询延迟（1秒）
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // 模拟：检查用户是否提交过收入
      const userData = mockUserIncomeStore.value[account.value];
      if (!userData) {
        throw new Error("尚未提交收入，请先提交");
      }
      // 模拟验证逻辑：收入 >= 门槛 → 返回true，否则false
      const isAboveThreshold = userData.income >= threshold;
      console.log("【模拟】收入验证结果", {
        account: account.value,
        userIncome: userData.income,
        threshold,
        isAboveThreshold,
      });
      return isAboveThreshold;
    } catch (error) {
      console.error("【模拟】收入验证失败:", error);
      throw new Error("验证失败：" + error.message);
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 模拟获取加密统计数据
   */
  const getEncryptedStats = async () => {
    isLoading.value = true;
    try {
      // 模拟链上查询延迟（1秒）
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // 模拟加密统计结果（和真实合约返回格式一致，只是值为模拟加密标识）
      return {
        totalUsers: "[加密数据] 128",
        averageIncome: "[加密数据] 8500",
        minIncome: "[加密数据] 3000",
        maxIncome: "[加密数据] 25000",
      };
    } catch (error) {
      console.error("【模拟】获取统计数据失败:", error);
      throw new Error("获取统计数据失败");
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * 模拟检查用户是否已提交收入
   */
  const hasUserSubmitted = async (userAddress) => {
    const address = userAddress || account.value;
    if (!address) return false;
    // 模拟链上查询延迟（500毫秒）
    await new Promise((resolve) => setTimeout(resolve, 500));
    // 模拟：检查本地存储中是否有该用户的提交记录
    return !!mockUserIncomeStore.value[address];
  };

  return {
    isLoading,
    submitEncryptedIncome, // 提交收入（模拟）
    verifyIncomeThreshold, // 验证收入门槛（模拟）
    getEncryptedStats, // 获取统计数据（模拟）
    hasUserSubmitted, // 检查是否提交（模拟）
  };
}
