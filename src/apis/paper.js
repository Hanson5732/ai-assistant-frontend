/**
 * 流式处理接口
 * @param {*} file 
 * @param {*} size 
 * @param {*} onMessage 
 */
export const processPaper = async (file, size = 'medium', onMessage) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('size', size);

    const response = await fetch('/api/process-paper', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('网络响应错误');
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