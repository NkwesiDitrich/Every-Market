import { axiosi as axios } from '../../config/axios'

export const fetchConversations = async (role) => {
    try {
        const endpoint = role === 'seller' ? '/sellers/conversations' : '/conversations/me'
        const res = await axios.get(endpoint)
        return res.data
    } catch (error) {
        throw error.response?.data || { message: "Network error or server unreachable" }
    }
}

export const fetchMessages = async (conversationId, role) => {
    try {
        const endpoint = role === 'seller'
            ? `/sellers/conversations/${conversationId}/messages`
            : `/conversations/${conversationId}/messages`
        const res = await axios.get(endpoint)
        return res.data
    } catch (error) {
        throw error.response?.data || { message: "Network error or server unreachable" }
    }
}

export const sendMessage = async (conversationId, body, role) => {
    try {
        const endpoint = role === 'seller'
            ? `/sellers/conversations/${conversationId}/messages`
            : `/conversations/${conversationId}/messages`
        const res = await axios.post(endpoint, { body })
        return res.data
    } catch (error) {
        throw error.response?.data || { message: "Network error or server unreachable" }
    }
}

export const createConversation = async (sellerId, orderId, productId, body) => {
    try {
        const res = await axios.post('/conversations', { sellerId, orderId, productId, body })
        return res.data
    } catch (error) {
        throw error.response?.data || { message: "Network error or server unreachable" }
    }
}
