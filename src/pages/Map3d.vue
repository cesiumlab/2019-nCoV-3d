<template>
  <div class="map3d">
    <ul>
      <li>
        <a
          @click="tochina()"
          :class="{active: (navIndex=='flatmap' || navIndex == 'beammap')}"
        >疫情分布图</a>
      </li>
      <li>
        <a @click="heatmap()" :class="{active: navIndex=='heatmap'}">疫情热力图</a>
      </li>
      <li>
        <a @click="zhibo()" :class="{active: navIndex=='zhibo'}">火神山&雷神山医院</a>
      </li>

      <li>
        <a @click="zhanyi()" :class="{active: navIndex=='zhanyi'}">一省一市战“疫”</a>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  data() {
    return {
      navIndex: "flatmap"
    };
  },
  mounted() {
    //加载场景
    this.$root._dataserver
      .loadScene()
      .then(scene => {
        console.log(scene);
        this._earth = this.$root._earth;

        this._earth.xbsjFromJSON(scene);

        //发送场景加载完成事件
        this.$root.$emit("scene.loaded");
      })
      .catch(ex => {
        console.log("query scene failed " + ex.message || ex);
      });
  },
  methods: {
    zhanyi() {
      this.$router
        .push({ name: "zhanyi", params: { area: "china" } })
        .catch(err => {
          err;
        });
      
      //开始环绕飞行

     this._earth.camera.flyAround( [1.947900386934476, 0.5442331843381032, 0],2000000,[0,-0.7,0]);

    },
    flyTo(index) {
      this._earth.cameraViewManager.views[index].flyTo();
    },
    tochina() {
      this.$router
        .push({ name: "flatmap", params: { area: "china" } })
        .catch(err => {
          err;
        });
      this._earth.cameraViewManager.china.flyTo();
      this._earth.cameraFlight.rotateGlobe.cancel();
    },
    heatmap() {
      //定位到全国
      this._earth.cameraViewManager.china.flyTo();
      //打开热力图
      this.$router
        .push({
          name: "heatmap"
        })
        .catch(err => {
          err;
        });
    },
    zhibo() {
      this.flyTo(0);
      //打开直播
      this.$router
        .push({
          name: "zhibo"
        })
        .catch(err => {
          err;
        });
    }
  },
  watch: {
    "$root.currentArea"(v) {
      if (v == "world") {
        //定位到全球，并且开始全球旋转

        this._earth.cameraFlight.rotateGlobe.start();
      } else if (v == "china") {
        //定位到中国
        this._earth.cameraViewManager.china.flyTo();
        this._earth.cameraFlight.rotateGlobe.cancel();
      } else {
        //定位到对应省区
        this._earth.cameraFlight.rotateGlobe.cancel();
      }
    },
    $route(to, from) {
      this.navIndex = to.name;
    }
  }
};
</script>
<style scoped>
a {
  text-decoration: none;
  color: white;
}
li {
  float: left;
  width: 23.75%;
  height: 30px;
  margin-left: 1%;
  text-align: center;
  line-height: 30px;
  background: url(../img/nav.png) no-repeat;
  background-size: 100% 100%;
  cursor: pointer;
}
.map3d {
  position: absolute;
  left: 15%;
  right: 15%;
  height: 30px;
  /* bottom: 300px; */
  top: 80px;

  font-size: 18px;
  font-weight: bold;
}
li a:hover,
.active {
  color: #03d8da;
  border-bottom: #03d8da 2px solid;
}
</style>
