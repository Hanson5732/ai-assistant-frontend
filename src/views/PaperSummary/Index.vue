<template>
  <main class="flex-1 p-4 md:p-8 overflow-y-auto">
    <div class="max-w-5xl mx-auto space-y-6">
        
      <header class="mb-8">
        <h2 class="text-2xl font-bold text-gray-800">Research Workspace</h2>
        <p class="text-gray-500 text-sm">Upload papers to generate summaries and citations using DeepSeek API.</p>
      </header>

      <FileUpload @file-selected="handleFileUpload" />

      <SummaryPanel :loading="loading" />

      <ChatPanel />

      <ExportPanel />

    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
// import { processPaper } from '@/apis/paper'
import FileUpload from './components/FileUpload.vue'
import SummaryPanel from './components/SummaryPanel.vue'
import ChatPanel from './components/ChatPanel.vue'
import ExportPanel from './components/ExportPanel.vue'

const loading = ref(false)
</script>

<style>

</style>