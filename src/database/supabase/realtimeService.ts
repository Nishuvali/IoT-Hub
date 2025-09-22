// Real-time Updates Service using Supabase Realtime
import { supabase } from '../utils/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface RealtimeEvent {
  type: 'order_update' | 'product_update' | 'notification' | 'chat_message';
  data: any;
  timestamp: string;
}

interface RealtimeSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

class RealtimeService {
  private subscriptions: Map<string, RealtimeSubscription> = new Map();
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  // Subscribe to order updates
  subscribeToOrderUpdates(userId: string, callback: (orderData: any) => void): string {
    const channelName = `order_updates_${userId}`;
    
    if (this.subscriptions.has(channelName)) {
      this.addListener(channelName, callback);
      return channelName;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Order update received:', payload);
          this.notifyListeners(channelName, payload);
        }
      )
      .subscribe();

    const subscription: RealtimeSubscription = {
      channel,
      unsubscribe: () => {
        channel.unsubscribe();
        this.subscriptions.delete(channelName);
        this.listeners.delete(channelName);
      }
    };

    this.subscriptions.set(channelName, subscription);
    this.addListener(channelName, callback);

    return channelName;
  }

  // Subscribe to product updates (for admins)
  subscribeToProductUpdates(callback: (productData: any) => void): string {
    const channelName = 'product_updates';
    
    if (this.subscriptions.has(channelName)) {
      this.addListener(channelName, callback);
      return channelName;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Product update received:', payload);
          this.notifyListeners(channelName, payload);
        }
      )
      .subscribe();

    const subscription: RealtimeSubscription = {
      channel,
      unsubscribe: () => {
        channel.unsubscribe();
        this.subscriptions.delete(channelName);
        this.listeners.delete(channelName);
      }
    };

    this.subscriptions.set(channelName, subscription);
    this.addListener(channelName, callback);

    return channelName;
  }

  // Subscribe to notifications
  subscribeToNotifications(userId: string, callback: (notification: any) => void): string {
    const channelName = `notifications_${userId}`;
    
    if (this.subscriptions.has(channelName)) {
      this.addListener(channelName, callback);
      return channelName;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Notification received:', payload);
          this.notifyListeners(channelName, payload);
        }
      )
      .subscribe();

    const subscription: RealtimeSubscription = {
      channel,
      unsubscribe: () => {
        channel.unsubscribe();
        this.subscriptions.delete(channelName);
        this.listeners.delete(channelName);
      }
    };

    this.subscriptions.set(channelName, subscription);
    this.addListener(channelName, callback);

    return channelName;
  }

  // Subscribe to chat messages
  subscribeToChatMessages(chatId: string, callback: (message: any) => void): string {
    const channelName = `chat_${chatId}`;
    
    if (this.subscriptions.has(channelName)) {
      this.addListener(channelName, callback);
      return channelName;
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `chat_id=eq.${chatId}`
        },
        (payload) => {
          console.log('Chat message received:', payload);
          this.notifyListeners(channelName, payload);
        }
      )
      .subscribe();

    const subscription: RealtimeSubscription = {
      channel,
      unsubscribe: () => {
        channel.unsubscribe();
        this.subscriptions.delete(channelName);
        this.listeners.delete(channelName);
      }
    };

    this.subscriptions.set(channelName, subscription);
    this.addListener(channelName, callback);

    return channelName;
  }

  // Send real-time notification
  async sendNotification(userId: string, notification: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    data?: any;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          data: notification.data,
          read: false,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
    }
  }

  // Send chat message
  async sendChatMessage(chatId: string, message: {
    sender_id: string;
    content: string;
    message_type: 'text' | 'image' | 'file';
    metadata?: any;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          chat_id: chatId,
          sender_id: message.sender_id,
          content: message.content,
          message_type: message.message_type,
          metadata: message.metadata,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to send chat message:', error);
      return false;
    }
  }

  // Update order status with real-time notification
  async updateOrderStatus(orderId: string, status: string, adminId: string): Promise<boolean> {
    try {
      // Get order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('user_id, order_number, status')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      // Update order status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // Add to order status history
      await supabase
        .from('order_status_history')
        .insert({
          order_id: orderId,
          old_status: order.status,
          new_status: status,
          changed_by: adminId,
          notes: `Status updated to ${status}`,
          created_at: new Date().toISOString()
        });

      // Send notification to user
      await this.sendNotification(order.user_id, {
        title: 'Order Status Update',
        message: `Your order ${order.order_number} status has been updated to ${status}`,
        type: 'info',
        data: { orderId, status }
      });

      return true;
    } catch (error) {
      console.error('Failed to update order status:', error);
      return false;
    }
  }

  // Private methods
  private addListener(channelName: string, callback: (data: any) => void): void {
    if (!this.listeners.has(channelName)) {
      this.listeners.set(channelName, new Set());
    }
    this.listeners.get(channelName)!.add(callback);
  }

  private notifyListeners(channelName: string, data: any): void {
    const listeners = this.listeners.get(channelName);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Unsubscribe from a specific channel
  unsubscribe(channelName: string): void {
    const subscription = this.subscriptions.get(channelName);
    if (subscription) {
      subscription.unsubscribe();
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll(): void {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
    this.listeners.clear();
  }

  // Get connection status
  getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' {
    // This would typically check the actual connection status
    return 'connected';
  }

  // Reconnect if disconnected
  async reconnect(): Promise<void> {
    // Implementation for reconnection logic
    console.log('Reconnecting to real-time service...');
  }
}

// Create realtime service instance
const realtimeService = new RealtimeService();

export default realtimeService;
