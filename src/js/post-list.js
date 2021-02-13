import Vue from "./VueBase.js";

if( document.querySelector("[data-vue=post-list]") ) {

  new Vue({
    el: "[data-vue=post-list]",
    data: {
      isProcessing: false,
      data: null,
      users: [],
      page: 1,
      isProcessingUsers: true,
    },
    props: {
      postTypeID: {
        type: String,
        default() {
          return document.querySelector("[data-vue=post-list]").getAttribute("data-posttype") || "1";
        },
      },
    },
    methods: {
      fetchInfo: function(page = 1){
        this.isProcessing = true;

        if( page < 1 ) { page = 1; }

        if( this.data && this.data.pages && page > this.data.pages ) {
          page = this.data.pages;
        }


        this.$http.get(`/rest/articles/posttype/${this.postTypeID}?page=${page}`)
          .then(res => {
            this.data = res.data ? res.data : null;
          })
          .catch(res => {
            console.error(res);
          })
          .then(res => {
            this.isProcessing = false;
            this.page = page;
          })
      },
      isFuture(dateISO) {
        return (new Date(dateISO).getTime() >= new Date().getTime());
      },
      fetchUsers() {
        this.isProcessingUsers = true;
        this.$http.get(`/rest/user?paginate=0`)
          .then(res => {
            this.users = res.data || [];
          })
          .catch(err => {
            console.error(err);
          })
          .then(() => {
            this.isProcessingUsers = false;
          })
      },
      getUserPropByID( id, prop ) {
        let user = null;
        user = this.users.find(a => a.id == id);
        return user ? user[prop] : id;
      }
    },
    created: function() {
      this.fetchInfo();
      this.fetchUsers();
    }
  });

}
