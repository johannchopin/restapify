<script lang="ts">
	import { onMount } from 'svelte'

	import api from './axiosStore'

	let routes: any = []

	onMount(async () => {
		api.get('/routes')
		.then(function (response) {
			routes = response.data
		})
		.catch(function (error) {
			console.log(error);
		})
	})

</script>

<header>
	<h1>Restapify</h1>
</header>

<main>
	{JSON.stringify(routes)}
</main>

<style>
</style>