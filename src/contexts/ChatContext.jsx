import { createContext, useContext, useState, useEffect, useRef } from 'react'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import { BASE_URL } from '../api/apiConfig'
import chatRoomService from '../api/chatRoomService'
import logger from '../utils/logger'

const ChatContext = createContext()

export const useChatNotifications = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatNotifications must be used within ChatProvider')
  }
  return context
}

export const ChatProvider = ({ children, userRole, userId }) => {
  const [unreadCount, setUnreadCount] = useState(0)
  const stompClientRef = useRef(null)
  const subscriptionsRef = useRef(new Map())

  useEffect(() => {
    if (userId && userRole) {
      connectWebSocket()
    }

    return () => {
      disconnect()
    }
  }, [userId, userRole])

  const connectWebSocket = () => {
    const token = localStorage.getItem('accessToken')
    if (!token) return

    try {
      const client = new Client({
        brokerURL: null,
        connectHeaders: {
          'Authorization': `Bearer ${token}`
        },
        debug: () => {},
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        webSocketFactory: () => new SockJS(`${BASE_URL}/api/ws`)
      })

      client.onConnect = () => {
        logger.log('📬 Chat notifications connected')
        stompClientRef.current = client
        subscribeToNotifications()
      }

      client.onWebSocketError = (error) => {
        logger.error('Chat notification WS error:', error)
      }

      client.activate()
    } catch (error) {
      logger.error('Failed to connect chat notifications:', error)
    }
  }

  const disconnect = () => {
    subscriptionsRef.current.forEach(sub => sub.unsubscribe())
    subscriptionsRef.current.clear()
    if (stompClientRef.current) {
      stompClientRef.current.deactivate()
    }
  }

  const subscribeToNotifications = async () => {
    try {
      // Load initial unread count
      const result = await chatRoomService.getMyChatRooms()
      if (result.success) {
        const rooms = result.data || []
        
        // Subscribe to each room for new messages
        rooms.forEach(room => {
          if (room.status !== 'CLOSED') {
            subscribeToRoom(room.id)
          }
        })
      }

      // Subscribe to lobby for staff
      if (userRole === 'ROLE_STAFF') {
        const lobbySubscription = stompClientRef.current.subscribe('/topic/staff-lobby', (message) => {
          const payload = JSON.parse(message.body)
          if (payload.id && payload.status === 'PENDING') {
            setUnreadCount(prev => prev + 1)
          }
        })
        subscriptionsRef.current.set('lobby', lobbySubscription)
      }
    } catch (error) {
      logger.error('Failed to subscribe to notifications:', error)
    }
  }

  const subscribeToRoom = (roomId) => {
    if (subscriptionsRef.current.has(roomId)) return

    const subscription = stompClientRef.current.subscribe(`/topic/chat-room/${roomId}`, (message) => {
      const chatMessage = JSON.parse(message.body)
      
      // Only count messages from others
      if (chatMessage.senderId !== userId && !chatMessage.type) {
        setUnreadCount(prev => prev + 1)
      }
    })

    subscriptionsRef.current.set(roomId, subscription)
  }

  const clearUnreadCount = () => {
    setUnreadCount(0)
  }

  const value = {
    unreadCount,
    clearUnreadCount
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
