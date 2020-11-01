import Vue from "./VueBase.js";

if( document.querySelector("[data-vue=post-editor]") ) {
  new Vue({
    el: "[data-vue=post-editor]",
    data: {
      myHtml: "<div></div>",
    },
    methods: {
    }
  });
}
