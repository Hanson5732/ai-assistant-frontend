<template>
    <div class="p-6 bg-white min-h-screen relative">
        <div class="mb-6 flex items-center">
            <router-link to="/bibliography"
                class="flex items-center text-gray-500 hover:text-indigo-600 transition-colors">
                <span class="text-2xl mr-1">‹</span>
                <span class="font-medium">Return</span>
            </router-link>
        </div>

        <div v-if="loading" class="flex justify-center py-20">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>

        <div v-else-if="paper" class="max-w-4xl mx-auto animate-fade-in">
            <div class="bg-indigo-50 border border-indigo-100 rounded-2xl p-8 mb-8 shadow-sm">
                <div class="flex items-start justify-between">
                    <h1 class="text-2xl font-bold text-gray-900 mb-4 leading-relaxed flex-1">
                        {{ paper.title }}
                    </h1>
                    <span class="ml-4 px-3 py-1 bg-indigo-200 text-indigo-800 text-xs font-bold rounded-full">
                        {{ paper.pub_year || 'Unknown Year' }}
                    </span>
                </div>

                <div class="space-y-4 text-sm text-gray-700">

                    <p class="flex items-start">
                        <span class="font-semibold text-right w-24 text-indigo-600 mr-4 shrink-0">Author(s):</span>
                        <span class="flex-1">{{ formatAuthors(paper.authors) }}</span>
                    </p>

                    <p class="flex items-start">
                        <span class="font-semibold text-right w-24 text-indigo-600 mr-4 shrink-0">Published in:</span>
                        <span class="flex-1">{{ paper.venue || 'Unknown Venue' }}</span>
                    </p>

                    <p v-if="paper.doi" class="flex items-start">
                        <span class="font-semibold text-right w-24 text-indigo-600 mr-4 shrink-0">DOI:</span>
                        <a :href="'https://doi.org/' + paper.doi" target="_blank"
                            class="text-indigo-500 hover:underline truncate flex-1">
                            {{ paper.doi }}
                        </a>
                    </p>

                </div>
            </div>

            <div v-if="paper.references && paper.references.length > 0">
                <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <span class="w-1 h-6 bg-indigo-600 rounded mr-2"></span>
                    Bibliographic References ({{ paper.references.length }})
                </h3>

                <ul class="space-y-3">
                    <li v-for="ref in paper.references" :key="ref.id"
                        class="p-4 bg-gray-50 border-l-4 border-indigo-200 hover:border-indigo-500 hover:bg-white hover:shadow-md transition-all rounded-r-lg">
                        <div class="flex gap-3">
                            <span class="text-xs font-bold text-indigo-400 mt-1">[{{ ref.order }}]</span>
                            <p class="text-sm text-gray-700 leading-relaxed">{{ ref.text }}</p>
                        </div>
                    </li>
                </ul>
            </div>

            <div v-else class="text-center py-10 text-gray-400 italic">
                No bibliographic references available for this paper.
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getBibliographyDetail } from '@/apis/bibliography'

const route = useRoute()
const paper = ref(null)
const loading = ref(true)

const formatAuthors = (authors) => {
    if (!authors || authors.length === 0) return 'Unknown'
    return authors.join(', ')
}

const fetchDetail = async () => {
    try {
        const id = route.params.id
        const res = await getBibliographyDetail(id)
        if (res.data.code === 1) {
            paper.value = res.data.data
        }
    } catch (error) {
        console.error('Failed to load paper detail:', error)
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    await fetchDetail()
})
</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>