import Vue from "./VueBase.js";

if( document.querySelector("[data-vue=navbar]") ) {
  new Vue({
    el: "[data-vue=navbar]",
    data: {
      showMenu: false,
    },
    methods: {
      toggleMenu: function(){
        this.showMenu = !this.showMenu;
      },
      logout: function() {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
  });
}
