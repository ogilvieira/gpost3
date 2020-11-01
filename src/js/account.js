import Vue from "./VueBase.js";

if( document.querySelector("[data-vue=account]") ) {

  new Vue({
    el: "[data-vue=account]",
    data: {
      isProcessing: true,
      errors: [],
      formRef: {},
      form: {
        email: '',
        name: '',
        front_role: '',
        bio: ''
      }
    },
    methods: {
      fetchInfo: function(){
        this.isProcessing = true;

        this.$http.get('/rest/account')
          .then(res => {
            Object.keys(this.form).map(a => {
              this.form[a] = res.data[a] || "";
              this.formRef[a] = res.data[a] || "";
            })
          })
          .catch(res => {
            console.error(res);
          })
          .then(res => {
            this.isProcessing = false;
          })

      },
      checkForm: function(e) {
        e.preventDefault();
        this.errors = [];

        if (this.form.name.length < 3 || this.form.name.split(' ').length < 2 ) {
          this.errors.push({ model: "name", message: "Nome e Sobrenome inválidos."});
        }


        if (this.form.email.indexOf('@')==-1 || this.form.email.indexOf('.')==-1) {
          this.errors.push({ model: "email", message: "E-mail inválido."});
        }

        if( JSON.stringify(this.form) == JSON.stringify(this.formRef) ) {
          this.errors.push({ model: "", message: "Não há atualizações para realizar." })
        }

        if( this.errors.length ) { return; }
        this.isProcessing = true;

        this.$http.put('/rest/account', this.form)
          .then(response => {

            Vue.$toast.open({
              message: response.data && response.data.message ? response.data.message : "",
            });

            this.fetchInfo();

          })
          .catch( response => {
            if( response.models ) {
              Object.keys(response.models).map(a => {
                this.errors.push({ model: a, message: response.models[a] })
              })
            }
          })
          .then( response => {
            this.isProcessing = false;
          })

      }
    },
    created: function() {
      this.fetchInfo();
    }
  });

}
