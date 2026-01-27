<template>
  <main class="flex-1 p-4 md:p-8 overflow-y-auto">
    <div class="max-w-5xl mx-auto space-y-6">
      
      <div v-if="paperTitle" class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h1 class="text-2xl font-serif font-bold text-indigo-950">
          <span class="text-indigo-600 mr-2">📚</span> {{ paperTitle }}
        </h1>
      </div>

      <SummaryPanel 
        :loading="loading"
        :summary="displaySummary" 
        :file="selectedFile"
        :sessionId="sessionId"
      />

      <ChatPanel v-if="sessionId" :sessionId="sessionId" />
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { processPaper, getSessionDetail } from '@/apis/paper'
import SummaryPanel from './components/SummaryPanel.vue'
import ChatPanel from './components/ChatPanel.vue'

const route = useRoute()

const loading = ref(false)
const selectedFile = ref(null)
const sessionId = ref('')
const rawSummary = ref('') 
const paperTitle = ref('') 
const selectedSize = ref('medium')

const displaySummary = computed(() => {
  return rawSummary.value.replace(/^Title:\s*.*\n?/, '').trim()
})

const loadData = async () => {
  const sId = route.params.sessionId
  
  // 场景 A：从上传页跳转过来的新文件 (sId 为 'new' 且 state 中有 file)
  if (sId === 'new' && history.state?.file) {
    selectedFile.value = history.state.file
    selectedSize.value = history.state.size || 'medium'
    handleGenerate()
    return
  }

  // 场景 B：点击侧边栏或直接刷新页面 (sId 是具体的 ID)
  if (sId && sId !== 'new') {
    sessionId.value = sId
    try {
      loading.value = true
      const res = await getSessionDetail(sId)
      // 假设返回数据结构包含 title 和 summary
      paperTitle.value = res.data.title
      rawSummary.value = res.data.summary
    } catch (error) {
      //
    } finally {
      loading.value = false
    }
  }
}

watch(() => route.params.sessionId, () => {
  loadData()
})

onMounted(() => {
  loadData()
})

onMounted(() => {
  // 从路由 state 获取上传页传来的文件
  if (history.state.file) {
    selectedFile.value = history.state.file
    selectedSize.value = history.state.size || 'medium'
    handleGenerate()
  }
})

const handleGenerate = async () => {
  if (!selectedFile.value || loading.value) return
  
  loading.value = true
  rawSummary.value = ''
  
  try {
    await processPaper(
      selectedFile.value, 
      selectedSize.value, 
      sessionId.value, 
      (chunk) => {
        // 1. 提取 SESSION_ID
        if (chunk.includes('SESSION_ID:')) {
          const match = chunk.match(/SESSION_ID:([\w-]+)/)
          if (match) sessionId.value = match[1]
          chunk = chunk.replace(/SESSION_ID:[\w-]+\n?/, '')
        }
        
        // 2. 实时提取 Title (如果包含)
        if (chunk.includes('Title:')) {
            const titleMatch = chunk.match(/Title:\s*(.*)/)
            if (titleMatch) paperTitle.value = titleMatch[1].split('\n')[0]
        }
        
        rawSummary.value += chunk
      }
    )
  } catch (error) {
    console.error('Error:', error)
  } finally {
    loading.value = false
  }
}
</script>