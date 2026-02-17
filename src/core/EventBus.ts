type EventHandler = (...args: any[]) => void;

class EventBus {
  private events = new Map<string, EventHandler[]>();

  on(event: string, handler: EventHandler) {
    const handlers = this.events.get(event) || [];
    handlers.push(handler);
    this.events.set(event, handlers);
  }

  emit(event: string, ...args: any[]) {
    this.events.get(event)?.forEach(h => h(...args));
  }

  off(event: string, handler: EventHandler) {
    const handlers = this.events.get(event);
    if (!handlers) return;
    this.events.set(event, handlers.filter(h => h !== handler));
  }
}

export const eventBus = new EventBus();