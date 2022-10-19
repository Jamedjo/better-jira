import Standup from './Standup';
import Jira from './Jira';
import Mutations from '../utils/Mutations';

export default class JiraStandupMode {
  static initialize() {
    return new this();
  }

  constructor() {
    this.data = {};
    this.Storage = chrome.storage.sync;
    this.running = true;

    if (Jira.isNotPresent()) {
      this.running = false;
      return;
    }

    this._initialColumnResize();
    this.Storage.get('standup', (storage) => {
      this._initiateStandup(storage.standup);
    });
  }

  update(event) {
    this._updateColumnWidths(event.detail);
    this._initiateStandup(event.detail.standup);
  }

  _updateColumnWidths(detail) {
    if (!this.running) {
      return;
    }

    if (!detail.enabled) {
      document.body.classList.remove('jira-standup-mode');
      return;
    }
    document.body.classList.add('jira-standup-mode');
    this._getPreferredWidth(detail);
  }

  _ifEnabled(enabledCallback, disabledCallback = () => {}) {
    if (!this.running) {
      return;
    }

    this.Storage.get('enabled', (storage) => {
      if (!storage.enabled) {
        disabledCallback();
        return;
      }

      enabledCallback();
    });
  }

  _initialColumnResize() {
    if (!this.running) {
      return;
    }

    setTimeout(() => {
      if (Jira.hasNotLoadedSwimlanes()) {
        // console.log('🔧: Swimlanes not present, waiting 100ms.');
        return this._initialColumnResize();
      }
      // console.log('🔧: Swimlanes are present, resizing now.');

      let enabled = () => {
        document.body.classList.add('jira-standup-mode');

        this.Storage.get('columnWidth', this._getPreferredWidth.bind(this));
        this._protectAgainstReactBoardReloading();
      };

      //-- Disallow setting columns if the plugin is not enabled
      let disabled = () => {
        document.body.classList.remove('jira-standup-mode');
      };
      this._ifEnabled(enabled, disabled);
    }, 100);
  }

  _getPreferredWidth(storage) {
    if (!this.running) {
      return;
    }

    this.data.columnWidth = storage.columnWidth;

    if (isNaN(this.data.columnWidth)) {
      this.data.columnWidth = 200;
    }

    this._setPreferredWidth();
  }

  _setPreferredWidth() {
    if (!this.running) {
      return;
    }

    let preferredWidth, columnCount, padding, width;

    preferredWidth = this.data.columnWidth;

    columnCount = Jira.columns().length;

    padding = columnCount * 12;
    width = columnCount * preferredWidth + padding;

    if (width < 10) {
      return;
    }

    //-- Handle Smaller Boards
    if (width < window.innerWidth) {
      let container = document.querySelector('#gh, #content > .aui-page-panel');
      width =
        parseInt(container.offsetWidth) -
        parseInt(
          window
            .getComputedStyle(container, null)
            .getPropertyValue('padding-left')
        );
    }

    try {
      let items = { poolWidth: width };
      this.Storage.set(items);

      this._setPoolWidth(width);
    } catch (e) {
      console.error(e);
    }
  }

  _setPoolWidth(width) {
    document.documentElement.style.setProperty(
      '--viewport-width',
      `${width}px`
    );
  }

  _setDetailViewWidth(width) {
    document.documentElement.style.setProperty('--detail-view-width', width);
  }

  _initiateStandup(config) {
    Standup.run(config);
  }

  _protectAgainstReactBoardReloading() {
    Mutations.onNodeRemoval(Jira.content(), 'ghx-pool-column', () => this._initialColumnResize());
  }
}
