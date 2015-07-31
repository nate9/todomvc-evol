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

  that.view.bind('itemRemove', function(item){
    that.removeItem(item.id);
  });
}

/**
 * Tells the view to show all todos
 * 
 */
Controller.prototype.showAll = function () {
  var that = this;
  that.model.read(function (data) {
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
    that.showAll();
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
};

module.exports = Controller;