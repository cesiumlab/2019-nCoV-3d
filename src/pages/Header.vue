<template>
  <div>
    <div class="header">
      <div class="title">
        <ul>
          <li :class="{active: areaType=='world'}" @click="toWorld()">全球</li>
          <li :class="{active: areaType=='china'}" v-show="areaType!='world'" @click="toChina()">中国</li>
          <li :class="{active: areaType=='province'}" v-show="areaType=='province'">{{areaName|f_short}}</li>
        </ul>
      </div>
      <div style="float: left;">
        <p class="text">新型冠状病毒疫情数据可视化</p>
      </div>
      <div class="info">
        <div style="display: inline-block; width: 336px;">
          <div class="infoItem">
            <span style="color: #f56262;">{{count.confirmedCount}}</span>
            <span>确诊</span>
          </div>
          <div class="infoItem" v-show="areaType=='china'">
            <span style="color: #e8b77d;">{{count.suspectedCount}}</span>
            <span>疑似</span>
          </div>
          <div class="infoItem">
            <div style="display: flex;">
              <span style="color: rgb(127, 127, 127);">{{count.deadCount}}</span>
              <span
                style="margin-top: 10px; font-size: 12px; color: rgb(127, 127, 127);"
              >({{deathrate}})</span>
            </div>
            <span>死亡</span>
          </div>
          <div class="infoItem">
            <span style="color: green;">{{count.curedCount}}</span>
            <span>治愈</span>
          </div>
        </div>
        <div style="display: inline-block; margin-left: -20px;font-size:0.8em;">
          <div style="margin-top: 22px; text-align: left;">数据来源：丁香园</div>
          <div style="text-align: left;">截至{{count.updateTime|f_time}}</div>
        </div>
      </div>
      <div class="origion"></div>
      <div id="timeContainer">
        <span id="date">{{dateTime.date}} 星期{{dateTime.day}}</span>
        <span id="clock">
          <span style="float:left">{{dateTime.time}}</span>
        </span>
        <span><a target="_blank" href="https://github.com/cesiumlab/2019-nCoV-3d" style="color:#00e5e5;">本项目开源</a></span>
      </div>
    </div>
  </div>
</template>
<script>
import moment from "moment";
export default {
  data() {
    return {
      areaName: "china",
      deathrate: 0,
      count: {
        confirmedCount: 0,
        suspectedCount: 0,
        curedCount: 0,
        deadCount: 0,
        updateTime: 0
      },
      dateTime: {
        date: "",
        day: "",
        time: ""
      },
      dayMap: ["日", "一", "二", "三", "四", "五", "六"]
    };
  },
  mounted() {
    this.$root.$on("scene.loaded", () => {
      this._earth = this.$root._earth;
    });

    this.updateChart();

    this.timer = setInterval(() => {
      this.dateTime.date = moment().format("YYYY/M/D");
      this.dateTime.day = this.dayMap[moment().day()];
      this.dateTime.time = moment().format("HH:mm:ss");
    }, 1000);
  },
  methods: {
    toWorld() {
      this.$router
        .push({ name: "beammap", params: { area: "world" } })
        .catch(err => {
          err;
        });

      this._earth.cameraViewManager.globe.flyTo();
      this._earth.cameraFlight.rotateGlobe.start();
    },
    toChina() {
      this.$router
        .push({ name: "flatmap", params: { area: "china" } })
        .catch(err => {
          err;
        });
      this._earth.cameraViewManager.china.flyTo();
      this._earth.cameraFlight.rotateGlobe.cancel();
    },
    updateChart() {
      this.$root._dataserver.loadOverall(this.$root.currentArea).then(data => {
        this.count = data;
        this.deathrate =
          (
            (this.count.deadCount /
              (this.count.confirmedCount + this.count.curedCount)) *
            100
          ).toFixed(2) + "%";
      });
    }
  },
  watch: {
    "$root.currentArea"(v) {
      this.areaName = v;
      this.updateChart();
    }
  },
  filters: {
    f_time(ut) {
      return moment(new Date(ut)).format("MM月DD日HH时");
    },
    f_short(fn){
      const    areaMap = { 
    "黑龙江省": "黑龙江",
    "宁夏回族自治区": "宁夏",
    "广西壮族自治区": "广西",
    "内蒙古自治区": "内蒙古", 
    "新疆维吾尔自治区": "新疆",
    "西藏自治区": "西藏",
    "香港特别行政区": "香港",
    "澳门特别行政区": "澳门",
    };  
    
     return areaMap[fn] || fn;
    }
  },
  computed: {
    areaType() {
      if (this.areaName == "china" || this.areaName == "world")
        return this.areaName;
      return "province";
    }
  }
};
</script>
<style scoped>
* {
  margin: 0;
  padding: 0;
}
.header {
  width: 100%;
  height: 80px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  background: #152c4c99;
  /* display: flex; */
  justify-content: space-between;
}
.title {
  float: left;
  width: 300px;
}
li {
  list-style: none;
  float: left;
  color: white;
  font-size: 22px;
  width: 82px;
  height: 36px;
  line-height: 36px;
  margin-top: 20px;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
li:nth-child(1) {
  background: url(../img/header1.png) no-repeat;
  background-size: 100% 100%;
  margin-left: 18px;
  padding-left: 22px;
}
li:nth-child(2),
li:nth-child(3) {
  background: url(../img/header2.png) no-repeat;
  background-size: 100% 100%;
  padding-left: 26px;
  margin-left: -20px;
}
li:nth-child(3) {
  padding-left: 16px;
}
.active {
  color: #00e5e5;
}
.info {
  color: white;
  width: 440px;
  margin-top: 12px;
  text-align: center;
  float: left;
  /* margin-left: 44px; */
}
.text {
  font-size: 24px;
  /* color: #04d8db;*/
  color: white;
  /* text-shadow: 2px 0 2px #0080ff, -2px 0 2px #0080ff, 0px 2px 2px #0080ff,
    0px -2px 2px #0080ff; */
  width: 440px;
  /* margin-left: 42px; */
  text-align: center;
  line-height: 78px;
}
.infoItem {
  display: inline-block;
  width: 80px;
}
.infoItem span:nth-child(1) {
  display: block;
  font-size: 24px;
  font-weight: 500;
}
.origion {
  float: right;
  width: 244px;
  height: 28px;
  background: url(../img/jiayou.png) no-repeat;
  background-size: contain;
  margin-top: 26px;
  margin-right: 384px;
}
#timeContainer {
  position: absolute;
  right: 50px;
  text-align: center;
  margin-left: 1%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
#date {
  display: block;
  font-size: 16px;
  font-weight: normal;
  line-height: 22px;
  color: #fff;
}
#clock {
  display: block;
  letter-spacing: 3.5px;
  color: #fff;
  font-size: 1.8rem;
  line-height: 2rem;
}
</style>
