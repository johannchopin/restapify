<script lang="ts">
  import Icon from './Icon/Icon.svelte'
  import restapifyIcon from '../assets/restapify-icon.svg'
  import { theme as themeStore } from '../stores'
</script>

<nav class={`navbar navbar-expand-lg ps-4 pe-4 pt-0 pb-0 navbar-${$themeStore.mode} bg-${$themeStore.mode} shadow`}>
  <div class="container-fluid">
    <a class="navbar-brand" href="/">
      {@html restapifyIcon}
    </a>
    <ul class="d-flex ms-auto mb-0">
      <li class="nav-item">
        <a class="nav-link" href="https://restapify.vercel.app/docs" target="_blank">
          <Icon name='book' class={`${$themeStore.mode}`} />
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="https://github.com/johannchopin/restapify" target="_blank">
          <Icon name='github' class={`${$themeStore.mode}`} />
        </a>
      </li>
      <li class="nav-item">
        <button id="toggleTheme" class="btn mb-0" on:click={themeStore.toggleMode}>
          <Icon name='circle-half' class={`${$themeStore.mode}`} />
        </button>
      </li>
    </ul>
  </div>
</nav>

<style lang="scss">
  .navbar {
    display: block;
    z-index: 1;

    &.bg-dark {
      background: black!important;
      box-shadow: 0 .5rem 1rem rgba(0,0,0,.65)!important;

      .navbar-brand {
        :global(svg) {
          filter: invert(100%);
        }
      }
    }

    .navbar-brand {
      :global(svg) {
        width: 20%;
      }
    }
  }

  ul {
    li {
      list-style-type: none;

      #toggleTheme {
        border: none;

        :global(.icon) {
          transform: rotate(-135deg);
        }
      }
    }
  }
</style>