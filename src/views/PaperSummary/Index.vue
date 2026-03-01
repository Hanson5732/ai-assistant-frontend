<template>
    <main 
        class="h-screen flex-1 p-4 md:p-8 overflow-y-auto bg-white" 
        @scroll="handleMainScroll"
    >
        <div class="max-w-4xl mx-auto space-y-8">

            <transition name="fade">
                <div v-if="paperTitle" class="pt-4 pb-2">
                    <h1 class="text-2xl md:text-3xl font-semibold text-gray-900 leading-snug tracking-tight">
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

const loadData = async () => {
    const sId = route.params.sessionId
    if (sId === 'new' && history.state?.file) {
        selectedFile.value = history.state.file
        selectedSize.value = history.state.size || 'medium'
        handleGenerate()
        return
    }
    if (sId && sId !== 'new') {
        try {
            loading.value = true
            const res = await getSessionDetail(sId)
            if (res.data.code === 1) {
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

const handleGenerate = async () => {
    if (!selectedFile.value || loading.value) return
    loading.value = true
    rawSummary.value = ''
    paperTitle.value = ''
    try {
        await processPaper(
            selectedFile.value,
            selectedSize.value,
            '',
            (chunk) => {
                if (chunk.includes('SESSION_ID:')) {
                    const match = chunk.match(/SESSION_ID:([\w-]+)/)
                    if (match) {
                        const newId = match[1]
                        sessionId.value = newId
                        window.history.replaceState(history.state, '', `/chat/${newId}`)
                    }
                    chunk = chunk.replace(/SESSION_ID:[\w-]+\n?/, '')
                }
                if (chunk.includes('Title:')) {
                    const titleMatch = chunk.match(/Title:\s*(.*)/)
                    if (titleMatch) {
                        paperTitle.value = titleMatch[1].split('\n')[0]
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
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 20
    if (isAtBottom) {
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