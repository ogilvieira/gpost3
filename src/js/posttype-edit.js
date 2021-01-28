import Vue from "./VueBase.js";
import draggable from "vuedraggable";
import InputImage from "./components/InputImage.vue";
import slugify from "slugify";
import { randomInt } from "./utils.js";

if( document.querySelector("[data-vue=posttype-edit]") ) {

  var vm = new Vue({
    el: "[data-vue=posttype-edit]",
    components: {
      'input-image' : InputImage,
      draggable
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

        this.$http.get(`/rest/posttype/${this.areaID}`)
          .then(res => {
            this.data = res.data;

            Object.keys(this.form).map(a => {
              this.form[a] = res.data[a];
            });

            this.form.custom_fields.map(a => {
              a.edit_mode = false;
              a.randomIndex = randomInt(0, 1000);
              return a;
            });

            this.formRef = JSON.parse(JSON.stringify(this.form));

          })
          .catch(err => {
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
          "randomIndex" : randomInt(0, 1000)
        })
      },
      editCustomInput: function( input ) {
        let index = this.form.custom_fields.findIndex(a => a.randomIndex == input.randomIndex);
        input.edit_mode = true;
        Vue.set(vm.form.custom_fields, index, input);
      },
      saveCustomInput: function( input ) {

        if(!input.title || !input.key) {
          this.$toast.open({
            type: "error",
            message: "Titulo e Chave são obrigatórios."
          });
          return;
        }


        if( input.title && this.form.custom_fields.filter(a => a.title == input.title).length > 1 ) {
          this.$toast.open({
            type: "error",
            message: "Já existe um campo com este mesmo Nome."
          });
          return;
        }

        if( input.title && this.form.custom_fields.filter(a => a.key == input.key).length > 1 ) {
          this.$toast.open({
            type: "error",
            message: "Já existe um campo com esta mesma Chave."
          });
          return;
        }

        input.options = input.options.trim();


        input.edit_mode = false;

        let index = this.form.custom_fields.findIndex(a => a.randomIndex == input.randomIndex);
        Vue.set(vm.form.custom_fields, index, input);

      },
      discard: function() {

        if(!this.loaded || this.isProcessing){ return; }

        let confirm = window.confirm("Deseja descartar as alterações não salvas?");

        if(confirm) {
          this.form = JSON.parse(JSON.stringify(this.formRef));
        }
      },
      slugifySlug: function( val ){
        val = slugify(val, {
          replacement: '-',
          lower: true,
          remove: /[*+~.()'"!:@]/g
        });

        return val;
      },
      removeCustomField(index) {

        if( !this.form.custom_fields[index] ) { return; }
        let confirm = window.confirm("Deseja remover este campo?");

        if( confirm ) {
          this.form.custom_fields.splice(index);
        }

      },
      serializeOptions( options ) {

        let res = options.trim().split("\n");

        res = res.map(a => {
          a = a.split(":");
          return a;
        });

        return res;
      },
      save: function() {
        this.isProcessing = true;

        this.$http.put(`/rest/posttype/${this.areaID}`, this.form)
          .then(res => {
            console.log(res)
            this.fetchInfo();
          })
          .catch(err => {
            console.error(err);
          })
          .then(res => {
            this.isProcessing = false;
          });
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
