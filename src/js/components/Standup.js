import Jira from './Jira';
import Mutations from '../utils/Mutations';

class Standup {
  constructor() {
    this.cssClass = 'standup';
    this.instructionsCssClass = 'JiraStandupMode-instructions';
    this.parentLocationId = 'ghx-controls-buttons';
    this.data = {};
    this.running = true;
    this.instructionsEl = this._buildCloseButton(this.instructionsCssClass)
  }

  run(state) {
    if (Jira.isNotPresent()) {
      this.running = false;
      return;
    }

    if (!state) {
      this._cleanupStandup();
      return;
    }

    this.initializeStandup();
  }

  initializeStandup() {
    if (!this.running) {
      return;
    }

    this._listener = (click) => {
      let closeButton = click.target.closest('[data-standup-close]');
      if (!closeButton) {
        return;
      }

      chrome.storage.sync.set({ standup: false }, () => {
        this._cleanupStandup();
      });
    };
    document.addEventListener('click', this._listener);

    window.standup = true;

    //-- Add `standup` class to the body
    document.body.classList.add(this.cssClass);

    //-- Add Close Standup Mode button
    if (document.querySelectorAll(`.${this.instructionsCssClass}`).length === 0) {
      // Default to appending close button to body
      document.body.appendChild(this.instructionsEl);

      // Place next to other buttons once loaded
      Mutations.waitForElement(Jira.content(), this.parentLocationId, ()=>{
        this._moveInstructionsToParent()
      });

      // Restore if removed by Jira
      Mutations.onNodeRemoval(Jira.content(), this.instructionsCssClass, () => {
        this._moveInstructionsToParent();
      });
    }
  }

  _moveInstructionsToParent() {
    this._parentElement().appendChild(this.instructionsEl);
  }

  _parentElement() {
    return document.getElementById(this.parentLocationId);
  }

  _buildCloseButton(css_class) {
    var instructionsEl = document.createElement('div');
    instructionsEl.setAttribute('data-standup-close', '');
    instructionsEl.classList.add(css_class);
    instructionsEl.id = css_class;
    instructionsEl.innerHTML = '\n        <span class="text">Standup Mode <span class="close">&nbsp;&plus;&nbsp;</span></span>\n      ';
    return instructionsEl;
  }

  _cleanupStandup() {
    document.body.classList.remove(this.cssClass);
    window.standup = false;

    //-- Clear the event listener
    document.removeEventListener('click', this._listener);

    //-- remove Instructions element
    let instructions = document.querySelector(`.${this.instructionsCssClass}`);
    if (instructions !== null) {
      instructions.remove();
    }
  }
}
export default new Standup();
