<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[500px]">
    <div class="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
      <h3 class="font-bold text-gray-700 font-serif italic text-lg">DeepSeek Summary</h3>
      <select class="text-xs border rounded-md px-2 py-1 bg-white focus:ring-1 focus:ring-indigo-500">
        <option>Short (100 words)</option>
        <option selected>Standard (200 words)</option>
        <option>Detailed Breakdown</option>
      </select>
    </div>
    <div class="p-6 overflow-y-auto text-sm text-gray-700 leading-relaxed scrollbar-thin">
      <div v-if="loading" class="flex flex-col items-center justify-center h-full space-y-4 text-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p class="text-gray-400">Processing abstractive summary via BART/T5 models...</p>
      </div>
      <div v-else class="space-y-4">
        <div class="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
          <p class="font-bold text-indigo-900 text-base mb-1">Core Objective</p>
          <p>This report documents the analysis and design of an AI-Powered Assistant focused on minimizing information overload in academia through automated summarization and RAG-based Q&A.</p>
        </div>
        <p class="font-bold text-gray-800 border-b pb-1">Key Contributions:</p>
        <ul class="list-disc pl-5 space-y-2 text-gray-600">
          <li><strong>Minimal-Input Intent Inference:</strong> Leveraging DeepSeek API to understand brief user queries.</li>
          <li><strong>Style-Accurate Citations:</strong> Supporting multiple formats with 95% metadata accuracy.</li>
          <li><strong>Zotero Integration:</strong> Direct export functionality for bibliography management.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps(['loading'])
</script>