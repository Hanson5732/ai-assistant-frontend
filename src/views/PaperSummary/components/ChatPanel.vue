<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200">
    <div class="p-3 border-b bg-gray-50 flex justify-between items-center">
      <h3 class="font-bold text-gray-700 font-serif text-lg">Contextual Q&A</h3>
    </div>
    <div class="p-4 border-b flex gap-2 bg-white sticky top-0 z-10 shadow-sm">
      <textarea v-model="userInput" ref="textareaRef" rows="1" @input="adjustHeight"
        @keydown.enter.exact.prevent="handleSend" @keydown.enter.shift.exact="userInput += '\n'"
        :disabled="loading || !sessionId" placeholder="Ask something about the paper..."
        class="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
      <button @click="handleSend" :disabled="loading || !sessionId"
        class="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:bg-gray-400">
        Send
      </button>
    </div>

    <div class="p-4 space-y-4 bg-gray-50/50">
      <div v-if="isTyping" class="flex w-full mb-4 justify-start">
        <div class="flex-shrink-0 mr-3 mt-1">
          <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-200">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <div class="flex flex-col max-w-[70%] items-start">
          <div class="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
            <div class="flex space-x-1 py-1 px-1">
              <div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
              <div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div class="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        </div>
      </div>

      <div v-for="(pair, groupIndex) in chatHistory" :key="groupIndex"
        class="space-y-4 w-full border-b border-gray-100 pb-4">
        <template v-for="(msg, msgIndex) in pair" :key="groupIndex + '-' + msgIndex">
          <div :class="['flex w-full mb-2', msg.role === 'user' ? 'justify-end' : 'justify-start']">
            
            <div v-if="msg.role === 'assistant'" class="flex-shrink-0 mr-3 mt-1">
              <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            <div :class="['flex flex-col max-w-[70%]', msg.role === 'user' ? 'items-end' : 'items-start']">
              <div v-if="msg.role === 'assistant'"
                class="bg-white text-gray-800 border border-gray-100 p-3 rounded-lg text-sm shadow-sm w-full overflow-x-auto">
                <div class="prose prose-sm max-w-none" v-html="renderMarkdown(msg.content)"></div>
              </div>
              
              <div v-else class="bg-indigo-600 text-white p-3 rounded-lg text-sm shadow-sm whitespace-pre-wrap">
                {{ msg.content }}
              </div>

              <div v-if="msg.role === 'assistant'" class="mt-1.5 ml-1">
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

            <div v-if="msg.role === 'user'" class="flex-shrink-0 ml-3 mt-1">
              <div class="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 shadow-sm border border-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
                </svg>
              </div>
            </div>

          </div>
        </template>
      </div>

      <div v-if="isLoadingMore" class="text-center py-4 text-xs text-gray-400 italic">
        Loading historical messages...
      </div>
      <div v-if="!hasMore" class="text-center py-4 text-xs text-gray-300">
        End of conversation history.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, defineExpose } from 'vue'
import { getSessionMessages, chatWithPaper } from '@/apis/paper'
import MarkdownIt from 'markdown-it'
import { ElMessage } from 'element-plus'

const md = new MarkdownIt()
const props = defineProps({ sessionId: String })
const chatHistory = ref([])
const userInput = ref('')
const isTyping = ref(false)
const currentPage = ref(1)
const hasMore = ref(true)
const isLoadingMore = ref(false)

const renderMarkdown = (content) => md.render(content)

// 加载历史记录
const loadHistory = async (isLoadMore = false) => {
  if (!props.sessionId || props.sessionId === 'new' || (!hasMore.value && isLoadMore)) return

  isLoadingMore.value = isLoadMore
  try {
    const res = await getSessionMessages(props.sessionId, currentPage.value)
    if (res.data.code === 1) {
      // 假设后端返回的是 [user, assistant] 对，我们需要将其反转为 [assistant, user]
      const fetchedMessages = (res.data.data.messages || []).map(pair => {
        return [pair[1], pair[0]] // 反转：让 assistant 在前
      })

      hasMore.value = res.data.data.more
      if (isLoadMore) {
        chatHistory.value.push(...fetchedMessages) // 向下滚动，追加到末尾
      } else {
        chatHistory.value = fetchedMessages
      }
    }
  } finally {
    isLoadingMore.value = false
  }
}

// 暴露加载接口
const loadMore = () => {
  if (!isLoadingMore.value && hasMore.value) {
    currentPage.value++
    loadHistory(true)
  }
}
defineExpose({ loadMore })

// 发送新消息：插入到最上方
const handleSend = async () => {
  if (!userInput.value.trim() || isTyping.value) return

  const text = userInput.value
  userInput.value = ''

  // 按照 [{assistant}, {user}] 格式插入到数组最前面
  const newPair = [
    { role: 'assistant', content: '...' },
    { role: 'user', content: text }
  ]
  chatHistory.value.unshift(newPair)
  isTyping.value = true

  try {
    await chatWithPaper(text, props.sessionId, (chunk) => {
      // 实时更新数组第一个元素的 assistant 内容
      if (chatHistory.value[0][0].content === '...') {
        chatHistory.value[0][0].content = ''
      }
      chatHistory.value[0][0].content += chunk
    })
  } finally {
    isTyping.value = false
  }
}

onMounted(() => loadHistory(false))

const copyContent = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('Copied to clipboard')
  } catch (err) {
    ElMessage.error('Copy failed')
  }
}

const textareaRef = ref(null)
const adjustHeight = () => {
  const textarea = textareaRef.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }
}
</script>