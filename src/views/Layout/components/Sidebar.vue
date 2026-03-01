<template>
  <aside 
    :class="[isCollapsed ? 'w-[72px]' : 'w-64']"
    class="bg-[#F9F9F9] flex flex-col transition-all duration-300 relative h-screen z-10"
  >
    <div class="h-16 flex items-center px-4" :class="[isCollapsed ? 'justify-center' : 'justify-between']">
      <div v-if="!isCollapsed" class="flex items-center gap-2 overflow-hidden">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6 text-black shrink-0">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h1 class="text-base font-semibold text-gray-900 tracking-tight truncate">Paper Assistant</h1>
      </div>
      <button 
        @click="isCollapsed = !isCollapsed" 
        class="p-2 text-gray-500 hover:bg-gray-200/60 hover:text-gray-900 rounded-md transition-colors shrink-0"
        title="Toggle Sidebar"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="3" x2="9" y2="21"></line>
        </svg>
      </button>
    </div>

    <nav class="flex-1 px-3 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
      
      <div class="mb-4 mt-2 px-1">
        <button 
          @click="handleNewChat" 
          class="nav-new-chat w-full flex items-center justify-center gap-2 p-2.5 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
          :class="[isCollapsed ? 'px-0' : '']"
          :title="isCollapsed ? 'New Chat' : ''"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 shrink-0">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span v-if="!isCollapsed" class="text-sm font-medium">New Chat</span>
        </button>
      </div>

      <div>
        <button 
          @click="toggleSubMenu"
          class="nav-paper-summary w-full flex items-center p-2.5 text-gray-700 hover:bg-gray-200/50 rounded-lg transition-colors group"
          :class="[isCollapsed ? 'justify-center' : 'justify-between']"
        >
          <div class="flex items-center gap-3 overflow-hidden">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 shrink-0 text-gray-500 group-hover:text-gray-900">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span v-if="!isCollapsed" class="font-medium text-sm truncate">Paper Summary</span>
          </div>
          <svg v-if="!isCollapsed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-gray-400 transition-transform duration-200" :class="{ 'rotate-180': isSubMenuOpen }">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <div v-show="!isCollapsed && isSubMenuOpen" class="mt-1 mb-3 space-y-0.5">
          <div 
            v-for="chat in history" 
            :key="chat.id" 
            @click="loadChat(chat.id)"
            class="group relative flex items-center justify-between py-2 pl-10 pr-2 text-sm text-gray-600 hover:bg-gray-200/50 hover:text-gray-900 rounded-lg cursor-pointer transition-colors"
            :title="chat.title"
          >
            <span class="truncate flex-1">{{ chat.title }}</span>
            <button 
              @click.stop="handleDeleteChat(chat.id)"
              class="opacity-0 group-hover:opacity-100 ml-2 p-1 text-gray-400 hover:text-red-500 transition-opacity rounded"
              title="Delete chat"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>

          <div v-if="history.length === 0" class="py-2 pl-10 text-xs text-gray-400">
            No history.
          </div>
        </div>
      </div>

      <router-link 
        to="/bibliography"
        class="nav-bibliography flex items-center p-2.5 text-gray-700 hover:bg-gray-200/50 rounded-lg transition-colors group"
        :class="[isCollapsed ? 'justify-center' : '']"
      >
        <div class="flex items-center gap-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 shrink-0 text-gray-500 group-hover:text-gray-900">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <span v-if="!isCollapsed" class="font-medium text-sm">Bibliography</span>
        </div>
      </router-link>

      <router-link 
        to="/folder"
        class="nav-folder flex items-center p-2.5 text-gray-700 hover:bg-gray-200/50 rounded-lg transition-colors group"
        :class="[isCollapsed ? 'justify-center' : '']"
      >
        <div class="flex items-center gap-3">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 shrink-0 text-gray-500 group-hover:text-gray-900">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
          <span v-if="!isCollapsed" class="font-medium text-sm">Folders</span>
        </div>
      </router-link>

    </nav>

    <div class="p-3">
      <button 
        @click="handleManualGuide"
        class="w-full flex items-center p-2.5 text-gray-500 hover:bg-gray-200/50 hover:text-gray-900 rounded-lg transition-colors"
        :class="[isCollapsed ? 'justify-center' : '']"
        title="Help & Guide"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 shrink-0" :class="[!isCollapsed ? 'mr-3' : '']">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <span v-if="!isCollapsed" class="text-sm font-medium">Help</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getSessions, deleteSession } from '@/apis/sidebar'
import { useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useGuide } from '@/utils/guide';

const { startGuide } = useGuide();

const isCollapsed = ref(false)
const isSubMenuOpen = ref(true)
const history = ref([])
const route = useRoute()

const handleManualGuide = () => {
  startGuide();
};

onMounted(() => {
  const hasGuided = localStorage.getItem('has_completed_guide');
  
  if (!hasGuided) {
    setTimeout(() => {
      startGuide();
      localStorage.setItem('has_completed_guide', 'true');
    }, 500);
  }
});

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

const handleDeleteChat = async (id) => {
  try {
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
      ElMessage.success('Chat history cleared') 
      await loadHistoryList();
      if (route.params.sessionId === id.toString()) {
        window.location.reload();
      }
    }
  } catch (error) {
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
/* 隐藏原生滚动条并提供极简的自定义滚动条 */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d1d5db; /* gray-300 */
  border-radius: 10px;
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background: #9ca3af; /* gray-400 */
}

/* 防止高亮闪烁 */
button {
  -webkit-tap-highlight-color: transparent;
}
</style>