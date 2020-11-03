import Vue from "./VueBase.js";
import InputImage from "./components/InputImage.vue";

import { isValidUrl } from "./utils.js";

if( document.querySelector("[data-vue=config-list]") ) {

  new Vue({
    el: "[data-vue=config-list]",
    components: {
      "input-image": InputImage
    },
    data: {
      isProcessing: false,
      userInfo: null,
      errors: [],
      data: null, 
    },
    methods: {
      fetchInfo: function(page = 1){
        this.isProcessing = true;
        this.page = page || this.page;

        this.$http.get('/rest/config')
          .then(res => {
            this.data = res.data;
          })
          .catch(res => {
            console.error(res);
          })
          .then(res => {
            this.isProcessing = false;
          })
      },
      updateKey( ev, key ) {
        this.errors = [];

        if( !key.custom_type && !key.key_value.length) {
          this.errors.push({ model: key.key_slug, message: `Valor de "${key.key_name}" é inválido.`});
          return;
        }

        if( (key.key_type == "URL") && (!key.custom_type || key.key_value.length) && !isValidUrl(key.key_value)) {
          this.errors.push({ model: key.key_slug, message: `Valor de "${key.key_name}" é inválido.`})
          return;
        }

        let _self = this;


        if( key.key_type == "IMAGE" && typeof key.key_value !== 'string' ) {

          this.isProcessing = true;

          this.$uploadImage(key.key_value)
            .then( urlImage => {
              key.key_value = urlImage;
              return _self.send(key)
            })
            .catch((err) => {
              console.error(err);
              _self.isProcessing = false;
              return;
            });
        } else {
          this.send(key);
        }

      },
      send: function(key) {
        this.isProcessing = true;
        this.$http.put(`/rest/config/${key.id}`, key)
          .then(response => {
            Vue.$toast.open({
              message: response.data && response.data.message ? response.data.message : "",
            });
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
      }
    },
    created: function() {
      this.$http.get('/rest/account')
        .then(res => {
          this.userInfo = res.data;
        })
      this.fetchInfo();
    }
  });

}
