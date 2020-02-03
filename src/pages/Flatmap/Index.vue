<template>
  <div>
    <div class="flat_legend">
      <div class="tuli">
        <span>图例</span>
        <i></i>
      </div>
      <div style="margin: 4px;">
        <div>
          <div class="legend_color" style="background-color: rgb(118, 22, 26);"></div>
          <div class="legend_label">> 1000人</div>
        </div>
        <div>
          <div class="legend_color" style="background-color: rgb(201, 47, 49);"></div>
          <div class="legend_label">500-999人</div>
        </div>
        <div>
          <div class="legend_color" style="background-color: rgb(227, 102, 84);"></div>
          <div class="legend_label">100-499人</div>
        </div>
        <div>
          <div class="legend_color" style="background-color: rgb(242, 168, 141);"></div>
          <div class="legend_label">10-99人</div>
        </div>
        <div>
          <div class="legend_color" style="background-color: rgb(250, 230, 210);"></div>
          <div class="legend_label">1-9人</div>
        </div>
      </div>
    </div>
    <div class="label" :style="{left:labelPosition.x+ 'px',top:labelPosition.y+ 'px'}">
      <p>{{label.name}}</p>
      <p>确诊：{{label.confirmedCount}}</p>
      <p>死亡：{{label.deadCount}}</p>
      <p>治愈：{{label.curedCount}}</p>
      <p>死亡率：{{label.deadRatio}}%</p>
    </div>
  </div>
