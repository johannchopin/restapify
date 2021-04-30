<script lang="ts">
  import { theme as themeStore, apiInfos as apiInfosStore } from '../stores'
  import MethodBadge from './MethodBadge.svelte'
  import RouteRequestPlaygroundResponse from './RouteRequestPlaygroundResponse.svelte'
  import type { Response } from './RouteRequestPlaygroundResponse.svelte'

  import { getRouteStructure, replaceAll } from '../utils'
  import type { HttpMethod } from '../types'

	import api from '../axiosStore'

  export let method: HttpMethod
  export let route: string

  const getSanitisedPlaygroundId = (): string => {
    return `play-${method}${replaceAll(replaceAll(replaceAll(route, '/', '-'), '[', '-'), ']', '-')}`
  }

  const routeStructure = getRouteStructure(route)

  let request = routeStructure.map((structure) => structure.value)
  let queries = null

  let response: Response | null = null

  const fetch = (): void => {
    response = null

    const timestamp = new Date().getTime()
    let requestCall = `http://localhost:${$apiInfosStore.port}${$apiInfosStore.baseUrl}/${request.join('/')}?timestamp=${timestamp}`
    if (queries) requestCall += `&${queries}`
    api[method.toLowerCase()](requestCall)
      .then(({data, headers, status}) => {
        response = {
            status,
            headers,
            body: data
          }
      })
      .catch((error) => {
        if (error.response) {
          const { status, headers, data } = error.response
          response = {
            status,
            headers,
            body: data
          }
          console.log(error.response);
        }
      })
  }
</script>

<div class="playground row mt-4">
  <form on:submit|preventDefault={fetch}>
    <div class="d-flex align-items-center">
      <div class="request d-flex align-items-center border border-1 border-secondary p-2 rounded-2">
        <MethodBadge {method} />
        <div class="d-flex ms-3">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-0">
              {#each routeStructure as routeComponent, i}
                <li class="breadcrumb-item d-flex align-items-center ps-1">
                  {#if routeComponent.type === 'variable'}
                    <input
                      type="text"
                      class={`form-control mb-0 py-0 px-1 bg-${$themeStore.mode}`}
                      placeholder={routeComponent.value}
                      required
                      on:input={(event) => {
                        const requestClone = [...request]
                        requestClone[i] = event.currentTarget.value
                        request = requestClone
                      }}
                    />
                  {:else}
                    {routeComponent.value}
                  {/if}
                </li>
              {/each}
              <li class="d-flex align-items-center ps-1">
                <span>?</span>
                <input 
                  type="text" 
                  class={`form-control queries mb-0 py-0 px-1 ms-1 bg-${$themeStore.mode}`} 
                  placeholder="queries..."
                  bind:value={queries}
                >
              </li>
            </ol>
          </nav>
        </div>
      </div>
      <button 
        type="submit" 
        class="btn btn-outline-success mb-0 ms-2"
        >Send
      </button>
    </div>
  </form>

  {#if response}
    <RouteRequestPlaygroundResponse id={getSanitisedPlaygroundId()} {response} />
  {/if}
</div>

<style>
  button {
    height: 100%;
  }
  .request {
    width: fit-content;
  }

  .breadcrumb-item::before {
    padding-right: 0.25rem !important;
  }

  .form-control {
    width: 7em;
    font-size: .8em;
  }

  .form-control.queries {
    width: 10em;
  }
</style>