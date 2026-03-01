<template>
    <div class="p-6 bg-white min-h-screen relative font-sans text-gray-900">
        <div class="mb-8 flex items-center justify-between max-w-4xl mx-auto">
            <router-link to="/bibliography"
                class="group flex items-center text-gray-500 hover:text-black transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    class="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span class="font-medium text-sm">Back to Library</span>
            </router-link>
            <button @click="openEditModal"
                class="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                Edit Metadata
            </button>
        </div>

        <div v-if="loading" class="flex justify-center py-20">
            <svg class="animate-spin h-6 w-6 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32" stroke-linecap="round" />
            </svg>
        </div>

        <div v-else-if="paper" class="max-w-4xl mx-auto animate-fade-in space-y-10">
            <div class="pb-6 border-b border-gray-200/60">
                <div class="flex items-start gap-4 mb-4">
                    <h1 class="text-3xl font-semibold text-gray-900 leading-tight flex-1">
                        {{ paper.title }}
                    </h1>
                    <span
                        class="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-md shrink-0 border border-gray-200">
                        {{ paper.pub_year || 'Unknown' }}
                    </span>
                </div>
                <div class="space-y-2 text-sm text-gray-600">
                    <p><span class="font-medium text-gray-400 mr-2">Authors:</span> {{ formatAuthors(paper.authors) }}
                    </p>
                    <p><span class="font-medium text-gray-400 mr-2">Venue:</span> {{ paper.venue || 'Unknown Venue' }}
                    </p>
                    <p v-if="paper.doi"><span class="font-medium text-gray-400 mr-2">DOI:</span> <a
                            :href="'https://doi.org/' + paper.doi" target="_blank"
                            class="text-gray-900 underline hover:text-black">{{ paper.doi }}</a></p>
                </div>
            </div>

            <div>
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            class="w-4 h-4 text-gray-400">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                        Export Citation
                    </h3>
                    <div class="flex gap-2">
                        <button v-for="fmt in ['APA', 'MLA', 'IEEE', 'Chicago', 'Harvard']" :key="fmt"
                            @click="activeFormat = fmt"
                            :class="['px-3 py-1 text-xs font-medium rounded-md transition-all', activeFormat === fmt ? 'bg-black text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200']">
                            {{ fmt }}
                        </button>
                    </div>
                </div>

                <div class="relative group bg-[#FAFAFA] rounded-xl border border-gray-200/60 p-5">
                    <button @click="copyCitation"
                        class="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-black transition-colors rounded-md bg-white border border-gray-200 shadow-sm opacity-0 group-hover:opacity-100"
                        title="Copy">
                        <svg v-if="!copied" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            class="w-4 h-4">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                            class="w-4 h-4 text-green-600">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </button>
                    <div class="text-sm text-gray-700 font-serif leading-relaxed pr-8">
                        {{ generatedCitation }}
                    </div>
                </div>
            </div>

            <div>
                <h3 class="text-sm font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">References ({{
                    paper.references ? paper.references.length : 0 }})</h3>
                <ul v-if="paper.references && paper.references.length > 0" class="space-y-4">
                    <li v-for="ref in paper.references" :key="ref.id"
                        class="flex gap-4 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                        <span class="font-medium text-gray-400 select-none shrink-0 w-6 text-right">{{ ref.order
                            }}.</span>
                        <p class="leading-relaxed">{{ ref.text }}</p>
                    </li>
                </ul>
                <div v-else class="text-gray-400 text-sm italic">No references extracted.</div>
            </div>
        </div>
        <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div
                class="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
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
                            <div v-for="(author, index) in editForm.authors" :key="index"
                                class="flex items-center gap-2">
                                <input v-model="editForm.authors[index]" type="text" placeholder="Author Name"
                                    class="flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />

                                <button @click="removeAuthor(index)" title="Remove"
                                    class="p-1 text-gray-400 hover:text-red-500 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <button @click="addAuthor"
                            class="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-semibold flex items-center">
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