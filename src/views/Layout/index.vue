<template>
    <div class="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
        <Sidebar />
        <RouterView />
    </div>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue'
</script>