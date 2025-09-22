import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { 
  MessageCircle, 
  Send, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  User,
  Bot,
  Paperclip,
  Smile,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import realtimeService from '../services/realtimeService';
import { supabase } from '../utils/supabase/client';

interface ChatMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  sender_name: string;
  sender_type: 'user' | 'admin' | 'bot';
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  metadata?: any;
  created_at: string;
  read: boolean;
}

interface ChatSession {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  status: 'active' | 'resolved' | 'pending';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  category: 'general' | 'technical' | 'billing' | 'order' | 'complaint';
  created_at: string;
  updated_at: string;
  last_message_at: string;
  unread_count: number;
}

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  updated_at: string;
}

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({
  isOpen,
  onClose,
  onMinimize
}) => {
  const { state: authState } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && authState.isAuthenticated) {
      initializeChat();
    }
  }, [isOpen, authState.isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = async () => {
    try {
      setLoading(true);
      
      // Create or get existing chat session
      const chatId = await createOrGetChatSession();
      setCurrentChat(chatId);
      
      // Load existing messages
      await loadMessages(chatId);
      
      // Subscribe to new messages
      subscribeToMessages(chatId);
      
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      toast.error('Failed to initialize chat');
    } finally {
      setLoading(false);
    }
  };

  const createOrGetChatSession = async (): Promise<string> => {
    try {
      // Check for existing active chat
      const { data: existingChat, error: chatError } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('user_id', authState.user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingChat && !chatError) {
        return existingChat.id;
      }

      // Create new chat session
      const { data: newChat, error: createError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: authState.user?.id,
          user_name: `${authState.user?.firstName} ${authState.user?.lastName}`,
          user_email: authState.user?.email,
          status: 'active',
          priority: 'medium',
          subject: 'General Inquiry',
          category: 'general'
        })
        .select()
        .single();

      if (createError) throw createError;
      return newChat.id;
    } catch (error) {
      console.error('Failed to create chat session:', error);
      throw error;
    }
  };

  const loadMessages = async (chatId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedMessages: ChatMessage[] = (data || []).map(msg => ({
        id: msg.id,
        chat_id: msg.chat_id,
        sender_id: msg.sender_id,
        sender_name: msg.sender_name || 'Unknown',
        sender_type: msg.sender_type || 'user',
        content: msg.content,
        message_type: msg.message_type || 'text',
        metadata: msg.metadata,
        created_at: msg.created_at,
        read: msg.read || false
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const subscribeToMessages = (chatId: string) => {
    realtimeService.subscribeToChatMessages(chatId, (payload) => {
      if (payload.eventType === 'INSERT') {
        const newMessage = payload.new as ChatMessage;
        setMessages(prev => [...prev, newMessage]);
        
        // Show typing indicator for bot messages
        if (newMessage.sender_type === 'bot') {
          setIsTyping(false);
        }
      }
    });
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentChat) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsTyping(true);

    try {
      // Add user message immediately
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        chat_id: currentChat,
        sender_id: authState.user?.id || '',
        sender_name: `${authState.user?.firstName} ${authState.user?.lastName}`,
        sender_type: 'user',
        content: messageContent,
        message_type: 'text',
        created_at: new Date().toISOString(),
        read: true
      };

      setMessages(prev => [...prev, userMessage]);

      // Send message to backend
      const success = await realtimeService.sendChatMessage(currentChat, {
        sender_id: authState.user?.id || '',
        content: messageContent,
        message_type: 'text'
      });

      if (!success) {
        toast.error('Failed to send message');
        return;
      }

      // Simulate bot response (in real implementation, this would be handled by backend)
      setTimeout(() => {
        const botResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          chat_id: currentChat,
          sender_id: 'bot',
          sender_name: 'Support Bot',
          sender_type: 'bot',
          content: generateBotResponse(messageContent),
          message_type: 'text',
          created_at: new Date().toISOString(),
          read: false
        };

        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds

    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
      setIsTyping(false);
    }
  };

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('order') || message.includes('tracking')) {
      return "I can help you with order tracking. Please provide your order ID and I'll look up the status for you.";
    }
    
    if (message.includes('payment') || message.includes('upi') || message.includes('refund')) {
      return "For payment-related queries, I can connect you with our billing team. They'll be able to assist you with UPI payments, refunds, and other payment issues.";
    }
    
    if (message.includes('product') || message.includes('component') || message.includes('iot')) {
      return "I'd be happy to help you with product information! Our IoT components include Arduino boards, ESP32 modules, sensors, and more. What specific product are you interested in?";
    }
    
    if (message.includes('technical') || message.includes('help') || message.includes('problem')) {
      return "I can provide technical support for our products. Please describe the issue you're facing, and I'll do my best to help you troubleshoot.";
    }
    
    if (message.includes('shipping') || message.includes('delivery')) {
      return "For shipping and delivery questions, I can check your order status and provide tracking information. What's your order number?";
    }
    
    return "Thank you for your message! I'm here to help you with any questions about our IoT products and services. How can I assist you today?";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <h3 className="font-semibold">Customer Support</h3>
          <Badge variant="secondary" className="bg-green-500 text-white">
            Online
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMinimize}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-primary-foreground hover:bg-primary-foreground/20"
          >
            ×
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Connecting to support...</p>
            </div>
          ) : (
            <>
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Start a conversation!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ask us anything about our IoT products and services.
                  </p>
                </div>
              )}
              
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      message.sender_type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : message.sender_type === 'bot'
                        ? 'bg-muted'
                        : 'bg-blue-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {message.sender_type === 'bot' ? (
                        <Bot className="w-3 h-3" />
                      ) : message.sender_type === 'admin' ? (
                        <User className="w-3 h-3" />
                      ) : null}
                      <span className="text-xs font-medium">
                        {message.sender_name}
                      </span>
                      <span className="text-xs opacity-70">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Bot className="w-3 h-3" />
                      <span className="text-xs font-medium">Support Bot</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
            disabled={loading}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || loading}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>Press Enter to send</span>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <Paperclip className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <Smile className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Support Dashboard
