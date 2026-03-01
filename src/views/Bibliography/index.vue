<template>
  <div class="p-6 bg-white min-h-screen" v-loading="loading" element-loading-text="Processing...">
    <div class="flex justify-between items-start mb-4">
      <h2 class="text-2xl font-bold text-gray-800">My Bibliography Library</h2>
      
      <div class="flex items-center gap-2">
        <div class="relative">
          <input 
            v-model="searchText" 
            type="text" 
            placeholder="Search by title..." 
            class="w-64 pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
            @keyup.enter="handleBasicSearch"
          />
          <button @click="handleBasicSearch" class="absolute right-3 top-2.5 text-gray-400 hover:text-indigo-600">
            🔍
          </button>
        </div>
        <button 
          @click="handleBasicSearch"
          class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
        >
          Search
        </button>
        <button 
          @click="deepSearchDialogVisible = true"
          class="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium shadow-sm"
        >
          Deep Search
        </button>
        <button 
          v-if="isSearchMode" 
          @click="clearSearch"
          class="text-xs text-red-500 hover:underline"
        >
          Clear Results
        </button>
      </div>
    </div>

    <div class="flex justify-start items-center gap-3 mb-8">
      <button v-if="!isSelectMode" @click="isSelectMode = true"
        class="multi-select-mode-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md text-sm">
        Select Files
      </button>

      <template v-else>
        <button @click="openFolderDialog" :disabled="selectedIds.length === 0"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md disabled:opacity-50 flex items-center gap-2 text-sm">
          <span>📁</span> Add to Folder ({{ selectedIds.length }})
        </button>
        <button @click="handleBatchDelete" :disabled="selectedIds.length === 0"
          class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md disabled:opacity-50 text-sm">
          Delete ({{ selectedIds.length }})
        </button>
        <button @click="exitSelectMode"
          class="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm">
          Cancel
        </button>
      </template>

      <button v-if="!isSelectMode" @click="triggerFileSelect"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2 text-sm">
        <span>+</span> Upload File(s)
      </button>
      <input type="file" ref="fileInput" class="hidden" @change="onFileSelected" accept=".pdf" />
    </div>

    <div v-if="bibliographyList.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
          <p class="text-gray-500 text-[11px] mb-1">Author: {{ item.author || (item.authors ? item.authors.join(', ') : 'Unknown') }}</p>
          <p class="text-gray-400 text-[10px]">Publication Date: {{ item.publish_date || item.pub_year || 'N/A' }}</p>
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

    <div v-else class="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
      <span class="text-4xl block mb-3">📭</span>
      <h3 class="text-lg font-medium text-gray-900 mb-1">No bibliographies found</h3>
      <p class="text-gray-500 text-sm">Try adjusting your search or upload new files.</p>
    </div>

    <div class="mt-10 flex justify-center" v-if="!isSearchMode">
      <el-pagination v-model:current-page="currentPage" :page-size="8" :total="totalCount" layout="prev, pager, next"
        background @current-change="handlePageChange" />
    </div>

    <el-dialog v-model="deepSearchDialogVisible" title="Deep Search Bibliography" width="600px" @closed="resetDeepSearchFilters">
      <div class="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
        <div class="flex items-start gap-3">
          <input type="checkbox" v-model="deepFilters.title.enabled" class="mt-2 w-4 h-4 text-indigo-600 rounded cursor-pointer" />
          <div class="flex-1">
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Title</label>
            <textarea v-model="deepFilters.title.value" :disabled="!deepFilters.title.enabled" rows="2" placeholder="Enter paper title..."
                class="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none disabled:bg-gray-100 disabled:text-gray-400 transition-colors"></textarea>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <input type="checkbox" v-model="deepFilters.author.enabled" class="w-4 h-4 text-indigo-600 rounded cursor-pointer" />
          <div class="flex-1">
            <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Author</label>
            <input v-model="deepFilters.author.value" :disabled="!deepFilters.author.enabled" type="text" placeholder="e.g. John Doe"
                class="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 transition-colors" />
          </div>
        </div>
        <div class="flex gap-4">
          <div class="flex items-center gap-3 flex-1">
            <input type="checkbox" v-model="deepFilters.venue.enabled" class="w-4 h-4 text-indigo-600 rounded cursor-pointer" />
            <div class="flex-1">
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Venue</label>
              <input v-model="deepFilters.venue.value" :disabled="!deepFilters.venue.enabled" type="text" placeholder="e.g. CVPR"
                  class="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 transition-colors" />
            </div>
          </div>
          <div class="flex items-center gap-3 flex-1">
            <input type="checkbox" v-model="deepFilters.year.enabled" class="w-4 h-4 text-indigo-600 rounded cursor-pointer" />
            <div class="flex-1">
              <label class="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Year Range</label>
              <div class="flex items-center gap-2">
                <select v-model="deepFilters.year.start" :disabled="!deepFilters.year.enabled" class="w-full border border-gray-300 rounded-lg p-1 text-sm disabled:bg-gray-100">
                  <option value="">Start</option>
                  <option v-for="y in yearOptions" :key="'s-'+y" :value="y">{{ y }}</option>
                </select>
                <select v-model="deepFilters.year.end" :disabled="!deepFilters.year.enabled" class="w-full border border-gray-300 rounded-lg p-1 text-sm disabled:bg-gray-100">
                  <option value="">End</option>
                  <option v-for="y in yearOptions" :key="'e-'+y" :value="y">{{ y }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="deepSearchDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="handleDeepSearch" :loading="loading">Search</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="uploadDialogVisible" title="Confirm uploading files" width="500px">
        <template #footer>
          <el-button @click="cancelUpload">Cancel</el-button>
          <el-button type="primary" @click="confirmAndUpload" :disabled="pendingFiles.length === 0">Upload</el-button>
        </template>
    </el-dialog>

    <el-dialog v-model="deleteDialogVisible" title="Delete Confirmation" width="400px" @closed="resetDeleteState">
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="deleteDialogVisible = false">Cancel</el-button>
            <el-button type="danger" :disabled="!hasConfirmed" @click="confirmDeleteAction">Delete</el-button>
          </span>
        </template>
    </el-dialog>

    <el-dialog v-model="folderDialogVisible" title="Add to Folder" width="400px">
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
import { getBibliography, addBibliography, deleteBibliography, searchBibliography } from '@/apis/bibliography'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { getFolderList, batchUpdateFolderPapers } from '@/apis/folder'

const router = useRouter()
const bibliographyList = ref([])
const fileInput = ref(null)
const loading = ref(false)
const currentPage = ref(1)
const totalCount = ref(0)

// Search States
const searchText = ref('')
const isSearchMode = ref(false)
const deepSearchDialogVisible = ref(false)
const deepFilters = ref({
  title: { enabled: false, value: '' },
  author: { enabled: false, value: '' },
  year: { enabled: false, start: '', end: '' },
  venue: { enabled: false, value: '' }
})

// Year options for deep search (consistent with FolderDetail)
const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => currentYear - i)

