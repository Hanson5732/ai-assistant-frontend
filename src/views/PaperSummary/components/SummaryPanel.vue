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
          v-if="!loading && summary && showRefresh"
          @click="handleRefresh"
          class="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          title="Regenerate summary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
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
import { defineProps, defineEmits, ref, watch, computed } from 'vue'

const props = defineProps({
  loading: Boolean,
  summary: [String, Object],
  selectedSize: {
    type: String,
    default: 'medium'
  }
})

const emit = defineEmits(['update:size'])

const showRefresh = ref(true)
const summaryData = computed(() => {
  if (!props.summary) return null
  if (typeof props.summary === 'object') return props.summary
  try {
    return JSON.parse(props.summary)
  } catch (e) {
    return null // 如果流式传输尚未完成，解析失败则暂不显示
  }
})

watch(() => props.loading, (val) => {
  if (val) showRefresh.value = false
  else if (summaryData.value) showRefresh.value = true
})

const handleRefresh = () => {
  showRefresh.value = false
  emit('refresh')
}
</script>