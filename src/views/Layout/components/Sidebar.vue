<template>
  <aside 
    :class="[isCollapsed ? 'w-18' : 'w-64']"
    class="bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 relative h-screen"
  >
    <div class="p-4 flex items-center" :class="[isCollapsed ? 'justify-center' : 'justify-between']">
      <h1 v-if="!isCollapsed" class="text-xl font-bold text-indigo-600 truncate">🚀 Paper Assistant</h1>
      <button 
        @click="isCollapsed = !isCollapsed" 
        class="p-2 hover:bg-gray-200 rounded-lg transition-colors"
        title="Toggle Sidebar"
      >
        <span class="text-xl">☰</span>
      </button>
    </div>

    <nav class="flex-1 px-3 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
      <div>
        <button 
          @click="toggleSubMenu"
          class="w-full flex items-center p-3 text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all group"
          :class="[isCollapsed ? 'justify-center' : 'justify-between']"
        >
          <div class="flex items-center gap-3">
            <span class="text-lg" title="Paper Summary">📄</span>
            <span v-if="!isCollapsed" class="font-medium text-sm">Paper Summary</span>
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
            :key="chat.id" 
            @click="loadChat(chat.id)"
            class="group relative flex items-center justify-between p-2 text-xs text-gray-500 hover:text-indigo-600 hover:bg-white rounded cursor-pointer transition-all"
            :title="chat.title"
          >
            <span class="truncate flex-1">{{ chat.title }}</span>
            
            <button 
              @click.stop="handleDeleteChat(chat.id)"
              class="opacity-0 group-hover:opacity-100 ml-2 p-1 text-gray-400 hover:text-red-500 transition-opacity"
              title="Clear history"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div v-if="history.length === 0" class="p-2 text-[10px] text-gray-400">
            No record found.
          </div>
        </div>
      </div>

      <router-link 
        to="/bibliography"
        class="flex items-center p-3 text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all group"
        :class="[isCollapsed ? 'justify-center' : '']"
      >
        <div class="flex items-center gap-3">
          <span class="text-lg" title="Bibliography Management">📚</span>
          <span v-if="!isCollapsed" class="font-medium text-sm">Bibliography</span>
        </div>
      </router-link>
      <router-link 
        to="/folder"
        class="flex items-center p-3 text-gray-700 hover:bg-white hover:shadow-sm rounded-lg transition-all group"
        :class="[isCollapsed ? 'justify-center' : '']"
      >
        <div class="flex items-center gap-3">
          <span class="text-lg" title="Folder Management">📁</span>
          <span v-if="!isCollapsed" class="font-medium text-sm">Folders</span>
        </div>
      </router-link>

    </nav>
  </aside>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getSessions, deleteSession } from '@/apis/sidebar'
import { useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'

const isCollapsed = ref(false)
const isSubMenuOpen = ref(true)
const history = ref([])
const route = useRoute()

const loadHistoryList = async () => {
  try {
    const res = await getSessions();
    if (res.data.code == 1) {
      history.value = res.data.data
    }
  } catch (error) {
    // console.error('加载历史记录失败:', error)
  }
}

/**
 * 删除/清除特定会话记录 (使用 Element Plus)
 */
const handleDeleteChat = async (id) => {
  try {
    // 使用 ElMessageBox 代替原生 confirm
    await ElMessageBox.confirm(
      'Are you sure you want to clear this chat history?',
      'Warning',
      {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning',
      }
    )
    
    const res = await deleteSession(id);
    if (res.data.code === 1) {
      ElMessage.success('Chat history cleared') // 成功提示
      await loadHistoryList();
      if (route.params.sessionId === id.toString()) {
        window.location.reload();
      }
    }
  } catch (error) {
    // 用户取消点击时不报错
    if (error !== 'cancel') {
      console.error('Failed to reset chat:', error);
      ElMessage.error('Failed to clear history');
    }
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

const loadChat = (id) => {
  window.location.href = `/chat/${id}`
}

const handleNewChat = () => {
  window.location.href = '/chat'
}

watch(() => route.params.sessionId, (newId) => {
  if (newId) {
    loadHistoryList()
  }
}, { immediate: true })

onMounted(() => {
  loadHistoryList()
})
</script>

<style scoped>
.w-18 { width: 4.5rem; }

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>