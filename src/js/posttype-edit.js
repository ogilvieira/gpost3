import Vue from "./VueBase.js";
import InputImage from "./components/InputImage.vue";
import slugify from "slugify";

if( document.querySelector("[data-vue=posttype-edit]") ) {

  new Vue({
    el: "[data-vue=posttype-edit]",
    components: {
      'input-image' : InputImage
    },
    data: {
      isProcessing: true,
      errors: [],
      userInfo: null,
      loaded: false,
      MODE: "new",
      data: null,
      optionsSEO: false,
      editSlug: false,
      formRef: {},
      form: {
        title: "",
        slug: "",
        seo_title: "",
        description: "",
        seo_description: "",
        show_in_search: 1,
        custom_fields: [],
        cover: null
      }
    },
    props: {
      areaID: {
        type: String,
        default() {
          return document.querySelector("[data-vue=posttype-edit]").getAttribute("data-id") || "";
        },
      },
    },
    methods: {
      fetchInfo: function(){
        this.MODE = "edit";
        this.isProcessing = true;

        this.$http.get(`/rest/articles/${this.areaID}`)
          .then(res => {
            this.data = res.data;

            Object.keys(this.form).map(a => {
              this.form[a] = res.data[a];
            });

            this.formRef = JSON.parse(JSON.stringify(this.form));

          })
          .catch(err => {
            console.log(err)
            console.error(err.data);
          })
          .then(res => {
            this.isProcessing = false;
            this.loaded = true;
          })
      },
      addCustomField: function() {
        this.form.custom_fields.push({
          "title": "",
          "key": "",
          "type" : "TEXT",
          "required" : false,
          "minlength" : 0,
          "maxlength" : 0,
          "options" : "",
          "edit_mode" : true,
        })
      },
      discard: function() {
        let confirm = window.confirm("Deseja descartar as alterações não salvas?");

        if(confirm) {
          this.form = JSON.parse(JSON.stringify(this.formRef));
        }
      },
      slugifySlug: function(){
        this.form.slug = slugify(this.form.slug, {
          replacement: '-',
          lower: true,
          remove: /[*+~.()'"!:@]/g
        })
      },
      removeCustomField(index) {

        if( !this.form.custom_fields[index] ) { return; }
        let confirm = window.confirm("Deseja remover este campo?");

        if( confirm ) {
          this.form.custom_fields.splice(index);
        }

      }
    },
    created: function() {

      this.$http.get('/rest/account')
        .then(res => {
          this.userInfo = res.data;
        })


      if( this.areaID ) {
        this.fetchInfo();
      } else {
        this.loaded = true;
        this.isProcessing = false;
      }
    }
  });

}
