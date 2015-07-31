/* global app, $on */
(function () {
  'use strict';

  function Todo(name) {
    this.storage = new app.Store("todos");
    this.model = new app.Model(this.storage);
    this.template = new app.Template();
    this.view = new app.View(this.template);
    this.controller = new app.Controller(this.model, this.view);
  }

  var todo = new Todo('todos-vanillajs');

  function setView() {
    todo.controller.showAll();
  }

  //On load and on #change, reset the view
  $on(window, 'load', setView);
  $on(window, 'hashchange', setView);
})();