<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <span class="text-indigo-600">📤</span> Upload PDF Paper
      </h3>
      <div
        @click="triggerInput" 
        class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer group">
        <p class="text-gray-500 group-hover:text-indigo-600">Drag and drop file here or <span class="font-medium underline">browse</span></p>
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
    
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Active Document</h3>
      <div v-if="pdfFile.name" class="flex items-start space-x-3">
        <div class="p-2 bg-red-100 text-red-600 rounded-lg font-bold text-xs">PDF</div>
        <div class="overflow-hidden">
          <p class="text-sm font-semibold text-gray-700 truncate">{{ pdfFile.name }}</p>
          <p class="text-xs text-gray-400">{{ pdfFile.size }} • Uploaded {{ pdfFile.date }}</p>
          <button @click="removeFile" class="mt-3 text-xs text-red-500 hover:text-red-700 font-medium">Remove File</button>
        </div>
      </div>
      <p v-else class="text-sm text-gray-400 italic">No document selected</p>
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

// 点击虚线框触发 input
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

// 当用户选择文件时
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