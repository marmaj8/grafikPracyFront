import Vue from 'vue'
import axios from 'axios'

//Vue.prototype.$axios = axios

export default ({ Vue }) => {
    Vue.prototype.$axios = axios.create({
      //baseURL: 'http://localhost:52540'
      baseURL: 'https://localhost:44331/',
      timeout: 10 * 1000,
      // headers: {
      //   'header': 'value'
      // }
    })
  }