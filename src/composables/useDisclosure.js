import { onMounted, onUnmounted, ref } from 'vue'

/**
 * Open/close state for menus, dropdowns and modals.
 * Pressing Escape closes it, as users expect from any popup.
 */
export function useDisclosure(initial = false) {
  const isOpen = ref(initial)

  const open = () => (isOpen.value = true)
  const close = () => (isOpen.value = false)
  const toggle = () => (isOpen.value = !isOpen.value)

  const onKeydown = (event) => {
    if (event.key === 'Escape') close()
  }

  onMounted(() => document.addEventListener('keydown', onKeydown))
  onUnmounted(() => document.removeEventListener('keydown', onKeydown))

  return { isOpen, open, close, toggle }
}
