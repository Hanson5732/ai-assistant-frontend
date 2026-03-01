<template>
    <div class="p-6 bg-white min-h-screen relative font-sans">
        <div class="max-w-5xl mx-auto">
            
            <div class="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <router-link to="/folder" class="group flex items-center text-gray-500 hover:text-black transition-colors w-fit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    <span class="font-medium text-sm">Back to Folders</span>
                </router-link>

                <div class="flex items-center gap-3">
                    <template v-if="!isSelectMode">
                        <button @click="isSelectMode = true" v-if="papers.length > 0" class="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors">
                            Manage
                        </button>
                        <button @click="openAddPaperModal" class="px-4 py-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Add Papers
                        </button>
                    </template>
                    <template v-else>
                        <select v-model="activeFormat" class="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-black outline-none py-2 px-3">
                            <option v-for="fmt in ['APA', 'MLA', 'IEEE']" :key="fmt" :value="fmt">{{ fmt }}</option>
                        </select>
                        <button @click="exportSelectedToTxt" :disabled="selectedPaperIds.length === 0" class="px-4 py-2 bg-gray-800 text-white text-sm rounded-xl hover:bg-black disabled:opacity-50">
                            Export ({{ selectedPaperIds.length }})
                        </button>
                        <button @click="removeSelected" :disabled="selectedPaperIds.length === 0" class="px-4 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-xl hover:bg-red-100 disabled:opacity-50">
                            Remove
                        </button>
                        <button @click="exitSelectMode" class="px-4 py-2 text-gray-500 hover:text-black text-sm transition-colors">
                            Cancel
                        </button>
                    </template>
                </div>
            </div>

            <div class="mb-8 pb-6 border-b border-gray-200/60">
                <h1 class="text-3xl font-semibold text-gray-900 mb-2 flex items-center gap-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-8 h-8 text-gray-300"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                    {{ folderName }}
                </h1>
                <p class="text-sm text-gray-500 pl-11">{{ papers.length }} document(s)</p>
            </div>

            <div v-if="loading" class="flex justify-center py-10">
                <svg class="animate-spin h-6 w-6 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="32" stroke-linecap="round"/></svg>
            </div>

            <div v-else-if="papers.length > 0" class="overflow-x-auto">
                <table class="w-full text-left text-sm text-gray-600">
                    <thead class="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-200">
                        <tr>
                            <th v-if="isSelectMode" class="py-3 px-2 w-8"><input type="checkbox" :checked="isAllSelected" @change="toggleSelectAll" class="rounded border-gray-300 text-black focus:ring-black"></th>
                            <th class="py-3 px-2 font-medium">Title</th>
                            <th class="py-3 px-2 font-medium w-48">Author(s)</th>
                            <th class="py-3 px-2 font-medium w-24 text-center">Year</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr v-for="paper in papers" :key="paper.id" class="hover:bg-gray-50/50 transition-colors group">
                            <td v-if="isSelectMode" class="py-4 px-2">
                                <input type="checkbox" :value="paper.id" v-model="selectedPaperIds" class="rounded border-gray-300 text-black focus:ring-black">
                            </td>
                            <td class="py-4 px-2 font-medium text-gray-900">
                                <router-link :to="`/bibliography/${paper.id}`" class="hover:text-black hover:underline decoration-gray-300 underline-offset-4">
                                    {{ paper.title }}
                                </router-link>
                            </td>
                            <td class="py-4 px-2 text-gray-500 truncate max-w-[12rem]" :title="formatAuthors(paper.authors)">{{ formatAuthors(paper.authors) }}</td>
                            <td class="py-4 px-2 text-center text-gray-400">{{ paper.pub_year || '—' }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div v-else class="text-center py-20">
                <p class="text-gray-400 text-sm">This folder is empty.</p>
            </div>

            <el-dialog v-model="addPaperDialogVisible" title="Add Papers to Folder" width="700px" top="5vh" @closed="resetSearch">
                <div class="bg-gray-50 border border-gray-200/60 rounded-xl p-4 mb-4 space-y-4">
                    <div class="flex items-start gap-3">
                        <input type="checkbox" v-model="filters.title.enabled" class="mt-2 w-4 h-4 text-black border-gray-300 rounded cursor-pointer focus:ring-black" />
                        <div class="flex-1">
                            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Title</label>
                            <textarea v-model="filters.title.value" :disabled="!filters.title.enabled" rows="2" placeholder="Enter paper title..."
                                class="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none resize-none disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"></textarea>
                        </div>
                    </div>

                    <div class="flex items-center gap-3">
                        <input type="checkbox" v-model="filters.author.enabled" class="w-4 h-4 text-black border-gray-300 rounded cursor-pointer focus:ring-black" />
                        <div class="flex-1">
                            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Author</label>
                            <input v-model="filters.author.value" :disabled="!filters.author.enabled" type="text" placeholder="e.g. John Doe"
                                class="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors" />
                        </div>
                    </div>

                    <div class="flex gap-4">
                        <div class="flex items-center gap-3 flex-1">
                            <input type="checkbox" v-model="filters.venue.enabled" class="w-4 h-4 text-black border-gray-300 rounded cursor-pointer focus:ring-black" />
                            <div class="flex-1">
                                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Venue (Journal/Conf)</label>
                                <input v-model="filters.venue.value" :disabled="!filters.venue.enabled" type="text" placeholder="e.g. CVPR"
                                    class="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-1 focus:ring-gray-400 focus:border-gray-400 outline-none disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors" />
                            </div>
                        </div>

                        <div class="flex items-center gap-3 flex-1">
                            <input type="checkbox" v-model="filters.year.enabled" class="w-4 h-4 text-black border-gray-300 rounded cursor-pointer focus:ring-black" />
                            <div class="flex-1">
                                <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Publication Year</label>
                                <div class="flex items-center gap-2">
                                    <select v-model="filters.year.start" :disabled="!filters.year.enabled" 
                                        class="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed focus:ring-1 focus:ring-gray-400 focus:border-gray-400">
                                        <option value="" disabled>Start</option>
                                        <option v-for="y in yearOptions" :key="'start-'+y" :value="y">{{ y }}</option>
                                    </select>
                                    <span class="text-gray-400 font-bold">-</span>
                                    <select v-model="filters.year.end" :disabled="!filters.year.enabled" 
                                        class="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed focus:ring-1 focus:ring-gray-400 focus:border-gray-400">
                                        <option value="" disabled>End</option>
                                        <option v-for="y in yearOptions" :key="'end-'+y" :value="y">{{ y }}</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end pt-2">
                        <button @click="handleSearch" :disabled="isSearching"
                            class="px-5 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2">
                            <svg v-if="isSearching" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            {{ isSearching ? 'Searching...' : 'Search Papers' }}
                        </button>
                    </div>
                </div>

                <div class="border border-gray-200/60 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                    <table class="w-full text-left text-sm text-gray-600">
                        <thead class="bg-gray-50/50 sticky top-0 shadow-sm z-10">
                            <tr>
                                <th class="p-3 w-4"><input type="checkbox" :checked="isAllSearchSelected" @change="toggleSearchSelectAll" class="rounded text-black border-gray-300 focus:ring-black"></th>
                                <th class="p-3 font-semibold text-gray-700">Title</th>
                                <th class="p-3 font-semibold text-gray-700 w-24">Year</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            <tr v-for="paper in searchResults" :key="paper.id" class="hover:bg-gray-50/50 transition-colors">
                                <td class="p-3">
                                    <input type="checkbox" :value="paper.id" v-model="selectedSearchIds" 
                                        :disabled="existingPaperIds.includes(paper.id)"
                                        class="rounded text-black border-gray-300 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed">
                                </td>
                                <td class="p-3">
                                    <div class="font-medium text-gray-800 line-clamp-2">{{ paper.title }}</div>
                                    <div class="text-xs text-gray-400 mt-1">{{ formatAuthors(paper.authors) }}</div>
                                    <span v-if="existingPaperIds.includes(paper.id)" class="inline-block mt-1 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded font-semibold border border-gray-200">Already in folder</span>
                                </td>
                                <td class="p-3 text-center">
                                    <span class="text-gray-500 text-xs">{{ paper.pub_year || 'N/A' }}</span>
                                </td>
                            </tr>
                            <tr v-if="searchResults.length === 0 && hasSearched">
                                <td colspan="3" class="p-8 text-center text-gray-400">No matching papers found.</td>
                            </tr>
                            <tr v-if="searchResults.length === 0 && !hasSearched">
                                <td colspan="3" class="p-8 text-center text-gray-400 italic">Click Search to load your library papers.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <template #footer>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-500">{{ selectedSearchIds.length }} selected</span>
                        <div>
                            <el-button @click="addPaperDialogVisible = false">Cancel</el-button>
                            <el-button type="primary" :disabled="selectedSearchIds.length === 0 || isAdding" @click="confirmAddPapers" class="bg-black hover:bg-gray-800 border-none">
                                {{ isAdding ? 'Adding...' : 'Add Selected' }}
                            </el-button>
                        </div>
                    </div>
                </template>
            </el-dialog>
        </div>
    </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getFolderDetails, batchUpdateFolderPapers } from '@/apis/folder'
