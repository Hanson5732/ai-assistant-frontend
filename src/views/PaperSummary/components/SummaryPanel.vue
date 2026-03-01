<template>
  <div class="bg-white rounded-2xl border border-gray-200/60 flex flex-col h-[500px] overflow-hidden">
    <div class="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-gray-400">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="font-medium text-gray-700 text-sm">Paper Summary</h3>
    </div>

    <div class="p-6 overflow-y-auto text-sm text-gray-800 leading-relaxed custom-scrollbar bg-[#FAFAFA]">
      <div v-if="loading" class="flex flex-col items-center justify-center h-full space-y-4 text-center">
        <svg class="animate-spin h-6 w-6 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-500 text-sm">Analyzing document...</p>
      </div>

      <div v-else-if="summary" class="markdown-body">
        <div v-html="renderedHtml" class="prose prose-sm md:prose-base max-w-none text-gray-800"></div>
      </div>

      <div v-else class="flex items-center justify-center h-full text-gray-400 text-sm">
        Upload a paper to see the AI summary.
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

const props = defineProps({
  loading: Boolean,
  summary: String,
  selectedSize: { type: String, default: 'medium' },
  file: { type: [File, Object], default: null },
  sessionId: { type: String, required: true }
})

const renderedHtml = computed(() => {
  if (!props.summary) return ''
  return md.render(props.summary)
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
.custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #d1d5db; }

/* 极简 Markdown 样式覆盖 */
.markdown-body :deep(h1), 
.markdown-body :deep(h2), 
.markdown-body :deep(h3) {
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: #111827; /* gray-900 */
}
.markdown-body :deep(p) { margin-bottom: 1rem; line-height: 1.7; }
.markdown-body :deep(ul) { list-style-type: disc; padding-left: 1.25rem; margin-bottom: 1rem; }
.markdown-body :deep(li) { margin-bottom: 0.5rem; }
.markdown-body :deep(strong) { font-weight: 600; color: #000; }
</style>