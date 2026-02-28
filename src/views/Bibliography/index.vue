<template>
  <div class="p-6 bg-white min-h-screen" v-loading="loading" element-loading-text="Processing...">
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800">My Bibliography Library</h2>
      <div class="flex gap-3">
        <button v-if="!isSelectMode" @click="isSelectMode = true"
          class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md">
          Select Files
        </button>

        <template v-else>
          <button @click="openFolderDialog" :disabled="selectedIds.length === 0"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md disabled:opacity-50 flex items-center gap-2">
            <span>📁</span> Add to Folder ({{ selectedIds.length }})
          </button>
          <button @click="handleBatchDelete" :disabled="selectedIds.length === 0"
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md disabled:opacity-50">
            Delete ({{ selectedIds.length }})
          </button>
          <button @click="exitSelectMode"
            class="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            Cancel
          </button>
        </template>

        <button v-if="!isSelectMode" @click="triggerFileSelect"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2">
          <span>+</span> Upload File(s)
        </button>
      </div>
      <input type="file" ref="fileInput" class="hidden" @change="onFileSelected" accept=".pdf" />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div v-for="item in bibliographyList" :key="item.id"
        class="border-2 rounded-xl p-4 transition-all bg-gray-50 flex flex-col justify-between group relative" :class="[
          selectedIds.includes(item.id) ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-indigo-100',
          !isSelectMode ? 'hover:shadow-lg' : ''
        ]">
        <div v-if="isSelectMode" class="absolute top-3 right-3 z-10">
          <input type="checkbox" :value="item.id" v-model="selectedIds"
            class="w-5 h-5 text-indigo-600 rounded cursor-pointer" />
        </div>

        <div @click="!isSelectMode && goToDetail(item.id)" :class="!isSelectMode ? 'cursor-pointer' : 'cursor-default'">
          <div class="text-indigo-600 mb-3">
            <span class="text-3xl">📄</span>
          </div>
          <h3 class="font-semibold text-gray-800 text-sm line-clamp-2 mb-2"
            :class="!isSelectMode && 'group-hover:text-indigo-600'">
            {{ item.title || 'Unknown Title' }}
          </h3>
          <p class="text-gray-500 text-[11px] mb-1">Author: {{ item.author || 'Unknown Author' }}</p>
          <p class="text-gray-400 text-[10px]">Publication Date: {{ item.publish_date || 'N/A' }}</p>
        </div>

        <div class="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
          <span class="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded">PDF</span>
          <button v-if="!isSelectMode" class="text-xs text-gray-400 hover:text-red-500"
            @click.stop="handleDelete(item.id)">
            Delete
          </button>
        </div>
      </div>
    </div>

    <div class="mt-10 flex justify-center">
      <el-pagination v-model:current-page="currentPage" :page-size="8" :total="totalCount" layout="prev, pager, next"
        background @current-change="handlePageChange" />
    </div>

    <el-dialog v-model="uploadDialogVisible" title="Confirm uploading files" width="500px">
      <div class="max-h-60 overflow-y-auto border rounded-md p-2">
        <div v-for="(file, index) in pendingFiles" :key="index"
          class="flex justify-between items-center p-2 hover:bg-gray-50 border-b last:border-0">
          <span class="text-sm truncate flex-1 mr-4">📄 {{ file.name }}</span>
          <button @click="removePendingFile(index)" class="text-red-400 hover:text-red-600 text-lg font-bold">×</button>
        </div>
        <div v-if="pendingFiles.length === 0" class="text-center py-4 text-gray-400">No pending files</div>
      </div>
      <div class="mt-4 flex justify-between items-center">
        <span class="text-xs text-gray-500">Limit: {{ pendingFiles.length }} / 10</span>
        <button @click="triggerFileSelect" :disabled="pendingFiles.length >= 10"
          class="text-indigo-600 text-sm hover:underline disabled:text-gray-300">
          + Add More Files
        </button>
      </div>
      <template #footer>
        <el-button @click="cancelUpload">Cancel</el-button>
        <el-button type="primary" @click="confirmAndUpload" :disabled="pendingFiles.length === 0">Upload</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="deleteDialogVisible" title="Delete Confirmation" width="400px" @closed="resetDeleteState">
      <div class="py-2">
        <p class="mb-4 text-gray-600">
          {{ isBatch ? 'Are you sure you want to delete these files?' : 'Are you sure you want to delete this bibliography?'}}
        </p>
        <el-checkbox v-model="hasConfirmed">I confirm to delete {{ isBatch ? 'these files' : 'this file'
        }}.</el-checkbox>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialogVisible = false">Cancel</el-button>
          <el-button type="danger" :disabled="!hasConfirmed" @click="confirmDeleteAction">
            Delete
          </el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-model="folderDialogVisible" title="Add to Folder" width="400px">
      <div v-loading="loadingFolders" class="py-4">
        <p class="mb-3 text-sm text-gray-600">Select a folder to add {{ selectedIds.length }} paper(s):</p>
        
        <el-select v-model="selectedFolderId" placeholder="Select a folder" class="w-full" size="large">
          <el-option
            v-for="folder in availableFolders"
            :key="folder.id"
            :label="folder.name"
            :value="folder.id"
          >
            <span style="float: left">{{ folder.name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ folder.paper_count }} papers</span>
          </el-option>
        </el-select>

        <div v-if="availableFolders.length === 0 && !loadingFolders" class="mt-4 text-sm text-red-500 bg-red-50 p-3 rounded">
          No folders available. Please create a folder first in the "Folders" menu.
        </div>
      </div>
      <template #footer>
        <el-button @click="folderDialogVisible = false">Cancel</el-button>
        <el-button type="primary" :disabled="!selectedFolderId || isAddingToFolder" @click="confirmAddToFolder">
          {{ isAddingToFolder ? 'Adding...' : 'Confirm' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getBibliography, addBibliography, deleteBibliography } from '@/apis/bibliography'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { getFolderList, batchUpdateFolderPapers } from '@/apis/folder'

const router = useRouter()
const bibliographyList = ref([])
const fileInput = ref(null)
const loading = ref(false)
const currentPage = ref(1)
const totalCount = ref(0)

// 模式切换与选择状态
const isSelectMode = ref(false)
const selectedIds = ref([])

// 上传预览状态
const uploadDialogVisible = ref(false)
const pendingFiles = ref([])

// 删除逻辑状态
const deleteDialogVisible = ref(false)
const hasConfirmed = ref(false)
const targetDeleteId = ref(null)
const isBatch = ref(false)

// 新增文件夹相关的状态变量
const folderDialogVisible = ref(false)
const availableFolders = ref([])
const selectedFolderId = ref(null)
const loadingFolders = ref(false)
const isAddingToFolder = ref(false)


const openFolderDialog = async () => {
  folderDialogVisible.value = true
  selectedFolderId.value = null
  loadingFolders.value = true
  
  try {
    const res = await getFolderList()
    if (res.data.code === 1) {
      availableFolders.value = res.data.data
    }
  } catch (error) {
    ElMessage.error('Failed to load folders')
  } finally {
    loadingFolders.value = false
  }
}


// 确认将选中的文献加入选中的文件夹
const confirmAddToFolder = async () => {
  if (!selectedFolderId.value) return
  
  isAddingToFolder.value = true
  try {
    // 调用后端的批量更新接口，action 传 'add'
    const res = await batchUpdateFolderPapers(selectedFolderId.value, 'add', selectedIds.value)
    
    if (res.data.code === 1) {
      ElMessage.success('Successfully added to folder')
      folderDialogVisible.value = false
      exitSelectMode() // 添加成功后退出多选模式
    } else {
      ElMessage.error(res.data.message || 'Failed to add to folder')
    }
  } catch (error) {
    ElMessage.error('An error occurred while adding to folder')
  } finally {
    isAddingToFolder.value = false
  }
}


const exitSelectMode = () => {
  isSelectMode.value = false
  selectedIds.value = []
}

// 1. 触发文件选择
const triggerFileSelect = () => fileInput.value.click()

// 2. 文件选择后的初步处理
const onFileSelected = (e) => {
  const selected = Array.from(e.target.files)

  // 合并到预览列表，并去重（通过文件名）或直接添加
  const newBatch = [...pendingFiles.value, ...selected]

  // 限制最多 10 个
  if (newBatch.length > 10) {
    ElMessage.warning('No more than 10 files for upload')
    pendingFiles.value = newBatch.slice(0, 10)
  } else {
    pendingFiles.value = newBatch
  }

  // 显示预览窗口
  uploadDialogVisible.value = true
  fileInput.value.value = null // 清空 input 允许重复选同名文件
}

// 3. 预览窗口内部操作
const removePendingFile = (index) => {
  pendingFiles.value.splice(index, 1)
}

const cancelUpload = () => {
  uploadDialogVisible.value = false
  pendingFiles.value = []
}

// 4. 最终确认上传
const confirmAndUpload = async () => {
  if (pendingFiles.value.length === 0) return

  const formData = new FormData()
  let uploadUrl = ''

  // 接口路由判定
  if (pendingFiles.value.length === 1) {
    formData.append('file', pendingFiles.value[0])
    uploadUrl = '/bibli/upload'
  } else {
    pendingFiles.value.forEach(file => {
      formData.append('file', file)
    })
    uploadUrl = '/bibli/upload_multi'
  }

  uploadDialogVisible.value = false
  loading.value = true // 进入加载状态，锁定 UI

  try {
    const res = await addBibliography(formData, uploadUrl)
    if (res.data.code === 1) {
      ElMessage.success(pendingFiles.value.length === 1 ? 'Upload Successfully' : `Successfully uploaded ${pendingFiles.value.length} files`)
      pendingFiles.value = []
      currentPage.value = 1
      await fetchList()
    } else {
      ElMessage.error(res.data.message || 'Upload Failed')
    }
  } catch (err) {
    ElMessage.error('Network Error or Server Busy')
  } finally {
    loading.value = false
  }
}

const goToDetail = (id) => {
  router.push(`/bibliography/${id}`)
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getBibliography(currentPage.value)
    if (res.data.code === 1) {
      bibliographyList.value = res.data.data.list
      totalCount.value = res.data.data.total
    }
  } catch (err) {
    console.error(err)
    ElMessage.error('Failed to load bibliography')
  } finally {
    loading.value = false
  }
}

// 分页切换处理
const handlePageChange = (page) => {
  currentPage.value = page
  fetchList()
}

// 确保在删除或上传后回到第一页或刷新当前页
const confirmDeleteAction = async () => {
  loading.value = true
  try {
    if (isBatch.value) {
      await Promise.all(selectedIds.value.map(id => deleteBibliography(id)))
      exitSelectMode()
    } else {
      await deleteBibliography(targetDeleteId.value)
    }
    ElMessage.success('Deleted successfully')

    // 如果当前页删没了，且不是第一页，则往前跳一页
    if (bibliographyList.value.length <= 1 && currentPage.value > 1) {
      currentPage.value--
    }
    fetchList()
  } catch (err) {
    ElMessage.error('Delete failed')
  } finally {
    loading.value = false
    deleteDialogVisible.value = false
  }
}



// 单个删除调用
const handleDelete = (id) => {
  isBatch.value = false
  targetDeleteId.value = id
  deleteDialogVisible.value = true
}

// 批量删除调用
const handleBatchDelete = () => {
  isBatch.value = true
  deleteDialogVisible.value = true
}

const resetDeleteState = () => {
  hasConfirmed.value = false
  targetDeleteId.value = null
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
/* 保持原样式 */
.line-clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>