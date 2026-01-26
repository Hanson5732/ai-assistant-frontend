<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[500px]">
    <div class="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
      <h3 class="font-bold text-gray-700 font-serif text-lg">DeepSeek Summary</h3>
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
          v-if="!summary"
          @click="handleGenerate"
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

      <div v-else-if="summary" class="markdown-body">
        <div v-html="renderedHtml" class="prose prose-sm prose-indigo max-w-none"></div>
      </div>

      <div v-else class="flex items-center justify-center h-full text-gray-400 italic">
        Upload a paper to see the AI summary.
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue'
import MarkdownIt from 'markdown-it'

// 初始化 Markdown 解析器
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

const props = defineProps({
  loading: Boolean,
  summary: String, // 直接接收后端的 Markdown 字符串内容
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

// 直接将 summary 字符串渲染为 HTML
const renderedHtml = computed(() => {
  if (!props.summary) return ''
  return md.render(props.summary)
})

const handleGenerate = () => {
  if (!props.file || props.loading) return
  emit('generate')
}
</script>

<style scoped>
/* 样式穿透：确保渲染出的 Markdown 标签有基本样式 */
.markdown-body :deep(h1), 
.markdown-body :deep(h2), 
.markdown-body :deep(h3) {
  font-weight: 700;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
  color: #1e1b4b; /* text-indigo-950 */
}
.markdown-body :deep(p) {
  margin-bottom: 0.75rem;
}
.markdown-body :deep(ul) {
  list-style-type: disc;
  padding-left: 1.25rem;
  margin-bottom: 0.75rem;
}
.markdown-body :deep(li) {
  margin-bottom: 0.25rem;
}
.markdown-body :deep(strong) {
  font-weight: 700;
  color: #4338ca; /* text-indigo-700 */
}
</style>