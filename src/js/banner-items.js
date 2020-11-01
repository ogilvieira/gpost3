import Vue from "./VueBase.js";
import InputImage from "./components/InputImage.vue";
import draggable from "vuedraggable";

if( document.querySelector("[data-vue=banner-items]") ) {

  var vm = new Vue({
    el: "[data-vue=banner-items]",
    components: {
      "input-image": InputImage,
      draggable
    },
    data: {
      score: 0,
      page: 1,
      userInfo: null,
      isProcessing: false,
      errors: [],
      data: [
        {
          order: 0,
          start: new Date().toISOString(),
          end: new Date().toISOString(),
          title: "lorem 1",
          link: "http://www.site.com/",
          image: "https://dummyimage.com/1920x400/444/ccc.jpg"
        },
        {
          order: 1,
          start: new Date().toISOString(),
          end: new Date().toISOString(),
          title: "lorem 2",
          link: "http://www.site.com/",
          image: "https://dummyimage.com/1920x400/444/ccc.jpg"
        },
        {
          order: 2,
          start: new Date().toISOString(),
          end: new Date().toISOString(),
          title: "lorem 3",
          link: "http://www.site.com/",
          image: "https://dummyimage.com/1920x400/444/ccc.jpg"
        }
      ], 
    },
    methods: {
      fetchInfo: function(page = 1){
        this.isProcessing = false;
      //   this.page = page || this.page;

      //   this.$http.get('/rest/banner', {
      //     params : {
      //       page: page
      //     }
      //   })
      //     .then(res => {
      //       this.data = res.data;
      //     })
      //     .catch(res => {
      //       console.error(res);
      //     })
      //     .then(res => {
      //       this.isProcessing = false;
      //     })
      },
      setOrder() {
        this.data = this.data.sort((a,b) => {
          return b.order-a.order;
        });

        this.data.map((a, index) => {
          console.log(a, index);
        })
      }
    },
    created: function() {
      this.fetchInfo();
    }
  });

}
