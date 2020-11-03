import Vue from "./VueBase.js";

if( document.querySelector("[data-vue=banner-list]") ) {

  new Vue({
    el: "[data-vue=banner-list]",
    data: {
      isProcessing: false,
      data: null, 
    },
    methods: {
      fetchInfo: function(page = 1){
        this.isProcessing = true;

        this.$http.get('/rest/banner')
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
