import { useState, useEffect, useRef } from 'react'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import chatRoomService from '../../api/chatRoomService'
import authService from '../../api/authService'
import logger from '../../utils/logger'
import { BASE_URL } from '../../api/apiConfig'
import '../../styles/ChatRoom.css'

const CustomerChatRoom = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [myRooms, setMyRooms] = useState([])
  const [activeRoomId, setActiveRoomId] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [currentUserId, setCurrentUserId] = useState(null)
  const [newRoomName, setNewRoomName] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  const stompClientRef = useRef(null)
  const activeSubscriptionsRef = useRef(new Map())
  const messagesEndRef = useRef(null)

  useEffect(() => {
    initializeConnection()
    return () => {
      disconnect()
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
        loadMyRooms()
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

  const loadMyRooms = async () => {
    try {
      const result = await chatRoomService.getMyChatRooms()
      if (result.success) {
        const rooms = result.data || []
        setMyRooms(rooms)
        
        // Subscribe to all non-closed rooms
        rooms.forEach(room => {
          if (room.status !== 'CLOSED') {
            subscribeToRoom(room.id)
          }
        })
      } else {
        logger.error('Failed to load rooms:', result.message)
      }
    } catch (error) {
      logger.error('Error loading rooms:', error)
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
      
      // Update room status in the list
      setMyRooms(prevRooms => {
        return prevRooms.map(room => {
          if (room.id === chatMessage.roomId) {
            if (chatMessage.type === 'STAFF_JOINED') {
              return { ...room, status: 'ACTIVE' }
            } else if (chatMessage.type === 'CHAT_ENDED') {
              return { ...room, status: 'CLOSED' }
            } else if (!chatMessage.type && chatMessage.senderId !== currentUserId) {
              // New message - mark as unread if not active room
              if (chatMessage.roomId !== activeRoomId) {
                return { ...room, hasNewMessage: true }
              }
            }
          }
          return room
        })
      })

      // Only display in active chat
      if (chatMessage.roomId !== activeRoomId) {
        return
      }

      // Handle different message types
      if (chatMessage.type === 'STAFF_JOINED') {
        addSystemMessage(`Staff ${chatMessage.staffName} has joined the chat!`)
      } else if (chatMessage.type === 'CHAT_ENDED') {
        addSystemMessage(`Chat ended by ${chatMessage.endedBy}`)
      } else if (chatMessage.senderId !== currentUserId) {
        // Regular message from staff
        setMessages(prev => [...prev, {
          ...chatMessage,
          isOwn: false
        }])
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

  const switchToRoom = async (roomId) => {
    setActiveRoomId(roomId)
    setMessages([])
    
    // Clear new message flag
    setMyRooms(prevRooms => 
      prevRooms.map(room => 
        room.id === roomId ? { ...room, hasNewMessage: false } : room
      )
    )

    // Load message history
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

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      alert('Please enter a room title')
      return
    }

    try {
      const result = await chatRoomService.createChatRoom({ name: newRoomName })
      if (result.success) {
        const newRoom = result.data
        setMyRooms(prev => [newRoom, ...prev])
        subscribeToRoom(newRoom.id)
        switchToRoom(newRoom.id)
        setNewRoomName('')
        setShowCreateModal(false)
        addSystemMessage('Chat room created. Waiting for staff...')
      } else {
        alert(`Failed to create room: ${result.message}`)
      }
    } catch (error) {
      logger.error('Error creating room:', error)
      alert('Failed to create room')
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
        setMyRooms(prevRooms => 
          prevRooms.map(room => 
            room.id === activeRoomId ? { ...room, status: 'CLOSED' } : room
          )
        )
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
    return myRooms.find(room => room.id === activeRoomId)
  }

  const activeRoom = getActiveRoom()
  const isChatActive = activeRoom && activeRoom.status !== 'CLOSED'

  return (
    <div className="chat-room-container">
      <div className="chat-room-header">
        <div className="header-content">
          <h1>💬 Customer Support Chat</h1>
          <div className="connection-status">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      <div className="chat-room-content">
        {/* Sidebar - My Rooms */}
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <h2>My Conversations</h2>
            <button 
              className="create-room-btn"
              onClick={() => setShowCreateModal(true)}
              disabled={!isConnected}
            >
              + New Request
            </button>
          </div>
          
          <div className="rooms-list">
            {myRooms.length === 0 ? (
              <div className="no-rooms">
                <p>No conversations yet</p>
                <p>Create a new request to start</p>
              </div>
            ) : (
              myRooms.map(room => (
                <div
                  key={room.id}
                  className={`room-item ${room.id === activeRoomId ? 'active' : ''} ${room.hasNewMessage ? 'new-message' : ''}`}
                  onClick={() => switchToRoom(room.id)}
                >
                  <div className="room-info">
                    <h3>{room.name}</h3>
                    <span className={`room-status ${room.status.toLowerCase()}`}>
                      {room.status}
                    </span>
                  </div>
                  {room.hasNewMessage && <span className="new-badge">New</span>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="chat-main">
          {activeRoomId ? (
            <>
              <div className="chat-header">
                <div className="chat-title">
                  <h2>{activeRoom?.name}</h2>
                  <span className={`chat-status ${activeRoom?.status.toLowerCase()}`}>
                    {activeRoom?.status}
                  </span>
                </div>
                {isChatActive && (
                  <button className="end-chat-btn" onClick={handleEndChat}>
                    End Chat
                  </button>
                )}
              </div>

              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    <p>No messages yet</p>
                    <p>Start the conversation!</p>
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
                  placeholder={isChatActive ? "Type your message..." : "Chat has ended"}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!isChatActive}
                  rows="3"
                />
                <button
                  className="send-btn"
                  onClick={handleSendMessage}
                  disabled={!isChatActive || !messageInput.trim()}
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="no-active-room">
              <h2>Welcome to Customer Support</h2>
              <p>Select a conversation from the list or create a new support request</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Support Request</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <label>Request Title</label>
              <input
                type="text"
                className="room-name-input"
                placeholder="e.g., Battery charging issue"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateRoom()
                  }
                }}
              />
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="confirm-btn" onClick={handleCreateRoom}>
                Create Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerChatRoom
