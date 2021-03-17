<template>
  <div class="modal-card">

    <header class="modal-card-head">
      <p class="modal-card-title">{{ options.title ? options.title : 'Log de Atividades' }}</p>
      <button class="delete" aria-label="close" v-on:click="close()"></button>
    </header>

    <section class="modal-card-body" v-if="!loaded">
      <div class="box is-size-6"> <i class="fas fa-sync-alt fa-spin mr-2"></i> Carregando...</div>
    </section>

    <section class="modal-card-body" v-if="loaded && (!data || !data.docs || !data.docs.length)">

      <div class="notification">
        Nenhuma atividade encontrada.
        <button class="button is-rounded is-small" v-on:click="fetch()">
          <span class="icon">
            <i class="fas fa-sync-alt"></i>
          </span>
          <span>
            Tentar Novamente
          </span>
        </button>
      </div>

    </section>

    <section class="modal-card-body" v-if="loaded && data.docs && data.docs.length">
      <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth is-size-6">
        <tr>
          <th>Usuário</th>
          <th class="has-text-centered">Ação</th>
          <th></th>
        </tr>

        <tr v-for="item in data.docs" v-bind:class="[colorClass[item.action] ? `has-background-${colorClass[item.action]}-light has-text-${colorClass[item.action]}-dark` : '' ]">
          <td>{{item.user.name}}</td>
          <td class="has-text-centered">{{labels[item.action] ? labels[item.action] : item.action}}</td>
          <td class="has-text-right">em {{item.createdAt | moment("DD/MM/YY \à\\s HH:mm:ss")}}</td>
        </tr>

      </table>
    </section>

    <footer class="modal-card-foot">
      <button class="button" v-bind:class="{'is-loading' : isProcessing }" :disabled="(!data || !data.pages) || page == 1" v-on:click="fetch(page - 1)">Anterior</button>
      <button class="button" v-bind:class="{'is-loading' : isProcessing }" :disabled="(!data || !data.pages) || page == data.pages" v-on:click="fetch(page + 1)">Próximo</button>
    </footer>

  </div>
</template>
<script>
const moment = require("moment");
moment.locale("pt-br");

module.exports = {
  props: {
    options: {
      title: null,
      type: null,
      description: null,
      inputs: null,
      onCancel: null,
      onSubmit: null,
      labels: {}
    },
  },
  data: function () {
    return {
      loaded: false,
      isProcessing: true,
      data: null,
      page: 1,
      paginate: 20,
      labels: {
        "CREATE" : "Criou",
        "UPDATE" : "Atualizou",
        "DELETE" : "Deletou",
        "ARCHIVE" : "Arquivou",
        "UNARCHIVE" : "Recuperou",
      },
      colorClass: {
        "CREATE" : "primary",
        "UPDATE" : "info",
        "DELETE" : "danger",
        "ARCHIVE" : "danger",
        "UNARCHIVE" : "primary",        
      }
    };
  },
  watch: {},
  methods: {
    fetch( page ) {
      if(!this.options.type || !this.options.target) {
        this.loaded = true;
        this.isProcessing = false;
        return;
      }

      if(!page) {
        page = this.page;
      }

      this.isProcessing = true;

      this.$http.get(`/rest/log?type=${this.options.type}&target=${this.options.target}&page=${page}&paginate=${this.paginate}`)
        .then(res => {
          if( res && res.data ) {
            this.data = res.data;
            this.page = page;
          }
        })
        .catch(res => {
          console.log(res);
          this.$toast.error('Erro ao tentar carregar log.');
        })
        .then(res => {
          this.loaded = true;
          this.isProcessing = false;
        })


    },
    close() {
      return this.$emit('close');
    }
  },
  mounted() {
    let errCount = 0;

    let _self = this;

    ['type', 'target'].forEach( attr => {

      if( !_self.options[attr] ) {
        _self.$toast.error(`"${attr}" is required.`);
        errCount++;
      }

    });

    if(errCount){
      this.$emit("close");
      return;
    }

    this.labels = Object.assign(this.labels, this.options.labels);

    this.fetch();
  }
};
</script>
