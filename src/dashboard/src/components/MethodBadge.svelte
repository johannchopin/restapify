<script  lang="ts">
  import type { HttpMethod } from '../types'

  export let method: HttpMethod

  const getBadgeBgClass = (): string => {
    switch (method) {
      case 'GET':
        return 'bg-success'
      case 'POST':
        return 'bg-warning' 
      case 'PUT':
        return 'bg-primary'
      case 'PATCH':
        return 'bg-secondary'
      case 'DELETE':
        return 'bg-danger'
    }
  }

  const getMethodName = (): string => {
    switch (method) {
      case 'DELETE':
        return 'DEL'
    
      default:
        return method
    }
  }
</script>

<span class={`badge ${getBadgeBgClass()} method`}>{getMethodName()}</span>

<style>
  .badge {
    text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
  }
</style>