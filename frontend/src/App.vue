<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
    <div class="container mx-auto max-w-4xl">
      <!-- 头部 -->
      <div class="text-center my-8">
        <h1 class="text-4xl font-bold text-gray-900 mb-2">Private Income Vault</h1>
        <p class="text-lg text-gray-600">
          基于FHEVM的隐私保护收入验证系统，加密提交收入范围，无需暴露具体金额即可完成验证
        </p>
      </div>

      <!-- 钱包连接 -->
      <div v-if="!isConnected" class="text-center my-8">
        <el-button type="primary" size="large" @click="connectWallet" class="bg-indigo-600 hover:bg-indigo-700">
          连接钱包
        </el-button>
      </div>

      <!-- 标签页导航 -->
      <div v-if="isConnected" class="my-8">
        <el-tabs v-model="activeTab" type="card" class="w-full">
          <el-tab-pane label="提交收入范围" name="submit">
            <IncomeSubmissionForm />
          </el-tab-pane>
          <el-tab-pane label="查看统计数据" name="stats">
            <StatsDisplay />
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 底部 -->
      <div class="text-center mt-12 text-gray-500 text-sm">
        <p>基于FHEVM构建 • 隐私保护的收入数据验证</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useFHEVM } from "./hooks/useFHEVM";
import IncomeSubmissionForm from "./components/IncomeSubmissionForm.vue";
import StatsDisplay from "./components/StatsDisplay.vue";
import { ElButton, ElTabs, ElTabPane } from "element-plus";

// 状态管理
const activeTab = ref("submit");
const { isConnected, connectWallet } = useFHEVM();
</script>