// Selection & Mode States
const isSelectMode = ref(false)
const selectedIds = ref([])

// Other Dialog States (from original file)
const uploadDialogVisible = ref(false)
const pendingFiles = ref([])
const deleteDialogVisible = ref(false)
const hasConfirmed = ref(false)
const targetDeleteId = ref(null)
const isBatch = ref(false)
const folderDialogVisible = ref(false)
const availableFolders = ref([])
const selectedFolderId = ref(null)
const loadingFolders = ref(false)
const isAddingToFolder = ref(false)

// --- Search Logic ---

// Basic Fuzzy Title Search
const handleBasicSearch = async () => {
  if (!searchText.value.trim()) {
    return clearSearch()
  }
  
  loading.value = true
  try {
    const res = await searchBibliography({ title: searchText.value.trim() })
    if (res.data.code === 1) {
      bibliographyList.value = res.data.data
      isSearchMode.value = true
      // Note: Backend search currently returns all matches without pagination
      totalCount.value = res.data.data.length 
    }
  } catch (error) {
    ElMessage.error('Search failed')
  } finally {
    loading.value = false
  }
}

// Deep Multi-field Search
const handleDeepSearch = async () => {
  const payload = {}
  if (deepFilters.value.title.enabled && deepFilters.value.title.value.trim()) payload.title = deepFilters.value.title.value.trim()
  if (deepFilters.value.author.enabled && deepFilters.value.author.value.trim()) payload.author = deepFilters.value.author.value.trim()
  if (deepFilters.value.venue.enabled && deepFilters.value.venue.value.trim()) payload.venue = deepFilters.value.venue.value.trim()
  if (deepFilters.value.year.enabled) {
    if (deepFilters.value.year.start) payload.year_start = deepFilters.value.year.start
    if (deepFilters.value.year.end) payload.year_end = deepFilters.value.year.end
  }

  loading.value = true
  try {
    const res = await searchBibliography(payload)
    if (res.data.code === 1) {
      bibliographyList.value = res.data.data
      isSearchMode.value = true
      totalCount.value = res.data.data.length
      deepSearchDialogVisible.value = false
    }
  } catch (error) {
    ElMessage.error('Deep search failed')
  } finally {
    loading.value = false
  }
}

