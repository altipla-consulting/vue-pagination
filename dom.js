
export function scrollToElement(elem, offset, ignoreDirection) {
  if (!elem) {
    return
  }

  setTimeout(() => {
    let target = Math.max(elem.offsetTop - offset, 0)
    if (window.pageYOffset > target || ignoreDirection) {
      window.scrollTo({
        top: target,
        behavior: 'smooth',
      })
    }
  })
}
