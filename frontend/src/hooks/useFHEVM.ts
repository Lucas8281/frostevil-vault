import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";

export function useFHEVM() {
  // 状态管理：是否连接钱包、当前钱包地址
  const isConnected = ref(false);
  const account = ref(null);

  // 连接钱包方法
  const connectWallet = async () => {
    try {
      // 检查是否安装 MetaMask（window.ethereum 是 MetaMask 注入的全局对象）
      if (!window.ethereum) {
        ElMessage.warning("请安装 MetaMask 钱包插件后重试");
        return;
      }
      // 请求用户授权连接钱包，返回授权的账户列表
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      // 更新状态：连接成功
      account.value = accounts[0];
      isConnected.value = true;
      console.log("钱包连接成功:", accounts[0]);
    } catch (error) {
      console.error("钱包连接失败:", error);
      ElMessage.error("钱包连接失败，请重试");
    }
  };

  // 页面挂载时自动检测是否已连接钱包（无需用户再次点击）
  onMounted(async () => {
    if (!window.ethereum) return;
    try {
      // 查询已授权的账户（不弹出授权弹窗）
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      // 若已有授权账户，自动更新连接状态
      if (accounts.length > 0) {
        account.value = accounts[0];
        isConnected.value = true;
      }
    } catch (error) {
      console.error("检测钱包连接状态失败:", error);
    }
  });

  return {
    isConnected, // 是否连接成功（布尔值）
    account, // 连接的钱包地址（字符串/null）
    connectWallet, // 手动连接钱包的方法
  };
}
