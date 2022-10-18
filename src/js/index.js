import JiraStandupMode from './components/JiraStandupMode';

let jiraStandupMode = JiraStandupMode.initialize();

document.addEventListener('jira-standup-mode:updated', (event) => {
  console.log('🔧: ', event.detail);
  jiraStandupMode.update(event);
});