export const AdminSupportDashboard: React.FC = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSupportData();
  }, []);

  const loadSupportData = async () => {
    try {
      setLoading(true);
      
      // Load chat sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false });

      if (sessionsError) throw sessionsError;

      // Load support tickets
      const { data: tickets, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (ticketsError) throw ticketsError;

      setChatSessions(sessions || []);
      setSupportTickets(tickets || []);

    } catch (error) {
      console.error('Failed to load support data:', error);
      toast.error('Failed to load support data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500">Pending</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-blue-500">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Urgent</Badge>;
      case 'high':
        return <Badge variant="secondary" className="bg-red-500">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-500">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-500">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading support dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Customer Support Dashboard</h1>
        <Button onClick={loadSupportData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="chats" className="space-y-4">
        <TabsList>
          <TabsTrigger value="chats">Live Chats ({chatSessions.length})</TabsTrigger>
          <TabsTrigger value="tickets">Support Tickets ({supportTickets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="chats" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Sessions List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Active Chats</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="space-y-1">
                      {chatSessions.map((session) => (
                        <div
                          key={session.id}
                          className={`p-4 cursor-pointer hover:bg-muted transition-colors ${
                            selectedSession?.id === session.id ? 'bg-muted' : ''
                          }`}
                          onClick={() => setSelectedSession(session)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{session.user_name}</h4>
                            {session.unread_count > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {session.unread_count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {session.subject}
                          </p>
                          <div className="flex items-center justify-between">
                            {getStatusBadge(session.status)}
                            {getPriorityBadge(session.priority)}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(session.last_message_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Chat Details */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedSession ? `Chat with ${selectedSession.user_name}` : 'Select a chat'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedSession ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>User Email</Label>
                          <p className="text-sm">{selectedSession.user_email}</p>
                        </div>
                        <div>
                          <Label>Category</Label>
                          <p className="text-sm capitalize">{selectedSession.category}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Status</Label>
                          <div className="mt-1">{getStatusBadge(selectedSession.status)}</div>
                        </div>
                        <div>
                          <Label>Priority</Label>
                          <div className="mt-1">{getPriorityBadge(selectedSession.priority)}</div>
                        </div>
                      </div>
                      <div>
                        <Label>Subject</Label>
                        <p className="text-sm">{selectedSession.subject}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm">Reply</Button>
                        <Button size="sm" variant="outline">Resolve</Button>
                        <Button size="sm" variant="outline">Escalate</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Select a chat session to view details</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{ticket.subject}</h4>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {ticket.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Category: {ticket.category}</span>
                      <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
