import request from "@/utils/request";

export const getSessions = async () => {
    return request({
        url: '/chat/sessions',
        method: 'GET'
    })
}