<script lang="ts">
  import Route from './Route.svelte'
  import Searchbar from './Searchbar.svelte'
  import { METHODS, DEFAULT_SIDEBAR_WIDTH } from '../const'

  import { getRouteSectionId } from '../utils'

  // S T O R E S
  import { apiInfos as apiInfosStore, theme as themeStore } from '../stores'

  // T Y P E S
  import type { GetApiInfosResponse, RouteResponse } from '../types'

  const SIDEBAR_WIDTH_LOCALSTORAGE_KEY = 'sidebarWidth'

  let apiInfos: GetApiInfosResponse | null = null
  let filters = null

  let sidebarLineWidth = 6

  const getSiderbarWith = () => {
    return localStorage.getItem(SIDEBAR_WIDTH_LOCALSTORAGE_KEY) 
      || (DEFAULT_SIDEBAR_WIDTH + (sidebarLineWidth / 2)).toString()
  }

  let sidebarWidth = getSiderbarWith()

	apiInfosStore.subscribe(value => {
		apiInfos = value
  })

  const setFilter = (value: string) => {
    filters = value.trim().toLowerCase().split(' ')
  }

  const resizeSidebar = (elmt: MouseEvent) => {
    sidebarWidth = (elmt.pageX + (sidebarLineWidth / 2)).toString()
  }

  const routeMatchFilters = (routesToFilter: RouteResponse, filtersToApply: string[] | null): boolean => {
    const infosToMatch = `${routesToFilter.method} ${routesToFilter.route}`.toLowerCase()
    if (filtersToApply) {
      return filtersToApply.every((filter) => {
        return infosToMatch.includes(filter)
      })
    }
    
    return true
  }

  // update sidebar width value in local storage when `sidebarWidth` change
  $: localStorage.setItem(SIDEBAR_WIDTH_LOCALSTORAGE_KEY, sidebarWidth)
</script>

<div class={`bg-${$themeStore.mode} border-right d-flex flex-column`} id="sidebar-wrapper" style={`width: ${sidebarWidth}px;`}>
  <Searchbar onInput={setFilter} />
  {#if apiInfos?.routes}
    <ul class="list-group pb-3">
      {#each Object.keys(apiInfos.routes) as route}
        {#each METHODS as method}
          {#if apiInfos.routes[route][method] && routeMatchFilters(apiInfos.routes[route][method], filters)}
            <li class="list-group-item p-0">
              <a href={`#${getRouteSectionId(apiInfos.routes[route][method])}`} class="d-flex justify-content-between p-2">
                <Route route={{...apiInfos.routes[route][method], method}} />
                {#if apiInfos.routes[route][method].states}
                  <span class="badge rounded-pill bg-light text-dark">
                    {Object.keys(apiInfos.routes[route][method].states).length + 1}
                  </span>
                {/if}
              </a>
            </li>
          {/if}
        {/each}
      {/each}
    </ul>
  {/if}	
  <button class="resize-sidebar-line"
    on:mousedown={() => {
      document.addEventListener('mousemove', resizeSidebar)
    }}
    on:mouseup={() => {
      document.removeEventListener('mousemove', resizeSidebar)
    }}
  />
</div>

<style lang="scss">
	#sidebar-wrapper {
    position: relative;
		transition: margin .25s ease-out;
  }
  
  #sidebar-wrapper :global(.route)  {
    :global(h3) {
      font-size: .7em;
    }

    :global(.badge) {
      font-size: .6em;
    }
  }

	#sidebar-wrapper .sidebar-heading {
		padding: 0.875rem 1.25rem;
		font-size: 2em;
	}

	#sidebar-wrapper .list-group {
    max-height: 100%;
    overflow: auto;

    a {
      display: block;
      transition: padding-left .3s;

      &:hover,
      &:focus {
        color: inherit;
        padding-left: 5%!important;
      }
    }
  }


  :global(#wrapper.toggled #sidebar-wrapper)  {
		margin-left: 0;
	}

  .resize-sidebar-line {
    position: absolute;
    height: 100%;
    width: 6px;
    right: 0;
    background-color: transparent;
    border: none;
    cursor: col-resize;
    transform: translateX(50%);

    &:hover {
      &::after {
        opacity: 1;
      }
    }

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      height: 95%;
      width: 2px;
      background-color: var(--bs-secondary);
      transform: translateY(-50%);
      opacity: 0;
    }
  }

  :global(.bg-dark) .resize-sidebar-line::after {
    background-color: var(--bs-light);
  }
</style>
