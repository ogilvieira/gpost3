<template>
  <div class="modal-card">

    <header class="modal-card-head">
      <p class="modal-card-title">Article Finder</p>
    </header>
    <section class="modal-card-body">
      <div>
        <div class="field mb-2">
          <p class="control has-icons-left has-icons-right" v-bind:class="{'is-loading' : isProcessing}">
            <input class="input is-rounded" type="text" v-model="terms" placeholder="Buscar..." v-on:keyup="setTime($event)">
            <span class="icon is-small is-left">
              <i class="fas fa-search"></i>
            </span>
          </p>

          <div><small class="is-size-7 has-text-grey"><i class="fa fa-keyboard mr-1"></i> <span>Use [enter] ou aguarde para buscar</span></small></div>
        </div>
      </div>

      <div v-if="loaded && !isProcessing && !(items && items.docs && items.docs.length)">
        <div class="notification">

          <div class="mb-2"><i class="fas fa-exclamation-circle mr-1"></i> Nenhum item encontrado.</div>

          <button class="button is-rounded is-small" v-on:click="fetchInfo()" v-bind:class="{'is-loading' : isProcessing }">
            <span class="icon">
              <i class="fas fa-sync-alt"></i>
            </span>
            <span>
              Tentar Novamente
            </span>
          </button>

        </div>
      </div>

      <div v-if="!loaded && isProcessing">
        <div class="box is-size-6"> <i class="fas fa-sync-alt fa-spin mr-2"></i> Carregando...</div>
      </div>

      <div v-if="items && items.docs && items.docs.length">
        <a href="javascript:void(0);" class="box" v-for="(item, index) in items.docs" :key="item.id" v-on:click="select(item)">
          <div class="columns is-flex-wrap-wrap is-align-items-center">
            <div class="column is-12"> 
              <div class="media mt-b">

                <div class="media-left">
                  <figure class="image is-128x128">
                    <img :src="item.cover" v-if="item.cover">
                  </figure>
                </div>
                <div class="media-content">
                  <div class="content">
                    <div v-if="!item.status">
                     <span class="tag is-danger">Rascunho</span>
                    </div>
                    <small class="is-size-7 has-text-grey" v-if="item.created_at != item.updated_at">Atualizado {{item.updated_at | moment("from", "now")}}</small>

                    <div v-if="item.status" class="tags has-addons">
                     <span class="tag" v-bind:class="{ 'is-info' : isFuture(item.published_date), 'is-success' : !isFuture(item.published_date)}" v-text="isFuture(item.published_date) ? 'Agendado' : 'Publicado'"></span>
                     <span class="tag"><i class="fas fa-clock mr-1"></i>{{item.published_date | moment("DD/MM/YY \à\\s HH:mm")}}</span>
                    </div>
                    <div class="title is-5 mb-0">{{item.title}}</div>
                    <p class="is-5">{{item.description}}</p>
                    <div class="has-text-grey-light is-size-7">
                      <i class="fas fa-clock mr-1"></i> <span>Criado em {{item.created_at | moment("DD/MM/YY \à\\s HH:mm")}}</span> - <span><i class="fas fa-user mr-1"></i><span>{{item.author.name}}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>

      <div class="mt-5">
        <button
          class="button"
          type="reset"
          v-on:click="cancel()"
        >
          Cancelar
        </button>
      </div>
    </section>


  </div>
</template>
<script>
const moment = require("moment");
moment.locale("pt-br");
const isFuture = require("../utils").isFuture;

module.exports = {
  props: {
    close: () => {},
    options: {
      parent: null,
      except: [],
      onCancel: null,
      onSubmit: null,
    },
  },
  data: function () {
    return {
      isProcessing: true,
      loaded: false,
      terms: "",
      items: [],
      timeout: null
    };
  },
  watch: {},
  methods: {
    isFuture: isFuture,
    setTime($event) {

      if( this.isProcessing ){ return; }

      if( $event && $event.keyCode == 13 ) {
        this.fetchInfo();
        return;
      }

      this.timeout = setTimeout(() => this.fetchInfo(), 3000);
    },
    fetchInfo() {

      if( this.timeout ) {
        clearTimeout(this.timeout);
      }

      let params = {
        page: 1,
        paginate: 10,
        terms: this.terms,
        except: this.options.except+''
      };

      this.$http.get(`/rest/articles/posttype/${this.options.parent}`, {
        params
      })
      .then(res => {
        this.items = res.data ? res.data : null;
      })
      .catch(res => {
        console.error(res);
      })
      .then(res => {
        this.loaded = true;
        this.isProcessing = false;
      })
    },
    cancel: function (e) {
      if (typeof this.options.onCancel == "function") {
        this.options.onCancel(form);
      }
      this.$emit("close");
      return;
    },
    select: function(item) {
      if (typeof this.options.onSubmit == "function") {
        this.options.onSubmit(item);
      }
      this.$emit('close');
      return
    }
  },
  created() {
    this.fetchInfo();
  },
};
</script>
