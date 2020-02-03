<template>
  <div>
    <div class="flat_legend">
      <div class="tuli">
        <span>图例</span>
        <i></i>
      </div>
      <div>
        <div
          class="legend_color"
          style="  width: 26px;height: 26px;border-radius: 13px;margin:0 4px;background-color: rgb(118, 22, 26);"
        ></div>
        <div class="legend_label">> 1000人</div>
      </div>
      <div>
        <div
          class="legend_color"
          style="width: 22px;height: 22px;border-radius: 11px;margin:0 6px;background-color: rgb(201, 47, 49);"
        ></div>
        <div class="legend_label">500-999人</div>
      </div>
      <div>
        <div
          class="legend_color"
          style="width: 18px;height: 18px;border-radius: 9px;margin:0 8px;background-color: rgb(227, 102, 84);"
        ></div>
        <div class="legend_label">100-499人</div>
      </div>
      <div>
        <div
          class="legend_color"
          style="width: 14px;height: 14px;border-radius: 7px;margin:2px 10px;background-color: rgb(242, 168, 141);"
        ></div>
        <div class="legend_label">10-99人</div>
      </div>
      <div>
        <div
          class="legend_color"
          style="width: 10px;height: 10px;border-radius: 5px;margin:4px 12px;background-color: rgb(250, 230, 210);"
        ></div>
        <div class="legend_label">1-9人</div>
      </div>
    </div>
    <div class="label" :style="{left:labelPosition.x+ 'px',top:labelPosition.y+ 'px'}">
      <p>{{label.name}}</p>
      <p>确诊：{{label.confirmedCount}}</p>
      <p>疑似：{{label.suspectedCount}}</p>
      <p>死亡：{{label.deadCount}}</p>
      <p>治愈：{{label.curedCount}}</p>
      <p>死亡率：{{label.deadRatio}}%</p>
    </div>
  </div>
</template>
<script>
import createBeams from "./Beam";
export default {
  data() {
    return {
      label: {},
      labelPosition: {
        x: -1000,
        y: -1000
      }
    };
  },
  mounted() {
    this.areaName = this.$route.params.area;

    //修改根下的区域
    this.$nextTick(function() {
      this.$root.currentArea = this.areaName;
    });

    //在这里加载国家点位 创建光柱图层
    //目前只用作世界展示

    this._beams = [];
    this.setBeam();
    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        this.setBeam();
      }, 60000);
    }
    this._earth = this.$root._earth;
    var viewer = this._earth.czm.viewer;
    var self = this;
    viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(
      movement
    ) {
      var pickedFeature = viewer.scene.pick(movement.endPosition);
      if (pickedFeature && pickedFeature.id) {
        self.labelPosition = movement.endPosition;
        if (pickedFeature.id) {
          self.label = pickedFeature.id.label;
          self.label.deadRatio =
            Math.round(
              (self.label.deadCount * 10000) /
                (self.label.confirmedCount +
                  self.label.deadCount +
                  self.label.curedCount)
            ) / 100;
        }
      } else {
        self.labelPosition = { x: -1000, y: -1000 };
      }
    },
    Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  },
  methods: {
    clear() {
      this._beams.forEach(element => {
        element.destroy();
      });
      this._beams = [];
    },
    setBeam() {
      this.clear();
      let self = this;
      this.$root._dataserver.loadSubArea(this.areaName).then(data => {
        var length = data.subs.length;
        for (var i = 0; i < length; i++) {
          var country = data.subs[i];
          if (country.confirmedCount === 0) {
            continue;
          }
          self._beams.push(...createBeams(country, self.$root._earth));
        }
      });
    }
  },
  beforeDestroy() {
    //离开的时候移除光柱图层
    this.clear();
    if (this.intervalId) {
      clearTimeout(this.intervalId);
    }
    this.labelPosition = { x: -1000, y: -1000 };
    var viewer = this._earth.czm.viewer;
    viewer.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.MOUSE_MOVE
    );
  }
};
</script>
<style scoped>
.flat_legend {
  position: absolute;
  right: 16%;
  bottom: 286px;
  width: 120px;
  background: url(../../img/tuli_bg.png) no-repeat;
  background-size: 100% 100%;
}
.tuli {
  display: inline-block;
  line-height: 2px;
}
.tuli span {
  display: block;
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
.flat_legend div {
  height: 30px;
}
.legend_color {
  width: 26px;
  height: 14px;
  float: left;
  border-radius: 2px;
}
.legend_label {
  color: #fff;
}
.label {
  position: absolute;
  z-index: 1000;
  margin-left: 10px;
  padding: 5px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.5);
}
.label p {
  color: #fff;
}
</style>
