<template>
  <div></div>
</template>
<script>
export default {
  components: {},
  data() {
    return {};
  },
  mounted() {
    this._earth = this.$root._earth;

    this._shense = this._earth.sceneTree.$refs.shense;
    this._zhanyi = this._earth.sceneTree.$refs.zhanyi;

    this._shense.enabled = true;

    this._zhanyi.setAllChildrenEnabled(true);

    this._earth.postProcess.bloom.enabled=true;
    this._earth.weather.atmosphere.enabled=false;
  },
  methods: {},
  beforeDestroy() {
    this._shense.enabled = true;
     this._earth.postProcess.bloom.enabled=false;
     this._earth.weather.atmosphere.enabled=true;
    this._zhanyi.setAllChildrenEnabled(false);
  }
};
</script>
<style scoped>
</style>
