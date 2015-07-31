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