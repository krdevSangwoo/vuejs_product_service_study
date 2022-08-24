import {
  createStore
} from 'vuex'

import persistedstate from 'vuex-persistedstate';

const store = createStore({
  state() {
    return {
      user: {}
    }
  },
  mutations: {
    user(state, data) {
      state.user = data;
    }
  },
  plugins: [
    persistedstate({
      path: ['user']
    })
  ]
});

export default store;