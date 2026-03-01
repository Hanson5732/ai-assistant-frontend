<template>
    <div class="p-6 bg-gray-50 min-h-screen relative">
        <div class="max-w-6xl mx-auto">
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">My Folders</h1>
                    <p class="text-gray-500 text-sm">Organize your papers into different collections.</p>
                </div>

                <div class="flex items-center gap-2">
                    <div class="relative">
                        <input v-model="searchQuery" type="text" placeholder="Search folders..."
                            class="w-64 pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
                            @keyup.enter="handleSearch" />
                        <button @click="handleSearch"
                            class="absolute right-3 top-2.5 text-gray-400 hover:text-indigo-600">
                            🔍
                        </button>
                    </div>
                    <button @click="handleSearch"
                        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm">
                        Search
                    </button>
                </div>
            </div>

            <div class="flex items-center justify-start mb-8">
                <button @click="showCreateModal = true"
                    class="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clip-rule="evenodd" />
                    </svg>
                    New Folder
                </button>
            </div>

            <div v-if="loading" class="flex justify-center py-20">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>

            <div v-else-if="folders.length > 0"
                class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <div v-for="folder in folders" :key="folder.id" @click="goToDetail(folder.id)"
                    class="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col h-full">

                    <div class="flex justify-between items-start mb-4">
                        <div
                            class="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                        </div>
                        <button @click.stop="handleDelete(folder.id, folder.name)"
                            class="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20"
                                fill="currentColor">
                                <path fill-rule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>

                    <div class="mt-auto">
                        <h3 class="text-lg font-bold text-gray-800 mb-1 truncate" :title="folder.name">{{ folder.name }}
                        </h3>
                        <p class="text-sm text-gray-500 font-medium">
                            {{ folder.paper_count }} {{ folder.paper_count === 1 ? 'paper' : 'papers' }}
                        </p>
                    </div>
                </div>
            </div>
            <div v-if="folders.length > 0" class="mt-10 flex justify-center">
                <el-pagination v-model:current-page="currentPage" :page-size="8" :total="totalCount"
                    layout="prev, pager, next" background @current-change="handlePageChange" />
            </div>

            <div v-else class="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <span class="text-5xl block mb-4 text-gray-300">📁</span>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No folders yet</h3>
                <p class="text-gray-500 text-sm mb-6">Create your first folder to start organizing papers.</p>
                <button @click="showCreateModal = true"
                    class="px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors">
                    Create Folder
                </button>
            </div>
        </div>

        <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-fade-in">
                <h2 class="text-xl font-bold text-gray-800 mb-4">Create New Foldaer</h2>
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Folder Name</label>
                    <input v-model="newFolderName" @keyup.enter="submitCreate" type="text"
                        placeholder="e.g. Deep Learning Papers"
                        class="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                </div>
                <div class="flex justify-end gap-3">
                    <button @click="closeCreateModal"
                        class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        Cancel
                    </button>
                    <button @click="submitCreate" :disabled="!newFolderName.trim() || isSubmitting"
                        class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300">
                        {{ isSubmitting ? 'Creating...' : 'Create' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getFolderList, createFolder, deleteFolder, searchFolders } from '@/apis/folder'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const folders = ref([])
const loading = ref(true)
const currentPage = ref(1)
const totalCount = ref(0)

// 弹窗状态
const showCreateModal = ref(false)
const newFolderName = ref('')
const isSubmitting = ref(false)

// 搜索状态
const searchQuery = ref('')
const isSearchMode = ref(false)

// 获取列表
const fetchFolders = async () => {
    loading.value = true
    try {
        // 传入 currentPage
        const res = await getFolderList(currentPage.value)
        if (res.data.code === 1) {
            folders.value = res.data.data.list
            totalCount.value = res.data.data.total
        }
    } catch (error) {
        console.error('Failed to fetch folders:', error)
    } finally {
        loading.value = false
    }
}

const clearSearch = () => {
    searchQuery.value = ''
    isSearchMode.value = false
    currentPage.value = 1
    fetchFolders()
}

const handleSearch = async () => {
    if (!searchQuery.value.trim()) {
        return clearSearch()
    }

    loading.value = true
    try {
        const res = await searchFolders(searchQuery.value.trim())
        if (res.data.code === 1) {
            folders.value = res.data.data
            isSearchMode.value = true
        }
    } catch (error) {
        ElMessage.error('Search failed')
    } finally {
        loading.value = false
    }
}

const handlePageChange = (page) => {
    currentPage.value = page
    fetchFolders()
}

// 跳转到详情
const goToDetail = (id) => {
    router.push(`/folder/${id}`)
}

// 关闭弹窗
const closeCreateModal = () => {
    showCreateModal.value = false
    newFolderName.value = ''
}

// 提交新建
const submitCreate = async () => {
    if (!newFolderName.value.trim() || isSubmitting.value) return

    isSubmitting.value = true
    try {
        const res = await createFolder({ name: newFolderName.value.trim() })
        if (res.data.code === 1) {
            closeCreateModal()
            currentPage.value = 1 // 强制跳回第一页，查看刚新建的文件夹
            await fetchFolders()
        } else {
            alert('Failed to create folder: ' + res.data.message)
        }
    } catch (error) {
        console.error('Create folder error:', error)
    } finally {
        isSubmitting.value = false
    }
}

// 删除文件夹
const handleDelete = async (id, name) => {
    try {
        await ElMessageBox.confirm(
            `Are you sure you want to delete "${name}"? This action cannot be undone.`,
            'Delete Folder',
            { type: 'warning' }
        )
        const res = await deleteFolder(id)
        if (res.data.code === 1) {
            if (folders.value.length <= 1 && currentPage.value > 1) {
                currentPage.value--
            }
            await fetchFolders()
        } else {
            alert('Failed to delete folder')
        }
    } catch (error) {
        console.error('Delete folder error:', error)
    }
}

onMounted(() => {
    fetchFolders()
})
</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.2s ease-out;
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