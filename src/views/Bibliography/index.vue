<template>
  <div class="p-6 bg-white min-h-screen">
    <div class="flex justify-between items-center mb-8">
      <h2 class="text-2xl font-bold text-gray-800">My Bibliography Library</h2>
      <button 
        @click="triggerUpload"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2"
      >
        <span>+</span> Upload New Bibliography
      </button>
      <input type="file" ref="fileInput" class="hidden" @change="handleUpload" accept=".pdf" />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div 
        @click="goToDetail(item.id)"
        v-for="item in bibliographyList" 
        :key="item.id"
        class="border-2 border-indigo-100 rounded-xl p-4 hover:border-indigo-500 hover:shadow-lg transition-all bg-gray-50 flex flex-col justify-between group"
      >
        <div>
          <div class="text-indigo-600 mb-3">
            <span class="text-3xl">📄</span>
          </div>
          <h3 class="font-semibold text-gray-800 text-sm line-clamp-2 mb-2 group-hover:text-indigo-600">
            {{ item.title || 'Unknown Title' }}
          </h3>
          <p class="text-gray-500 text-[11px] mb-1">Author: {{ item.author || 'Unknown Author' }}</p>
          <p class="text-gray-400 text-[10px]">Publication Date: {{ item.publish_date || 'N/A' }}</p>
        </div>
        
        <div class="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
          <span class="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded">PDF</span>
          <button 
            class="text-xs text-gray-400 hover:text-red-500"
            @click="handleDelete(item.id)"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <div v-if="bibliographyList.length === 0" class="text-center py-20 text-gray-400">
      <p>No bibliography found. Please upload a file.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getBibliography, addBibliography, deleteBibliography } from '@/apis/bibliography'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const bibliographyList = ref([])
const fileInput = ref(null)

const goToDetail = (id) => {
  router.push(`/bibliography/${id}`)
}

// 获取文献列表
const fetchList = async () => {
  try {
    const res = await getBibliography() // 假设你有获取列表的接口
    if (res.data.code === 1) bibliographyList.value = res.data.data
  } catch (err) {
    console.error(err)
  }
}

const triggerUpload = () => fileInput.value.click()

// 处理上传逻辑
const handleUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await addBibliography(formData)
    if (res.code === 1) {
      fetchList() // 刷新列表
    }
  } catch (err) {
    // alert('上传失败')
  }
}

onMounted(() => {
  fetchList()
})

const handleDelete = async (id) => {
  ElMessageBox.confirm('Are you sure you want to delete this bibliography?', 'Delete Confirmation', {
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await deleteBibliography(id)
      if (res.data.code === 1) {
        // 删除成功后重新获取列表
        fetchList()
      } else {
        ElMessage.error(res.data.message)
      }
    } catch (err) {
      // console.error(err)
    }
  }).catch(() => {
    // 用户取消删除
    return
  })
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>