import { formatPaperCitation } from '@/utils/citation'
import { searchBibliography } from '@/apis/bibliography'
import { ElMessageBox, ElMessage } from 'element-plus'


const route = useRoute()
const folderId = route.params.id

const folderName = ref('Loading...')
const papers = ref([])
const loading = ref(true)

const isSelectMode = ref(false)
const exitSelectMode = () => {
    isSelectMode.value = false
    selectedPaperIds.value = []
}

// 选中的文献 ID 数组
const selectedPaperIds = ref([])
// 默认引用的导出格式
const activeFormat = ref('APA')

// 搜索与添加文献的逻辑
const addPaperDialogVisible = ref(false)
const isSearching = ref(false)
const hasSearched = ref(false)
const isAdding = ref(false)
const searchResults = ref([])
const selectedSearchIds = ref([])
// 生成年份选项 (从当前年份倒推到1950年)
const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => currentYear - i)
// 过滤器状态
const filters = ref({
    title: { enabled: false, value: '' },
    author: { enabled: false, value: '' },
    year: { enabled: false, start: '', end: '' },
    venue: { enabled: false, value: '' }
})

// 计算当前文件夹内已经存在的文献 ID，用于在搜索结果中禁用它们
const existingPaperIds = computed(() => papers.value.map(p => p.id))

