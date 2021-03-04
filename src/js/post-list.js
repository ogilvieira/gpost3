import Vue from "./VueBase.js";

if( document.querySelector("[data-vue=post-list]") ) {

  new Vue({
    el: "[data-vue=post-list]",
    data: {
      isProcessing: false,
      data: null,
      users: [],
      categories: [],
      page: 1,
      isProcessingUsers: true,
      filterForm: null
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

        let params = !this.filterForm ? {} : Object.assign({}, this.filterForm);
        params.page = page;

        this.$http.get(`/rest/articles/posttype/${this.postTypeID}`, {
          params
        })
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
      fetchCategories() {
        let _self = this;

        this.$http.get(`/rest/posttype/${this.postTypeID}/categories`)
          .then((catsData) => {
            _self.categories = catsData.data;

          })
          .catch((err) => {
            console.log(err);
          })
      },
      getUserPropByID( id, prop ) {
        let user = null;
        user = this.users.find(a => a.id == id);
        return user ? user[prop] : id;
      },
      openFilter() {
        let _self = this;
        let options = {
          inputs: {
            "terms": {
              type: 'text',
              title: 'Termos',
            },
            "category": {
              type: 'select',
              title: 'Categoria',
              options: [],
            },
            "author": {
              type: 'select',
              title: 'Autor',
              options: [],
            }
          },
          onSubmit: (formData) => {

            let params = {};

            if( !Object.values(formData).filter(a => !!a).length ) { 
              _self.filterForm =  null;
              console.log('none');
            } else {
              _self.filterForm = {};
              _self.page = 1;

              Object.keys(formData).forEach(key => {
                if(formData[key]){ 
                _self.filterForm[key] = formData[key];
                }
              });

            }
            
            _self.fetchInfo();

          },
          onCancel: () => {
            _self.filterForm = null;
            _self.fetchInfo();
          }
        };

        _self.filterForm && Object.keys(_self.filterForm).forEach(key => {
          if( options.inputs[key] ) {
            options.inputs[key].value = _self.filterForm[key];
          }
        });

        this.users && this.users.forEach(a => {
          options.inputs.author.options.push(`${a.id}:${a.name}`);
        });

        this.categories && this.categories.forEach(a => {
          options.inputs.category.options.push(`${a.id}:${a.title}`);
        });

        Modal.open('FORM_FILTER', options)
      }
    },
    created: function() {
      this.fetchInfo();
      this.fetchUsers();
      this.fetchCategories();
    }
  });

}
