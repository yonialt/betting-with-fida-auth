type MessageCallback = (data: any) => void;

class FidaBetWebSocketClient {
  private socket: WebSocket | null = null;
  private subscriptions: Map<string, Set<MessageCallback>> = new Map();
  private isConnected: boolean = false;
  private reconnectTimeout: any = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 2;
  private wsUrl: string;

  constructor() {
    if (typeof window !== 'undefined') {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      this.wsUrl = import.meta.env.VITE_WS_BASE_URL || `${protocol}//${window.location.host}/ws`;
    } else {
      this.wsUrl = '';
    }
  }

  public connect() {
    if (typeof window === 'undefined' || !window.WebSocket) return;
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      // Graceful fallback to client simulation mode without console errors
      return;
    }

    try {
      this.socket = new WebSocket(this.wsUrl);

      this.socket.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        // Resubscribe to all active topics
        this.subscriptions.forEach((_, topic) => {
          this.sendSubscribeFrame(topic);
        });
      };

      this.socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const topic = payload.topic || payload.destination;
          if (topic && this.subscriptions.has(topic)) {
            this.subscriptions.get(topic)?.forEach((cb) => cb(payload.body || payload));
          }
        } catch {
          // Non-JSON frame
        }
      };

      this.socket.onclose = () => {
        this.isConnected = false;
        this.scheduleReconnect();
      };

      this.socket.onerror = () => {
        this.isConnected = false;
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, 5000);
  }

  private sendSubscribeFrame(topic: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify({ action: 'SUBSCRIBE', destination: topic }));
      } catch {}
    }
  }

  public subscribe(topic: string, callback: MessageCallback): () => void {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set());
      if (this.isConnected) {
        this.sendSubscribeFrame(topic);
      }
    }
    this.subscriptions.get(topic)?.add(callback);

    // Return unsubscribe function
    return () => {
      const set = this.subscriptions.get(topic);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.subscriptions.delete(topic);
        }
      }
    };
  }

  public disconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
  }
}

export const fidaBetWebSocket = new FidaBetWebSocketClient();
