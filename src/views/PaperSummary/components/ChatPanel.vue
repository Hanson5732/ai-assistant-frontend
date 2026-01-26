<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[550px]">
    <div class="p-3 border-b bg-gray-50 flex justify-between items-center">
      <h3 class="font-bold text-gray-700 text-sm">Contextual Q&A</h3>
      <span v-if="sessionId" class="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded">
        Active Session: {{ sessionId.substring(0, 8) }}
      </span>
    </div>

    <div ref="chatContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
      <div v-for="(msg, index) in messages" :key="index" 
           :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">
        <div :class="[
          'max-w-[85%] px-3 py-2 rounded-lg text-sm',
          msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800 border'
        ]">
          {{ msg.content }}
        </div>
      </div>
      <div v-if="loading" class="text-xs text-gray-400 italic">AI is typing...</div>
    </div>

    <div class="p-4 border-t flex gap-2">
      <input 
        v-model="inputMsg" 
        @keyup.enter="sendMessage"
        :disabled="loading || !sessionId"
        placeholder="Ask something about the paper..."
        class="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button 
        @click="sendMessage" 
        :disabled="loading || !sessionId"
        class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
      >
        Send
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps } from 'vue'
import { chatWithPaper } from '@/apis/paper'

const props = defineProps({
  sessionId: String
})

const messages = ref([])
const inputMsg = ref('')
const loading = ref(false)
const chatContainer = ref(null)

// 加载历史详情
const loadSessionHistory = async () => {
  if (!props.sessionId) return
  try {
    const res = await fetch(`/api/chat/history/${props.sessionId}`)
    const result = await res.json()
    if (result.code === 200) {
      messages.value = result.data
    }
  } catch (e) {
    console.error("Load history error:", e)
  }
}

// 监听 sessionId 变化（如从侧边栏切换）
watch(() => props.sessionId, () => {
  loadSessionHistory()
}, { immediate: true })

const sendMessage = async () => {
  if (!inputMsg.value || loading.value || !props.sessionId) return

  const userText = inputMsg.value
  messages.value.push({ role: 'user', content: userText })
  inputMsg.value = ''
  loading.value = true

  // 插入 AI 占位
  const aiMsgIndex = messages.value.push({ role: 'assistant', content: '' }) - 1
  
  try {
    // 调用你在 src/apis/paper.js 中定义的原生 fetch 流式方法
    await chatWithPaper(userText, props.sessionId, (chunk) => {
      messages.value[aiMsgIndex].content += chunk
      // 滚动到底部逻辑可自行添加
    })
  } catch (error) {
    messages.value[aiMsgIndex].content = "Error: Connection failed."
  } finally {
    loading.value = false
  }
}
</script>