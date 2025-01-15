type EventCallback<T = unknown> = (data: T) => void;

class BrowserEventEmitter<T = unknown> {
  private events: { [key: string]: EventCallback<T>[] } = {};

  on(event: string, callback: EventCallback<T>) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event: string, data: T) {
    if (this.events[event]) {
      for (const callback of this.events[event]) {
        callback(data);
      }
    }
  }

  removeListener(event: string, callback: EventCallback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}

export const submissionEmitter = new BrowserEventEmitter();
export const submissionStatusEmitter = new BrowserEventEmitter();
