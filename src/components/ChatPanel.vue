<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[500px]">
    <div class="p-4 border-b bg-gray-50 rounded-t-xl">
      <h3 class="font-bold text-gray-700">Contextual Q&A</h3>
    </div>
    <div class="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50 text-sm">
      <div class="flex justify-end">
        <div class="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none max-w-[85%] shadow-sm">
          What are the major technical challenges mentioned in Chapter 4?
        </div>
      </div>
      <div class="flex justify-start">
        <div class="bg-white border p-3 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm text-gray-700">
          <p class="font-bold text-[10px] text-indigo-600 uppercase mb-1">DeepSeek Assistant</p>
          According to Section 4.3, major challenges include <strong>data processing bottlenecks</strong> for large PDFs (initially >10s) and ensuring <strong>API rate limit management</strong> while maintaining sub-5s response times.
        </div>
      </div>
    </div>
    <div class="p-4 border-t bg-white flex gap-2">
      <input type="text" placeholder="Ask DeepSeek about the paper..." class="flex-1 border border-gray-300 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
      <button class="bg-indigo-600 text-white px-6 py-2.5 rounded-full hover:bg-indigo-700 font-bold text-sm transition-colors shadow-sm">Send</button>
    </div>
  </div>
</template>