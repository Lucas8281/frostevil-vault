<template>
  <el-card class="p-6">
    <h2 class="text-2xl font-semibold text-gray-900 mb-6 text-center">加密统计数据</h2>

    <template v-if="isLoading">
      <div class="text-center">
        <el-loading-spinner />
        <p class="text-gray-600 mt-2">加载加密统计数据中...</p>
      </div>
    </template>

    <template v-else-if="stats">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <!-- 总用户数 -->
        <el-card class="bg-blue-50 border-blue-200">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm text-blue-600">总用户数</p>
              <p class="text-2xl font-bold text-blue-900">{{ stats.totalUsers }}</p>
            </div>
            <el-icon color="#4096ff" size="32">
              <User />
            </el-icon>
          </div>
        </el-card>

        <!-- 平均收入范围 -->
        <el-card class="bg-green-50 border-green-200">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm text-green-600">平均收入范围</p>
              <p class="text-2xl font-bold text-green-900">{{ stats.averageIncome }}</p>
            </div>
            <el-icon color="#52c41a" size="32">
              <DataLine />
            </el-icon>
          </div>
        </el-card>

        <!-- 最低收入范围 -->
        <el-card class="bg-purple-50 border-purple-200">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm text-purple-600">最低收入范围</p>
              <p class="text-2xl font-bold text-purple-900">{{ stats.minIncome }}</p>
            </div>
            <el-icon color="#722ed1" size="32">
              <Minus />
            </el-icon>
          </div>
        </el-card>

        <!-- 最高收入范围 -->
        <el-card class="bg-orange-50 border-orange-200">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm text-orange-600">最高收入范围</p>
              <p class="text-2xl font-bold text-orange-900">{{ stats.maxIncome }}</p>
            </div>
            <el-icon color="#fa8c16" size="32">
              <Plus />
            </el-icon>
          </div>
        </el-card>
      </div>

      <el-card class="bg-yellow-50 border-yellow-200">
        <div slot="header" class="text-sm font-medium text-yellow-800">隐私优先分析</div>
        <p class="text-sm text-yellow-700">
          以上所有统计数据均通过全同态加密直接在加密数据上计算得出， 个人用户数据完全隐私，同时支持聚合分析。
        </p>
      </el-card>

      <div class="text-center mt-6">
        <el-button type="primary" @click="loadStats" class="bg-indigo-600 hover:bg-indigo-700">
          <Refresh /> 刷新统计数据
        </el-button>
      </div>
    </template>

    <template v-else>
      <p class="text-center text-gray-500">无法加载统计数据，请稍后重试</p>
    </template>
  </el-card>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useFHEVM } from "../hooks/useFHEVM";
import { ElButton, ElCard } from "element-plus";
import { DataLine, Minus, Plus, Refresh, User } from "@element-plus/icons-vue";

// 状态管理
const stats = ref(null);
const isLoading = ref(true);
const { getEncryptedStats } = useFHEVM();

// 加载统计数据
const loadStats = async () => {
  isLoading.value = true;
  try {
    stats.value = await getEncryptedStats();
  } catch (error) {
    console.error("加载统计失败:", error);
    stats.value = null;
  } finally {
    isLoading.value = false;
  }
};

// 初始化加载
onMounted(loadStats);
</script>
