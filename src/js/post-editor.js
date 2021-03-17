import Vue from "./VueBase.js";
import slugify from "slugify";
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import "@ckeditor/ckeditor5-build-classic/build/translations/pt-br.js";
import InputImage from "./components/InputImage.vue";
import InputDateTimeLocal from "./components/InputDateTimeLocal.vue";
import UploadAdapter from './UploadAdapter';
import { isValidDate } from "./utils.js";
import Modal from "./Modal/Modal.js";

if( document.querySelector("[data-vue=post-editor]") ) {

  var vm = new Vue({
    el: "[data-vue=post-editor]",
    components: {
      "input-image": InputImage,
      "input-datetime": InputDateTimeLocal,
    },
    data: {
      editor: ClassicEditor,
      editorData: "<div></div>",
      editorConfig: {
        contentsCss: '/css/style.css',
        alignment: {
          options: [ 'left', 'right', 'center' ]
        },
        language: 'pt-br',
        height: 480,
        heading: {
          options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
          ]
        },
        extraPlugins: [ uploader ]
      },
      loaded: false,
      showOptionsSEO: false,
      localSavedNotification: false,
      cachedTime: null,
      isProcessing: true,
      rawData: null,
      editSlug: false,
      data: null,
      postType: null,
      categories: [],
      isProcessingCats: true,
      users: [],
      myUser: null,
      isProcessingUsers: true,
      errors: {}
    },
    props: {
      id: {
        type: String,
        default() {
          return document.querySelector("[data-vue=post-editor]").getAttribute("data-id") || "new";
        },
      },
      postTypeID: {
        type: String,
        default() {
          return document.querySelector("[data-vue=post-editor]").getAttribute("data-posttype") || "1";
        },
      },
    },
    methods: {
      fetchInfo() {
        this.isProcessing = true;

        let proms = [
          this.$http.get(`/rest/posttype/${this.postTypeID}`)
        ];

        if( this.id == 'new' || isNaN(this.id) ) {
          this.data = {
            id: "new",
            title: "",
            description: "",
            slug: "",
            seo_title: "",
            seo_description: "",
            cover: "",
            content: "<div></div>",
            status: true,
            parent: this.postTypeID,
            category: "",
            custom_fields: {},
            published_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            tags: []
          };
        } else {
          proms.push(this.$http.get(`/rest/article/${this.id}`));
        }

        Promise.all(proms)
          .then(res => {

            if( res[1] ) {
              this.data = res[1].data;
            }

            if( res[0] ) {
              this.postType = res[0].data;

              if( this.postType.custom_fields ){
                this.postType.custom_fields.map(a => {
                  this.data.custom_fields[a.key] = this.data.custom_fields[a.key] || "";
                });
              }
            }

          })
          .catch(err => {
            console.error(err);
          })
          .then(() => {
            this.rawData = JSON.parse(JSON.stringify(this.data));
            this.isProcessing = false;
            this.loaded = true;
          });

      },
      fetchCategories() {
        this.isProcessingCats = true;
        this.$http.get(`/rest/posttype/${this.postTypeID}/categories`)
          .then(res => {
            this.categories = res.data || [];
          })
          .catch(err => {
            console.error(err);
          })
          .then(() => {
            this.isProcessingCats = false;
          })
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
      checkTag(e) {
        e.target.value = e.target.value.replace(/,/g,"");

        if(e.keyCode == 188 || e.keyCode == 13 ) {

          if(e.target.value && e.target.value.length < 3 || this.data.tags.indexOf(e.target.value)!=-1){ return; }

          this.data.tags.push(e.target.value);
          e.target.value = "";
        }
      },
      removeTag( tag ) {
        let index = this.data.tags.indexOf(tag);
        if( index == -1 ) { return; }
        this.data.tags.splice(index,1)
      },
      checkCustomMultipleOption(customFieldKey, option){
        let r = (this.data.custom_fields[customFieldKey] || '').split(',');
        return r.indexOf(option) != -1;
      },
      toggleCustomMultipleOption( customFieldKey, option ){

        let customFieldVal = this.data.custom_fields[customFieldKey].split(',').filter(a => !!a);
        let index = customFieldVal.indexOf(option);

        if( index == -1 ) {
          customFieldVal.push(option);
        } else {
          customFieldVal.splice(index, 1);
        }

        let custom_fields = Object.assign({}, this.data.custom_fields);
            custom_fields[customFieldKey] = customFieldVal.join(',');

        Vue.set(vm.data, 'custom_fields', custom_fields);

      },
      setCustomInputImage(image, customFieldKey) {

        let custom_fields = Object.assign({}, this.data.custom_fields);
            custom_fields[customFieldKey] = image;

        Vue.set(vm.data, 'custom_fields', custom_fields);
      },
      openCategoryEditor( id = null ) {
        Modal.open('CATEGORY_EDITOR', { id: id, postTypeID: this.postTypeID })
      },
      discard() {
        let confirm = window.confirm("Tem certeza que deseja descartar as alterações não salvas?");
        if(!confirm){ return; }
        this.savedLocalDataAction('discard');
      },
      getSavedLocalData() {
        let cached = window.localStorage.getItem('post_'+this.id);
        if(!cached){ return; }

        try {
          cached = JSON.parse(cached);
          if( cached.data && cached.time ) {

            if( new Date(this.rawData.updated_at).getTime() >= new Date(cached.time).getTime()) {
              this.savedLocalDataAction('discard');
              return;
            }


            if( typeof cached.data.cover == 'object' ) { cached.data.cover = ""; }

            this.data = cached.data;
            this.cachedTime = cached.time;
            this.localSavedNotification = true;
          }
        } catch (err) {
          console.error(err);
        }

      },
      checkToLocalSave() {

        let rawData = JSON.stringify(this.rawData);

        if( window.localStorage.getItem('post_'+this.data.id) ){
          rawData = JSON.stringify(JSON.parse(window.localStorage.getItem('post_'+this.data.id)).data);
        }

        if( JSON.stringify(this.data) != rawData ){
          window.localStorage.setItem('post_'+this.data.id, JSON.stringify({time: new Date().toISOString(), data: this.data }));
          this.$toast.info("Cópia de segurança salva.");

          if( !this.data.is_editing_by && this.data.id != 'new' ) {
            this.$http.put(`/rest/article/${this.data.id}/lock`)
              .then(res => {
                this.data.is_editing_by = res.data.id;
              });
          }
        }
      },
      cancel() {
        if(this.data.id != 'new' && this.data.is_editing_by && this.data.is_editing_by == this.myUser.id){
          this.unlockItem(() => {
            window.location = `/articles/${this.postTypeID}`;
          });
        } else {
          window.location = `/articles/${this.postTypeID}`;
        }


      },
      unlockItem(cb, confirmMsg = false){

        if(confirmMsg){
          let confirm = window.confirm("Tem certeza que deseja desbloquear este artigo para edição?");
          if(!confirm){ return; }
        }

        if(this.data.id == 'new'){
          if( typeof cb == 'function' ){ return cb(); }
          return;
        }

        this.$http.put(`/rest/article/${this.data.id}/unlock`)
          .then(res => {
            if( typeof cb == 'function' ){
              cb();
            }
            this.fetchInfo();
          });

      },
      savedLocalDataAction( action ) {
        if( action == 'keep' ) {
          this.localSavedNotification = false;
        }
        if( action == 'discard' ) {
          this.localSavedNotification = false;
          this.data = JSON.parse(JSON.stringify(this.rawData));
          this.cachedTime = null;
          this.unlockItem();

          if( window.localStorage.getItem('post_'+this.data.id) ) {
            window.localStorage.removeItem('post_'+this.data.id);
          }
        }
      },
      getPath() {

        let a = [];

        if( this.postType ) {
          a.push(this.postType.slug);
        }

        if( this.categories && this.data.category ) {
          let cat = this.categories.find(b => b.id == this.data.category);
          a.push(cat.slug);
        }

        if( this.data.slug ) {
          a.push(this.data.slug);
        }

        return '/'+a.join("/");
      },
      slugifySlug: function( val ){
        val = slugify(val, {
          replacement: '-',
          lower: true,
          remove: /[*+~.()'"!:@,;]/g
        });

        return val;
      },
      processPost(data, exit){
        this.isProcessing = true;
         let path = `/rest/article${this.data.id == 'new' ? '' : '/'+this.data.id}`;
         return this.$http[data.id == 'new' ? 'post' : 'put'](path, data)
          .then(res => {

            this.$toast.success(res.message ? res.message : "Operação realizada com sucesso.");

            this.savedLocalDataAction('discard');

            if( data.id == 'new' && !exit) {
              window.location = `/articles/${this.postTypeID}/${res.data.data.id}`;
              return;
            }

            if( !exit ) {
              this.fetchInfo();
              return;
            } else {
              window.location = `/articles/${this.postTypeID}`;
              return;
            }

          })
          .catch(err => {
            if( err.models ) {
              Object.keys(err.models).map(a => {
                this.errors[`data.${a}`] = err.models[a];
              });
            }
            console.error(err);
          })
          .then(() => {
            this.isProcessing = false;
          })
      },
      save( exit = true ) {
        this.errors = {};

        if(!this.data.slug || this.data.slug.length < 3) {
          this.errors['data.slug'] = 'Slug muito curto ou ausente.';
        }

        if(!this.data.title || this.data.title.length < 3) {
          this.errors['data.title'] = 'Titulo muito curto ou ausente.';
        }

        if( !this.data.content.replace(/(<([^>]+)>)/gi, "") || this.data.content.replace(/(<([^>]+)>)/gi, "").length < 3 ) {
          this.errors['data.content'] = 'Conteúdo ausente de texto.';
        }

        if( Object.keys(this.errors).length ){
          this.$toast.error("Alguns campos precisam ser preenchidos corretamente.");
          return;
        }


        let proms = [];

        let _self = this;
        // upload image or not?
        if( _self.data.cover && typeof _self.data.cover != 'string' ) {
          this.isProcessing = true;
          this.$uploadImage(_self.data.cover)
            .then( urlImage => {
              _self.data.cover = urlImage;
              _self.processPost(_self.data, exit)
            })
            .catch(err => {
              this.isProcessing = false;
              console.error(err);
              this.$toast.error("Erro ao fazer upload da Imagem de Capa");
            });
        } else {
          _self.processPost(_self.data, exit);
        }

      },
      archivePost() {
        if( this.data.id == 'new' ){ return; }

        let confirm = window.confirm("Tem certeza que deseja arquivar este artigo?");
        if(!confirm){ return; }

        let confirmB = window.prompt('Digite "arquivar" para continuar:');
        if(!confirmB || confirmB.toLowerCase() != 'arquivar'){ 
          this.$toast.info("Arquivamento cancelado.");
          return; 
        }


        this.isProcessing = true;

        let _self = this;

        this.$http.put(`/rest/article/${this.data.id}/archive`)
          .then( res => {
            this.savedLocalDataAction('discard');
            window.location = `/articles/${this.postTypeID}`;
          })
          .catch(err => {
            this.$toast.error("Erro ao tentar arquivar.");
            console.error(err);
          })
          .then(() => {
            this.isProcessing = false;
          });
      },
      unarchivePost() {
        if( this.data.id == 'new' ){ return; }

        let confirm = window.confirm("Este artigo voltará como rascunho, deseja continuar?");
        if(!confirm){ return; }

        this.$http.put(`/rest/article/${this.data.id}/unarchive`)
          .then( res => {
            this.savedLocalDataAction('discard');
          })
          .catch(err => {
            console.log(err);
            this.$toast.error("Erro ao tentar recuperar item.");
            console.error(err);
          })
          .then(() => {
            this.isProcessing = false;
            this.fetchInfo();
          });

      },
      openLog() {
        if( this.data.id == 'new' ){ return; }
        Modal.open("LOG", { type: "ARTICLE", target: this.data.id });
      }
    },
    created: function() {
      this.fetchCategories();
      this.fetchUsers();

      let _self = this;

      this.$http.get("/rest/account")
        .then( res => {
          _self.myUser = res.data || null;
        })

      window.addEventListener("category:update", function (e) {
        _self.fetchCategories();
      });

      setInterval(() => {
        this.checkToLocalSave();
      }, 1 * 60000);

      this.fetchInfo();

      window.addEventListener('beforeunload', function (e) {
        if( _self.data && _self.rawData && (JSON.stringify(_self.rawData) != JSON.stringify(_self.data)) ) {
          e.preventDefault();
          e.returnValue = '';
        }
      });


    }
  });

  //set editor
  function uploader(editor) {
    editor.plugins.get( 'FileRepository' ).createUploadAdapter = ( loader ) => {
      return new UploadAdapter(loader, vm);
    };
  }

}
