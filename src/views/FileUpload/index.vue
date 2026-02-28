<template>
  <main class="flex-1 p-4 md:p-8 overflow-y-auto">
    <div class="max-w-3xl mx-auto">
      <div v-if="!selectedFile" class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">Upload a PDF file to Get a Summary</h2>
        <h2 class="text-2xl font-bold text-gray-800 mb-6">of the Research Paper</h2>
        <div 
          @click="triggerInput"
          class="border-4 border-dashed border-gray-100 rounded-2xl p-16 hover:border-indigo-200 transition-all cursor-pointer bg-gray-50 group"
        >
          <div class="text-5xl mb-4">📄</div>
          <p class="text-lg text-gray-600">Click or drag PDF here to start</p>
          <input type="file" ref="fileInput" class="hidden" accept=".pdf" @change="onFileChange" />
        </div>
      </div>

      <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center space-x-4">
            <div class="p-3 bg-red-100 text-red-600 rounded-xl font-bold text-xl">PDF</div>
            <div>
              <h3 class="font-bold text-gray-800">{{ selectedFile.name }}</h3>
              <p class="text-sm text-gray-400">{{ formatBytes(selectedFile.size) }}</p>
            </div>
          </div>
          <button @click="selectedFile = null" class="text-sm text-indigo-600 hover:underline">Change File</button>
        </div>

        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Length of Summary</label>
            <select 
              v-model="selectedSize"
              class="w-full border rounded-lg px-4 py-2 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="small">Short (100 words)</option>
              <option value="medium">Standard (200 words)</option>
              <option value="large">Detailed Breakdown (400 words)</option>
            </select>
          </div>

          <button 
            @click="startAnalysis"
            :disabled="loading"
            class="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center"
          >
            <span v-if="loading" class="animate-spin mr-2">⏳</span>
            {{ loading ? 'Initializing...' : 'Upload and Analyze' }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const fileInput = ref(null)
const selectedFile = ref(null)
const selectedSize = ref('medium')
const loading = ref(false)

const triggerInput = () => fileInput.value.click()

const onFileChange = (e) => {
  const file = e.target.files[0]
  if (file) selectedFile.value = file
}

const formatBytes = (bytes) => (bytes / (1024 * 1024)).toFixed(2) + ' MB'

const startAnalysis = () => {
  loading.value = true
  // 这里跳转到详情页，并通过 state 传递文件对象
  router.push({
    name: 'PaperDetail',
    params: { sessionId: 'new' },
    state: { file: selectedFile.value, size: selectedSize.value }
  })
}
</script>