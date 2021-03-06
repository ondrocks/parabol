import useInitialRender from 'hooks/useInitialRender'
import {RefObject, useEffect, useRef} from 'react'

const useScrollThreadList = (
  threadables: readonly any[],
  editorRef: RefObject<HTMLTextAreaElement>,
  wrapperRef: RefObject<HTMLDivElement>
) => {
  const isInit = useInitialRender()
  // if we're at or near the bottom of the scroll container
  // and the body is the active element
  // then scroll to the bottom whenever threadables changes
  const oldScrollHeightRef = useRef(0)

  useEffect(() => {
    const {current: el} = wrapperRef
    if (!el) return

    const {scrollTop, scrollHeight, clientHeight} = el
    if (isInit) {
      if (el.scrollTo) {
        el.scrollTo({top: scrollHeight})
      } else {
        el.scrollTop = el.scrollHeight
      }
      return
    }
    // get the element for the draft-js el or android fallback
    const edEl = (editorRef.current as any)?.editor || editorRef.current

    // if i'm writing something or i'm almost at the bottom, go to the bottom
    if (
      document.activeElement === edEl ||
      scrollTop + clientHeight > oldScrollHeightRef.current - 20
    ) {
      setTimeout(() => {
        if (el.scrollTo) {
          el.scrollTo({top: scrollHeight, behavior: 'smooth'})
        } else {
          el.scrollTop = el.scrollHeight
        }
        // the delay is required for new task cards, not sure why height is determined async
      }, 50)
    }
  }, [isInit, threadables])

  useEffect(() => {
    oldScrollHeightRef.current = wrapperRef.current?.scrollHeight ?? 0
  }, [threadables])
}

export default useScrollThreadList
