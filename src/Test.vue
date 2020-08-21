
<template>
  <input type="checkbox" v-model="delayed"> Delayed load
  <h1>
    useClientAsyncPagination
    ( <a href="#" @click.prevent="fillClientAsync">fill data</a> )
  </h1>
  <Pagination :model="clientAsync"></Pagination>

  <hr>
  <h1>
    useControlledPagination
    ( <a href="#" @click.prevent="fillControlled">fill data</a> )
  </h1>
  <Pagination :model="controlled"></Pagination>
</template>

<script>
import { range } from 'lodash-es'

import Pagination from './Pagination.vue'

import { useClientAsyncPagination, useControlledPagination } from '../lib'


async function delay(milliseconds) {
  await new Promise(resolve => setTimeout(() => resolve(), milliseconds))
}


export default {
  components: {
    Pagination,
  },

  data() {
    let that = this

    return {
      delayed: false,
      clientAsync: useClientAsyncPagination({
        async fetch(keys) {
          if (that.delayed) {
            await delay(3000)
          }

          return keys.map(key => ({ key }))
        },
      }),
      controlled: useControlledPagination({
        async fetch({ min, max }) {
          if (that.delayed) {
            await delay(3000)
          }

          that.controlled.setItems(range(min + 1, Math.min(101, max + 1)).map(key => ({ key })))
        },
      }),
    }
  },

  methods: {
    fillClientAsync() {
      this.clientAsync.setKeys(range(1, 101))
    },

    fillControlled() {
      this.controlled.totalSize = 100
      this.controlled.pageSize = 30
      this.controlled.setItems(range(1, 31).map(key => ({ key })))
    },
  },
}
</script>
