<template>
  <div class="mt-8 mb-10">
    <div class="mb-4 flex items-center gap-2 px-1">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5 text-gray-500">
        <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      <h3 class="font-medium text-gray-800">Q&A</h3>
    </div>

    <div class="sticky top-0 z-10 bg-white pb-6 pt-2">
      <div class="relative flex items-end border border-gray-300 bg-white rounded-2xl shadow-sm focus-within:ring-1 focus-within:ring-gray-300 focus-within:border-gray-400 transition-all p-2">
        <textarea 
          v-model="userInput" 
          ref="textareaRef" 
          rows="1" 
          @input="adjustHeight"
          @keydown.enter.exact.prevent="handleSend" 
          @keydown.enter.shift.exact="userInput += '\n'"
          :disabled="loading || !sessionId" 
          placeholder="Ask something about the paper..."
          class="flex-1 max-h-48 bg-transparent border-0 focus:ring-0 resize-none px-2 py-1.5 text-sm text-gray-900 placeholder-gray-400 outline-none"
        ></textarea>
        <button 
          @click="handleSend" 
          :disabled="loading || !sessionId || !userInput.trim()"
          class="flex-shrink-0 p-1.5 rounded-xl ml-2 transition-colors duration-200 flex items-center justify-center h-8 w-8"
          :class="userInput.trim() ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-400'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </button>
      </div>
    </div>

    <div class="space-y-6 pt-2">
      <div v-if="isTyping" class="flex w-full justify-start animate-pulse">
        <div class="flex-shrink-0 mr-4 mt-0.5">
          <div class="w-8 h-8 flex items-center justify-center text-black">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <div class="flex flex-col items-start pt-1.5">
          <div class="flex space-x-1 py-1">
            <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
          </div>
        </div>
      </div>

      <div v-for="(pair, groupIndex) in chatHistory" :key="groupIndex" class="space-y-6 w-full pb-6">
        <template v-for="(msg, msgIndex) in pair" :key="groupIndex + '-' + msgIndex">
          
          <div v-if="msg.role === 'user'" class="flex w-full justify-end items-start gap-3">
            <div class="bg-gray-100 border border-gray-200/60 text-gray-900 px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-[80%] text-sm whitespace-pre-wrap leading-relaxed shadow-sm">
              {{ msg.content }}
            </div>
            <div class="flex-shrink-0 mt-0.5">
              <div class="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white shadow-sm">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            </div>
          </div>

          <div v-if="msg.role === 'assistant'" class="flex w-full justify-start group/msg items-start">
            <div class="flex-shrink-0 mr-4 mt-0.5">
              <div class="w-8 h-8 bg-white border border-gray-200 shadow-sm rounded-full flex items-center justify-center text-black">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div class="flex flex-col flex-1 items-start min-w-0 pt-1">
              <div class="text-gray-800 text-sm w-full overflow-x-auto leading-relaxed">
                <div class="prose prose-sm max-w-none" v-html="renderMarkdown(msg.content)"></div>
              </div>
              
              <div class="mt-2 ml-[-4px] opacity-0 group-hover/msg:opacity-100 transition-opacity">
                <button @click="copyContent(msg.content)" class="flex items-center space-x-1 text-gray-400 hover:text-gray-700 p-1 rounded-md transition-colors" title="Copy to clipboard">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>

        </template>
      </div>

      <div v-if="isLoadingMore" class="text-center py-4 text-xs text-gray-400">
        Loading historical messages...
      </div>
      <div v-if="!hasMore && chatHistory.length > 0" class="text-center py-4 text-xs text-gray-300">
        · End of conversation ·
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

const loadHistory = async (isLoadMore = false) => {
  if (!props.sessionId || props.sessionId === 'new' || (!hasMore.value && isLoadMore)) return
  isLoadingMore.value = isLoadMore
  try {
    const res = await getSessionMessages(props.sessionId, currentPage.value)
    if (res.data.code === 1) {
      const fetchedMessages = (res.data.data.messages || []).map(pair => {
        return [pair[1], pair[0]] 
      })
      hasMore.value = res.data.data.more
      if (isLoadMore) {
        chatHistory.value.push(...fetchedMessages)
      } else {
        chatHistory.value = fetchedMessages
      }
    }
  } finally {
    isLoadingMore.value = false
  }
}

const loadMore = () => {
  if (!isLoadingMore.value && hasMore.value) {
    currentPage.value++
    loadHistory(true)
  }
}
defineExpose({ loadMore })

const handleSend = async () => {
  if (!userInput.value.trim() || isTyping.value) return
  const text = userInput.value
  userInput.value = ''
  
  const textarea = textareaRef.value
  if (textarea) textarea.style.height = 'auto'

  const newPair = [
    { role: 'assistant', content: '...' },
    { role: 'user', content: text }
  ]
  chatHistory.value.unshift(newPair)
  isTyping.value = true

  try {
    await chatWithPaper(text, props.sessionId, (chunk) => {
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
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
  }
}
</script>

<style scoped>
.prose :deep(p) { margin-bottom: 0.75rem; margin-top: 0; }
.prose :deep(p:last-child) { margin-bottom: 0; }
</style>