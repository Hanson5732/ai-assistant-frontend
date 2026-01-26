<template>
  <aside 
    :class="[isCollapsed ? 'w-18' : 'w-64']"
    class="bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 relative h-screen"
  >
    <div class="p-4 flex items-center" :class="[isCollapsed ? 'justify-center' : 'justify-between']">
      <h1 v-if="!isCollapsed" class="text-xl font-bold text-indigo-600 truncate">🚀 AI Research</h1>
      <button 
        @click="isCollapsed = !isCollapsed" 
        class="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        title="Toggle Sidebar"
      >
        <span class="text-xl">☰</span>
      </button>
    </div>

    <nav class="flex-1 px-3 space-y-2 mt-4 overflow-y-auto">
      <div>
        <button 
          @click="toggleSubMenu"
          class="w-full flex items-center p-3 text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all group"
          :class="[isCollapsed ? 'justify-center' : 'justify-between']"
        >
          <div class="flex items-center gap-3">
            <span class="text-lg" title="Paper Summary">📄</span>
            <span v-if="!isCollapsed" class="font-medium text-sm">Historical Conversations</span>
          </div>
          <span v-if="!isCollapsed" class="text-[10px] transition-transform" :class="{ 'rotate-180': isSubMenuOpen }">▼</span>
        </button>

        <div v-if="!isCollapsed && isSubMenuOpen" class="mt-1 ml-4 border-l border-gray-200 pl-2 space-y-1">
          <button 
            @click="handleNewChat" 
            class="w-full text-left p-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-md mb-2"
          >
            + New Chat
          </button>
          
          <div 
            v-for="chat in history" 
            :key="chat" 
            @click="loadChat(chat)"
            class="p-2 text-xs text-gray-500 hover:text-indigo-600 hover:bg-white rounded cursor-pointer truncate"
            :title="chat"
          >
            {{ chat }}
          </div>

          <div v-if="history.length === 0" class="p-2 text-[10px] text-gray-400">
            No record found.
          </div>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { getSessions } from '@/apis/sidebar'


const isCollapsed = ref(false)
const isSubMenuOpen = ref(true)
const history = ref([])

/**
 * 获取所有历史会话索引
 */
const loadHistoryList = async () => {
  try {
    const res = await getSessions();
    if (res.code == 1) {
      history.value = res.data
    }
  } catch (error) {
    // console.error('加载历史记录失败:', error)
  }
}

const toggleSubMenu = () => {
  if (isCollapsed.value) {
    isCollapsed.value = false
    isSubMenuOpen.value = true
  } else {
    isSubMenuOpen.value = !isSubMenuOpen.value
  }
}

/**
 * 加载特定会话：通过 URL 参数跳转并触发页面刷新加载
 */
const loadChat = (id) => {
  window.location.href = `/chat/${id}`
}

/**
 * 新建会话：清除当前参数并刷新
 */
const handleNewChat = () => {
  window.location.href = '/chat'
}

// 组件挂载时立即执行请求
onMounted(() => {
  loadHistoryList()
})

onUnmounted(() => {
  loadHistoryList()
})
</script>

<style scoped>
.w-18 { width: 4.5rem; }
</style>