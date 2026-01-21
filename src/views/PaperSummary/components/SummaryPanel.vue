<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[500px]">
    <div class="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
      <h3 class="font-bold text-gray-700 font-serif italic text-lg">DeepSeek Summary</h3>
      <div class="flex items-center space-x-2">
        <select 
          :value="selectedSize" 
          @change="$emit('update:size', $event.target.value)"
          class="text-xs border rounded-md px-2 py-1 bg-white focus:ring-1 focus:ring-indigo-500"
        >
          <option value="small">Short (100 words)</option>
          <option value="medium">Standard (200 words)</option>
          <option value="large">Detailed Breakdown</option>
        </select>

        <button 
          v-if="!summaryData"
          @click="handleGenerate(file, selectedSize)"
          :disabled="loading || !file"
          class="text-xs px-3 py-1.5 rounded-md transition-colors font-medium"
          :class="[
            (loading || !file) 
              ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          ]"
        >
          {{ loading ? 'Generating...' : 'Generate' }}
        </button>
        
      </div>
    </div>

    <div class="p-6 overflow-y-auto text-sm text-gray-700 leading-relaxed scrollbar-thin">
      <div v-if="loading" class="flex flex-col items-center justify-center h-full space-y-4 text-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p class="text-gray-400">Processing abstractive summary via DeepSeek...</p>
      </div>

      <div v-else-if="summaryData" class="space-y-8">
        <section>
          <h4 class="flex items-center font-bold text-indigo-900 mb-2 uppercase tracking-wider text-xs">
            <span class="w-1 h-4 bg-indigo-600 mr-2 rounded"></span> Abstract
          </h4>
          <p class="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 italic">
            {{ summaryData.abstract }}
          </p>
        </section>

        <section>
          <h4 class="flex items-center font-bold text-indigo-900 mb-2 uppercase tracking-wider text-xs">
            <span class="w-1 h-4 bg-indigo-600 mr-2 rounded"></span> Detailed Breakdown
          </h4>
          <div class="grid gap-4">
            <div v-for="(content, key) in summaryData.structured_breakdown" :key="key" class="border-l-2 border-gray-100 pl-4">
              <p class="font-semibold text-gray-800 capitalize mb-1">{{ key }}</p>
              <p class="text-gray-600 text-xs leading-normal">{{ content }}</p>
            </div>
          </div>
        </section>

        <section>
          <h4 class="flex items-center font-bold text-indigo-900 mb-2 uppercase tracking-wider text-xs">
            <span class="w-1 h-4 bg-indigo-600 mr-2 rounded"></span> Terminology
          </h4>
          <div class="flex flex-wrap gap-2">
            <div v-for="item in summaryData.key_term" :key="item.term" class="group relative">
              <span class="px-2 py-1 bg-white border border-gray-200 rounded text-xs cursor-help hover:border-indigo-400 hover:text-indigo-600 transition-colors">
                {{ item.term }}
              </span>
              <div class="absolute bottom-full left-0 mb-2 w-64 p-2 bg-gray-800 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                {{ item.definition }}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h4 class="flex items-center font-bold text-indigo-900 mb-2 uppercase tracking-wider text-xs">
            <span class="w-1 h-4 bg-indigo-600 mr-2 rounded"></span> Logical Relations
          </h4>
          <ul class="space-y-1">
            <li v-for="(relation, index) in summaryData.knowledge_graph" :key="index" class="text-xs text-gray-500 font-mono">
              <span class="text-indigo-400 mr-2">#</span> {{ relation }}
            </li>
          </ul>
        </section>
      </div>

      <div v-else class="flex items-center justify-center h-full text-gray-400 italic">
        Upload a paper to see the AI summary.
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps({
  loading: Boolean,
  summary: [String, Object],
  selectedSize: {
    type: String, 
    default: 'medium'
  },
  file: {
    type: [File, Object],
    default: null
  },
  sessionId: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:size', 'generate'])

// 解析摘要数据的计算属性
const summaryData = computed(() => {
  if (!props.summary) return null
  if (typeof props.summary === 'object') return props.summary
  try {
    return JSON.parse(props.summary)
  } catch (e) {
    return null
  }
})

const handleGenerate = () => {
  if (!props.file || props.loading) return
  emit('generate')
}
</script>