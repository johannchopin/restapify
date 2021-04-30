<script lang="ts">
  import MethodBadge from './MethodBadge.svelte'
  import RouteSlug from './RouteSlug.svelte'
  import type { RouteResponse } from '../types'

  export let route: RouteResponse
</script>

<div class="route">
  <div class="d-flex badge-ctn">
    <MethodBadge method={route.method} />
  </div>
  <h3>
    <RouteSlug route={route.route} />
  </h3>
</div>

<style>
  .route {
    display: flex;
    align-items: center;
  }

  .badge-ctn {
    min-width: 2.7em;
  }

  .route :global(.badge.method) {
    margin-right: 5px;
  }

  h3 {
    margin: 0;
  }
</style>