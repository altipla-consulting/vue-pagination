
import { ref, computed, readonly } from 'vue'
import { values, isArray } from 'lodash-es'

import { scrollToElement } from './dom'


const DEFAULT_PAGE_SIZE = 30


export function useClientAsyncPagination({ pageSize = DEFAULT_PAGE_SIZE, fetch }) {
  let cache = ref({})
  let cacheVersion = 0

  let firstUpdate = ref(true)
  let elem

  let loading = ref(true)
  let keys = ref([])
  let page = ref(0)
  let totalSize = computed(() => keys.value.length)
  let start = computed(() => page.value * pageSize)
  let end = computed(() => Math.min((page.value + 1) * pageSize, totalSize.value))
  let hasNextPage = computed(() => end.value < totalSize.value)
  let hasPrevPage = computed(() => start.value > 0)
  let isEmpty = computed(() => !firstUpdate.value && !totalSize.value)
  let totalPages = computed(() => Math.ceil(totalSize.value / pageSize) - 1)
  let isFirstPage = computed(() => page.value === 0)
  let isLastPage = computed(() => page.value >= totalPages.value)
  let items = computed(() => {
    if (loading.value && !Object.keys(cache.value).length) {
      return []
    }

    return keys.value
      .slice(start.value, end.value)
      .map(key => cache.value[key])
      .filter(val => !!val)
  })

  async function goTo(newPage, doNotScroll) {
    let min = newPage * pageSize
    let slice = keys.value
      .slice(min, min + pageSize)
      .filter(key => !cache.value[key])

    cacheVersion++
    let version = cacheVersion
    if (!slice.length) {
      loadPage(newPage, doNotScroll, version)
      return
    }

    loading.value = true
    let reply = await fetch(slice)
    reply.forEach((item, index) => cache.value[slice[index]] = item)
    loadPage(newPage, doNotScroll, version)
  }

  function loadPage(newPage, doNotScroll, version) {
    if (cacheVersion !== version) {
      return
    }

    loading.value = false
    page.value = newPage
    if (!doNotScroll) {
      scrollToElement(elem, 20)
    }
  }

  function nextPage() {
    goTo(page.value + 1)
  }

  function prevPage() {
    goTo(page.value - 1)
  }

  function firstPage() {
    goTo(0)
  }

  function lastPage() {
    goTo(totalPages.value)
  }

  function setKeys(newKeys) {
    firstUpdate.value = false
    keys.value = [].concat(newKeys)
    loading.value = true
    cache.value = {}
    goTo(0)
  }

  function updateKeysWithoutChangingPage(newKeys) {
    if (firstUpdate.value) {
      setKeys(newKeys)
      return
    }

    keys.value = newKeys

    if (page.value > 0 && page.value > totalPages.value) {
      goTo(Math.ceil(totalSize.value / pageSize) - 1, true)
    } else {
      goTo(page.value, true)
    }
  }

  function mounted(newElem) {
    elem = newElem
  }

  return {
    supportsFirstLast: true,

    // Common fields to all kinds of pagination
    loading,
    page,
    start,
    end,
    totalSize,
    hasNextPage,
    hasPrevPage,
    isEmpty,
    totalPages,
    items,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    isFirstPage,
    isLastPage,
    mounted,
    pageSize,
    
    // Custom fields of this type of pagination
    keys: readonly(keys),
    setKeys,
    updateKeysWithoutChangingPage,
  }
}


export function useControlledPagination({ fetch }) {
  let firstUpdate = ref(true)
  let elem

  let loading = ref(true)
  let page = ref(0)
  let totalSize = ref(0)
  let pageSize = ref(0)
  let start = computed(() => page.value * pageSize.value)
  let end = computed(() => Math.min((page.value + 1) * pageSize.value, totalSize.value))
  let hasNextPage = computed(() => end.value < totalSize.value)
  let hasPrevPage = computed(() => start.value > 0)
  let isEmpty = computed(() => !firstUpdate.value && !totalSize.value)
  let totalPages = computed(() => pageSize.value ? Math.ceil(totalSize.value / pageSize.value) - 1 : 0)
  let isFirstPage = computed(() => page.value === 0)
  let isLastPage = computed(() => page.value >= totalPages.value)
  let items = ref([])

  async function goTo(newPage) {
    let min = newPage * pageSize.value
    let max = min + pageSize.value

    loading.value = true
    await fetch({ min, max, page: newPage })
    loading.value = false

    page.value = newPage
    scrollToElement(elem, 20)
  }

  function nextPage() {
    goTo(page.value + 1)
  }

  function prevPage() {
    goTo(page.value - 1)
  }

  function firstPage() {
    goTo(0)
  }

  function lastPage() {
    goTo(totalPages.value)
  }

  function setItems(newItems) {
    firstUpdate.value = false
    loading.value = false
    items.value = newItems
  }

  function mounted(newElem) {
    elem = newElem
  }

  return {
    supportsFirstLast: true,

    // Common fields to all kinds of pagination
    loading,
    page,
    start,
    end,
    totalSize,
    hasNextPage,
    hasPrevPage,
    firstPage,
    lastPage,
    isFirstPage,
    isLastPage,
    isEmpty,
    totalPages,
    items,
    nextPage,
    prevPage,
    mounted,
    pageSize,

    // Custom fields of this type of pagination
    setItems,
  }
}


export function useServerPagination({ pageSize = DEFAULT_PAGE_SIZE, fetch, delayStart = true }) {
  let firstUpdate = ref(true)
  let elem

  let loading = ref(true)
  let page = ref(0)
  let totalSize = ref(0)
  let start = computed(() => page.value * pageSize)
  let end = computed(() => Math.min((page.value + 1) * pageSize, totalSize.value))
  let hasNextPage = computed(() => end.value < totalSize.value)
  let hasPrevPage = computed(() => start.value > 0)
  let isEmpty = computed(() => !firstUpdate.value && !totalSize.value)
  let totalPages = computed(() => Math.ceil(totalSize.value / pageSize) - 1)
  let isFirstPage = computed(() => page.value === 0)
  let isLastPage = computed(() => page.value >= totalPages.value)
  let allItems = ref([])
  let nextPageToken = ''
  let items = computed(() => allItems.value.slice(start.value, end.value))

  async function goTo(newPage) {
    let min = newPage * pageSize
    if (min >= allItems.value.length) {
      loading.value = true
      let reply = await fetch({ pageToken: nextPageToken, pageSize })
      let items = values(reply).find(v => isArray(v))

      nextPageToken = reply.nextPageToken
      totalSize.value = reply.totalSize
      allItems.value = allItems.value.concat(items)
      page.value = newPage

      loading.value = false
      scrollToElement(elem, 20)
    } else {
      page.value = newPage
      scrollToElement(elem, 20)
    }
  }

  function nextPage() {
    goTo(page.value + 1)
  }

  function prevPage() {
    goTo(page.value - 1)
  }

  function firstPage() {
    goTo(0)
  }

  function mounted(newElem) {
    elem = newElem
  }

  if (!delayStart) {
    goTo(0)
  }

  return {
    supportsFirstLast: false,
    
    // Common fields to all kinds of pagination
    loading,
    page,
    start,
    end,
    totalSize,
    hasNextPage,
    hasPrevPage,
    isEmpty,
    totalPages,
    items,
    nextPage,
    prevPage,
    isFirstPage,
    isLastPage,
    mounted,
    pageSize,
    firstPage,
    lastPage() {
      throw new Error(`cannot use lastPage() method with server pagination`)
    },

    // Custom fields of this type of pagination
    init() {
      goTo(0)
    },
  }
}