</template>
<script>
import areaMap from "./AreaMap";
export default {
  data() {
    return {
      areaName: "",
      analysis: 60,
      index: 0,
      world: null,
      labelPosition: {
        x: -1000,
        y: -1000
      },
      label: {},
      colorLegend: [
        new Cesium.Color(118 / 255, 22 / 255, 26 / 255, 0.5),
        new Cesium.Color(201 / 255, 47 / 255, 49 / 255, 0.5),
        new Cesium.Color(227 / 255, 102 / 255, 84 / 255, 0.5),
        new Cesium.Color(242 / 255, 168 / 255, 141 / 255, 0.5),
        new Cesium.Color(250 / 255, 230 / 255, 210 / 255, 0.5),
        new Cesium.Color(1, 1, 1, 0.5)
      ]
    };
  },
  mounted() {
    /*
   
    var self = this;
    this.$root._dataserver
      .loadScene()
      .then(scene => {
        console.log(scene);

        self._earth = this.$root._earth;
        window.uia = this._earth;

        self._earth.xbsjFromJSON(scene);
      })
      .catch(ex => {
        console.log("query scene failed " + ex.message || ex);
      });
      */
    this.areaMap = areaMap;
    this.areaName = this.$route.params.area;
    console.log(this.$route.params);
    //修改根下的区域
    this.$nextTick(function() {
      this.$root.currentArea = this.areaName;
    });
    this._earth = this.$root._earth;
    var viewer = this._earth.czm.viewer;
    this.changeArea();
    this.setArea(this.areaName);
    var self = this;
    viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(
      movement
    ) {
      var pickedFeature = viewer.scene.pick(movement.endPosition);
      self.highlight(pickedFeature);
      if (pickedFeature) {
        self.labelPosition = movement.endPosition;
        if (
          self._areaKV.hasOwnProperty(
            pickedFeature.id.properties["Name"]._value
          )
        ) {
          self.label = self._areaKV[pickedFeature.id.properties["Name"]._value];
          self.label.deadRatio =
            Math.round(
              (self.label.deadCount * 10000) /
                (self.label.confirmedCount +
                  self.label.curedCount +
                  self.label.deadCount)
            ) / 100;
        } else {
          self.label = {
            name: pickedFeature.id.properties["Name"]._value,
            confirmedCount: 0,
            deadRatio: 0,
            deadCount: 0,
            curedCount: 0
          };
        }
      }
    },
    Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    //根据 areaName 加载 geo 数据 和 疫情数据，并在地图上显示
    //这么获取 earth
    //在beforedestroy中销毁显示资源
  },
  methods: {
    highlight(pickedFeature) {
      this.labelPosition = { x: -1000, y: -1000 };
      if (self._highlightFace) {
        self._highlightFace.outline = false;
      }
      if (pickedFeature && pickedFeature.id.polygon) {
        //判断之前是否有高亮面存在
        self._highlightFace = pickedFeature.id.polygon;
        self._highlightFace.outline = true;
      }
    },
    flyTo(index) {
      this._earth.cameraViewManager.views[index].flyTo();
      this.navindex = index;
    },
    getAreaColor(confirmedCount) {
      if (confirmedCount >= 1000) {
        return this.colorLegend[0];
      } else if (confirmedCount >= 500) {
        return this.colorLegend[1];
      } else if (confirmedCount >= 100) {
        return this.colorLegend[2];
      } else if (confirmedCount >= 10) {
        return this.colorLegend[3];
      } else {
        return this.colorLegend[4];
      }
    },
    setArea() {
      let self = this;
      let viewer = this._earth.czm.viewer;
      var promise = Cesium.GeoJsonDataSource.load(
        this.$root._dataserver.earthsdkServer + self.areaMap[this.areaName] + ".json"
      );
      promise.then(function(dataSource) {
        viewer.dataSources.add(dataSource);
        self._dataSource = dataSource;
        viewer.flyTo(dataSource.entities.values, {
          duration: 2,
          offset: {
            heading: Cesium.Math.toRadians(0.0),
            pitch: Cesium.Math.toRadians(-90)
          }
        });
        self.setColor();
      });
    },
    setColor() {
      if (this._dataSource) {
        let self = this;
        this.$root._dataserver
          .loadSubArea(this.areaName, this.$root.currentTime)
          .then(data => {
            var colorMap = {};
            self._areaKV = {};
            var length = data.subs.length;
            for (var i = 0; i < length; i++) {
              var province = data.subs[i];
              colorMap[province.name] = self.getAreaColor(
                province.confirmedCount
              );
              self._areaKV[province.name] = province;
            }
            var entities = self._dataSource.entities.values;
            for (var i = 0; i < entities.length; i++) {
              var entity = entities[i];
              entity.polygon.material = colorMap[
                entity.properties["Name"]._value
              ]
                ? colorMap[entity.properties["Name"]._value]
                : self.colorLegend[5];
              entity.polygon.outline = false;
              entity.polygon.outlineWidth = 3;
            }
          });
      }
    },
    changeArea() {
      if (this._dataSource) {
        let viewer = this._earth.czm.viewer;
        viewer.dataSources.remove(this._dataSource);
      }
    }
  },
  beforeDestroy() {
    this.changeArea();
    var viewer = this._earth.czm.viewer;
    viewer.screenSpaceEventHandler.removeInputAction(
      Cesium.ScreenSpaceEventType.MOUSE_MOVE
    );
  },
  watch: {
    "$root.currentTime"(v) {
      console.log("$root.currentTime changed:", v);
      this.setColor();
    },
    "$root.mousemoveArea"(v) {
      if (this._dataSource) {
        var entities = this._dataSource.entities.values;
        for (var i = 0; i < entities.length; i++) {
          var entity = entities[i];
          if (entity.properties["Name"]._value === v) {
            this.highlight({ id: entity });
          }
        }
      }
    }
  }
};
</script>
<style scoped>
.flat_legend {
  position: absolute;
  right: 16%;
  bottom: 286px;
  width: 108px;
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
  width: 26px;
  height: 14px;
  float: left;
  margin: 2px;
  border-radius: 2px;
}
.legend_label {
  color: #fff;
}
.label {
  position: absolute;
  z-index: 1000;
  width: 500;
  height: 100;
  margin-left: 10px;
  padding: 5px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.5);
}
.label p {
  color: #fff;
}
</style>
