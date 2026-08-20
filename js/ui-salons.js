/**
 * Disabled dead code placeholder.
 */
(function () {
  'use strict';

  window.salonUI = {
    disabled: true,
    currentSalon: null,
    messageBuffer: [],
    maxMessages: 0,
    renderSalonCategories: function () {
      return '';
    },
    renderSalonChat: function () {
      return '';
    },
    addMessage: function () {},
    renderMessages: function () {},
    sendMessage: async function () {
      return false;
    },
    selectSalon: async function () {
      return false;
    },
    toggleCategory: function () {},
    getRoleIcon: function () {
      return '';
    },
    showNotification: function () {},
    escapeHTML: function (text) {
      return text == null ? '' : String(text);
    }
  };
})();