const isAllSearchSelected = computed(() => {
    // 只能全选那些"还没在文件夹里"的文献
    const selectable = searchResults.value.filter(p => !existingPaperIds.value.includes(p.id))
    return selectable.length > 0 && selectedSearchIds.value.length === selectable.length
})

const toggleSearchSelectAll = (event) => {
    if (event.target.checked) {
        selectedSearchIds.value = searchResults.value
            .filter(p => !existingPaperIds.value.includes(p.id))
            .map(p => p.id)
    } else {
        selectedSearchIds.value = []
    }
}

const openAddPaperModal = () => {
    addPaperDialogVisible.value = true
    handleSearch()
}

const resetSearch = () => {
    filters.value = {
        title: { enabled: false, value: '' },
        author: { enabled: false, value: '' },
        year: { enabled: false, start: '', end: '' },
        venue: { enabled: false, value: '' }
    }
    searchResults.value = []
    selectedSearchIds.value = []
    hasSearched.value = false
}

// 触发搜索
const handleSearch = async () => {
    isSearching.value = true
    const payload = {}
    
    // 只组装被勾选启用的查询条件
    if (filters.value.title.enabled && filters.value.title.value.trim()) {
        payload.title = filters.value.title.value.trim()
    }
    if (filters.value.author.enabled && filters.value.author.value.trim()) {
        payload.author = filters.value.author.value.trim()
    }
    if (filters.value.venue.enabled && filters.value.venue.value.trim()) {
        payload.venue = filters.value.venue.value.trim()
    }
    if (filters.value.year.enabled) {
        if (filters.value.year.start) payload.year_start = filters.value.year.start
        if (filters.value.year.end) payload.year_end = filters.value.year.end
    }

    try {
        const res = await searchBibliography(payload)
        if (res.data.code === 1) {
            searchResults.value = res.data.data
            hasSearched.value = true
            selectedSearchIds.value = [] 
        }
    } catch (error) {
        console.error("Search failed", error)
    } finally {
        isSearching.value = false
    }
}

