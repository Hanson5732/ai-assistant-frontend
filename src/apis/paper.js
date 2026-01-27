import request from '@/utils/request'

/**
 * 流式处理接口
 * @param {*} file 
 * @param {*} size 
 * @param {*} sessionId 
 * @param {*} onMessage 
 */
export const processPaper = async (file, size = 'medium', sessionId, onMessage) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('size', size);
    formData.append('sessionId', sessionId || 'null');

    const response = await fetch('/api/process-paper', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Network response error');
    }

    // 获取可读流读取器
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {  // eslint-disable-line no-constant-condition
        const { done, value } = await reader.read();
        if (done) break;

        // 解码获取到的二进制数据并传给回调函数
        const chunk = decoder.decode(value, { stream: true });
        if (onMessage) {
            onMessage(chunk);
        }
    }
}

/**
 * 与论文进行聊天
 * @param {*} message 
 * @param {*} sessionId 
 * @param {*} onMessage 
 */
export const chatWithPaper = async (message, sessionId, onMessage) => {
    const response = await fetch('/api/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sessionId }),
    });

    if (!response.ok) throw new Error('Chat request failed');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {  // eslint-disable-line no-constant-condition
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (onMessage) onMessage(chunk);
    }
}

/**
 * 获取历史聊天记录
 * @param {*} sessionId 
 * @returns 
 */
export const getSessionDetail = (sessionId) => {
  return request({
    url: `/api/chat/session/${sessionId}`,
    method: 'GET'
  })
}