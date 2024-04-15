import { createSSRApp } from 'vue';
import App from './App.vue';
import { setupStore } from '@/state';
// import 'uno.css';
import core from './core';

export function createApp() {
	const app = createSSRApp(App);

	// Configure store
	app.use(core);
	setupStore(app);

	return {
		app,
	};
}
