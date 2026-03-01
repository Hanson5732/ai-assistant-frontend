<template>
  <div class="flex h-screen overflow-hidden bg-white text-gray-900 font-sans antialiased">
    <Sidebar class="flex-shrink-0 border-r border-gray-200/70" />

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden bg-white">
      <main class="flex-1 overflow-y-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue'
</script>