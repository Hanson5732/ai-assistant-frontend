<template>
  <div class="flex h-screen overflow-hidden bg-gray-50">
    
    <Sidebar class="flex-shrink-0 border-r border-gray-200" />

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <main class="flex-1 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue'
</script>