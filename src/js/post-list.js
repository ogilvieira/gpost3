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
              options: [':Todas'],
            },
            "status": {
              type: 'select',
              title: 'Status',
              options: [':Todos', '0:Rascunho','1:Publicado/Agendado'],
            },
            "author": {
              type: 'select',
              title: 'Autor(a)',
              options: [':Todos(as)'],
            },
            "archived": {
              type: 'select',
              title: 'Arquivo',
              options: [':Não Arquivados','1:Somente Arquivados'],
            }
          },
          onSubmit: (formData) => {

            let params = {};

            if( !Object.values(formData).filter(a => !!a).length ) { 
              _self.filterForm =  null;
            } else {
              _self.filterForm = {};
              _self.page = 1;

              Object.keys(formData).forEach(key => {
                if(formData[key]){ 
                _self.filterForm[key] = formData[key];
                }
              });

            }

            window.sessionStorage.setItem(`post-list-filter_${this.postTypeID}`, JSON.stringify(_self.filterForm));

            _self.fetchInfo();

          },
          onCancel: () => {
            _self.filterForm = null;

            if( window.sessionStorage.getItem(`post-list-filter_${this.postTypeID}`) ) {
              window.sessionStorage.removeItem(`post-list-filter_${this.postTypeID}`);
            }

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

      if( window.sessionStorage.getItem(`post-list-filter_${this.postTypeID}`) ) {
        this.filterForm = JSON.parse(window.sessionStorage.getItem(`post-list-filter_${this.postTypeID}`));
      }

      this.fetchInfo();
      this.fetchUsers();
      this.fetchCategories();
    }
  });

}
