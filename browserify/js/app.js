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
  todo.controller.showAll();
}

//On load and onc #hange, reset the view
$on(window, 'load', setView);
$on(window, 'hashchange', setView);