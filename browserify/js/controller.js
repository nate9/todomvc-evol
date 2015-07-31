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