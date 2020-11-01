import Vue from "./VueBase.js";
import axios from "axios";

if( document.querySelector("[data-vue=login]") ) {

  new Vue({
    el: "[data-vue=login]",
    data: {
      isProcessing: false,
      errors: [],
      form: {
        email: '',
        password: '',
      }
    },
    methods: {
      checkLogin: function(e) {
        e.preventDefault();
        this.errors = [];

        if (this.form.email.indexOf('@')==-1 || this.form.email.indexOf('.')==-1) {
          this.errors.push({ model: "email", message: "E-mail inválido."});
        }

        if (!this.form.password.length) {
          this.errors.push({ model: "password", message: "Senha é requerido."});
        }

        if( this.errors.length ) { return; }

        this.$http.post('/rest/account/login', this.form)
          .then(response => {
            window.localStorage.setItem("token", response.data);
            window.location.href = "/";
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

      },
    },
    created: function(){
     if( window.localStorage.getItem("token") ) {
      window.location.href = "/";
      this.isProcessing = true;
     }
    }
  });

}
