<template>
  <div class="file-image-wrap">
    <figure class="image" v-if="value">
      <img :src="value" :title="value">
      <button class="delete" v-on:click="removeFile()" :disabled="disabled || isProcessing">remove</button>
    </figure>
    <div class="file is-boxed is-small is-centered is-info m-3" v-if="!value">
      <label class="file-label">
        <input class="file-input" type="file" ref="file" name="image" :required="required" v-on:input="uploadImage($event.target.value)" accept="image/*" :disabled="disabled || isProcessing">
        <span class="file-cta">
          <span class="file-icon">
            <i class="fas fa-cloud-upload-alt"></i>
          </span>
          <span class="file-label">
            Escolha uma imagem...
          </span>
        </span>
      </label>
    </div>
  </div>
</template>
<script>
  module.exports = {
    props: {
      value: {
        type: String
      },
      required: {
        type: Boolean,
        default: false
      },
      disabled: {
        type: Boolean,
        default: false
      },
    },
    computed: {
      computed_value: function(){
        return this.value;
      }
    },
    data: function() {
      return {
        isProcessing: false
      };
    },
    methods: {
      uploadImage: function() {
        var file = this.$refs.file.files[0];
        if(!file){ return; }

        var formData = new FormData();
        formData.append("image", file)

        this.isProcessing = true;

        this.$http.post('/rest/media', formData)
          .then(res => {
            this.updateValue(res.data);
          })
          .catch(res => {
            console.error(res)
          })
          .then(res => {
            this.isProcessing = false;
          })

      },
      removeFile: function() {
        var file = this.value.split('\/').slice(-1);

        this.isProcessing = true;

        this.$http.delete(`/rest/media/${file}`)
          .then(res => {
            this.updateValue(null);
          })
          .catch(res => {
            if(res.response.status == 404) {
              this.updateValue(null);
            }
          })
          .then(res => {
            this.isProcessing = false;
          })

      },
      updateValue: function (value) {
        let _self = this;

        setTimeout(function(){
          _self.$emit('input', value ? value : "");
          _self.$emit('change', value ? value : "");
        }, 400)
      }
    },
    created: function() {
      this.image = this.value ? this.value+'' : null;
    }
  }
</script>
