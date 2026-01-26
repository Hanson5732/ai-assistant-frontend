<template>
  <main class="flex-1 p-4 md:p-8 overflow-y-auto">
    <div class="max-w-5xl mx-auto space-y-6">

      <FileUpload @upload="handleFileUpload" />

      <SummaryPanel 
        :loading="loading"
        :summary="summary"
        :selectedSize="selectedSize"
        :file="selectedFile"
        :sessionId="sessionId"
        @generate="handleGenerate"
        @update:size="s => selectedSize = s"
      />

      <ChatPanel :sessionId="sessionId" />

      <ExportPanel />

    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { processPaper } from '@/apis/paper'
import FileUpload from './components/FileUpload.vue'
import SummaryPanel from './components/SummaryPanel.vue'
import ChatPanel from './components/ChatPanel.vue'
import ExportPanel from './components/ExportPanel.vue'

const loading = ref(false)
const selectedFile = ref(null)
const sessionId = ref('')
const summary = ref('')
const selectedSize = ref('medium')

const handleFileUpload = (file) => {
  selectedFile.value = file
  summary.value = ''
  loading.value = false
}


const handleGenerate = async () => {
  if (!selectedFile.value || loading.value) return
  
  loading.value = true
  summary.value = ''
  
  try {
    await processPaper(
      selectedFile.value, 
      selectedSize.value, 
      sessionId.value, 
      (chunk) => {
        // 1. 提取 SESSION_ID (如果 chunk 包含它)
        if (chunk.includes('SESSION_ID:')) {
          const match = chunk.match(/SESSION_ID:([\w-]+)/)
          if (match) sessionId.value = match[1]
          // 移除 SESSION_ID 部分，剩下的可能是 JSON 内容
          chunk = chunk.replace(/SESSION_ID:[\w-]+\n?/, '')
        }
        
        // 2. 累加内容
        summary.value += chunk
      }
    )
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}


</script>

<style>

</style>