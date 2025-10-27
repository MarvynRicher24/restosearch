import { reactive } from 'vue'

type Toast = { id: number; message: string; type?: 'info' | 'success' | 'error'; ttl?: number }

const state = reactive<{ toasts: Toast[] }>({ toasts: [] })
let idCounter = 1

export function useToast() {
  function show(message: string, type: Toast['type'] = 'info', ttl = 3500) {
    const t: Toast = { id: idCounter++, message, type, ttl }
    state.toasts.push(t)
    if (ttl > 0) {
      setTimeout(() => {
        dismiss(t.id)
      }, ttl)
    }
    return t.id
  }

  function dismiss(id: number) {
    const idx = state.toasts.findIndex(t => t.id === id)
    if (idx !== -1) state.toasts.splice(idx, 1)
  }

  return {
    toasts: state.toasts,
    show,
    dismiss
  }
}
