import { createContext, useContext, useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import { BASE_URL } from '../api/apiConfig'
import chatRoomService from '../api/chatRoomService'
import logger from '../utils/logger'

const ChatContext = createContext()

export const useChatNotifications = () => {
  const context = useContext(ChatContext)
  if (!context) {
    // Return default values instead of throwing error - allow components to work without provider
    return { 
      unreadCount: 0, 
      clearUnreadCount: () => {}, 
      setActiveRoom: () => {} 
    }
  }
  return context
}

export const ChatProvider = ({ children, userRole, userId }) => {
  const [unreadCount, setUnreadCount] = useState(0)
  const location = useLocation()
  const stompClientRef = useRef(null)
  const subscriptionsRef = useRef(new Map())
  const activeRoomRef = useRef(null)
  const roomsCacheRef = useRef([])
  const hasFetchedRoomsRef = useRef(false)

  // Check if currently on chat page
  const isOnChatPage = location.pathname.includes('/chat')

  useEffect(() => {
    if (userId && userRole && !isOnChatPage) {
      connectWebSocket()
    } else if (isOnChatPage) {
      // Clear notifications when entering chat page
      setUnreadCount(0)
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [userId, userRole, isOnChatPage])

  // Fetch rooms only once on mount
  useEffect(() => {
    if (userId && userRole && !hasFetchedRoomsRef.current) {
      fetchAndCacheRooms()
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

  const fetchAndCacheRooms = async () => {
    try {
      const result = await chatRoomService.getMyChatRooms()
      if (result.success) {
        roomsCacheRef.current = result.data || []
        hasFetchedRoomsRef.current = true
        logger.log('📦 Chat rooms cached:', roomsCacheRef.current.length)
      }
    } catch (error) {
      logger.error('Failed to fetch chat rooms:', error)
    }
  }

  const subscribeToNotifications = async () => {
    try {
      // Use cached rooms instead of fetching again
      const rooms = roomsCacheRef.current
      
      if (rooms.length === 0 && !hasFetchedRoomsRef.current) {
        // Only fetch if cache is empty and hasn't been fetched yet
        await fetchAndCacheRooms()
      }

      // Subscribe to each room for new messages
      roomsCacheRef.current.forEach(room => {
        if (room.status !== 'CLOSED') {
          subscribeToRoom(room.id)
        }
      })

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
      
      // Only count messages from others AND not in currently active room
      if (chatMessage.senderId !== userId && !chatMessage.type && activeRoomRef.current !== roomId) {
        setUnreadCount(prev => prev + 1)
      }
    })

    subscriptionsRef.current.set(roomId, subscription)
  }

  const clearUnreadCount = () => {
    setUnreadCount(0)
  }

  const setActiveRoom = (roomId) => {
    activeRoomRef.current = roomId
  }

  const value = {
    unreadCount,
    clearUnreadCount,
    setActiveRoom
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
