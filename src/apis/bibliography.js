import request from '@/utils/request'

export const getBibliography = async () => {
    return request({
        url: '/bibli/list',
        method: 'GET'
    })
}

export const addBibliography = async (data) => {
    return request({
        url: '/bibli/upload',
        method: 'POST',
        data
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