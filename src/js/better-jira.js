import BetterJira from './components/BetterJira';

let betterJira = BetterJira.initialize();

document.addEventListener('better-jira:updated', (event) => {
  console.log('🔧: ', event.detail);
  betterJira.update(event);
});
