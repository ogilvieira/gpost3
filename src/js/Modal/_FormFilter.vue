<template>
  <div class="modal-card">

    <header class="modal-card-head">
      <p class="modal-card-title">{{ options.title ? options.title : 'Filtrar' }}</p>
    </header>
    <section class="modal-card-body">
      <form action="" v-if="options.inputs" @submit="applyFilter">
        <div v-for="(input, key) in options.inputs">
          <input
            v-if="input.type == 'hidden'"
            type="hidden"
            v-model="form[key]"
          />

          <div v-if="input.type == 'text'" class="field mb-2">
            <label class="label" v-text="input.title" v-if="input.title"></label>
            <input class="input" type="text" v-model="form[key]">
          </div>

          <div v-if="input.type == 'date_range'" class="form-control-wrap-daterange" >
            <label v-text="input.title" v-if="input.title"></label>

            <div class="form-control">
              <input
                v-if="hasDatePicker"
                type="date"
                placeholder="Início"
                v-model="form[key + '_start']"
              />
              <input
                v-if="!hasDatePicker"
                type="tel"
                v-mask="'##/##/####'"
                v-model="form[key + '_start']"
              />
            </div>

            <div class="text-center">a</div>

            <div class="form-control">
              <input
                v-if="hasDatePicker"
                type="date"
                placeholder="Fim"
                v-model="form[key + '_end']"
              />
              <input
                v-if="!hasDatePicker"
                type="tel"
                v-mask="'##/##/####'"
                v-model="form[key + '_end']"
              />
            </div>
          </div>

          <div
            v-if="input.type == 'select'"
            class="field mb-1"
          >
            <label class="label" v-text="input.title" v-if="input.title"></label>
            <div class="select">
              <select v-model="form[key]">
                <option v-bind:value="null">---</option>
                <option
                  v-for="option in input.options"
                  v-text="
                    option.split(':')[1]
                      ? option.split(':')[1]
                      : option.split(':')[0]
                  "
                  v-bind:value="option.split(':')[0]"
                ></option>
              </select>
            </div>
          </div>
        </div>

        <div class="mt-5">
          <button
            class="button"
            type="reset"
            v-on:click="cancelFilter()"
          >
            Limpar Filtros
          </button>
          <button class="button is-success" type="submit">Aplicar Filtros</button>
        </div>
      </form>
    </section>


  </div>
</template>
<script>
const hasDatePicker = require("../utils").isDateTimeSupported();
const moment = require("moment");
moment.locale("pt-br");

module.exports = {
  props: {
    close: () => {},
    options: {
      title: null,
      description: null,
      inputs: null,
      onCancel: null,
      onSubmit: null,
    },
  },
  data: function () {
    return {
      hasDatePicker: hasDatePicker,
      loaded: false,
      form: {},
    };
  },
  watch: {},
  methods: {
    processForm() {
      let form = Object.assign(this.form, {});
      Object.keys(this.options.inputs).map((a) => {
        let input = this.options.inputs[a];

        if (input.type == "date_range") {
          ["start", "end"].map((key) => {
            //fix to old browsers
            if (!this.hasDatePicker) {
              let dateArr = form[a + "_" + key].split("/");
              dateArr = [dateArr[2], dateArr[1], dateArr[0]].join("-");
              form[a + "_" + key] = dateArr;
            }

            form[a + "_" + key] = moment(form[a + "_" + key])
              [key + "Of"]("day")
              .toISOString();
          });
        }
      });

      return form;
    },
    applyFilter: function (e) {
      e.preventDefault();

      let form = this.processForm();
      if (typeof this.options.onSubmit == "function") {
        this.options.onSubmit(form);
      }
      this.$emit("close");
      return;
    },
    cancelFilter: function (e) {
      let form = this.processForm();
      if (typeof this.options.onCancel == "function") {
        this.options.onCancel(form);
      }
      this.$emit("close");
      return;
    },
  },
  created() {
    Object.keys(this.options.inputs).map((a) => {
      let input = this.options.inputs[a];

      if (input.type == "date_range") {
        ["start", "end"].map((key) => {
          this.form[a + "_" + key] = input[key + "_date"]
            ? moment(input[key + "_date"]).format(
                this.hasDatePicker ? "YYYY-MM-DD" : "DD-MM-YYYY"
              )
            : null;
        });
      } else {
        this.form[a] = input.value ? input.value : input.defaultValue || null;
      }
    });

    this.loaded = true;
  },
};
</script>
