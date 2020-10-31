import Vue from "./VueBase.js";

new Vue({
  el: "[data-vue=navbar]",
  data: {
    showMenu: false,
  },
  methods: {
    toggleMenu: function(){
      this.showMenu = !this.showMenu;
    }
  }
});
