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

    
    this._shense = this._earth.sceneTree.$refs.shense; 
    this._huoshenshan_all = this._earth.sceneTree.$refs.huoshenshan_all; 

 
    this._shense.enabled = false; 

    this._huoshenshan_all.setAllChildrenEnabled(true); 
  },
  methods: {},
  beforeDestroy() {
    this.$root.$emit("zhibo.show", false); 
    this._shense.enabled = true; 
    this._huoshenshan_all.setAllChildrenEnabled(false); 
  }
};
</script>
<style scoped>
</style>
