<template>
  <div class="p-6 bg-white min-h-screen text-gray-900" v-loading="loading">
    
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold tracking-tight">My Folders</h2>
      
      <div class="flex items-center gap-2">
        <div class="relative group">
          <input v-model="searchQuery" type="text" placeholder="Search folders..." 
            class="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200/60 rounded-xl focus:bg-white focus:ring-1 focus:ring-gray-300 focus:border-gray-400 outline-none transition-all text-sm"
            @keyup.enter="handleSearch" />
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4 text-gray-400 absolute left-3 top-3"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <button v-if="isSearchMode" @click="clearSearch" class="text-xs text-red-500 hover:text-red-700 font-medium ml-2">Clear</button>
      </div>
    </div>

    <div class="mb-8">
      <button @click="createDialogVisible = true" class="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm font-medium w-fit">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        New Folder
      </button>
    </div>

    <div v-if="folders.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="folder in folders" :key="folder.id" @click="goToDetail(folder.id)"
        class="group border border-gray-200/60 rounded-2xl p-5 bg-white hover:border-gray-400 hover:shadow-sm transition-all cursor-pointer relative flex flex-col">
        
        <div class="flex justify-between items-start mb-6">
          <div class="text-gray-400 group-hover:text-black transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
          </div>
          <button @click.stop="handleDelete(folder)" class="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
        
        <h3 class="font-semibold text-gray-900 truncate mb-1">{{ folder.name }}</h3>
        <p class="text-xs text-gray-500 mb-4">{{ folder.paper_count || 0 }} papers</p>
        <div class="mt-auto text-[10px] text-gray-400 uppercase tracking-wide">Created {{ folder.create_time }}</div>
      </div>
    </div>

    <div v-else class="text-center py-24 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
      <div class="flex justify-center mb-4 text-gray-300">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-12 h-12"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
      </div>
      <h3 class="text-sm font-medium text-gray-900 mb-1">No folders yet</h3>
      <p class="text-gray-500 text-xs">Create a new folder to organize your library.</p>
    </div>

    <div class="mt-8 flex justify-center" v-if="!isSearchMode && totalCount > 0">
      <el-pagination v-model:current-page="currentPage" :page-size="8" :total="totalCount" layout="prev, pager, next" background @current-change="handlePageChange" />
    </div>

    <el-dialog v-model="createDialogVisible" title="Create New Folder" width="400px">
      <div class="py-2">
        <label class="block text-sm font-medium text-gray-700 mb-2">Folder Name</label>
        <el-input v-model="newFolderName" placeholder="Enter folder name..." @keyup.enter="submitCreate" />
      </div>
      <template #footer>
        <el-button @click="createDialogVisible = false">Cancel</el-button>
        <el-button type="primary" :disabled="!newFolderName.trim()" @click="submitCreate" class="bg-black hover:bg-gray-800 border-none">Create</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getFolderList, createFolder, deleteFolder, searchFolders } from '@/apis/folder'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const folders = ref([])
const loading = ref(false)
const currentPage = ref(1)
const totalCount = ref(0)

// 搜索状态
const searchQuery = ref('')
const isSearchMode = ref(false)

// 新建文件夹状态
const createDialogVisible = ref(false)
const newFolderName = ref('')

const fetchFolders = async () => {
  loading.value = true
  try {
    const res = await getFolderList(currentPage.value)
    if (res.data.code === 1) {
      folders.value = res.data.data.list
      totalCount.value = res.data.data.total
    }
  } catch (error) {
    ElMessage.error('Failed to load folders')
  } finally {
    loading.value = false
  }
}

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    return clearSearch()
  }
  
  loading.value = true
  try {
    const res = await searchFolders({ name: searchQuery.value.trim() }) // 根据后端接口规范传递 JSON 对象
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

const clearSearch = () => {
  searchQuery.value = ''
  isSearchMode.value = false
  currentPage.value = 1
  fetchFolders()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchFolders()
}

// 新建文件夹提交逻辑
const submitCreate = async () => {
  if (!newFolderName.value.trim()) return
  
  try {
    const res = await createFolder({ name: newFolderName.value })
    if (res.data.code === 1) {
      ElMessage.success('Folder created successfully')
      createDialogVisible.value = false
      newFolderName.value = ''
      fetchFolders()
    } else {
      ElMessage.error(res.data.message || 'Failed to create folder')
    }
  } catch (error) {
    ElMessage.error('Failed to create folder')
  }
}

const handleDelete = async (folder) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete "${folder.name}"? This action cannot be undone.`,
      'Delete Folder',
      { 
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        type: 'warning' 
      }
    )
    
    const res = await deleteFolder(folder.id)
    if (res.data.code === 1) {
      ElMessage.success('Folder deleted')
      // 如果当前页删空了并且不是第一页，则往前翻一页
      if (folders.value.length === 1 && currentPage.value > 1) {
          currentPage.value--
      }
      fetchFolders()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('Delete failed')
    }
  }
}

const goToDetail = (id) => {
  router.push(`/folder/${id}`)
}

onMounted(() => {
  fetchFolders()
})
</script>