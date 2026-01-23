<template>
  <aside 
    :class="[isCollapsed ? 'w-18' : 'w-64']"
    class="bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 relative"
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
            <span v-if="!isCollapsed" class="font-medium text-sm">Paper Summary</span>
          </div>
          <span v-if="!isCollapsed" class="text-[10px] transition-transform" :class="{ 'rotate-180': isSubMenuOpen }">▼</span>
        </button>

        <div v-if="!isCollapsed && isSubMenuOpen" class="mt-1 ml-4 border-l border-gray-200 pl-2 space-y-1">
          <button @click="handleNewChat" class="w-full text-left p-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-md mb-2">
            + New Chat
          </button>
          <div v-for="chat in recentChats" :key="chat.id" @click="loadChat(chat.id)" class="p-2 text-xs text-gray-500 hover:text-indigo-600 hover:bg-white rounded cursor-pointer truncate">
            {{ chat.title }}
          </div>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'

const isCollapsed = ref(false) // 控制侧边栏整体收起
const isSubMenuOpen = ref(true) // 控制二级目录展开

const history = ref([{ id: '1', title: 'HypoSelectSimRAG Analysis' }])
const recentChats = computed(() => [...history.value].slice(0, 15))

const toggleSubMenu = () => {
  if (isCollapsed.value) {
    isCollapsed.value = false // 如果是收起状态，点击图标先展开侧边栏
    isSubMenuOpen.value = true
  } else {
    isSubMenuOpen.value = !isSubMenuOpen.value
  }
}

const handleNewChat = () => window.location.reload()
const loadChat = (id) => console.log('Load:', id)
</script>

<style scoped>
.w-18 { width: 4.5rem; } /* 收起后的宽度 */
</style>