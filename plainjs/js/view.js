//Plain JS, we declare all the dependencies at the top
/*global qs, qsa, $on, $parent, $delegate */
(function (window) {
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

  //Usage: view.render("showEntries","1")
  //Why do we need a mapper to map the viewCmd to the actual methods?
  //This is the reaction
  View.prototype.render = function (viewCmd, parameter) {
    var that = this;
    var viewCommands = {
      showEntries: function () {
          that.$todoList.innerHTML = that.template.show(parameter);
      },
      removeItem: function () {
          that._removeItem(parameter);
      },
      clearNewTodo: function () {
          that.$newTodo.value = '';
      }
    };
    viewCommands[viewCmd]();
  };

  View.prototype._itemId = function(element) {
    var li = $parent(element, 'li');
    return parseInt(li.dataset.id, 10);
  };

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
    }
  };

  //Export Globally, unlike commonJS
  window.app = window.app || {};
  window.app.View = View;

})(window);