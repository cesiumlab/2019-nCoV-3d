<template>
  <div
    class="video_con"
    @dbclick="toggleFullScreen(false)"
    v-show="show"
    :style="{left:left+'px', bottom:bottom+'px'}"
  >
    <video class="video" crossorigin autoplay="false" loop="true" muted="true" ref="video"></video>
    <label class="name">{{name}}</label>
    <button class="fsbtn" @click="toggleFullScreen(true)"></button>
    <button class="mapbtn" @click="tomap()"></button>
    <span class="arrow"></span>
  </div>
</template>
<script>
import Hls from "hls.js";
export default {
  props: {
    name: String,
    url: String,
    georef: String,
    vtype: String
  },
  data() {
    return {
      show: false,
      left: 0,
      bottom: 0
    };
  },
  mounted() {
    var video = this.$refs.video;

    if (this.vtype == "mp4") {
      video.src = this.url;
    } else {
      this._hls = new Hls();
      this._hls.loadSource(
        //"https://mobilelive-play.ysp.cctv.cn/ysp/48DBAC04BAF25EC508321C7D9AA2EE0D416DEC24B7BE6C46A1B779069E85905D38EBF0D6097BFF12522BC947DA37B1053C3EB4984A7CB2B8C33E5DA99CF9F0C95EE29E9E9C851A07E07CA20DC4BDF1A61125E33922B62AB49C2EDC3940ACCA31/2001891501_hd.m3u8"
        this.url
      );
      this._hls.attachMedia(video);
      this._hls.on(Hls.Events.MANIFEST_PARSED, function() {
        //video.play();
      });
    }

    var self = this;
    //场景加载事件
    this.$root.$on("scene.loaded", () => {
      //根据georef获取pin
      this._earth = this.$root._earth;
      this._csn = this._earth.sceneTree.$refs[this.georef];

      //并且监控pin的窗口位置
      if (this._csn) {
        var pin = this._csn.czmObject;
        XE.MVVM.watch(
          () => [...pin.winPos],
          () => {
            //console.log(pin.winPos);
            self.left = pin.winPos[0] - 128;
            self.bottom = pin.winPos[3];
          }
        );
      }

      this._csnVideo = this._earth.sceneTree.$refs[
        this.georef + "_video"
      ].czmObject;

      if (this._csnVideo) {
        //  this._csnVideo.videoUrl = "";
      }
    });

    //监控隐藏事件
    this.$root.$on("zhibo.show", v => {
      this.show = v;
      if (this._csnVideo && !this.show) {
        this._csnVideo.enabled = false;
      }
    });
  },
  methods: {
    toggleFullScreen(fullScreen) {
      if (fullScreen) {
        this.$refs.video.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    },
    tomap() {
      if (!this._csnVideo) return;

      if (!this._csnVideo.enabled) {
        //1,启用
        this._csnVideo.enabled = true;

        //2,飞行定位
        this._csnVideo.flyTo();
        //3,开始播放

        //  this._csnVideo.playing = true;
        this._csnVideo.videoUrl = this.url;
        var self = this;
        setTimeout(() => {
          self._csnVideo._cameraVideo._primitive.classificationType = 2;
        }, 3000);
      } else {
        this._csnVideo.enabled = false;
        this._csnVideo._videoElement.pause();
        // this._csnVideo.videoUrl = "";
      }
    }
  }
};
</script>
<style scoped>
.video_con {
  position: absolute;
  width: 266px;
  height: 155px;
  background: url(../img/video_bg.png) no-repeat;
  background-size: 100% 100%;
}
.video {
  width: 256px;
  margin-left: 6px;
  margin-top: 6px;
}
.name {
  position: absolute;
  top: 4px;
  color: white;
  right: 4px;
  width: 124px;
  height: 24px;
  text-align: center;
  line-height: 24px;
  background: black;
  background: url(../img/video_name.png) no-repeat;
  background-size: 100% 100%;
  font-size: 14px;
}
.fsbtn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  background: url(../img/quanping.png) no-repeat;
  background-size: 100% 100%;
  border: none;
  cursor: pointer;
  outline: none;
}
.fsbtn:hover {
  background: url(../img/quanping_on.png) no-repeat;
  background-size: 100% 100%;
}

.mapbtn {
  position: absolute;
  bottom: 8px;
  right: 36px;
  width: 20px;
  height: 20px;
  background: url(../img/location.png) no-repeat;
  background-size: 100% 100%;
  border: none;
  cursor: pointer;
  outline: none;
}
.mapbtn:hover {
  background: url(../img/location_on.png) no-repeat;
  background-size: 100% 100%;
}
.arrow {
  display: inline-block;
  position: absolute;
  right: 59px;
  bottom: -28px;
  width: 138px;
  height: 30px;
  background: url(../img/arrow.png) no-repeat;
  background-size: 100% 100%;
}
</style>
