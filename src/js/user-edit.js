import Vue from "./VueBase.js";
import { scorePassword } from "./utils.js";

if( document.querySelector("[data-vue=user-edit]") ) {

  new Vue({
    el: "[data-vue=user-edit]",
    data: {
      isProcessing: true,
      errors: [],
      formRef: {},
      score: 0,
      userInfo: null,
      loaded: false,
      MODE: "new",
      updatePass: false,
      form: {
        email: '',
        name: '',
        front_role: '',
        role: 'editor',
        bio: '',
        password: '',
        passwordB: '',
        active: 1
      }
    },
    props: {
      userID: {
        type: String,
        default() {
          return document.querySelector("[data-vue=user-edit]").getAttribute("data-id") || "";
        },
      },
    },
    methods: {
      fetchInfo: function(){
        this.MODE = "edit";
        this.isProcessing = true;

        this.$http.get(`/rest/user/${this.userID}`)
          .then(res => {
            Object.keys(this.form).map(a => {
              this.form[a] = (res.data[a] || "")+'';
              this.formRef[a] = (res.data[a] || "")+'';
            })
          })
          .catch(err => {
            console.error(err.data);
          })
          .then(res => {
            this.isProcessing = false;
            this.loaded = true;
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

        if( this.MODE == 'edit' && JSON.stringify(this.form) == JSON.stringify(this.formRef) ) {
          this.errors.push({ model: "", message: "Não há atualizações para realizar." })
        }

        if( (this.MODE == 'new' || (this.MODE == 'edit' && this.form.password.length > 0)) && this.form.password.length < 6) {
          this.errors.push({ model: "password", message: "A senha precisa ter pelomenos 6 caracteres." })
        }


        if( (this.MODE == 'new' || (this.MODE == 'edit' && this.form.password.length > 0)) && this.form.passwordB.length == 0) {
          this.errors.push({ model: "passwordB", message: "É necessário repetir a senha." })
        }

        if( (this.MODE == 'new' || (this.MODE == 'edit' && this.form.password.length > 0)) && this.form.password != this.form.passwordB) {
          this.errors.push({ model: "passwordB", message: "As senhas precisam ser iguais." })
        }

        if( this.errors.length ) { return; }
        this.isProcessing = true;

        let form = Object.assign({}, this.form);

        if( this.MODE == 'edit' && !this.form.password ) {
          delete form.password;
        }

        delete form.passwordB;

        this.$http[this.MODE == 'new' ? 'post' : 'put'](`/rest/user${this.MODE == 'new' ? '' : '/'+this.userID}`, form)
          .then(response => {

            Vue.$toast.open({
              message: response.data && response.data.message ? response.data.message : "",
            });

            if( this.MODE == 'new' ) {
              
              setTimeout(() => {
                window.location.href = "/users/"+response.data.data.id;
              }, 1000);

            } else {
              this.fetchInfo();
            }

          })
          .catch( response => {
            if( response.models ) {
              Object.keys(response.models).map(a => {
                this.errors.push({ model: a, message: response.models[a] })
              })
            }
            this.isProcessing = false;
          })

        return;
      },
      setScore: function() {
        this.score = scorePassword(this.form.password);
      },
    },
    created: function() {

      this.$http.get('/rest/account')
        .then(res => {
          this.userInfo = res.data;
          console.log(this.userInfo);
        })


      if( this.userID ) {
        this.fetchInfo();
      } else {
        this.loaded = true;
        this.isProcessing = false;
      }
    }
  });

}
