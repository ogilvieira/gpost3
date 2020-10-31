import Vue from "vue";
// import VTooltip from "v-tooltip";
// import VueScrollTo from "vue-scrollto";
import VueToast from "vue-toast-notification";
// import Money from "v-money";
// import VueTheMask from "vue-the-mask";

//set default plugins and configs for Vuejs
Vue.use(VueToast, {
  position: "top-right",
  duration: 5000,
});

// Vue.use(Money, { precision: 4 });
// Vue.use(VueScrollTo);
// Vue.use(VueTheMask);
// Vue.use(VTooltip, {
//   defaultTrigger: "hover focus click",
// });

module.exports = Vue;
