import './design/tokens.css';
import './design/base.css';
import { mount } from 'svelte';
import App from './app/App.svelte';
import { setupPwa } from './app/pwa';
import { library } from './app/library.svelte';
import { settings } from './app/settings.svelte';
import { trackViewport } from './app/viewport';

library.start();
settings.start();
trackViewport();
mount(App, { target: document.getElementById('app')! });
setupPwa();
