<script lang="ts">
  import { alert as alertStore } from '../stores'

  $: if ($alertStore.show) {
    setTimeout(() => {
      alertStore.update(store => ({...store, show: false}))
    }, 3500)
  }
</script>

<div class="toast-container position-absolute bottom-0 end-0 p-3">
  <div class={`toast d-flex align-items-center text-white bg-${$alertStore.type} border-0`} class:show={$alertStore.show} role="alert" aria-live="assertive" aria-atomic="true">
    <div class="toast-body">
      {$alertStore.message}
    </div>
    <button 
      type="button" 
      class="btn-close btn-close-white ms-auto me-2 mb-0" 
      on:click={alertStore.hide} 
      data-bs-dismiss="toast" 
      aria-label="Close"
    />
  </div>
</div>
