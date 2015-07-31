(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global app, $on */
'use strict';

var Store = require("./store.js");
var Model = require("./model.js");
var View = require("./view.js");
var Controller = require("./controller.js");
var helper = require("./helper.js");
var qs = helper.qs;
var $on = helper.$on;


function Todo(name) {
  this.storage = new Store();
  this.model = new Model(this.storage);
  //OLD
  //this.template = new app.Template();
  //NEW
  var source = qs("#todo-template").innerHTML;
  this.template = Handlebars.compile(source)
  this.view = new View(this.template);
  this.controller = new Controller(this.model, this.view);
}

var todo = new Todo('todos-vanillajs');

function setView() {
  todo.controller.setView(document.location.hash);
}

//On load and on #change, reset the view
$on(window, 'load', setView);
$on(window, 'hashchange', setView);
},{"./controller.js":2,"./helper.js":3,"./model.js":4,"./store.js":5,"./view.js":6}],2:[function(require,module,exports){
'use strict';

var helper = require("./helper.js");
var $on = helper.$on;
require("./view.js");

/**
 * Takes a model and view and acts as the controller between them
 * 
 * @constructor
 * @param {object} model
 * @param {object} view
 */
function Controller(model, view) {
  var that = this;
  that.model = model;
  that.view = view;

  //Bind View actions to this controller's methods
  that.view.bind('newTodo', function(title) {
    that.addItem(title);
  });

  that.view.bind('itemEdit', function (item) {
    that.editItem(item.id);
  });

  that.view.bind('itemEditDone', function(item) {
    that.editItemSave(item.id, item.title);
  });

  that.view.bind('itemRemove', function(item){
    that.removeItem(item.id);
  });
}

/**
 * @param {string} '' | 'active' | 'completed'
 * Acts as a router
 */
Controller.prototype.setView = function(locationHash) {
  var route = locationHash.split('/')[1];
  var page = route || '';
  this._updateFilterState(page);
};

//Controller is binding view's event to it's function, which when it runs,
//Calls Model to update itself, which on call back, calls View to Render itself.
Controller.prototype.editItemSave = function(id, title) {
  var that = this;
  if(title.trim()) {
    that.model.update(id, {title: title}, function () {
      that.view.render('editItemDone', {id: id, title: title});
    });
  } else {
    that.removeItem(id);
  }
};


Controller.prototype.showAll = function () {
  var that = this;
  that.model.read(function (data) {
    that.view.render('showEntries', data);
  });
};

Controller.prototype.showActive = function () {
  var that = this;
  that.model.read({ completed: false }, function (data) {
    that.view.render('showEntries', data);
  });
};

Controller.prototype.showCompleted = function() {
  var that = this;
  that.model.read({ completed: true }, function (data) {
    that.view.render('showEntries', data);
  });
};

/**
 * Informs the view to render clearing the new todo
 * 
 */
Controller.prototype.addItem = function (title) {
  var that = this;
  if(title.trim() === '') {
    return;
  }

  that.model.create(title, function() {
    that.view.render('clearNewTodo');
    that._filter(true);
  });
};

/**
 * @param  {[type]}
 */
Controller.prototype.removeItem = function (id) {
  var that = this;
  that.model.remove(id, function() {
    that.view.render('removeItem', id);
  });
  that._filter();
};

Controller.prototype._updateCount = function() {

};

/**
 * Re-filters the todo items
 *
 * @param { } [varname] [description]
 */
Controller.prototype._filter = function (force) {
  var activeRoute = this._activeRoute.charAt(0).toUpperCase() + this._activeRoute.substr(1);

  // Update the elements on the page, which change with each completed todo
  this._updateCount();

  // If the last active route isn't "All", or we're switching routes, we
  // re-create the todo item elements, calling:
  //   this.show[All|Active|Completed]();
  if (force || this._lastActiveRoute !== 'All' || this._lastActiveRoute !== activeRoute) {
    this['show' + activeRoute]();
  }

  this._lastActiveRoute = activeRoute;
};

Controller.prototype._updateFilterState = function (currentPage) {
  //Store a reference to the active route
  this._activeRoute = currentPage;

  //We would use a constant for '' to denote that it means to show all in the filter
  if (currentPage === '') {
    this._activeRoute = 'All';
  }

  this._filter();

  this.view.render('setFilter', currentPage);
};

module.exports = Controller;
},{"./helper.js":3,"./view.js":6}],3:[function(require,module,exports){
/* global NodeList */
//Helpers for a querySelector
var qs = function (selector, scope) {
  //If scope is null, then return document
  return (scope || document).querySelector(selector);
}
module.exports.qs = qs;

var qsa = function (selector, scope) {
  return (scope || document).querySelectorAll(selector);
}
module.exports.qsa = qsa;

//Adding event listeners
var $on = function (target, type, callback, useCapture) {
  target.addEventListener(type, callback, !!useCapture);
}
module.exports.$on = $on;

// Attach a handler to event for all elements that match the selector,
// now or in the future, based on a root element
var $delegate = function (target, selector, type, handler) {
  function dispatchEvent(event) {
    var targetElement = event.target;
    var potentialElements = qsa(selector, target);
    var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;

    if(hasMatch) {
      handler.call(targetElement, event);
    }
  }
  var useCapture = type === 'blur' || type === 'focus';

  $on(target, type, dispatchEvent, useCapture);
}

module.exports.$delegate = $delegate;

// Find the element's parent with the given tag name:
// $parent(qs('a'), 'div');
var $parent = function (element, tagName) {
  if (!element.parentNode) {
    return;
  }
  if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {
    return element.parentNode;
  }
  return $parent(element.parentNode, tagName);
}

module.exports.$parent = $parent;

// Allow for looping on nodes by chaining:
// qsa('.foo').forEach(function () {})
// Is this overriden in this conext?
NodeList.prototype.forEach = Array.prototype.forEach;
},{}],4:[function(require,module,exports){
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
 * Updates a model by giving it an ID, data to update, and a callback to fire when
 * the update is complete.
 *
 * @param {number} id The id of the model to update
 * @param {object} data The properties to update and their new value
 * @param {function} callback The callback to fire when the update is complete.
 */
Model.prototype.update = function (id, data, callback) {
  this.storage.save(data, callback, id);
};

/**
 * Removes a model from storage
 *
 * @param {number} id The ID of the model to remove
 * @param {function} callback The callback to fire when the removal is complete.
 */
Model.prototype.remove = function (id, callback) {
  this.storage.remove(id, callback);
};

module.exports = Model;
},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
//Normal JS, we declare all the dependencies at the top
/*global qs, qsa, $on, $parent, $delegate */
var helper = require("./helper.js");
var qs = helper.qs;
var qsa = helper.qsa;
var $on = helper.$on;
var $parent = helper.$parent;
var $delegate = helper.$delegate;

'use strict';

//A View is where we type in all the ugly dom manipulation code and hacks
//1) Handles events
//2) Binds events to DOM objects
function View(template) {
  this.template = template;

  this.ENTER_KEY = 13;
  this.ESCAPE_KEY = 27;
  this.$todoList = qs('.todo-list');
  this.$todoItemCounter = qs('.todo-count');
  this.$clearCompleted = qs('.clear-completed');
  this.$main = qs('.main');
  this.$footer = qs('.footer');
  this.$toggleAll = qs('.toggle-all');
  this.$newTodo = qs('.new-todo');
}

//Removes an item from the todo list
View.prototype._removeItem = function (id) {
  var elem = qs('[data-id="' + id + '"]');
  if (elem) {
    this.$todoList.removeChild(elem);
  }
};

View.prototype._clearCompletedButton = function() {};

//Sets a filter on the view
View.prototype._setFilter = function (currentPage) {
  qs('.filters .selected').className = '';
  qs('.filters [href="#/' + currentPage + '"]').className = 'selected';
};

View.prototype._editItem = function(id, title) {
  var listItem = qs('[data-id="' + id + '"]');

  if(!listItem) {
    return;
  }

  listItem.className = listItem.className + ' editing';
  var input = document.createElement('input');
  input.className = 'edit';

  listItem.appendChild(input);
  input.focus();
  input.value = title;
};

View.prototype._editItemDone = function (id, title) {
  var listItem = qs('[data-id="' + id + '"]');

  if(!listItem) {
    return;
  }

  var input = qs('input.edit', listItem);
  listItem.removeChild(input);

  listItem.className = listItem.className.replace('editing', '');

  qsa('label', listItem).forEach(function (label) {
      label.textContent = title;
  });
};

//Usage: view.render("showEntries","1")
//Why do we need a mapper to map the viewCmd to the actual methods?
//This is the reaction
View.prototype.render = function (viewCmd, parameter) {
  var that = this;
  var viewCommands = {
    showEntries: function () {
        that.$todoList.innerHTML = that.template(parameter);
    },
    removeItem: function () {
        that._removeItem(parameter);
    },
    updateElementCount: function () {
        //replace with footer template
        //that.$todoItemCounter.innerHTML = that.template.itemCounter(parameter);
    },
    clearCompletedButton: function () {
        that._clearCompletedButton(parameter.completed, parameter.visible);
    },
    contentBlockVisibility: function () {
        that.$main.style.display = that.$footer.style.display = parameter.visible ? 'block' : 'none';
    },
    toggleAll: function () {
        that.$toggleAll.checked = parameter.checked;
    },
    setFilter: function () {
        that._setFilter(parameter);
    },
    clearNewTodo: function () {
        that.$newTodo.value = '';
    },
    elementComplete: function () {
        that._elementComplete(parameter.id, parameter.completed);
    },
    editItem: function () {
        that._editItem(parameter.id, parameter.title);
    },
    editItemDone: function () {
        that._editItemDone(parameter.id, parameter.title);
    }
  };
  viewCommands[viewCmd]();
};

View.prototype._itemId = function(element) {
  var li = $parent(element, 'li');
  return parseInt(li.dataset.id, 10);
};

View.prototype._bindItemEditDone = function (handler) {
  var that = this;
  $delegate(that.$todoList, 'li .edit', 'blur', function() {
    if(!this.dataset.iscanceled) {
      handler({
        id: that._itemId(this),
        title: this.value
      });
    }
  });

  $delegate(that.$todoList, 'li .edit', 'keypress', function(event) {
    if(event.keyCode === that.ENTER_KEY) {
      this.blur();
    }
  });
};

/*View.prototype._bindItemEditCancel = function (handler) {

};*/

//These are the Actions
View.prototype.bind = function (event, handler) {
  var that = this;
  if(event === 'newTodo') {
    $on(that.$newTodo, 'change', function() {
      handler(that.$newTodo.value);
    });
  } else if (event === 'itemRemove') {
    $delegate(that.$todoList, '.destroy', 'click', function() {
      handler({id: that._itemId(this)});
    });
  } else if (event === 'itemEditDone') {
    that._bindItemEditDone(handler);
  }

  //ETC.
};

module.exports = View;
},{"./helper.js":3}]},{},[1]);
