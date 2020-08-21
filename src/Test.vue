
<template>
  <h1>
    useClientAsyncPagination
    ( <a href="#" @click.prevent="fillClientAsync">fill data</a> )
  </h1>
  <Pagination :model="clientAsync"></Pagination>
</template>

<script>
import { range } from 'lodash-es'

import Pagination from './Pagination.vue'

import { useClientAsyncPagination } from '../lib'


export default {
  components: {
    Pagination,
  },

  data() {
    return {
      clientAsync: useClientAsyncPagination({
        async fetch(keys) {
          return keys.map(key => {
            return { key }
          })
        },
      }),
    }
  },

  mounted() {
    console.log('test')
  },

  methods: {
    fillClientAsync() {
      this.clientAsync.setKeys(range(1, 101))
    },
  },
}
</script>
