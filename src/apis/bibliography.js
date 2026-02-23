import request from '@/utils/request'

export const getBibliography = async (page = 1) => {
    return request({
        url: '/bibli/list',
        method: 'GET',
        params: { page }
    })
}

export const addBibliography = async (data, url= '/bibli/upload') => {
    return request({
        url: url,
        method: 'POST',
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        timeout: 600000
    })
}


export const deleteBibliography = async (id) => {
    return request({
        url: `/bibli/delete/${id}`,
        method: 'DELETE'
    })
}

export const getBibliographyDetail = async (id) => {
    return request({
        url: `/bibli/detail/${id}`,
        method: 'GET'
    })
}