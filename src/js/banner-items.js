import Vue from "./VueBase.js";
import InputImage from "./components/InputImage.vue";
import InputDateTimeLocal from "./components/InputDateTimeLocal.vue";
import draggable from "vuedraggable";
import { isValidUrl, isValidDate } from "./utils.js";


if( document.querySelector("[data-vue=banner-items]") ) {

  var vm = new Vue({
    el: "[data-vue=banner-items]",
    components: {
      "input-image": InputImage,
      "input-datetime": InputDateTimeLocal,
      draggable
    },
    data: {
      isProcessing: true,
      loaded: false,
      isUploading: false,
      uploadStep: 0,
      uploadStepItems: 0,
      uploadsItemsCompleted: 0,
      uploadErros: [],
      errors: [],
      area: null,
      dataRaw: [],
      data: []
    },
    props: {
      areaID: {
        type: String,
        default() {
          return document.querySelector("[data-vue=banner-items]").getAttribute("data-area-id") || "";
        },
      },
    },
    methods: {
      fetchArea: function() {
        this.$http.get(`/rest/banner/${this.areaID}`)
          .then(res => {
            this.area = res.data;
          }).catch(err => {
             console.error(err.data);
          });
      },
      fetchInfo: function(){
        this.isProcessing = true;
        this.$http.get(`/rest/banner/${this.areaID}/items`)
          .then(res => {
            this.data = res.data;
            this.dataRaw = JSON.parse(JSON.stringify(res.data));

          })
          .catch(res => {
            console.error(res);
          })
          .then(res => {
            this.isProcessing = false;
            this.loaded = true;
          })
      },
      setOrder: function() {
        this.data.map((a, index) => {
          a.order = index+1;
          return a;
        });
      },
      addNew: function() {

        let d = new Date();
        d.setDate( d.getDate() + 30 );

        this.data.push({
          id: Math.floor(Math.random() * 1000),
          order: this.data.length+1,
          start_date: new Date().toISOString(),
          end_date: d.toISOString(),
          title: "",
          link: "",
          image: "",
          isNew: true
        });

      },
      removeItem: function(item) {
        let confirm = window.confirm("Deseja mesmo excluir este item permanentemente?");
        if(!confirm){ return; }


        if(!item.isNew){
          if(!item.id){ return; }

          this.isProcessing = true;

          this.$http.delete(`/rest/banner/${this.areaID}/item/${item.id}`)
            .then(res => {
              let index = this.data.indexOf(item);
              this.data.splice(index, 1);
              if( res && res.data.message ) {
                this.$toast.open({
                  message: (res.data && res.data.message ? res.data.message : "")
                })
              }
            })
            .catch(err => {
              console.error(err)
            })
            .then(res => {
              this.isProcessing = false;
            });

            return;
        }

        if(item.isNew) {
          let index = this.data.indexOf(item);
          this.data.splice(index, 1);
        }

      },
      save( data = null ) {
        this.errors = [];

        if(JSON.stringify(this.data) == JSON.stringify(this.dataRaw)){

          this.$toast.open({
            type: "error",
            message: "Não há alterações para salvar."
          })

          return;
        }

        let items = data ? data : this.data;

        items.map(a => {

          if (a.title.length < 3) {
            this.errors.push({ model: a.id+`_title`, message: `Titulo inválido.`});
          }

          if (!a.link || !isValidUrl(a.link)) {
            this.errors.push({ model: a.id+`_link`, message: `Link inválido.`});
          }

          if (!a.start_date || !isValidDate(new Date(a.start_date))) {
            this.errors.push({ model: a.id+`_start`, message: `Data e hora de inicio inválido.`});
          }

          if (!a.end_date || !isValidDate(new Date(a.end_date))) {
            this.errors.push({ model: a.id+`_end`, message: `Data e hora final inválida.`});
          }

          if( isValidDate(new Date(a.end_date)) && isValidDate(new Date(a.start_date)) && new Date(a.end_date).getTime() <= new Date(a.start).getTime()) {
            this.errors.push({ model: a.id+`_end`, message: `Data final precisa ser maior que a data de inicio.`});
          }

        });


        if( this.errors.length ) {
          this.$toast.open({
            type: "error",
            message: "É necessário corrigir alguns erros para salvar."
          });
          return;
        }

        this.uploadImages(items);
        return;
      },
      uploadImages(items) {
        let imageToUpload = items.filter(a => typeof a.image == 'object');
        this.uploadErros = [];
        this.uploadStep = 1;
        this.uploadStepItems = imageToUpload.length;
        this.isUploading = true;
        this.uploadsItemsCompleted = 0;

        if(!this.uploadStepItems) {
          return this.insertNewItems(items);
        }

        let proms = [];
        let _self = this;

        imageToUpload.map(a => {
          proms.push(new Promise((resolve, reject) => {
            return this.$uploadImage(a.image)
              .then( urlImage => {
                a.image = urlImage;
                _self.uploadsItemsCompleted++;
                resolve(a);
              })
              .catch(err => {
                _self.uploadErros.push(a);
                reject(a);
              });
          }))
        });

        Promise.all(proms)
          .then(( res ) => {
            console.log('success', res);
          })
          .catch((err) => {
            console.error(err);
          })
          .then(() => {
            this.insertNewItems(items);
          });

      },
      insertNewItems(items) {
        this.uploadStep = 2;
        let itemsToInsert = items.filter(a => (a.isNew));
        this.uploadStepItems = itemsToInsert.length;
        this.isUploading = true;
        this.uploadsItemsCompleted = 0;

        let proms = [];
        let _self = this;

        if(!this.uploadStepItems){
          return this.updateItems(items);
        }

        console.log("Try to insert: ", itemsToInsert);

        itemsToInsert.map(a => {
          proms.push(new Promise((resolve, reject) => {
            return this.$http.post(`/rest/banner/${_self.areaID}/item/new`, {
              title: a.title,
              link: a.link,
              order: a.order,
              start_date: a.start_date,
              end_date: a.end_date,
              title: a.title,
              image: a.image,
            })
              .then(res => {
                _self.uploadsItemsCompleted++;
                a.pending = false;
                resolve(a);
              })
              .catch(err => {
                _self.uploadErros.push(a);
                reject(err)
              })
          }));
        });


        Promise.all(proms)
          .then(( res ) => {
            console.log('success', res);
          })
          .catch((err) => {
            console.error(err);
          })
          .then(() => {
            this.updateItems(items);
          });

      },
      updateItems(items) {
        this.uploadStep = 3;
        let itemsToUpdate = items.filter(a => {
          return this.dataRaw.find(b => JSON.stringify(b) != JSON.stringify(a));
        });


        this.uploadStepItems = itemsToUpdate.length;
        this.isUploading = true;
        this.uploadsItemsCompleted = 0;

        let proms = [];
        let _self = this;

        if(!this.uploadStepItems) {
          this.isUploading = false;
          this.uploadStep = 0;
          if(!this.uploadErros.length) { this.fetchInfo(); }
          return;
        }


        itemsToUpdate.map(a => {

          proms.push(new Promise((resolve, reject) => {
            return this.$http.put(`/rest/banner/${_self.areaID}/item/${a.id}`, {
              title: a.title,
              link: a.link,
              order: a.order,
              start_date: a.start_date,
              end_date: a.end_date,
              title: a.title,
              image: a.image,
            })
              .then(res => {
                _self.uploadsItemsCompleted = 0;
                a.pending = false;
                resolve(a);
              })
              .catch(err => {
                _self.uploadErros.push(a);
                reject(err)
              })
          }));
        });


        Promise.all(proms)
          .then(( res ) => {
            console.log('success', res);
          })
          .catch((err) => {
            console.error(err);
          })
          .then(() => {

            this.isUploading = false;
            this.uploadStep = 0;

            if(!this.uploadErros.length) { this.fetchInfo(); }
          });

      },
      discard: function() {
        let confirm = window.confirm("Quer mesmo descartar suas alterações?");
        if(!confirm){ return; }

        this.data = JSON.parse(JSON.stringify(this.dataRaw));
      }
    },
    created: function() {
      this.fetchArea();
      this.fetchInfo();

      let _self = this;

      window.onbeforeunload = function () {
        if (_self.uploadErros && _self.uploadErros.length) {
          return true;
        }
        return undefined;
      }
    }
  });
}