// 确认添加到文件夹
const confirmAddPapers = async () => {
    if (selectedSearchIds.value.length === 0) return
    isAdding.value = true
    try {
        // 调用之前写好的批量更新接口 action: 'add'
        const res = await batchUpdateFolderPapers(folderId, 'add', selectedSearchIds.value)
        if (res.data.code === 1) {
            addPaperDialogVisible.value = false
            await fetchFolderData() // 刷新文件夹详情
        } else {
            alert('Failed to add papers: ' + res.data.message)
        }
    } catch (error) {
        console.error("Add papers error:", error)
    } finally {
        isAdding.value = false
    }
}


// 判断是否全选
const isAllSelected = computed(() => {
    return papers.value.length > 0 && selectedPaperIds.value.length === papers.value.length
})

// 切换全选/取消全选
const toggleSelectAll = (event) => {
    if (event.target.checked) {
        selectedPaperIds.value = papers.value.map(paper => paper.id)
    } else {
        selectedPaperIds.value = []
    }
}

// 格式化作者展示
const formatAuthors = (authors) => {
    if (!authors || authors.length === 0) return 'Unknown Author'
    return authors.join(', ')
}

// 获取文件夹详情数据
const fetchFolderData = async () => {
    loading.value = true
    try {
        const res = await getFolderDetails(folderId)
        if (res.data.code === 1) {
            folderName.value = res.data.data.name
            papers.value = res.data.data.papers || []
        } else {
            alert('Failed to load folder details')
        }
    } catch (error) {
        console.error('Error fetching folder:', error)
    } finally {
        loading.value = false
    }
}

// 批量从文件夹中移除文献
const removeSelected = async () => {
    try {
        await ElMessageBox.confirm(
            `Are you sure you want to remove ${selectedPaperIds.value.length} paper(s) from this folder?`,
            'Warning',
            {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning',
            }
        )
    } catch (error) {
        // 用户点击了取消，直接返回，不执行后续删除操作
        return
    }
    
    try {
        const res = await batchUpdateFolderPapers(folderId, 'remove', selectedPaperIds.value)
        if (res.data.code === 1) {
            exitSelectMode() 
            await fetchFolderData()
            ElMessage.success('Successfully removed from folder')
        } else {
            ElMessage.error('Failed to remove papers: ' + res.data.message)
        }
    } catch (error) {
        console.error('Error removing papers:', error)
        ElMessage.error('An error occurred while removing papers.')
    }
}

// 批量导出选中文献为 txt 文件
const exportSelectedToTxt = () => {
    // 1. 获取所有被选中的文献完整对象
    const selectedPapers = papers.value.filter(paper => selectedPaperIds.value.includes(paper.id))
    
    // 2. 将文献逐一传入格式化函数，并在文献间增加两个换行符作为分隔
    const citationsText = selectedPapers
        .map(paper => formatPaperCitation(paper, activeFormat.value))
        .join('\n\n')

    // 3. 将文本转换为 Blob 对象 (设置 MIME 类型为纯文本)
    const blob = new Blob([citationsText], { type: 'text/plain;charset=utf-8' })
    
    // 4. 利用浏览器的 URL.createObjectURL 和 <a> 标签触发文件下载
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    
    // 设定导出的文件名，如 "Citations_APA.txt"
    const safeFolderName = folderName.value.replace(/\s+/g, '_')
    link.download = `${safeFolderName}_${activeFormat.value}.txt`
    
    document.body.appendChild(link)
    link.click()
    
    // 5. 垃圾回收清理
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

onMounted(() => {
    fetchFolderData()
})
</script>