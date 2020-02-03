<template>
  <div class="heatmap_legend">
    <div class="tuli">
      <span>图例</span>
      <i></i>
    </div>
    <div style="margin: 4px; overflow: hidden;">
      <div ref="legend" class="legend_color" style="background-color: rgb(255, 255, 255);">
        <canvas ref="legendCanvas"></canvas>
      </div>
      <div class="legend_text" style="background-color: rgb(255, 255, 255, 0);">
        <div style="margin-left: 5px;">>50人</div>
        <div style="position: absolute; bottom: 0px; margin-left: 5px;">0人</div>
      </div>
    </div>
  </div>
</template>
<script>
// @ts-check
/// <reference path="vue.extend.d.ts">
/// <reference path="misc.d.ts">
/// <reference path="VirusHeatMap.d.ts">

import VirusHeatMap from "./VirusHeatMap";

/**
 * @type { VirusHeatMap | undefined }
 */
let g_heatMap = undefined;

let g_canvasReady = false;

export default {
  data() {
    return {};
  },
  mounted() {
    //修改根下的区域
    this.$nextTick(function() {
      this.$root.currentArea = "china";

      console.log("heatmap mounted!");
      if (!g_heatMap && this.$root._earth) {
        const fetchCityInfosCallback = (updateTime, callback) => {
          this.$root._dataserver
            .loadCitiesData(updateTime)
            .then(result => callback(result));
        };
        // http://www.earthsdk.com/static/data/cities.json
        const cityCoordsJsonPath =
          this.$root._dataserver.earthsdkServer + "cities.json";
        console.log(cityCoordsJsonPath);
        g_heatMap = new VirusHeatMap(
          this.$root._earth,
          fetchCityInfosCallback,
          cityCoordsJsonPath
        );
        // g_heatMap.updateDate = this.$root.currentDay;
        g_heatMap.updateTime = this.$root.currentTime;
        window.g_heatMap = g_heatMap;
      }
      g_heatMap.show = true;

      console.log(this.$refs.legendCanvas);

      // if (!g_canvasReady) {
      g_canvasReady = true;
      if (this.$refs.legendCanvas instanceof HTMLCanvasElement) {
        const canvas = this.$refs.legendCanvas;
        canvas.width = 20;
        canvas.height = 100;
        var ctx = canvas.getContext("2d");

        var gradient = ctx.createLinearGradient(0, 100, 0, 0);
        // gradient.addColorStop(0,"green");
        // gradient.addColorStop(1,"white");

        /**
         * @type { [number, string][] }
         */
        const gradientConfig = [
          [0, "rgba(0, 255, 0, 0.0)"],
          [0.05, "rgba(0, 255, 0, 0.3)"],
          [0.5, "rgba(255, 255, 0, 0.5)"],
          [1, "red"]
        ];
        gradientConfig.forEach(gc => {
          gradient.addColorStop(gc[0], gc[1]);
        });

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 20, 100);
      }
      // }
    });
  },
  watch: {
    "$root.currentTime"(v) {
      console.log("heatmap currentTime changed!");
      g_heatMap && (g_heatMap.updateTime = v);
    }
  },
  beforeDestroy() {
    g_heatMap.show = false;
    console.log("heatmap destroy!");
  }
};
</script>
<style scoped>
.heatmap_legend {
  position: absolute;
  right: 16%;
  bottom: 286px;
  width: 100px;
  background: url(../../img/tuli_bg.png) no-repeat;
  background-size: 100% 100%;
}
.tuli {
  display: inline-block;
  line-height: 2px;
}
.tuli span {
  display: inline-block;
  color: #00ffff;
  font-size: 16px;
  padding-left: 8px;
  margin-top: 10px;
}
.tuli i {
  display: inline-block;
  width: 70px;
  height: 10px;
  background: url(../../img/tuli.png) no-repeat;
  background-size: contain;
}
.legend_color {
  width: 20px;
  height: 100px;
  float: left;
  margin: 0px;
  border-radius: 0px;
}
.legend_text {
  width: 70px;
  height: 100px;
  float: left;
  margin: 0px;
  border-radius: 0px;
  color: white;
  font-size: 14px;
}
</style>
