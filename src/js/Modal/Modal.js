import Vue from "vue";
import CategoryEditor from "./_CategoryEditor.vue";
import FormFilter from "./_FormFilter.vue";

(function (window) {
  if (window.Modal) {
    return window.Modal;
  }

  var container = document.createElement("div");
  container.setAttribute("id", "modal-container");
  document.body.appendChild(container);

  let vm = new Vue({
    el: "#modal-container",
    data: {
      content: null,
      isOpen: false,
      modalOptions: {},
      currentModalComponent: null,
      modalClassName: "",
      modals: {
        CATEGORY_EDITOR: CategoryEditor,
        FORM_FILTER: FormFilter
      },
    },
    template: `
      <div v-if="isOpen" @keydown.esc="close" class="modal is-active" v-bind:class="['modal--'+modalClassName]">
        <div class="modal-background" v-on:click="close()"></div>
        <component v-bind:is="currentModalComponent" :options="modalOptions" v-on:close="close"></component>
      </div>
    `,
    methods: {
      open: function (modal_name, options) {
        let modal = this.modals[modal_name];

        if (!modal) {
          console.error(
            `Error: "${modal_name}" isn't a valid modal. Try one of these: ${Object.keys(
              this.modals
            ).join(", ")}`
          );
          return;
        }

        this.isOpen = true;
        this.currentModalComponent = null;

        this.modalClassName = (modal_name || "")
          .toLowerCase()
          .replace(/_/g, "-");

        this.modalOptions = options || {};
        this.currentModalComponent = modal ? modal : null;
        document.querySelector("html").classList.add("is-clipped");
      },
      close: function () {
        this.container = null;
        this.isOpen = false;
        this.modalOptions = {};
        document.querySelector("html").classList.remove("is-clipped");
      },
    },
  });

  let _public = {
    open: vm.open,
    close: vm.close,
  };

  window.Modal = _public;

  exports.open = _public.open;
  exports.close = _public.close;
})(window);
