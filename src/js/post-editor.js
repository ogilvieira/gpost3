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
      editorData: `<figure class="image"><img src="https://content.betsul.com/media/istock-1245946530nmg.jpg" alt="Arsenal Manchester United"><figcaption>Arsenal e Manchester United se enfrentaram pela primeira vez em 1894 (iStock)</figcaption></figure><p>É difícil pensar em uma rivalidade tão grande e tão duradoura quanto a que os ingleses Manchester United e Arsenal mantém nos dias de hoje. Dois gigantes das cidades mais importantes do Reino Unido fazem confronto que sempre é muito aguardado no país e que balança com os sentimentos de milhões de torcedores. História riquíssima que tem alguns pontos curiosos.</p><p>Para começar, o Arsenal é o adversário que mais vezes o Manchester United enfrentou desde que foi criado, em uma rivalidade que começou ainda no século retrasado, em 1894 (o confronto inaugural terminou em 3 a 3). Outro ponto interessante é que, apesar de contabilizarem o mesmo número de jogos, Gunners e Red Devils somam retrospectos diferentes.</p><p>O grande ponto é que o Arsenal coloca mais vitórias para o Manchester United no retrospecto do que o próprio Red Devils contabiliza para si, algo que é quase único nas maiores rivalidades do mundo. Ficou curioso para saber os números do clássico? Então confira abaixo no levantamento que o Betsul preparou para hoje!</p><h2>Quantas vezes Arsenal x Manchester United aconteceu na história?</h2><p>É unânime na contagem de Manchester United e Arsenal o número de confrontos na história: 232. Destes, 202 foram pelo Campeonato Inglês (somando períodos pré e pós criação da Premier League), de acordo com as estatísticas oficiais do United. Quantos confrontos aconteceram por outras competições não foi possível encontrar, mas é sabido que o clássico já foi realizado por Liga dos Campeões, Copa da Inglaterra, Supercopa da Inglaterra, Copa da Liga Inglesa e Championship.</p><h2>Manchester United x Arsenal: quem leva vantagem no retrospecto?</h2><p>Os dois times concordam que quem leva vantagem em número de vitórias é o Manchester United. O engraçado é que os Red Devils contabilizam 97 triunfos sobre o Arsenal, enquanto o Arsenal soma 99 derrotas para o rival, um retrospecto para lá de esquisito pelo lado dos londrinos.</p><p>Com relação às vitórias do Arsenal, o clube conta 84 triunfos sobre o Manchester United, enquanto o time do Old Trafford tem em sua contagem 83 derrotas para o rival. Isso significa que os empates também não são contabilizados de maneira igual: 52 segundo os Red Devils e 49 de acordo com os Gunners.</p><h2>Quem venceu mais vezes pela Premier League?</h2><p>A partir da temporada 1992/93, começou na Inglaterra a Premier League. Desde então, Arsenal e Manchester United se enfrentaram 56 vezes e o retrospecto é muito favorável aos Diabos Vermelhos. São 24 vitórias, 17 empates e 15 triunfos dos Gunners. Neste período, 78 a 60 em favor do United no quesito número de gols marcados no clássico.</p>`,
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
      loaded: true,
      showOptionsSEO: false,
      localSavedNotification: false,
      cachedTime: null,
      isProcessingCats: true,
      isProcessing: true,
      isLoaded: false,
      rawData: null,
      editSlug: false,
      data: null,
      postType: null,
      categories: [],
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

        if( this.id == 'new' ) {
          this.data = {
            id: "new",
            title: "",
            description: "",
            slug: "",
            seoTitle: "",
            seoDescription: "",
            cover: "",
            content: "<div></div>",
            status: false,
            parent: this.postTypeID,
            category: "",
            customFields: {},
            publishedDate: new Date().toISOString(),
            tags: []
          };
        }

        Promise.all(proms)
          .then(res => {
            this.postType = res[0].data;

            if( this.postType.custom_fields ){
              this.postType.custom_fields.map(a => {
                this.data.customFields[a.key] = '';
              });
            }
          })
          .catch(err => {
            console.error(err);
          })
          .then(() => {
            this.rawData = JSON.parse(JSON.stringify(this.data));
            this.isProcessing = false;
          });

      },
      fetchCategories() {
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
      checkTag(e) {
        e.target.value = e.target.value.replace(/,/g,"");

        if(e.keyCode == 188 || e.keyCode == 13 ) {

          if(e.target.value.length < 3 || this.data.tags.indexOf(e.target.value)!=-1){ return; }

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
        let r = this.data.customFields[customFieldKey].split(',');
        return r.indexOf(option) != -1;
      },
      toggleCustomMultipleOption( customFieldKey, option ){

        let customFieldVal = this.data.customFields[customFieldKey].split(',').filter(a => !!a);
        let index = customFieldVal.indexOf(option);

        if( index == -1 ) {
          customFieldVal.push(option);
        } else {
          customFieldVal.splice(index, 1);
        }

        let customFields = Object.assign({}, this.data.customFields);
            customFields[customFieldKey] = customFieldVal.join(',');

        Vue.set(vm.data, 'customFields', customFields);

      },
      setCustomInputImage(image, customFieldKey) {

        let customFields = Object.assign({}, this.data.customFields);
            customFields[customFieldKey] = image;

        Vue.set(vm.data, 'customFields', customFields);
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
            this.data = cached.data;
            this.cachedTime = cached.time;
            this.localSavedNotification = true;
          }
        } catch (err) {
          console.error(err);
        }

      },
      checkToLocalSave() {
        if( JSON.stringify(this.data) != JSON.stringify(this.rawData) ){
          window.localStorage.setItem('post_'+this.data.id, JSON.stringify({time: new Date().toISOString(), data: this.data }));
          this.$toast.info("Cópia de segurança salva.")
        }
      },
      savedLocalDataAction( action ) {
        if( action == 'keep' ) {
          this.localSavedNotification = false;
        }
        if( action == 'discard' ) {
          this.localSavedNotification = false;
          this.data = JSON.parse(JSON.stringify(this.rawData));
          this.cachedTime = null;

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
          remove: /[*+~.()'"!:@]/g
        });

        return val;
      },
      save( exit = true ) {
        this.isProcessing = true;

        this.savedLocalDataAction('discard');
        this.fetchInfo();
      }
    },
    created: function() {
      this.fetchCategories();

      let _self = this;

      window.addEventListener("category:update", function (e) {
        _self.fetchCategories();
      });

      setInterval(() => {
        this.checkToLocalSave();
      }, 3 * 60000)

      this.fetchInfo();
    }
  });

  //set editor
  function uploader(editor) {
    editor.plugins.get( 'FileRepository' ).createUploadAdapter = ( loader ) => {
      return new UploadAdapter(loader, vm);
    };
  }

}
