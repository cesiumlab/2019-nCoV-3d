<template>
  <div>
    <div class="container">
      <span class="casedetails">病例详情</span>
      <!--
      <p>
        <button @click="toWorld()">全球</button>
        <button v-show="areaType!='world'" @click="toChina()">中国</button>
        <button v-show="areaType=='province'">{{areaName}}</button>
      </p>
      -->
      <div class="charts" ref="charts"></div>
    </div>
  </div>
</template>
<script>
import echarts from "echarts";

var shortToFull = {
  北京: "北京市",
  天津: "天津市",
  上海: "上海市",
  重庆: "重庆市",
  河北: "河北省",
  山西: "山西省",
  辽宁: "辽宁省",
  吉林: "吉林省",
  黑龙江: "黑龙江省",
  江苏: "江苏省",
  浙江: "浙江省",
  安徽: "安徽省",
  福建: "福建省",
  江西: "江西省",
  山东: "山东省",
  河南: "河南省",
  湖北: "湖北省",
  湖南: "湖南省",
  广东: "广东省",
  海南: "海南省",
  甘肃: "甘肃省",
  四川: "四川省",
  贵州: "贵州省",
  云南: "云南省",
  陕西: "陕西省",
  青海: "甘肃省",
  青海: "青海省",
  //  台湾: "台湾省",
  内蒙古: "内蒙古自治区",
  广西: "广西壮族自治区",
  西藏: "西藏自治区",
  宁夏: "宁夏回族自治区",
  新疆: "新疆维吾尔自治区",
  //  香港: "香港特别行政区",
  //  澳门: "澳门特别行政区"
};

export default {
  data () {
    return {
      areaName: "china"
    };
  },
  mounted () {
    this._eChart = echarts.init(this.$refs.charts);
    //根据窗口的大小变动图表
    window.addEventListener("resize", () => {
      this._eChart.resize();
    });
    this.updateChart();

    this.$root.$on("scene.loaded", () => {
      this._earth = this.$root._earth;
    });

    var self = this;
    this._eChart.on("click", param => {
      if (!param || !param.name) return;

      if (self.areaType == "world") {
        //国家点定位

        if (param.name == "中国") {
          self.toChina();
        }
      } else if (self.areaType == "china") {
        //省级点定位
        self.toProvince(param.name);
      } else {
        //城市点定位
      }
    });
    this._eChart.on("mousemove", param => {
      if (!param || !param.name) return;

      if (self.areaType !== "world") {
        this.$root.mousemoveArea = param.name;
      }
    });
  },
  methods: {
    toWorld () {
      this.$router
        .push({ name: "beammap", params: { area: "world" } })
        .catch(err => {
          err;
        });

      this._earth.cameraViewManager.globe.flyTo();
      this._earth.cameraFlight.rotateGlobe.start();
    },
    toChina () {
      this.$router
        .push({ name: "flatmap", params: { area: "china" } })
        .catch(err => {
          err;
        });
      this._earth.cameraViewManager.china.flyTo();
      this._earth.cameraFlight.rotateGlobe.cancel();
    },
    toProvince (province) {
      var name = shortToFull[province];
      if (!name)
        return;
      this.$router
        .push({ name: "flatmap", params: { area: name } })
        .catch(err => {
          err;
        });
    },
    updateChart () {
      this.$root._dataserver.loadSubArea(this.$root.currentArea).then(data => {
        var ydata = [];
        var confirmed = [];
        var suspected = [];
        var cured = [];
        var dead = [];
        var empty = [];
        if (!data.subs)
          return;
        data.subs.sort((a, b) => {
          return a.confirmedCount - b.confirmedCount;
        });
        var maxValue = 0;
        data.subs.forEach(element => {
          maxValue =
            maxValue > element.confirmedCount
              ? maxValue
              : element.confirmedCount +
              element.curedCount +
              element.deadCount;
        });
        data.subs.forEach(element => {
          ydata.push(element.name);
          confirmed.push(element.confirmedCount);
          suspected.push(element.suspectedCount);
          cured.push(element.curedCount);
          dead.push(element.deadCount);
          empty.push(
            maxValue -
            element.confirmedCount -
            element.curedCount -
            element.deadCount
          );
        });

        var option = {
          tooltip: {
            trigger: "axis",
            axisPointer: {
              // 坐标轴指示器，坐标轴触发有效
              type: "shadow" // 默认为直线，可选为：'line' | 'shadow'
            },
            formatter: function (param) {
              var tip = param[0].name + "</br>";
              for (var i = 0; i < param.length; i++) {
                if (param[i].seriesName.length > 0) {
                  tip += param[i].marker + param[i].seriesName + ": " + param[i].data + "</br>";
                }
              }
              if (param.length > 3) {
                tip += "死亡率: " + Math.round(param[1].data * 10000 / (param[0].data + param[1].data + param[2].data)) / 100 + "%";
              }
              return tip;
            }
          },
          legend: {
            data: ["确诊", "死亡", "治愈"],
            textStyle: {
              color: "white"
            }
          },
          grid: {
            left: "3%",
            right: "4%",
            bottom: "3%",
            containLabel: true
          },
          xAxis: {
            type: "value",
            axisLabel: {
              textStyle: {
                color: "white" //坐标值得具体的颜色
              }
            },
            axisLine: {
              lineStyle: {
                type: "solid",
                color: "white" //坐标线的颜色
              }
            },
            splitLine: {
              show: true,
              lineStyle: {
                type: "dashed"
              }
            }
          },
          yAxis: {
            type: "category",
            data: ydata,
            axisLine: {
              lineStyle: {
                type: "solid",
                color: "white" //坐标线的颜色
              }
            },
            axisLabel: {
              textStyle: {
                color: "white" //坐标值得具体的颜色
              }
            }
          },
          series: [
            {
              name: "确诊",
              type: "bar",
              stack: "总量",

              data: confirmed,
              itemStyle: {
                normal: {
                  color: "#f56262"
                }
              }
            },

            {
              name: "死亡",
              type: "bar",
              stack: "总量",

              data: dead,
              itemStyle: {
                normal: {
                  color: "rgb(127, 127, 127)"
                }
              }
            },
            {
              name: "治愈",
              type: "bar",
              stack: "总量",

              data: cured,
              itemStyle: {
                normal: {
                  color: "green"
                }
              }
            },
            {
              name: "",
              type: "bar",
              stack: "总量",
              data: empty,
              itemStyle: {
                normal: {
                  color: "rgba(88,255,255,0)"
                }
              }
            }
          ]
        };

        this._eChart.setOption(option, true);
      });
    }
  },
  watch: {
    "$root.currentArea" (v) {
      this.areaName = v;
      this.updateChart();
    }
  },
  computed: {
    areaType () {
      if (this.areaName == "china" || this.areaName == "world")
        return this.areaName;
      return "province";
    }
  }
};
</script>
<style scoped>
.container {
  width: 15%;
  position: fixed;
  top: 80px;
  bottom: 0;
  left: 0;
  background: #152c4c99;
  color: white;
  z-index: 1;
}

.casedetails {
  font-size: 18px;
  font-weight: bold;
  padding-left: 20px;
}

.charts {
  position: absolute;
  width: 100%;
  top: 30px;
  bottom: 10px;
}
</style>
