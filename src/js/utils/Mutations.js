class Mutations {
  onNodeRemoval(root, target_node_id, callback) {
    var mutationObserver = new MutationObserver((mutations) => {
      let contentHasBeenDeleted = mutations.find((mutation) => {
        if (mutation.removedNodes.length < 1) {
          return false;
        }

        let removedNodes = [...mutation.removedNodes];
        return removedNodes.find((node) => {
          return node.id === target_node_id;
        });
      });

      if (contentHasBeenDeleted) {
        mutationObserver.disconnect();
        callback()
      }
    });
    mutationObserver.observe(root, {
      childList: true,
      subtree: true
    });
  }

  waitForElement(root, target_node_id, callback) {
    if(document.getElementById(target_node_id)){
      callback();
      return
    }

    var mutationObserver = new MutationObserver((mutations) => {
      let contentHasBeenAdded = mutations.find((mutation) => {
        if (mutation.addedNodes.length < 1) {
          return false;
        }

        let addedNodes = [...mutation.addedNodes];
        return addedNodes.find((node) => {
          return node.id === target_node_id;
        });
      });

      if (contentHasBeenAdded) {
        mutationObserver.disconnect();
        callback()
      }
    });
    mutationObserver.observe(root, {
      childList: true,
      subtree: true
    });
  }
}

export default new Mutations();
