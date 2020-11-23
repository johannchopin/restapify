<script lang="ts">
	import { onMount } from 'svelte'
	import type { Routes } from '../../types'

	import api from './axiosStore'

	let routes: Routes | null = null

	onMount(async () => {
		api.get<Routes>('/routes')
		.then(function (response) {
			routes = response.data
		})
		.catch(function (error) {
			console.log(error);
		})
	})

	const close = (): void => {
		api.get('/close')
	}

</script>

<header>
	<h1>Restapify</h1>
	<button on:click={close}>Close server</button>
</header>

<main>
	{routes ? JSON.stringify(routes) : 'Loading...'}
</main>

<style>
</style>