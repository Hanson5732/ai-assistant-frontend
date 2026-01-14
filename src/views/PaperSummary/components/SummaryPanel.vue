<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[500px]">
    <div class="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
      <h3 class="font-bold text-gray-700 font-serif italic text-lg">DeepSeek Summary</h3>
      <select 
        :value="selectedSize" 
        @change="$emit('update:size', $event.target.value)"
        class="text-xs border rounded-md px-2 py-1 bg-white focus:ring-1 focus:ring-indigo-500"
      >
        <option value="Short">Short (100 words)</option>
        <option value="Standard">Standard (200 words)</option>
        <option value="Detailed">Detailed Breakdown</option>
      </select>
    </div>

    <div class="p-6 overflow-y-auto text-sm text-gray-700 leading-relaxed scrollbar-thin">
      <div v-if="loading" class="flex flex-col items-center justify-center h-full space-y-4 text-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        <p class="text-gray-400">Processing abstractive summary via DeepSeek...</p>
      </div>

      <div v-else-if="summary" class="space-y-4">
        <div class="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
          <p class="font-bold text-indigo-900 text-base mb-1">Core Objective</p>
          <p>{{ summary }}</p> 
        </div>
      </div>

      <div v-else class="flex items-center justify-center h-full text-gray-400 italic">
        Upload a paper to see the AI summary.
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  loading: Boolean,
  summary: String,
  selectedSize: String
})

defineEmits(['update:size'])
</script>