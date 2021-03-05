import Vue from "./VueBase.js";
import draggable from "vuedraggable";
import { isFuture } from "./utils";

if( document.querySelector("[data-vue=post-featured]") ) {

  new Vue({
    el: "[data-vue=post-featured]",
    components: {
      draggable: draggable
    },
    data: {
      items: [],
      itemsRaw: [],
      loaded: false,
      isProcessing: true
    },
    props: {
      postTypeID: {
        type: String,
        default() {
          return document.querySelector("[data-vue=post-featured").getAttribute("data-posttype") || "";
        },
      },
    },
    methods: {
      fetchInfo: function(){
        this.isProcessing = true;

        this.$http.get(`/rest/posttype/${this.postTypeID}/featured`)
          .then(res => {
            this.items = res.data || [];
            this.itemsRaw = JSON.parse(JSON.stringify(this.items));;
          })
          .catch(err => {
            console.error(err.data);
          })
          .then(() => {
            this.isProcessing = false;
            this.loaded = true;
          })
      },
      discard: function() {
        let confirm = window.confirm("Quer mesmo descartar suas alterações?");
        if(!confirm){ return; }

        this.items = JSON.parse(JSON.stringify(this.itemsRaw));
      },
      removeItem: function(item) {
        let confirm = window.confirm("Deseja mesmo excluir este item permanentemente?");
        if(!confirm){ return; }

        let index = this.items.indexOf(item);
        this.items.splice(index, 1);
      },
      getIdsArr: function() {
        let arr = [];
        this.items.forEach(a => arr.push(a.id));
        return arr;
      },
      save: function() {
        if(JSON.stringify(this.items) == JSON.stringify(this.itemsRaw)){

          this.$toast.open({
            type: "error",
            message: "Não há alterações para salvar."
          })

          return;
        }

        let arr = this.getIdsArr();

        let _self = this;
        _self.isProcessing = true;

        this.$http.put(`/rest/posttype/${this.postTypeID}/featured?articlesIds=${arr.join(',')}`)
          .then(res => {
            _self.$toast.open("Items atualizados com sucesso.");
            _self.fetchInfo();
          })
          .catch(err => {
            console.error(err);
            _self.isProcessing = false;
          });

      },
      openPostFinder: function() {
        Modal.open('ARTICLE_FINDER', { 
          parent: this.postTypeID,
          except: this.getIdsArr(),
          onSubmit: (item) => this.addNew(item)
        })
      },
      addNew: function(item) {
        
        if( item && !this.items.find(a => a.id == item.id) ) {
          this.items.push(item);
        }
      },
      isFuture: isFuture
    },
    created: function() {
      this.fetchInfo();
    }
  });

}
