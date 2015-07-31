//Class that implements a Store using browser's localStore capabilities,
//or stores in-memory json

'use strict';

/**
 *
 *
 * @param {function} callback fake DB callback
 */
function Store(name, callback) {
  callback = callback || function () {};

  this._dbName = name;

  if (!localStorage[name]) {
    var data = {
      todos: []
    };
    localStorage[name] = JSON.stringify(data);
  }

  callback.call(this, JSON.parse(localStorage[name]));
}

/**
 * Will retrieve all data from the collection
 *
 * @param {function} callback The callback to fire upon retrieving data
 */
Store.prototype.findAll = function (callback) {
  callback = callback || function () {};
  callback.call(this, JSON.parse(localStorage[this._dbName]).todos);
};

Store.prototype.save = function(updateData, callback, id) {
  var data = JSON.parse(localStorage[this._dbName]);
  var todos = data.todos;

  callback = callback || function() {};

  // If an ID was actually given, find the item and update each property
  if (id) {
    for (var i = 0; i < todos.length; i++) {
      if (todos[i].id === id) {
        for (var key in updateData) {
          todos[i][key] = updateData[key];
        }
        break;
      }
    }

    localStorage[this._dbName] = JSON.stringify(data);
    callback.call(this, JSON.parse(localStorage[this._dbName]).todos);
  } else {
    // Generate an ID
    updateData.id = new Date().getTime();

    todos.push(updateData);
    localStorage[this._dbName] = JSON.stringify(data);
    callback.call(this, [updateData]);
  }
};

/**
 * Will remove an item from the Store based on its ID
 *
 * @param {number} id The ID of the item you want to remove
 * @param {function} callback The callback to fire after saving
 */
Store.prototype.remove = function (id, callback) {
  var data = JSON.parse(localStorage[this._dbName]);
  var todos = data.todos;

  for (var i = 0; i < todos.length; i++) {
    if (todos[i].id == id) {
      todos.splice(i, 1);
      break;
    }
  }

  localStorage[this._dbName] = JSON.stringify(data);
  callback.call(this, JSON.parse(localStorage[this._dbName]).todos);
};

module.exports = Store;