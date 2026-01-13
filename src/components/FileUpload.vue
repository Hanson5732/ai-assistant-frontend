<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <span class="text-indigo-600">📤</span> Upload PDF Paper
      </h3>
      <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer group">
        <p class="text-gray-500 group-hover:text-indigo-600">Drag and drop file here or <span class="font-medium underline">browse</span></p>
        <p class="text-xs text-gray-400 mt-2">Max size: 20MB (Academic PDF only)</p>
      </div>
    </div>
    
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Active Document</h3>
      <div v-if="hasFile" class="flex items-start space-x-3">
        <div class="p-2 bg-red-100 text-red-600 rounded-lg font-bold text-xs">PDF</div>
        <div class="overflow-hidden">
          <p class="text-sm font-semibold text-gray-700 truncate">Song_Jiale_FYP_Report.pdf</p>
          <p class="text-xs text-gray-400">1.4 MB • Uploaded Oct 26</p>
          <button class="mt-3 text-xs text-red-500 hover:text-red-700 font-medium">Remove File</button>
        </div>
      </div>
      <p v-else class="text-sm text-gray-400 italic">No document selected</p>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps(['hasFile'])
</script>