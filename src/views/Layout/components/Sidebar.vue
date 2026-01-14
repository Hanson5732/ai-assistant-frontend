<template>
  <nav class="bg-indigo-700 text-white w-full md:w-64 p-4 md:h-screen md:sticky md:top-0 flex flex-row md:flex-col justify-between items-center md:items-start shrink-0 z-50 shadow-xl">
    
    <div class="flex items-center space-x-2 shrink-0">
      <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-indigo-700 font-bold shadow-sm">AI</div>
      <h1 class="text-xl font-bold tracking-tight">Academic Assistant</h1>
    </div>
    
    <button @click="isMenuOpen = !isMenuOpen" class="md:hidden p-2 focus:outline-none">
      <span class="text-2xl" v-if="!isMenuOpen">☰</span>
      <span class="text-2xl" v-else>✕</span>
    </button>

    <div :class="{'hidden': !isMenuOpen && !isLargeScreen, 'flex': isMenuOpen || isLargeScreen}" 
         class="absolute top-16 left-0 w-full bg-indigo-800 md:bg-transparent md:relative md:top-0 md:flex flex-col mt-8 flex-1 w-full transition-all">
      
      <div class="flex flex-col space-y-2 w-full">
        <a href="#" class="p-3 bg-indigo-800 rounded-lg flex items-center space-x-3 transition-all">
          <span class="w-5 text-center">📄</span><span>Paper Summary</span>
        </a>
        <a href="#" class="p-3 hover:bg-indigo-600 rounded-lg flex items-center space-x-3 transition-all">
          <span class="w-5 text-center">💬</span><span>Contextual Q&A</span>
        </a>
        <a href="#" class="p-3 hover:bg-indigo-600 rounded-lg flex items-center space-x-3 transition-all">
          <span class="w-5 text-center">🔖</span><span>Bibliography</span>
        </a>
        <a href="#" class="p-3 hover:bg-indigo-600 rounded-lg flex items-center space-x-3 transition-all">
          <span class="w-5 text-center">📊</span><span>Knowledge Graph</span>
        </a>
      </div>

      <div class="mt-auto pt-6 border-t border-indigo-600 hidden md:block w-full">
        <div class="flex items-center space-x-3 p-2 bg-indigo-800/50 rounded-xl hover:bg-indigo-600 transition-colors cursor-pointer group">
          <div class="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center font-bold border-2 border-indigo-400 group-hover:border-white transition-all">
            SJ
          </div>
          <div class="overflow-hidden">
            <p class="text-sm font-bold truncate">Song Jiale</p>
            <p class="text-[10px] text-indigo-300 truncate italic">FYP Candidate</p>
          </div>
          <button class="ml-auto text-indigo-400 hover:text-white">
            ⚙️
          </button>
        </div>
      </div>

    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isMenuOpen = ref(false)
const isLargeScreen = ref(window.innerWidth >= 768)

const updateScreenSize = () => {
  isLargeScreen.value = window.innerWidth >= 768
}

onMounted(() => window.addEventListener('resize', updateScreenSize))
onUnmounted(() => window.removeEventListener('resize', updateScreenSize))
</script>