<script context="module" lang="ts">
  export interface Response {
    status: number
    headers: Object
    body: string
  }
</script>

<script lang="ts">
  import JSONTree from 'svelte-json-tree'
  import { getStatusColorClass } from '../utils'

  export let id: string
  export let response: Response

  $: isBodyEmpty = response.body.length === 0
</script>

<div class="playground-response mt-4">
  <p>Status: <span class={`${getStatusColorClass(response.status)} fw-bold`}>{response.status}</span></p>
  <ul class="nav nav-tabs" role="tablist">
    <li class="nav-item" role="presentation">
      <button 
        class="nav-link" 
        class:active={!isBodyEmpty}
        class:disabled={isBodyEmpty}
        class:text-decoration-line-through={isBodyEmpty}
        id="{id}-body-tab" 
        data-bs-toggle="tab" 
        data-bs-target="#{id}-body" 
        type="button" 
        role="tab" 
        aria-controls="{id}-body" 
        aria-selected="true"
      >
        Body
      </button>
    </li>
    <li class="nav-item" role="presentation">
      <button class="nav-link" class:active={isBodyEmpty} id="{id}-header-tab" data-bs-toggle="tab" data-bs-target="#{id}-header" type="button" role="tab" aria-controls="{id}-header" aria-selected="false">
        Header
      </button>
    </li>
  </ul>
  <div class="tab-content p-2 border border-top-0 bg-light rounded-bottom">
    <div class="tab-pane fade" class:show={!isBodyEmpty} class:active={!isBodyEmpty} id="{id}-body" role="tabpanel" aria-labelledby="{id}-body-tab">
      {#if !isBodyEmpty}
         <JSONTree value={response.body} />
      {/if}
    </div>
    <div class="tab-pane fade" class:show={isBodyEmpty} class:active={isBodyEmpty} id="{id}-header" role="tabpanel" aria-labelledby="{id}-header-tab">
      <JSONTree value={response.headers} />
    </div>
  </div>
</div>

<style>
  .tab-pane {
    color: black;
  }

  :global(.bg-dark) button {
    color: white;
  }

  .tab-pane :global(.container) {
    padding-left: 0;
  }
</style>