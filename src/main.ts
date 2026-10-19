import './design/tokens.css';
import './design/base.css';
import { mount } from 'svelte';
import App from './app/App.svelte';
import { setupPwa } from './app/pwa';

mount(App, { target: document.getElementById('app')! });
setupPwa();
