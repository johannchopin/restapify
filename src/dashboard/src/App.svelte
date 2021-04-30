<script lang="ts">
	import './custom.scss'
	import { onMount } from 'svelte'
	import { atomOneDark } from "svelte-highlight/styles"

	import RouteSection from './components/RouteSection.svelte'
	import Navbar from './components/Navbar.svelte'
	import Sidebar from './components/Sidebar.svelte'
	import AlertToast from './components/AlertToast.svelte'

  import { METHODS } from './const'

	// S T O R E S
	import { apiInfos as apiInfosStore, states as statesStore, theme as themeStore } from './stores'

	// T Y P E S
	import type { GetApiInfosResponse, GetStatesResponse } from './types'

	import api from './axiosStore'

	let apiInfos: GetApiInfosResponse | null = null

	apiInfosStore.subscribe(value => {
		apiInfos = value
	})

	const fetchRoutes = (): void => {
		api.get<GetApiInfosResponse>('/api')
		.then((response) => {
			apiInfosStore.set(response.data)
		})
		.catch((error) => {
			console.log(error);
		})
	}

	const fetchStates = (): void => {
		api.get<GetStatesResponse>('/states')
		.then((response) => {
			statesStore.set(response.data)
		})
		.catch((error) => {
			console.log(error);
		})
	}

	const scrollToInitialRoute = (): void => {
		const hash = location.hash
		const hashExist = hash.startsWith('#')

		if (hashExist) {
			setTimeout(() => {
				document
					.getElementById(hash.substring(1))
					.scrollIntoView({ behavior: "smooth" });
			}, 200)
		}
	}

	onMount(async () => {
		fetchRoutes()
		fetchStates()
		scrollToInitialRoute()
	})
</script>

<svelte:head>
  {@html atomOneDark}
</svelte:head>

<Navbar />
<div class="d-flex" id="wrapper">
	<Sidebar />
	<div id="page-content-wrapper" class={`bg-${$themeStore.mode}`}>
		<div class="container-fluid" id="content">
			{#if apiInfos?.routes}
				{#each Object.keys(apiInfos.routes) as route}
        	{#each METHODS as method}
          	{#if apiInfos.routes[route][method]}
							<RouteSection route={{...apiInfos.routes[route][method], method}} />
						{/if}	
					{/each}
				{/each}
			{/if}	
		</div>
	</div>
</div>
<AlertToast />

<style lang="scss">
	@import "./custom.scss";

	#wrapper {
		overflow-x: hidden;
    overflow: hidden;
		flex-grow: 1;
	}

	#content {
		height: 100%;
		overflow: auto;
		scroll-behavior: smooth;
	}

	#page-content-wrapper {
		width: 0;
		flex-grow: 1;
	}

	:global(.bg-dark) {
		color: $white;

		:global(.form-control) { 
			color: $white!important;
		}

		:global(.list-group) {
			:global(.list-group-item) {
				background-color: $dark!important;
			}
		}
	}
</style>