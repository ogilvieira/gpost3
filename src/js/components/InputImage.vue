<template>
  <div class="file-image-wrap">
    <figure class="image" v-if="!!value || !!imageBase64">
      <img :src="typeof value == 'string' ? value : imageBase64">
      <button v-if="typeof value == 'object' || candelete" class="delete is-large" v-on:click="removeFile()" :disabled="disabled || isProcessing">remove</button>
    </figure>

    <div class="file is-boxed is-centered m-3" v-if="!value && (!value && !imageBase64)" v-bind:class="{'is-info' : !invalid, 'is-danger' : invalid}">
      <label class="file-label">
        <input class="file-input" type="file" ref="file" name="image" :required="required" v-on:input="uploadImage($event.target.value)" accept="image/*" :disabled="disabled || isProcessing">
        <span class="file-cta">
          <span class="file-icon">
            <i class="fas fa-cloud-upload-alt"></i>
          </span>
          <span class="file-label" v-text="placeholder"></span>
        </span>
      </label>
    </div>
  </div>
</template>
<script>

  const { imageToBase64Async, bytesToSize } = require('../utils.js');

  module.exports = {
    props: {
      value: {
        default: null
      },
      placeholder: {
        type: String,
        default: "Escolha uma imagem..."
      },
      required: {
        type: Boolean,
        default: false
      },
      candelete: {
        type: Boolean,
        default: true
      },
      invalid: {
        type: Boolean,
        default: false
      },
      disabled: {
        type: Boolean,
        default: false
      },
      maxsize: {
        type: Number,
        default: 600 * 1024
      }

    },
    computed: {
      computed_value: function(){
        return this.value;
      }
    },
    data: function() {
      return {
        isProcessing: false,
        imageBase64: null
      };
    },
    methods: {
      uploadImage: function() {

        var file = this.$refs.file.files[0];
        if(!file){ return; }

        if(file.size > this.maxsize) {

          this.$toast.open({
            type: 'error',
            message: `O tamanho deste arquivo é ${bytesToSize(file.size)}. O tamanho máximo permitido é ${bytesToSize(this.maxsize)}.`
          });

          return;
        }

        this.updateValue(file);

        return;

      },
      removeFile: function() {

        if(typeof this.value == 'object') {
          this.imageBase64 = null;
          this.updateValue("");
          return;
        }

        var confirm = window.confirm("Tem certeza que deseja excluir este arquivo permanentemente?");

        if(!confirm){ return; }

        var file = this.value;

        this.isProcessing = true;

        this.$http.delete(`/rest/media/${file}`)
          .then(res => {
            this.imageBase64 = null;
            this.updateValue("", true);
          })
          .catch((err) => {
            if(err.response && err.response.status == 404) {
              this.updateValue("", true);
              this.imageBase64 = null;
            }
          })
          .then(res => {
            this.isProcessing = false;
          })
      },
      updateValue: function (value, deleteFile = false) {
        let _self = this;

        if( value ) {
          imageToBase64Async(value, function(base64){
            _self.imageBase64 = base64;
          });
        }

        _self.$emit('input', value ? value : "");
        _self.$emit('change', value ? value : "");

        if( deleteFile ) {
          _self.$emit('deleteupload', "");
        }


      }
    },
    created: function() {
      this.image = this.value ? this.value+'' : null;
    }
  }
</script>
