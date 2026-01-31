<template>
    <main 
        class="h-screen flex-1 p-4 md:p-8 overflow-y-auto bg-gray-50" 
        @scroll="handleMainScroll"
    >
        <div class="max-w-5xl mx-auto space-y-6">

            <transition name="fade">
                <div v-if="paperTitle"
                    class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm border-l-4 border-l-indigo-600">
                    <h1 class="text-2xl font-serif font-bold text-indigo-950 leading-tight">
                        {{ paperTitle }}
                    </h1>
                </div>
            </transition>

            <SummaryPanel :loading="loading" :summary="rawSummary" :selectedSize="selectedSize" :file="selectedFile"
                :sessionId="sessionId" @generate="handleGenerate" @update:size="s => selectedSize = s" />

            <ChatPanel v-if="sessionId && sessionId !== 'new'" :sessionId="sessionId" ref="chatPanelRef" />

            <div id="bottom-sentinel" class="h-1"></div>
        </div>
    </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getSessionDetail, processPaper } from '@/apis/paper'
import SummaryPanel from './components/SummaryPanel.vue'
import ChatPanel from './components/ChatPanel.vue'

const route = useRoute()
const loading = ref(false)
const selectedFile = ref(null)
const sessionId = ref(route.params.sessionId)
const rawSummary = ref('')
const paperTitle = ref('')
const selectedSize = ref('medium')

// 加载/刷新数据的逻辑
const loadData = async () => {
    const sId = route.params.sessionId

    // 场景 A：新上传文件跳转
    if (sId === 'new' && history.state?.file) {
        selectedFile.value = history.state.file
        selectedSize.value = history.state.size || 'medium'
        handleGenerate()
        return
    }

    // 场景 B：查询具体会话记录
    if (sId && sId !== 'new') {
        try {
            loading.value = true
            const res = await getSessionDetail(sId)
            if (res.data.code === 1) {
                // 匹配你提供的后端结构
                paperTitle.value = res.data.data.title
                rawSummary.value = res.data.data.summary
                sessionId.value = sId
                rawSummary.value = rawSummary.value.replace(/^Title:\s*.*\n?/, '').trim()
            }
        } catch (error) {
            console.error('Failed to fetch session detail:', error)
        } finally {
            loading.value = false
        }
    }
}

// 核心生成逻辑
const handleGenerate = async () => {
    if (!selectedFile.value || loading.value) return

    loading.value = true
    rawSummary.value = ''
    paperTitle.value = '' // 重置标题

    try {
        await processPaper(
            selectedFile.value,
            selectedSize.value,
            '',
            (chunk) => {
                // 1. 提取 Session ID
                if (chunk.includes('SESSION_ID:')) {
                    const match = chunk.match(/SESSION_ID:([\w-]+)/)
                    if (match) {
                        const newId = match[1]
                        sessionId.value = newId
                        window.history.replaceState(history.state, '', `/chat/${newId}`)
                    }
                    chunk = chunk.replace(/SESSION_ID:[\w-]+\n?/, '')
                }

                // 2. 提取 Title (流式输出时)
                // 如果 chunk 中包含 "Title: "，将其截取到 paperTitle 中
                if (chunk.includes('Title:')) {
                    const titleMatch = chunk.match(/Title:\s*(.*)/)
                    if (titleMatch) {
                        paperTitle.value = titleMatch[1].split('\n')[0]
                        // 同时从摘要内容中移除这一行，保持 SummaryPanel 纯净
                        chunk = chunk.replace(/Title:.*\n?/, '')
                    }
                }

                rawSummary.value += chunk
            }
        )
    } catch (error) {
        console.error('Generation error:', error)
    } finally {
        loading.value = false
    }
}

watch(() => route.params.sessionId, loadData)
onMounted(loadData)

const chatPanelRef = ref(null)

const handleMainScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target

    // 增加容错值（例如 20px），防止因为像素舍入导致不触底
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 20

    if (isAtBottom) {
        console.log('Detected bottom - triggering loadMore') // 调试用
        chatPanelRef.value?.loadMore()
    }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>