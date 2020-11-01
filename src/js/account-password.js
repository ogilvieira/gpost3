import Vue from "./VueBase.js";
import { scorePassword } from "./utils.js"

if( document.querySelector("[data-vue=account-password]") ) {

  new Vue({
    el: "[data-vue=account-password]",
    data: {
      score: 0,
      isProcessing: false,
      errors: [],
      form: {
        currentPassword: '',
        newPassword: '',
        newPasswordB: '',
      }
    },
    methods: {
      fetchInfo: function(){

      },
      setScore: function() {
        this.score = scorePassword(this.form.newPassword);
      },
      checkForm: function(e) {
        e.preventDefault();
        this.errors = [];

        if (this.form.newPassword.length < 6) {
          this.errors.push({ model: "newPassword", message: "A Nova senha precisa ter pelomenos 6 caracteres"});
        }


        if (this.form.newPassword != this.form.newPasswordB) {
          this.errors.push({ model: "newPasswordB", message: "As senhas precisam ser iguais."});
        }

        if( this.errors.length ) { return; }

        this.isProcessing = true;

        this.$http.put('/rest/account/password', {
          currentPassword: this.form.currentPassword,
          newPassword: this.form.newPassword,
        })
          .then(response => {
            
            Vue.$toast.open({
              message: response.data && response.data.message ? response.data.message : "",
            });

            this.form = {
              currentPassword: '',
              newPassword: '',
              newPasswordB: '',
            };
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

        return;
      }
    }
  });

}
