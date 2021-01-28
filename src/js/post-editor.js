import Vue from "./VueBase.js";
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
      loaded: true,
      editor: ClassicEditor,
      showOptionsSEO: false,
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
      isCached: false,
      isProcessing: false,
      isLoaded: false,
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
      posttypeID: {
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
          this.$http.get(`/rest/posttype/${this.posttypeID}`),
          this.$http.get(`/rest/posttype/${this.posttypeID}/categories`),
        ];

        if( this.id == 'new' ) {
          this.data = {
            title: "",
            description: "",
            slug: "",
            seoTitle: "",
            seoDescription: "",
            cover: "",
            content: "<div></div>",
            status: false,
            parent: "",
            customFields: {},
            publishedDate: new Date().toISOString(),
            tags: []
          }
        }


        Promise.all(proms)
          .then(res => {
            this.postType = res[0].data;

            if( this.postType.custom_fields ){
              this.postType.custom_fields.map(a => {
                this.data.customFields[a.key] = '';
              });
            }

            this.categories = res[1].data || [];

          })
          .catch(err => {
            console.error(err);
          })
          .then(() => {
            this.isProcessing = false;
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
      openCategoryEditor( id = null ) {
        Modal.open('CATEGORY_EDITOR', { id: id, parent: this.posttypeID })
      }
    },
    created: function() {
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
