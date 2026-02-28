<template>
    <div class="p-6 bg-white min-h-screen relative">
        <div class="mb-6 flex items-center justify-between">
            <router-link to="/bibliography"
                class="flex items-center text-gray-500 hover:text-indigo-600 transition-colors">
                <span class="text-2xl mr-1">‹</span>
                <span class="font-medium">Return</span>
            </router-link>
            <button @click="openEditModal"
                class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
                Edit Paper
            </button>
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

            <div class="mb-8 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center">
                        <span class="mr-2">📄</span> Export Citation
                    </h3>
                    <div class="flex gap-2">
                        <button v-for="fmt in ['APA', 'MLA', 'IEEE', 'Chicago', 'Harvard']" :key="fmt" @click="activeFormat = fmt"
                            :class="['px-3 py-1 text-sm font-medium rounded-full transition-all',
                                activeFormat === fmt ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">
                            {{ fmt }}
                        </button>
                    </div>

                    <div class="mt-1 ml-1">
                        <button @click="copyCitation"
                            class="flex items-center space-x-1.5 text-gray-400 hover:text-indigo-500 transition-colors duration-200 text-xs">
                            <svg v-if="!copied" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round">
                                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                            </svg>
                            <span v-if="!copied" class="text-sm">Copy</span>
                            <span v-else class="text-gray-400 text-sm font-bold">Done!</span>
                        </button>
                    </div>
                </div>

                <div class="relative group">
                    <div
                        class="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-sm text-gray-800 italic break-words">
                        {{ generatedCitation }}
                    </div>
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
        <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
                <h2 class="text-xl font-bold text-gray-800 mb-5">Edit Bibliography</h2>
                
                <div class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <textarea v-model="editForm.title" rows="3"
                               class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none leading-relaxed"></textarea>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Author(s)</label>
                        <div class="grid grid-cols-2 gap-4">
                            <div v-for="(author, index) in editForm.authors" :key="index" class="flex items-center gap-2">
                                <input v-model="editForm.authors[index]" type="text" placeholder="Author Name"
                                       class="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                                
                                <button @click="removeAuthor(index)" title="Remove" class="p-1 text-gray-400 hover:text-red-500 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <button @click="addAuthor" class="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-semibold flex items-center">
                            <span class="mr-1">+</span> Add Author
                        </button>
                    </div>
                    
                    <div class="flex gap-4">
                        <div class="flex-1">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Year</label>
                            <input v-model="editForm.pub_year" type="number" 
                                   class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                        </div>
                        <div class="flex-1">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Venue (Journal/Conf)</label>
                            <input v-model="editForm.venue" type="text" 
                                   class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                        </div>
                    </div>
                    
                    <div class="flex gap-4">
                        <div class="flex-1">
                            <label class="block text-sm font-medium text-gray-700 mb-1">DOI</label>
                            <input v-model="editForm.doi" type="text" 
                                   class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                        </div>
                        <div class="flex-1">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Page Range</label>
                            <input v-model="editForm.page_range" type="text" placeholder="e.g. 100-120"
                                   class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                        </div>
                    </div>
                </div>

                <div class="mt-8 flex justify-end gap-3">
                    <button @click="showEditModal = false" 
                            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        Cancel
                    </button>
                    <button @click="submitEdit" 
                            class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getBibliographyDetail, updateBibliography } from '@/apis/bibliography'
import { formatPaperCitation } from '@/utils/citation'

const route = useRoute()
const paper = ref(null)
const loading = ref(true)
const activeFormat = ref('APA')
const copied = ref(false)
const showEditModal = ref(false)
const editForm = ref({
    title: '',
    authors: [],
    pub_year: '',
    venue: '',
    doi: '',
    page_range: ''
})

const formatAuthors = (authors) => {
    if (!authors || authors.length === 0) return 'Unknown Author'
    return authors.join(', ')
}

const generatedCitation = computed(() => {
    if (!paper.value) return '';
    return formatPaperCitation(paper.value, activeFormat.value);
});

const copyCitation = async () => {
    try {
        await navigator.clipboard.writeText(generatedCitation.value)
        copied.value = true
        setTimeout(() => copied.value = false, 2000)
    } catch (err) {
        console.error('Failed to copy!', err)
    }
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


const openEditModal = () => {
    if (paper.value) {
        editForm.value = {
            title: paper.value.title || '',
            authors: paper.value.authors && paper.value.authors.length > 0 
                     ? [...paper.value.authors] 
                     : [''], 
            pub_year: paper.value.pub_year || '',
            venue: paper.value.venue || '',
            doi: paper.value.doi || '',
            page_range: paper.value.page_range || ''
        }
        showEditModal.value = true
    }
}

const addAuthor = () => {
    editForm.value.authors.push('')
}

const removeAuthor = (index) => {
    editForm.value.authors.splice(index, 1)
}

const submitEdit = async () => {
    try {
        // 清理掉空的作者名并去掉前后空格
        const authorsArray = editForm.value.authors
            .map(a => a.trim())
            .filter(a => a.length > 0)

        const payload = {
            title: editForm.value.title,
            authors: authorsArray,
            pub_year: editForm.value.pub_year,
            venue: editForm.value.venue,
            doi: editForm.value.doi,
            page_range: editForm.value.page_range
        }
        
        const res = await updateBibliography(route.params.id, payload)
        if (res.data.code === 1) {
            showEditModal.value = false
            await fetchDetail() // 刷新页面数据
        } else {
            alert('Failed to update: ' + res.data.message)
        }
    } catch (error) {
        console.error('Update error:', error)
        alert('An error occurred while updating.')
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