import { axiosi } from '../../config/axios'

export const fetchNotifications = async () => {
    try {
        const res = await axiosi.get('/notifications/me')
        return res.data
    } catch (error) {
        throw error.response.data
    }
}

export const markAsRead = async (id) => {
    try {
        const res = await axiosi.patch(`/notifications/me/${id}`)
        return res.data
    } catch (error) {
        throw error.response.data
    }
}

export const markAllAsRead = async () => {
    try {
        const res = await axiosi.patch('/notifications/me/all/mark-read')
        return res.data
    } catch (error) {
        throw error.response.data
    }
}
