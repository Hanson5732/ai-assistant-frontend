<template>
  <main class="flex-1 p-4 md:p-8 overflow-y-auto">
    <div class="max-w-5xl mx-auto space-y-6">
        
      <header class="mb-8">
        <h2 class="text-2xl font-bold text-gray-800">Research Workspace</h2>
        <p class="text-gray-500 text-sm">Upload papers to generate summaries and citations using DeepSeek API.</p>
      </header>

      <FileUpload @file-selected="handleFileUpload" />

      <SummaryPanel 
        :loading="loading"
        :summary="summary"
        :selectedSize="selectedSize"
        :file="selectedFile"
        :sessionId="sessionId"
        @generate="handleGenerate"
        @update:size="s => selectedSize = s"
      />

      <ChatPanel />

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
        summary.value = chunk 
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