import Vue from "vue";
import VueToast from "vue-toast-notification";
import axios from 'axios'
import VueTheMask from "vue-the-mask";
import wysiwyg from "vue-wysiwyg";


//set default plugins and configs for Vuejs
Vue.use(VueToast, {
  position: "top-right",
  duration: 5000,
});

Vue.use(VueTheMask);

// Add a request interceptor
axios.interceptors.request.use(function (request) {

    if( !request.url.endsWith('login') ) {

        if( !window.localStorage.getItem("token") ){
          window.location.href = "/login";
          return;
        }

        request.headers.Authorization = window.localStorage.getItem("token");
    }

    return request;
  }, function (error) {
    return Promise.reject(error);
  });

// Add a response interceptor
axios.interceptors.response.use(function (response) {
    return response;
  }, function (error) {

    let err = error && error.response && error.response.data ? error.response.data : { message: "Erro de comunicação com o servidor." };
    let messages = [];

    if (err && !err.message && err.models) {
      Object.values(err.models).map((a) => messages.push(a));
    }

    if ( err && err.message && !err.models ) {
      messages.push(err.message);
    }

    if( messages && messages.length ) {
      Vue.$toast.open({
        type: "error",
        message: messages.join("\n"),
      });
    }

    if(error.response.status == 401) {
      window.localStorage.clear();
    }

    throw error;
  });

Vue.prototype.$http = axios;


Vue.use(wysiwyg, {
  image: {
    uploadURL: "/rest/media"
  }
});


module.exports = Vue;

