
<template>
  <header>
    <i>{{model.loading ? 'Loading...' : 'Success'}}</i>
    <p>
      <button @click="model.firstPage" :disabled="model.isFirstPage"><strong>First page</button>
      &nbsp;
      <button @click="model.prevPage" :disabled="!model.hasPrevPage"><strong>Prev page</button>
      &nbsp;
      <button @click="model.nextPage" :disabled="!model.hasNextPage"><strong>Next page</button>
      &nbsp;
      <button @click="model.lastPage" :disabled="model.isLastPage"><strong>Last page</button>
    </p>
  </header>
  <p>
    <strong>Pagination: {{model.totalSize ? model.start+1 : model.start}} - {{model.end}} of {{model.totalSize}}</strong>
  </p>
  <p>
    <code v-for="item in model.items" :key="item.key">{{item.key}}</code>
  </p>
  <code>{{model}}</code>
</template>

<script>
export default {
  props: {
    model: Object,
  },
}
</script>
