<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[500px]">
    <div class="p-4 border-b bg-gray-50 rounded-t-xl">
      <h3 class="font-bold text-gray-700">Contextual Q&A</h3>
    </div>

    <div class="p-4 border-t flex gap-2">
      <input 
        v-model="inputMsg" 
        @keyup.enter="sendMessage"
        :disabled="loading || !sessionId"
        placeholder="Ask a question about this paper..."
        class="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button 
        @click="sendMessage" 
        :disabled="loading || !sessionId"
        class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:bg-gray-400"
      >
        {{ loading ? '...' : 'Send' }}
      </button>
    </div>
  </div>
</template>

<script setup>
  import { ref, nextTick, defineProps } from 'vue'
import { chatWithPaper } from '@/apis/paper'

const props = defineProps({
  sessionId: String // 从父组件 Index.vue 传入
})

const messages = ref([])
const inputMsg = ref('')
const loading = ref(false)
const chatContainer = ref(null)

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const sendMessage = async () => {
  if (!inputMsg.value || loading.value || !props.sessionId) return

  const userText = inputMsg.value
  messages.value.push({ role: 'user', content: userText })
  inputMsg.value = ''
  loading.value = true

  // 先插入一个空的 AI 消息，用于承接流式输出
  const aiMsgIndex = messages.value.push({ role: 'assistant', content: '' }) - 1
  
  try {
    await chatWithPaper(userText, props.sessionId, (chunk) => {
      messages.value[aiMsgIndex].content += chunk
      scrollToBottom()
    })
  } catch (error) {
    messages.value[aiMsgIndex].content = "Error: Failed to get response."
  } finally {
    loading.value = false
  }
}
</script>