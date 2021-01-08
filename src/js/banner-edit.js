import Vue from "./VueBase.js";
import { scorePassword } from "./utils.js";

if( document.querySelector("[data-vue=banner-edit]") ) {

  new Vue({
    el: "[data-vue=banner-edit]",
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
        title: '',
        description: ''
      }
    },
    props: {
      bannerID: {
        type: String,
        default() {
          return document.querySelector("[data-vue=banner-edit]").getAttribute("data-id") || "";
        },
      },
    },
    methods: {
      fetchInfo: function(){
        this.MODE = "edit";
        this.isProcessing = true;

        this.$http.get(`/rest/banner/${this.bannerID}`)
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

        if (this.form.title.length < 3) {
          this.errors.push({ model: "title", message: "Titulo inválido."});
        }

        if (this.form.description.length < 5 ) {
          this.errors.push({ model: "description", message: "Descrição inválidas."});
        }

        if( this.MODE == 'edit' && JSON.stringify(this.form) == JSON.stringify(this.formRef) ) {
          this.errors.push({ model: "", message: "Não há atualizações para realizar." })
        }


        if( this.errors.length ) { return; }
        this.isProcessing = true;

        let form = Object.assign({}, this.form);

        this.$http[this.MODE == 'new' ? 'post' : 'put'](`/rest/banner${this.MODE == 'new' ? '' : '/'+this.bannerID}`, form)
          .then(response => {

            Vue.$toast.open({
              message: response.data && response.data.message ? response.data.message : "",
            });

            if( this.MODE == 'new' ) {

              setTimeout(() => {
                window.location.href = "/banners/"+response.data.data.id;
              }, 1000);

            } else {
              this.fetchInfo();
            }

          })
          .catch( response => {
            console.log(response);
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
        })


      if( this.bannerID ) {
        this.fetchInfo();
      } else {
        this.loaded = true;
        this.isProcessing = false;
      }
    }
  });

}
