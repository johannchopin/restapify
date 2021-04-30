<script  lang="ts">
  import Route from './Route.svelte'
  import RouteDataTable from './RouteDataTable.svelte'
  import RouteRequestPlayground from './RouteRequestPlayground.svelte'
  import LinkToCopy from './LinkToCopy.svelte'
  import StateBtn from './StateBtn.svelte'

	import api from '../axiosStore'
  import { states as statesStore, alert as alertStore } from '../stores'
  
  import type { RouteResponse } from '../types'

  import { getRouteSectionId } from '../utils'

  export let route: RouteResponse

  let states = null
  let selectedState = null
  let checkedState = null
  let matchingState = null

  statesStore.subscribe(value => {
    states = value
    matchingState = statesStore.getStateForRoute(value, route.route, route.method)
  })

  $: {
    if (matchingState) {
      selectedState = matchingState.state
      checkedState = matchingState.state
    }
  }

  $: statusCode = selectedState ? route.states[selectedState].statusCode : route.statusCode
  $: fileContent = selectedState ? route.states[selectedState].fileContent : route.fileContent
  $: header = selectedState ? route.states[selectedState].header : route.header

  const sectionId = getRouteSectionId(route)

  const onCheckState = (state: string): void => {
    const updatedState = state ? 
      {
        route: route.route,
        state,
        method: route.method
      } : { route: route.route }

    api.put('/states', updatedState).then(({ status }) => {
      if (status === 204) {
        alertStore.show({type: 'success', message: 'State has been updated!'})
      }
    }).catch(() => {
      alertStore.show({type: 'danger', message: 'There was a problem with the state update! Is the mocked server still running?'})
    })

    checkedState = state
    selectedState = state
  }

  const onClickState = (state: string) => {
    selectedState = state
  }
</script>

<section class="route">
  <header class="d-flex mb-3 ps-4" id={sectionId}>
    <LinkToCopy link={window.location.href.split(/[?#]/)[0] + '#' + sectionId} />
    <Route route={route} />
  </header>

  <div class="route-body d-flex flex-column ps-4">
    <div class="d-flex">
      <div class="route-content w-100">
        <RouteDataTable {fileContent} {statusCode} {header} />
      </div>
      {#if route.states}
        <div class="d-flex flex-column me-4">
          <StateBtn 
            value="_default" 
            selected={selectedState === null} 
            checked={checkedState === null}
            sectionId={sectionId} 
            onCheckState={() => { onCheckState(null) }} 
            onClickState={() => onClickState(null)}
          />
          {#each Object.keys(route.states) as state}
            <StateBtn 
              value={state} 
              sectionId={sectionId} 
              selected={selectedState === state} 
              checked={checkedState === state}
              onCheckState={() => { onCheckState(state) }} 
              onClickState={() => { onClickState(state) }}
            />
          {/each}
        </div>
      {/if}
    </div>
    <RouteRequestPlayground method={route.method} route={route.route} />
  </div>
</section>

<style lang="scss">
  section.route {
    min-height: 100vh;
  }

  header {
    position: relative;
    align-items: center;
    padding-top: 2em;

    :global(.link-to-copy) {
      position: absolute;
      left: 0;
      visibility: hidden;
    }

    :global(.route) {
      :global(.badge.method) {
        font-size: 1em;
        margin-right: 1em;
      }
    }

    &:hover {
      :global(.link-to-copy) {
        visibility: visible;
      }
    }
  }

  header p {
    margin-bottom: 0;
  }

  .route-body {
    :global(.hljs) {
      max-width: 40vw;
      max-height: 45vh;
    }
  }
</style>