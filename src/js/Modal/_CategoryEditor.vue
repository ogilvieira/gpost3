<template>
  <div class="modal-card">
    <header class="modal-card-head">
      <p class="modal-card-title">{{ options.id ? 'Editar Categoria' : 'Nova Categoria' }}{{id}}</p>
      <button class="delete" aria-label="close" v-on:click="close()"></button>
    </header>
    <section class="modal-card-body">

      <div class="notification is-danger is-light mb-5" v-if="errors.length">
        <button class="delete" v-on:click="errors = []"></button>
        <p v-for="error in errors" v-text="error.message"></p>
      </div>

      <form action="" v-on:submit="save()">

        <div class="field mb-5">
          <label class="label">Titulo <span class="has-text-danger">*</span></label>
          <div class="control" v-bind:class="{'is-loading' : isProcessing }">
            <input class="input" type="text" v-model="data.title" :disabled="isProcessing" v-bind:class="{'is-danger' : errors.find(a => a.model == 'title')}">
          </div>
        </div>


        <div class="field mb-5">
          <label class="label">Descrição</label>
          <div class="control" v-bind:class="{'is-loading' : isProcessing }">
            <textarea class="textarea has-fixed-size" rows="2" maxlength="120" v-model="data.description" :disabled="isProcessing" v-bind:class="{'is-danger' : errors.find(a => a.model == 'description')}"></textarea>
          </div>
          <small class="is-size-7 has-text-grey">
            <i class="fa fa-keyboard mr-1"></i> <span><span v-text="data.description.length"></span>/120 caracteres.</span>
          </small>
        </div>

        <div class="is-size-7 has-text-danger">*Campos obrigatórios</div>
      </form>


    </section>
    <footer class="modal-card-foot">
      <button class="button is-success" v-on:click="save()" v-bind:class="{'is-loading' : isProcessing }">Salvar</button>
      <button class="button" v-on:click="close()" v-bind:class="{'is-loading' : isProcessing }">Cancelar</button>
      <button v-if="options.id" class="button is-danger" v-on:click="deleteItem()" v-bind:class="{'is-loading' : isProcessing }">Deletar</button>
    </footer>
  </div>
</template>
<script>
module.exports = {
  props: {
    options: {
      id: null,
      parent: null
    },
  },
  data: function () {
    return {
      loaded: false,
      isProcessing: true,
      rawData: null,
      errors: [],
      data: {
        title: "",
        description: "",
      }
    };
  },
  watch: {},
  methods: {
    fetch() {
      if(!this.options.id) {
        this.loaded = true;
        this.isProcessing = false;
        return;
      }

      this.isProcessing = true;

      this.$http.get(`/rest/category/${this.options.id}`)
        .then(res => {

          this.data = {
            title: res.data.title || "",
            description: res.data.description || "",
          };

          this.rawData = {};

          Object.keys(this.data).map(a => {
            this.rawData[a] = this.data[a];
          });


        })
        .catch(res => {
          console.log(res);
        })
        .then(res => {
          this.isProcessing = false;
        })


    },
    deleteItem() {
      let confirm = window.confirm("Tem certeza que deseja excluir este item?");
      if(!confirm){ return; }
    },
    save( event ) {

      if( event && event.target ) {
        event.preventDefault();
      }

      this.errors = [];

      if(!this.data.title || this.data.title.length < 3) {
        this.errors.push({
          'model' : 'title',
          'message' : 'Titulo precisa ter pelo menos 3 caracteres.'
        })
      }

      if(this.data.description.length > 120) {
        this.errors.push({
          'model' : 'description',
          'message' : 'Descrição precisa ter no máximo 120 caracteres.'
        })
      }

      if( this.errors.length ) {
        this.$toast.error("Alguns erros foram encontrados.");
        return;
      }

      this.isProcessing = true;


      this.$http[this.options.id ? 'put' : 'post'](`/rest/posttype/${this.options.parent}/categories?title=${this.data.title}&description=${this.data.description}`)
        .then(res => {
          this.$toast.open({
            message: res.data && res.data.message ? res.data.message : "",
          });
          this.$emit('close');
        })
        .catch(err => {
          console.error(err);
          if( err.models ) {
            Object.keys(err.models).map(a => {
              this.errors.push({ model: a, message: err.models[a] })
            })
          }
        })
        .then(() => {
          this.isProcessing = false;
        });

        return;
    },
    close() {
      this.$emit("close");
    }
  },
  mounted() {
    if(!this.options.parent){
      this.$toast.error('Parent posttype\'s id is required.');
      console.error('Parent posttype\'s id is required.');
      this.$emit("close");
    }

    this.fetch();
  }
};
</script>
