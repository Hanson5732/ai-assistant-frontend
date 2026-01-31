<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
    <div class="p-3 border-b bg-gray-50 flex justify-between items-center">
      <h3 class="font-bold text-gray-700 font-serif text-lg">Contextual Q&A</h3>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-4 shadow-inner bg-gray-50/50" ref="chatContainer"
      @scroll="handleScroll">
      <div v-if="isLoadingMore" class="text-center py-2 text-xs text-gray-400">Loading history...</div>

      <div v-for="(pair, groupIndex) in chatHistory" :key="groupIndex" class="space-y-4 w-full">
        <template v-for="(msg, msgIndex) in pair" :key="groupIndex + '-' + msgIndex">
          <div :class="['flex w-full mb-2', msg.role === 'user' ? 'justify-end' : 'justify-start']">
            <div :class="['flex flex-col max-w-[70%]', msg.role === 'user' ? 'items-end' : 'items-start']">
              <div :class="[
                'p-3 rounded-lg text-sm leading-relaxed shadow-sm w-fit',
                msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800 border border-gray-100'
              ]">
                <div v-if="msg.role === 'assistant'" class="prose prose-sm max-w-none"
                  v-html="renderMarkdown(msg.content)"></div>
                <div v-else class="whitespace-pre-wrap">{{ msg.content }}</div>
              </div>
              <div v-if="msg.role === 'assistant'" class="mt-1 ml-1">
                <button @click="copyContent(msg.content)"
                  class="flex items-center space-x-1 text-gray-400 hover:text-indigo-500 transition-colors duration-200 text-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  <span>Copy</span>
                </button>
              </div>
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
      <textarea v-model="userInput" ref="textareaRef" rows="1" @input="adjustHeight"
        @keydown.enter.exact.prevent="handleSend" @keydown.enter.shift.exact="userInput += '\n'"
        :disabled="loading || !sessionId" placeholder="Ask something about the paper..."
        class="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
      <button @click="handleSend" :disabled="loading || !sessionId"
        class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:bg-gray-400 transition-colors">
        Send
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, defineProps } from 'vue'
import { getSessionMessages, chatWithPaper } from '@/apis/paper'
import { ElMessage } from 'element-plus'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()
const props = defineProps({ sessionId: String, messages: Array })
const chatHistory = ref([])
const userInput = ref('')
const isTyping = ref(false)

const currentPage = ref(1)
const hasMore = ref(true)
const isLoadingMore = ref(false)


const textareaRef = ref(null)
const adjustHeight = () => {
  const textarea = textareaRef.value
  if (textarea) {
    textarea.style.height = 'auto' // 先重置高度以计算 scrollHeight
    textarea.style.height = `${textarea.scrollHeight}px`
  }
}

const renderMarkdown = (content) => md.render(content)

const loadHistory = async (isLoadMore = false) => {
  if (!props.sessionId || props.sessionId === 'new' || !hasMore.value) return

  isLoadingMore.value = isLoadMore
  try {
    const res = await getSessionMessages(props.sessionId, currentPage.value)
    if (res.data.code === 1) {
      const newMessages = res.data.data.messages || []
      hasMore.value = res.data.data.hasMore

      if (isLoadMore) {
        // 如果是加载更多，将旧消息插入到数组头部
        chatHistory.value = [...newMessages, ...chatHistory.value]
      } else {
        chatHistory.value = newMessages
        scrollToBottom()
      }
    }
  } finally {
    isLoadingMore.value = false
  }
}

const handleScroll = async (e) => {
  // 当滚动条到达顶部 (scrollTop === 0) 且还有更多数据时加载
  if (e.target.scrollTop === 0 && hasMore.value && !isLoadingMore.value) {
    const previousHeight = e.target.scrollHeight
    currentPage.value++
    await loadHistory(true)

    // 加载后保持滚动位置，防止因内容增加导致视觉跳动
    nextTick(() => {
      e.target.scrollTop = e.target.scrollHeight - previousHeight
    })
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

  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
  }

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

const copyContent = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('Copied to clipboard')
  } catch (err) {
    ElMessage.error('Copy failed')
  }
}

onMounted(loadHistory)
</script>