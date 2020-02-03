<template>
  <div>
    <div class="navigation">
      <div class="title">
        <button @click="toBeam('world')">全球</button>
        <button @click="setArea('china')">中国</button>
        <button @click="setArea('湖北省')">湖北</button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  methods: {
    toBeam(area) {
      this.$router
        .push({ name: "beammap", params: { area: area } })
        .catch(err => {
          err;
        });
    },
    setArea(area) {
      //this.$root.currentArea = area;
      this.$router
        .push({ name: "flatmap", params: { area: area } })
        .catch(err => {
          err;
        });
    }
  }
};
</script>
<style scoped>
.navigation {
  width: 500px;
  height: 60px;
  position: absolute;
  top: 80px;
  left: 20%;
}
.text {
  font-size: 20px;
  color: #24fffd;
  text-shadow: 2px 0 2px #0080ff, -2px 0 2px #0080ff, 0px 2px 2px #0080ff,
    0px -2px 2px #0080ff;
  margin-left: 32px;
  text-align: center;
  line-height: 56px;
}
</style>
