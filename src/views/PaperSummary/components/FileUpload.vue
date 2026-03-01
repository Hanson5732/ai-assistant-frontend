<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-200/60 p-6 transition-all hover:border-gray-300">
      <h3 class="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 text-gray-500">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        Upload PDF
      </h3>
      <div
        @click="triggerInput" 
        class="border border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 hover:border-gray-400 transition-colors cursor-pointer group flex flex-col items-center justify-center">
        
        <div class="w-10 h-10 mb-3 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:text-black group-hover:bg-gray-200 transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        
        <p class="text-gray-600 text-sm">Drag and drop file here or <span class="font-medium text-black">browse</span></p>
        <p class="text-xs text-gray-400 mt-2">Max size: 20MB (Academic PDF only)</p>
        <input 
          type="file" 
          ref="fileInput" 
          class="hidden" 
          accept=".pdf" 
          @change="onFileChange" 
        />
      </div>
    </div>
    
    <div class="bg-[#FAFAFA] rounded-2xl border border-gray-200/60 p-6 flex flex-col">
      <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Active Document</h3>
      
      <div v-if="pdfFile.name" class="flex-1 flex flex-col justify-center">
        <div class="flex items-start space-x-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
          <div class="p-2.5 bg-gray-100 text-black rounded-lg shrink-0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div class="overflow-hidden min-w-0 flex-1">
            <p class="text-sm font-medium text-gray-900 truncate" :title="pdfFile.name">{{ pdfFile.name }}</p>
            <p class="text-xs text-gray-500 mt-0.5">{{ pdfFile.size }}</p>
            <button @click="removeFile" class="mt-2 text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
              Remove
            </button>
          </div>
        </div>
      </div>
      
      <div v-else class="flex-1 flex items-center justify-center">
        <p class="text-sm text-gray-400">No document selected</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, defineEmits } from 'vue'

const emit = defineEmits(['upload'])
const fileInput = ref(null)
const pdfFile = reactive({
  name: '',
  size: '',
  date: ''
})

const triggerInput = () => {
  fileInput.value.click()
}

const formatBytes = (bytes, decimals = 1) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    pdfFile.name = file.name
    pdfFile.size = formatBytes(file.size)
    const options = { month: 'short', day: 'numeric' }
    pdfFile.date = new Date().toLocaleDateString('en-US', options)
    emit('upload', file)
  }
}

const removeFile = () => {
  pdfFile.name = ''
  pdfFile.size = ''
  pdfFile.date = ''
  fileInput.value.value = null
  emit('upload', null)
}
</script>