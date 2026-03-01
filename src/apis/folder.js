import request from '@/utils/request'

export const createFolder = (data) => {
  return request({
    url: '/folder/create',
    method: 'post',
    data
  })
}


export const deleteFolder = (id) => {
    return request({
        url: `/folder/delete/${id}`,
        method: 'DELETE'
    })
}


export const getFolderDetails = (id) => {
    return request({
        url: `/folder/${id}`,
        method: 'GET'
    })
}


export const batchUpdateFolderPapers = (id, action, paper_ids) => {
    return request({
        url: `/folder/${id}/papers`,
        method: 'POST',
        data: { action, paper_ids }
    })
}

export const getFolderList = (page = 1) => {
    return request({
        url: '/folder/list',
        method: 'GET',
        params: { page }
    })
}

export const searchFolders = (name) => {
    return request({
        url: '/folder/search',
        method: 'POST',
        data: { name }
    })
}