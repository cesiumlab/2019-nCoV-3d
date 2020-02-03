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
    //显示所有video
    this.$root.$emit("zhibo.show", true);
    this._earth = this.$root._earth;

    this._google = this._earth.sceneTree.$refs.google;
    this._shense = this._earth.sceneTree.$refs.shense;
    this._terrain = this._earth.sceneTree.$refs.terrain;

    this._google.enabled = true;
    this._shense.enabled = false;
    this._terrain.enabled = true;
  },
  methods: {},
  beforeDestroy() {
    this.$root.$emit("zhibo.show", false);
    this._google.enabled = false;
    this._shense.enabled = true;
    this._terrain.enabled = false;
  }
};
</script>
<style scoped>
</style>