const clearSearch = () => {
  searchText.value = ''
  isSearchMode.value = false
  currentPage.value = 1
  fetchList()
}

const resetDeepSearchFilters = () => {
  deepFilters.value = {
    title: { enabled: false, value: '' },
    author: { enabled: false, value: '' },
    year: { enabled: false, start: '', end: '' },
    venue: { enabled: false, value: '' }
  }
}

// --- Original Logic (Maintained) ---

const fetchList = async () => {
  loading.value = true
  try {
    const res = await getBibliography(currentPage.value)
    if (res.data.code === 1) {
      bibliographyList.value = res.data.data.list
      totalCount.value = res.data.data.total
    }
  } catch (err) {
    ElMessage.error('Failed to load bibliography')
  } finally {
    loading.value = false
  }
}

// ... (Rest of original functions: openFolderDialog, confirmAddToFolder, exitSelectMode, triggerFileSelect, etc.) ...
// Note: Ensure handlePageChange, confirmAndUpload, and confirmDeleteAction are kept for core functionality.

const handlePageChange = (page) => {
  currentPage.value = page
  fetchList()
}

const exitSelectMode = () => {
  isSelectMode.value = false
  selectedIds.value = []
}

const triggerFileSelect = () => fileInput.value.click()

const onFileSelected = (e) => {
  const selected = Array.from(e.target.files)
  const newBatch = [...pendingFiles.value, ...selected]
  if (newBatch.length > 10) {
    ElMessage.warning('No more than 10 files for upload')
    pendingFiles.value = newBatch.slice(0, 10)
  } else {
    pendingFiles.value = newBatch
  }
  uploadDialogVisible.value = true
  fileInput.value.value = null
}

const cancelUpload = () => {
  uploadDialogVisible.value = false
  pendingFiles.value = []
}

const confirmAndUpload = async () => {
  if (pendingFiles.value.length === 0) return
  const formData = new FormData()
  let uploadUrl = pendingFiles.value.length === 1 ? '/bibli/upload' : '/bibli/upload_multi'
  pendingFiles.value.forEach(file => formData.append('file', file))

  uploadDialogVisible.value = false
  loading.value = true
  try {
    const res = await addBibliography(formData, uploadUrl)
    if (res.data.code === 1) {
      ElMessage.success('Upload Successfully')
      pendingFiles.value = []
      currentPage.value = 1
      await fetchList()
    }
  } catch (err) {
    ElMessage.error('Network Error')
  } finally {
    loading.value = false
  }
}

const goToDetail = (id) => router.push(`/bibliography/${id}`)

const handleDelete = (id) => {
  isBatch.value = false
  targetDeleteId.value = id
  deleteDialogVisible.value = true
}

const handleBatchDelete = () => {
  isBatch.value = true
  deleteDialogVisible.value = true
}

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
    if (bibliographyList.value.length <= 1 && currentPage.value > 1) currentPage.value--
    fetchList()
  } catch (err) {
    ElMessage.error('Delete failed')
  } finally {
    loading.value = false
    deleteDialogVisible.value = false
  }
}

const resetDeleteState = () => {
  hasConfirmed.value = false
  targetDeleteId.value = null
}

const openFolderDialog = async () => {
  folderDialogVisible.value = true
  selectedFolderId.value = null
  loadingFolders.value = true
  try {
    const res = await getFolderList()
    if (res.data.code === 1) availableFolders.value = res.data.data
  } catch (error) {
    ElMessage.error('Failed to load folders')
  } finally {
    loadingFolders.value = false
  }
}

const confirmAddToFolder = async () => {
  if (!selectedFolderId.value) return
  isAddingToFolder.value = true
  try {
    const res = await batchUpdateFolderPapers(selectedFolderId.value, 'add', selectedIds.value)
    if (res.data.code === 1) {
      ElMessage.success('Successfully added to folder')
      folderDialogVisible.value = false
      exitSelectMode()
    }
  } catch (error) {
    ElMessage.error('An error occurred')
  } finally {
    isAddingToFolder.value = false
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>