import Vue from "./VueBase.js";

if( document.querySelector("[data-vue=post-list]") ) {

  new Vue({
    el: "[data-vue=post-list]",
    data: {
      isProcessing: false,
      data: null,
      users: [],
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

        this.$http.get(`/rest/posttype/${this.postTypeID}/articles`)
          .then(res => {
            this.data = res.data;
          })
          .catch(res => {
            console.error(res);
          })
          .then(res => {
            this.isProcessing = false;
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
