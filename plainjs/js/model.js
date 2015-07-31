(function (window) {
  'use strict';

  function Model(storage) {
    this.storage = storage;
  }

  Model.prototype.create = function(title, callback) {
    title = title || '';
    callback = callback || function() {};

    var newItem = {
      title: title.trim(),
      completed: false
    };

    this.storage.save(newItem, callback);
  };

  /**
   *  Queries the storage for Todo Items
   *
   */
  Model.prototype.read = function(query, callback) {
    var queryType = typeof query;
    callback = callback || function() {};

    if (queryType === 'function') {
      callback = query;
      return this.storage.findAll(callback);
    } else if (queryType === 'string' || queryType === 'number') {
      query = parseInt(query, 10);
      this.storage.find({ id: query }, callback);
    } else {
      this.storage.find(query, callback);
    }
  }

  /**
   * Removes a model from storage
   *
   * @param {number} id The ID of the model to remove
   * @param {function} callback The callback to fire when the removal is complete.
   */
  Model.prototype.remove = function (id, callback) {
    this.storage.remove(id, callback);
  };

  // Export to window
  window.app = window.app || {};
  window.app.Model = Model;
})(window);