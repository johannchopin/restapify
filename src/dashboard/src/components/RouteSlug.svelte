<script lang="ts">
  import { getRouteStructure } from '../utils'

  export let route: string
</script>

<span class="route">
{#each getRouteStructure(route) as routeComponent}
   <span class="route-delimiter">/</span>
   <span class:route-variable={routeComponent.type === 'variable'}>{routeComponent.value}</span>
{/each}
</span>

<style type="scss">
  .route {
    display: flex;
  }

  .route-delimiter {
    margin: 0 1px;
  }

  .route-variable {
    opacity: .9;
    color: orangered;
  }

  :global(.bg-dark) {
    .route-variable {
      color: aquamarine;
    }
  }
</style>