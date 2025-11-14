import { useState, useEffect, useRef } from 'react'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import chatRoomService from '../../api/chatRoomService'
import authService from '../../api/authService'
import logger from '../../utils/logger'
import { BASE_URL } from '../../api/apiConfig'
import '../../styles/ChatRoom.css'

const StaffChatRoom = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [pendingRooms, setPendingRooms] = useState([])
  const [myActiveRooms, setMyActiveRooms] = useState([])
  const [activeRoomId, setActiveRoomId] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [currentUserId, setCurrentUserId] = useState(null)
  
  const stompClientRef = useRef(null)
  const lobbySubscriptionRef = useRef(null)
  const activeSubscriptionsRef = useRef(new Map())
  const messagesEndRef = useRef(null)
  const activeRoomIdRef = useRef(null)
  const currentUserIdRef = useRef(null)

  useEffect(() => {
    initializeConnection()
    return () => {
      disconnect()
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Update ref when activeRoomId changes
  useEffect(() => {
    activeRoomIdRef.current = activeRoomId
  }, [activeRoomId])

  // Update ref when currentUserId changes
  useEffect(() => {
    currentUserIdRef.current = currentUserId
  }, [currentUserId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const initializeConnection = async () => {
    try {
      const userProfile = await authService.getUserProfile()
      if (userProfile.success && userProfile.data) {
        setCurrentUserId(userProfile.data.userId)
        connectWebSocket()
      }
    } catch (error) {
      logger.error('Failed to get user profile:', error)
      alert('Failed to load user information')
    }
  }

  const connectWebSocket = () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      alert('No authentication token found. Please login again.')
      return
    }

    try {
      logger.log('🔄 Connecting to WebSocket at:', `${BASE_URL}/api/ws`)
      
      // Use factory function for auto-reconnect support
      const client = new Client({
        brokerURL: null, // We're using SockJS, not direct WebSocket
        connectHeaders: {
          'Authorization': `Bearer ${token}`
        },
        debug: function (str) {
          // Disable debug logs
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        webSocketFactory: function () {
          return new SockJS(`${BASE_URL}/api/ws`)
        }
      })

      client.onConnect = (frame) => {
        logger.log('✅ Connected to WebSocket successfully')
        stompClientRef.current = client
        setIsConnected(true)
        subscribeToLobby()
        loadPendingRooms()
        loadMyActiveRooms()
      }

      client.onStompError = (frame) => {
        logger.error('❌ STOMP error:', frame)
        setIsConnected(false)
        alert('STOMP error: ' + frame.headers.message)
      }

      client.onWebSocketError = (error) => {
        logger.error('❌ WebSocket error:', error)
        setIsConnected(false)
      }

      client.onWebSocketClose = (event) => {
        logger.log('WebSocket closed:', event)
        setIsConnected(false)
      }

      client.activate()
      stompClientRef.current = client
      
    } catch (error) {
      logger.error('❌ WebSocket connection error:', error)
      alert('Failed to initialize chat connection: ' + error.message)
      setIsConnected(false)
    }
  }

  const disconnect = () => {
    // Unsubscribe from lobby
    if (lobbySubscriptionRef.current) {
      lobbySubscriptionRef.current.unsubscribe()
    }

    // Unsubscribe from all rooms
    activeSubscriptionsRef.current.forEach((subscription) => {
      subscription.unsubscribe()
    })
    activeSubscriptionsRef.current.clear()

    // Disconnect STOMP client
    if (stompClientRef.current) {
      stompClientRef.current.deactivate()
    }
    setIsConnected(false)
    logger.log('🔴 Disconnected from WebSocket')
  }

  const subscribeToLobby = () => {
    const lobbyTopic = '/topic/staff-lobby'
    logger.log(`Subscribing to ${lobbyTopic}...`)
    
    lobbySubscriptionRef.current = stompClientRef.current.subscribe(lobbyTopic, (message) => {
      const payload = JSON.parse(message.body)
      logger.log('Received lobby message:', payload)
      
      if (payload.id && payload.status === 'PENDING') {
        // New pending room
        setPendingRooms(prev => {
          // Check if already exists
          if (prev.some(room => room.id === payload.id)) {
            return prev
          }
          return [payload, ...prev]
        })
      } else if (payload.type === 'CLAIMED') {
        // Room was claimed by someone
        setPendingRooms(prev => prev.filter(room => room.id !== payload.roomId))
      }
    })
  }

  const loadPendingRooms = async () => {
    try {
      const result = await chatRoomService.getPendingChatRooms()
      if (result.success) {
        setPendingRooms(result.data || [])
      } else {
        logger.error('Failed to load pending rooms:', result.message)
      }
    } catch (error) {
      logger.error('Error loading pending rooms:', error)
    }
  }

  const loadMyActiveRooms = async () => {
    try {
      const result = await chatRoomService.getMyChatRooms()
      if (result.success) {
        const rooms = result.data || []
        const activeRooms = rooms.filter(room => room.status === 'ACTIVE')
        setMyActiveRooms(activeRooms)
        
        // Subscribe to all active rooms
        activeRooms.forEach(room => {
          subscribeToRoom(room.id)
        })
      } else {
        logger.error('Failed to load my active rooms:', result.message)
      }
    } catch (error) {
      logger.error('Error loading my active rooms:', error)
    }
  }

  const subscribeToRoom = (roomId) => {
    if (activeSubscriptionsRef.current.has(roomId)) {
      return // Already subscribed
    }

    const roomTopic = `/topic/chat-room/${roomId}`
    logger.log(`Subscribing to ${roomTopic}...`)
    
    const subscription = stompClientRef.current.subscribe(roomTopic, (message) => {
      const chatMessage = JSON.parse(message.body)
      logger.log('Received WS message:', chatMessage)
      logger.log('Current activeRoomId:', activeRoomIdRef.current)
      
      // Handle different message types
      if (chatMessage.type === 'CHAT_ENDED') {
        // Remove room from active list
        setMyActiveRooms(prevRooms => 
          prevRooms.filter(room => room.id !== chatMessage.roomId)
        )
        // Show system message if in active room
        if (chatMessage.roomId === activeRoomIdRef.current) {
          addSystemMessage(`Chat ended by ${chatMessage.endedBy}`)
        }
      } else if (chatMessage.type === 'STAFF_JOINED') {
        // Staff joined notification (ignore for staff)
        return
      } else if (!chatMessage.type && chatMessage.senderId !== currentUserIdRef.current) {
        // Regular message from customer
        if (chatMessage.roomId === activeRoomIdRef.current) {
          // Currently viewing this room - display message immediately
          logger.log('✅ Displaying message in active room')
          setMessages(prev => [...prev, {
            ...chatMessage,
            isOwn: false
          }])
        } else {
          // Different room - mark as unread
          logger.log('📩 Marking different room as unread')
          setMyActiveRooms(prevRooms => 
            prevRooms.map(room => 
              room.id === chatMessage.roomId ? { ...room, hasNewMessage: true } : room
            )
          )
        }
      }
    })
    
    activeSubscriptionsRef.current.set(roomId, subscription)
  }

  const addSystemMessage = (text) => {
    setMessages(prev => [...prev, {
      type: 'SYSTEM',
      content: text,
      timestamp: new Date().toISOString()
    }])
  }

  const handleJoinRoom = async (room) => {
    try {
      // Join the room via API
      const result = await chatRoomService.joinChatRoom(room.id)
      if (result.success) {
        // Remove from pending list
        setPendingRooms(prev => prev.filter(r => r.id !== room.id))
        
        // Add to my active rooms
        const joinedRoom = { ...room, status: 'ACTIVE' }
        setMyActiveRooms(prev => [joinedRoom, ...prev])
        
        // Subscribe to the room
        subscribeToRoom(room.id)
        
        // Switch to the room
        switchToRoom(room.id, true)
        
        addSystemMessage('You joined the chat')
      } else {
        alert(`Failed to join room: ${result.message}`)
      }
    } catch (error) {
      logger.error('Error joining room:', error)
      alert('Failed to join room')
    }
  }

  const switchToRoom = async (roomId, skipHistory = false) => {
    setActiveRoomId(roomId)
    setMessages([])
    
    // Clear new message flag
    setMyActiveRooms(prevRooms => 
      prevRooms.map(room => 
        room.id === roomId ? { ...room, hasNewMessage: false } : room
      )
    )

    // Load message history
    if (!skipHistory) {
      try {
        const result = await chatRoomService.getChatRoomMessages(roomId)
        if (result.success) {
          const history = result.data || []
          setMessages(history.map(msg => ({
            ...msg,
            isOwn: msg.senderId === currentUserId
          })))
        }
      } catch (error) {
        logger.error('Error loading message history:', error)
        addSystemMessage('Failed to load message history')
      }
    }
  }

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeRoomId) {
      return
    }

    const chatMessage = {
      roomId: activeRoomId,
      content: messageInput.trim()
    }

    stompClientRef.current.publish({
      destination: '/app/chat.sendRoomMessage',
      body: JSON.stringify(chatMessage)
    })
    
    // Add message to local state immediately
    setMessages(prev => [...prev, {
      content: messageInput.trim(),
      senderId: currentUserId,
      senderName: 'You',
      timestamp: new Date().toISOString(),
      isOwn: true
    }])
    
    setMessageInput('')
  }

  const handleEndChat = async () => {
    if (!activeRoomId) return
    
    if (!window.confirm('Are you sure you want to end this chat?')) {
      return
    }

    try {
      const result = await chatRoomService.closeChatRoom(activeRoomId)
      if (result.success) {
        addSystemMessage('Chat ended successfully')
        setMyActiveRooms(prevRooms => 
          prevRooms.filter(room => room.id !== activeRoomId)
        )
        setActiveRoomId(null)
        setMessages([])
      } else {
        alert(`Failed to end chat: ${result.message}`)
      }
    } catch (error) {
      logger.error('Error ending chat:', error)
      alert('Failed to end chat')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getActiveRoom = () => {
    return myActiveRooms.find(room => room.id === activeRoomId)
  }

  const activeRoom = getActiveRoom()

  return (
    <div className="chat-room-container staff">
      <div className="chat-room-header staff">
        <div className="header-content">
          <h1>👨‍💼 Staff Support Dashboard</h1>
          <div className="connection-status">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      <div className="chat-room-content">
        {/* Sidebar - Lobby & My Rooms */}
        <div className="chat-sidebar staff">
          {/* Pending Rooms (Lobby) */}
          <div className="sidebar-section">
            <div className="sidebar-header">
              <h2>🛎️ Pending Requests</h2>
              <span className="count-badge">{pendingRooms.length}</span>
            </div>
            
            <div className="rooms-list">
              {pendingRooms.length === 0 ? (
                <div className="no-rooms">
                  <p>No pending requests</p>
                </div>
              ) : (
                pendingRooms.map(room => (
                  <div
                    key={room.id}
                    className="room-item pending"
                    onClick={() => handleJoinRoom(room)}
                  >
                    <div className="room-info">
                      <h3>{room.name}</h3>
                      <span className="room-id">ID: {room.id}</span>
                    </div>
                    <button className="join-btn">Join</button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* My Active Rooms */}
          <div className="sidebar-section">
            <div className="sidebar-header">
              <h2>💬 My Active Chats</h2>
              <span className="count-badge">{myActiveRooms.length}</span>
            </div>
            
            <div className="rooms-list">
              {myActiveRooms.length === 0 ? (
                <div className="no-rooms">
                  <p>No active chats</p>
                  <p>Join a pending request to start</p>
                </div>
              ) : (
                myActiveRooms.map(room => (
                  <div
                    key={room.id}
                    className={`room-item active ${room.id === activeRoomId ? 'selected' : ''} ${room.hasNewMessage ? 'new-message' : ''}`}
                    onClick={() => switchToRoom(room.id)}
                  >
                    <div className="room-info">
                      <h3>{room.name}</h3>
                      <span className="room-id">ID: {room.id}</span>
                    </div>
                    {room.hasNewMessage && <span className="new-badge">New</span>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chat-main">
          {activeRoomId ? (
            <>
              <div className="chat-header staff">
                <div className="chat-title">
                  <h2>{activeRoom?.name}</h2>
                  <span className="chat-id">Room ID: {activeRoomId}</span>
                </div>
                <button className="end-chat-btn" onClick={handleEndChat}>
                  End Chat
                </button>
              </div>

              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>No messages yet</p>
                    <p>Waiting for customer...</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`message ${msg.type === 'SYSTEM' ? 'system' : msg.isOwn ? 'sent' : 'received'}`}
                    >
                      {msg.type === 'SYSTEM' ? (
                        <span className="system-text">{msg.content}</span>
                      ) : (
                        <>
                          <div className="message-header">
                            <span className="sender-name">{msg.isOwn ? 'You' : msg.senderName}</span>
                            <span className="message-time">
                              {new Date(msg.timestamp).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <div className="message-content">{msg.content}</div>
                        </>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="message-input-container">
                <textarea
                  className="message-input"
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows="3"
                />
                <button
                  className="send-btn"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="no-active-room">
              <h2>Welcome to Staff Support Dashboard</h2>
              <p>Join a pending request or select an active chat to continue</p>
              <div className="stats">
                <div className="stat">
                  <span className="stat-number">{pendingRooms.length}</span>
                  <span className="stat-label">Pending Requests</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{myActiveRooms.length}</span>
                  <span className="stat-label">Active Chats</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StaffChatRoom
