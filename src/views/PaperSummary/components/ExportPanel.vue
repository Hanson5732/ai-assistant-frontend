<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-center gap-6">
    <div class="flex flex-col sm:flex-row items-center gap-4 text-sm">
      <span class="text-gray-500 font-bold text-xs uppercase tracking-widest">Citation Style:</span>
      
      <div class="flex bg-gray-100 rounded-xl p-1 shadow-inner">
        <button 
          v-for="style in styles" 
          :key="style"
          @click="currentStyle = style"
          :class="[
            'px-4 py-1.5 rounded-lg transition-all font-bold',
            currentStyle === style 
              ? 'bg-white shadow-md text-indigo-600' 
              : 'hover:bg-gray-200 text-gray-600'
          ]"
        >
          {{ style }}
        </button>
      </div>
    </div>

    <button 
      @click="handleExport"
      class="w-full md:w-auto px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center justify-center gap-2 font-bold transition-all transform active:scale-95 shadow-md"
    >
      <span>🔖</span> Export to Zotero
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const styles = ['APA', 'MLA', 'IEEE', 'Harvard']

const currentStyle = ref('APA')

const handleExport = () => {
  alert(`已触发导出！格式：${currentStyle.value}`)
}
</script>