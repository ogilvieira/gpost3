import Vue from "./VueBase.js";

if( document.querySelector("[data-vue=user-list]") ) {

  new Vue({
    el: "[data-vue=user-list]",
    data: {
      score: 0,
      page: 1,
      isProcessing: false,
      errors: [],
      data: null, 
    },
    methods: {
      fetchInfo: function(page = 1){
        this.isProcessing = true;
        this.page = page || this.page;

        this.$http.get('/rest/user', {
          params : {
            page: page
          }
        })
          .then(res => {
            this.data = res.data;
          })
          .catch(res => {
            console.error(res);
          })
          .then(res => {
            this.isProcessing = false;
          })
      }
    },
    created: function() {
      this.fetchInfo();
    }
  });

}
