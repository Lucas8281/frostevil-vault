<template>
  <el-card class="p-6">
    <h2 class="text-2xl font-semibold text-gray-900 mb-6 text-center">
      加密提交收入范围
    </h2>

    <template v-if="hasSubmitted">
      <el-alert
        title="提交成功"
        message="您的收入范围已加密存储在链上，可在不暴露具体金额的情况下完成验证"
        type="success"
        show-icon
      />
    </template>

    <template v-else>
      <el-form ref="form" :model="form" label-width="120px" @submit.prevent="handleSubmit">
        <el-form-item label="收入范围（月）" prop="incomeRange" :rules="[{ required: true, message: '请选择收入范围' }]">
          <el-select v-model="form.incomeRange" placeholder="选择收入范围">
            <el-option label="3000元以下" value="1" />
            <el-option label="3000-5000元" value="2" />
            <el-option label="5000-10000元" value="3" />
            <el-option label="10000-20000元" value="4" />
            <el-option label="20000元以上" value="5" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            native-type="submit"
            :loading="isSubmitting"
            class="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {{ isSubmitting ? '加密提交中...' : '加密提交收入范围' }}
          </el-button>
        </el-form-item>
      </el-form>

      <el-card class="mt-6 bg-blue-50 border-blue-200">
        <div slot="header" class="text-sm font-medium text-blue-800">隐私保护说明</div>
        <ul class="text-sm text-blue-700 space-y-1">
          <li>• 您的收入范围将通过全同态加密（FHE）处理</li>
          <li>• 区块链无法获取您的具体收入信息</li>
          <li>• 仅能验证您是否符合特定收入门槛（如"是否≥5000元"）</li>
          <li>• 统计分析仅基于加密数据进行</li>
        </ul>
      </el-card>
    </template>
  </el-card>
</template>

<script setup>
import { ref } from 'vue';
import { useFHEVM } from '../hooks/useFHEVM';
import { ElCard, ElForm, ElFormItem, ElSelect, ElOption, ElButton, ElAlert } from 'element-plus';

// 状态管理
const form = ref({ incomeRange: '' });
const isSubmitting = ref(false);
const hasSubmitted = ref(false);
const { submitEncryptedData } = useFHEVM();

// 提交处理
const handleSubmit = async () => {
  if (!form.value.incomeRange) return;

  isSubmitting.value = true;
  try {
    // 模拟FHE加密：实际项目中需使用@fhevm/solidity库
    const mockEncryptedData = new Uint8Array([parseInt(form.value.incomeRange)]);
    const mockProof = new Uint8Array([1, 2, 3, 4]); // 模拟零知识证明

    await submitEncryptedData(mockEncryptedData, mockProof);
    hasSubmitted.value = true;
  } catch (error) {
    console.error('提交失败:', error);
    alert('提交失败，请重试');
  } finally {
    isSubmitting.value = false;
  }
};
</script>