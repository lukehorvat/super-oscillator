import * as welcomeScreen from './lib/welcome-screen';
// import * as loadingScreen from './lib/loading-screen';
// import { SceneManager } from './lib/scene-manager';
import './index.css';

void main();

async function main(): Promise<void> {
  const appEl = document.querySelector('.app')!;
  await welcomeScreen.render(appEl);
  // const assetCache = await loadingScreen.render(appEl);
  // const sceneManager = new SceneManager(assetCache);
  // sceneManager.render(appEl);
}
