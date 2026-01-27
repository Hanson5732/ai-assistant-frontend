<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
    <div class="p-3 border-b bg-gray-50 flex justify-between items-center">
      <h3 class="font-bold text-gray-700 text-sm">Contextual Q&A</h3>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-4 shadow-inner bg-gray-50/50" ref="chatContainer">
      <div v-for="(pair, groupIndex) in chatHistory" :key="groupIndex" class="space-y-4">
        <template v-for="(msg, msgIndex) in pair" :key="groupIndex + '-' + msgIndex">
          <div :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">
            <div :class="[ 
              'max-w-[80%] p-3 rounded-lg text-sm leading-relaxed shadow-sm',
              msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800 border border-gray-100'
            ]">
              <div v-if="msg.role === 'assistant'" class="prose prose-sm max-w-none" v-html="renderMarkdown(msg.content)"></div>
              <div v-else>{{ msg.content }}</div>
            </div>
          </div>
        </template>
      </div>
      
      <div v-if="isTyping" class="flex justify-start">
        <div class="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        </div>
      </div>
      <div v-if="loading" class="text-xs text-gray-400 italic">AI is typing...</div>
    </div>

    <div class="p-4 border-t flex gap-2">
      <input 
        v-model="inputMsg" 
        @keyup.enter="handleSend"
        :disabled="loading || !sessionId"
        placeholder="Ask something about the paper..."
        class="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <button 
        @click="handleSend" 
        :disabled="loading || !sessionId"
        class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:bg-gray-400 transition-colors"
      >
        Send
      </button>
    </div>
    </div>
</template>

<script setup>
import { ref, onMounted, nextTick, defineProps } from 'vue'
import { getSessionDetail, chatWithPaper } from '@/apis/paper'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()
const props = defineProps({ sessionId: String, messages: Array })
const chatHistory = ref([]) 
const userInput = ref('')
const isTyping = ref(false)

const renderMarkdown = (content) => md.render(content)

const loadHistory = async () => {
  if (!props.sessionId || props.sessionId === 'new') return
  try {
    const res = await getSessionDetail(props.sessionId)
    if (res.code === 1) {
      chatHistory.value = res.data.messages || []
      scrollToBottom()
    }
  } catch (err) {
    // console.error("加载聊天失败", err)
  }
}

// 修改发送逻辑
const handleSend = async () => {
  if (!userInput.value.trim() || isTyping.value) return
  
  const text = userInput.value
  const userMsg = { role: 'user', content: text }
  
  // 1. 初始化本地显示，AI 内容先设为空
  const currentPair = [userMsg, { role: 'assistant', content: '' }]
  chatHistory.value.push(currentPair)
  
  userInput.value = ''
  isTyping.value = true
  
  try {
    // 2. 调用流式接口，在回调中更新内容
    await chatWithPaper(text, props.sessionId, (chunk) => {
      // 找到刚刚推入的那一对对话的 AI 部分，进行内容累加
      const lastPair = chatHistory.value[chatHistory.value.length - 1]
      lastPair[1].content += chunk // 实时将流式块拼接到内容中
      
      // 每次内容更新都尝试滚动到底部
      scrollToBottom()
    })
  } catch (error) {
    console.error('Chat Error:', error)
    // 报错时可以给用户一个提示
    const lastPair = chatHistory.value[chatHistory.value.length - 1]
    lastPair[1].content = "Error: Failed to get response from AI."
  } finally {
    isTyping.value = false
    scrollToBottom()
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    const container = document.querySelector('.overflow-y-auto')
    if (container) container.scrollTop = container.scrollHeight
  })
}

onMounted(loadHistory)
</script>