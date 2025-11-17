<template>
  <div class="container mx-auto p-6 max-w-2xl">
    <!-- 钱包连接提示 -->
    <div v-if="!isConnected" class="text-center py-10">
      <el-alert type="warning" title="请先连接钱包" show-icon />
      <el-button type="primary" size="large" @click="connectWallet" class="mt-4"> 连接MetaMask钱包 </el-button>
    </div>

    <!-- 已连接钱包：提交收入 + 验证功能 -->
    <div v-else class="space-y-8">
      <!-- 提交收入表单 -->
      <el-card shadow="hover">
        <h3 class="text-xl font-semibold mb-4">提交你的收入（模拟加密）</h3>

        <el-form :model="incomeForm" :rules="incomeRules" ref="incomeFormRef">
          <el-form-item label="月收入（元）" prop="income">
            <el-input
              v-model.number="incomeForm.income"
              type="number"
              placeholder="输入你的月收入"
              min="0"
              max="100000"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSubmitIncome" :loading="isLoading" class="w-full">
              {{ isLoading ? "加密提交中..." : "加密提交收入" }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 提交成功提示 -->
        <el-alert
          v-if="submitSuccess"
          type="success"
          title="提交成功！"
          show-icon
          :description="`交易哈希（模拟）：${txHash}`"
          class="mt-4"
        />
      </el-card>

      <!-- 验证收入门槛 -->
      <el-card shadow="hover">
        <h3 class="text-xl font-semibold mb-4">验证收入是否达标（模拟）</h3>

        <el-form :model="verifyForm" :rules="verifyRules" ref="verifyFormRef">
          <el-form-item label="收入门槛（元）" prop="threshold">
            <el-input
              v-model.number="verifyForm.threshold"
              type="number"
              placeholder="输入要验证的门槛（如5500）"
              min="0"
            />
          </el-form-item>

          <el-form-item>
            <el-button type="success" @click="handleVerifyIncome" :loading="isLoading" class="w-full">
              {{ isLoading ? "验证中..." : "验证是否达标" }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 验证结果 -->
        <div v-if="verificationResult !== null" class="mt-4">
          <el-result
            :icon="verificationResult ? 'success' : 'error'"
            :title="verificationResult ? '✅ 收入达标！' : '❌ 收入未达标'"
          >
            <template #subTitle> 你的收入{{ verificationResult ? "≥" : "<" }} {{ verifyForm.threshold }}元 </template>
          </el-result>
        </div>
      </el-card>

      <!-- 查看统计数据 -->
      <el-card shadow="hover">
        <h3 class="text-xl font-semibold mb-4">加密统计数据（模拟）</h3>

        <el-button type="info" @click="handleGetStats" :loading="isLoading" class="mb-4">
          {{ isLoading ? "加载中..." : "获取统计数据" }}
        </el-button>

        <div v-if="stats" class="grid grid-cols-2 gap-4">
          <el-statistic :value="stats.totalUsers" label="总提交用户数" />
          <el-statistic :value="stats.averageIncome" label="平均收入（加密）" />
          <el-statistic :value="stats.minIncome" label="最低收入（加密）" />
          <el-statistic :value="stats.maxIncome" label="最高收入（加密）" />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useFHEVM } from "@/hooks/useFHEVM";
import { useEncryptedIncomeGate } from "@/hooks/useEncryptedIncomeGate";
import { ElAlert, ElButton, ElCard, ElForm, ElFormItem, ElInput, ElMessage, ElResult, ElStatistic } from "element-plus";

// 钱包相关
const { isConnected, connectWallet, account } = useFHEVM();

// 收入提交相关
const { isLoading, submitEncryptedIncome, verifyIncomeThreshold, getEncryptedStats, hasUserSubmitted } =
  useEncryptedIncomeGate();

// 表单状态
const incomeFormRef = ref(null);
const incomeForm = ref({ income: "" });
const incomeRules = ref({
  income: [{ required: true, message: "请输入月收入", trigger: "blur" }],
});

// 验证表单状态
const verifyFormRef = ref(null);
const verifyForm = ref({ threshold: 5500 }); // 默认验证5500门槛
const verifyRules = ref({
  threshold: [{ required: true, message: "请输入收入门槛", trigger: "blur" }],
});

// 结果状态
const submitSuccess = ref(false);
const txHash = ref("");
const verificationResult = ref(null);
const stats = ref(null);

// 页面挂载时，检查是否已提交过收入
onMounted(async () => {
  if (isConnected.value && account.value) {
    const hasSubmitted = await hasUserSubmitted();
    if (hasSubmitted) {
      ElMessage.info("你已提交过收入，可直接进行验证");
    }
  }
});

// 提交收入（模拟加密提交）
const handleSubmitIncome = async () => {
  await incomeFormRef.value.validate();
  submitSuccess.value = false;

  try {
    // 模拟：前端加密（实际是直接传原始收入，模拟加密过程）
    const rawIncome = incomeForm.value.income;
    const mockProof = new Uint8Array(0); // 模拟零知识证明

    // 调用模拟Hook提交
    const result = await submitEncryptedIncome(rawIncome, mockProof);
    submitSuccess.value = true;
    txHash.value = result.txHash;
    ElMessage.success("收入提交成功！");
  } catch (error) {
    ElMessage.error(error.message);
  }
};

// 验证收入门槛
const handleVerifyIncome = async () => {
  await verifyFormRef.value.validate();
  verificationResult.value = null;
  try {
    verificationResult.value = await verifyIncomeThreshold(verifyForm.value.threshold);
  } catch (error) {
    ElMessage.error(error.message);
  }
};

// 获取统计数据
const handleGetStats = async () => {
  try {
    stats.value = await getEncryptedStats();
  } catch (error) {
    ElMessage.error(error.message);
  }
};
</script>
