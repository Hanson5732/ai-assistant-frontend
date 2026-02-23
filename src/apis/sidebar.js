import request from "@/utils/request";

export const getSessions = async () => {
    return request({
        url: '/chat/sessions',
        method: 'GET'
    })
}


export const deleteSession = async (sessionId) => {
    return request({
        url: `/chat/delete/${sessionId}`,
        method: 'DELETE'
    })
}