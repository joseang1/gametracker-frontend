import { onMounted, onUnmounted } from 'vue'

export function useClickOutside(targetRef, handler) {
  const onClick = (event) => {
    const element = targetRef.value
    if (element && !element.contains(event.target)) handler(event)
  }

  onMounted(() => document.addEventListener('click', onClick))
  onUnmounted(() => document.removeEventListener('click', onClick))
}
