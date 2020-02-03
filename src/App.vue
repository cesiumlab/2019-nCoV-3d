<template>
  <div id="app">
    <div style="width: 100%; height: 100%">
      <div ref="earthContainer" style="width: 100%; height: 100%"></div>
    </div>

    <Video
      v-for="addr in zhiboPoints"
      :key="addr.name"
      :name="addr.name"
      :url="addr.url"
      :georef="addr.georef"
      :vtype="addr.type"
    ></Video>
    <Map3d></Map3d>

    <Header></Header>
    <TimeLine></TimeLine>
    <Left></Left>
    <News></News>

    <router-view :key="$route.fullPath" />
  </div>
</template>

<script>
import Header from "@/pages/Header";
import TimeLine from "@/pages/TimeLine";
import Left from "@/pages/Left";
import News from "@/pages/News";
import Map3d from "@/pages/Map3d";

import DataServer from "./js/DataServer";
import Video from "@/pages/Video";

export default {
  components: {
    Header,
    News,
    Left,
    TimeLine,
    Video,
    Map3d
  },
  // name: 'App'
  data() {
    return {
      // _earth: undefined // 注意：Earth和Cesium的相关变量放在vue中，必须使用下划线作为前缀！
      zhiboPoints: [
        /*
         {
          georef: "huoshenshan02",
          name: "火神山实时画面2",
          url:
            "https://mobilelive-play.ysp.cctv.cn/ysp/C736F1FABA0A008ACCC09B78C23B6A8D7CB78D097A778BBC21F9A8C658054456E99C0AA31374DB7A7BC8579ACDC915C0B01FAE24F7FEDC86E934EF5C7083399B24F263064E6E9F93B6DA568E8D2365AE369571916DFAB92F44BA6CB2E33F5CAE/2001891501_hd.m3u8"
        },
        {
          georef: "huoshenshan01",
          name: "火神山实时画面1",
          url:
            "https://mobilelive-play.ysp.cctv.cn/ysp/F2B167778DAEDE252C9E62CCE23CA51EB08EEF67BEA35DE73D81AF0A9391E0584AC9C7000711EC57512BE36C98C27561BE9625F57019FD31FDD99AB57B8C357A05DA762608C6B2E9BCCCD421A0B9EFAD6E5340B9CA7DB345C5316B3F05DAF211/2001894001_hd.m3u8"
        },
*/
        {
          georef: "huoshenshan02",
          name: "火神山回看画面2",
          type: "mp4",
          url:
            "https://mp4playcloud-cdn.ysp.cctv.cn/c000033c7v5.lYIs11002.mp4?sdtfrom=v7007&guid=53a76d1e221b7e536282c4640425c542&vkey=FF942CC5F1ED90C875734DAD0ABA7C7CFDF2ABC644FF095A7942E6F685C29993373D7CCFF165059541D222BD207B132EA1F0BE1AE6553A9CFFD98C837184B528F4A33DD281DA411BF459A8A7F4524214BE2E034984AEF8DFAF353C338DCBD1452C3DAB37346F5C178BDBB9D98FCE6A01&platform=2"
        },
        {
          georef: "huoshenshan01",
          name: "火神山回看画面1",
          type: "mp4",
          url:
            "https://mp4playcloud-cdn.ysp.cctv.cn/f000069yp0n.afNb11002.mp4?sdtfrom=v7007&guid=53a76d1e221b7e536282c4640425c542&vkey=134B59C7CD7B1ABC435970200597F27FBE7CEEB69AA787AE0146FEB00A611542BC74A5B22094F56B0705BF17D4695CBBF07818A2517FF9FAAFBD86875DFC60C0167A82197C59F125EB9D9620BC10D0A89A2A59A8F6E82D01F32BBFAA0673749AE8B25475BE282781836494536B0D81ED&platform=2"
        },
        {
          georef: "leishenshan01",
          name: "雷神山实时画面1",
          url:
            "https://mobilelive-play.ysp.cctv.cn/ysp/E4F9D6E9E2CB4C1D7868477F655F5726CA7029487D7528C5CE8436BA8CFEF593926522EDD95870598B7CC17FEBB58C45ECBABA9F4DF59AF44662747CD4477E937DC545BFE287B25D58DB285E112B36212019FD9E34DA103CE84EBF6354B830FB/2001893301_hd.m3u8"
        },
        {
          georef: "leishenshan02",
          name: "雷神山实时画面2",
          url:
            "https://mobilelive-play.ysp.cctv.cn/ysp/C30A9F9A16CC01F5A81AF758854CE146D124447C066E0A59568CB66D11824C5724BED80D8493EE530DFD937ACEBAED46C1B6E6FD057802DB76DDAD134960C26E9AF543FB7AEBE8F226C5D08A800EAF42795BD88EC407A186F81AAD73C07E28CA/2001893201_hd.m3u8"
        }
      ]
    };
  },
  created() {
    this.$root._dataserver = new DataServer();
    window.dataserver = this.$root._dataserver;
  },
  mounted() {
    // 创建地球
    var earth = new XE.Earth(this.$refs.earthContainer);
    // 添加默认地球影像
    earth.sceneTree.root = {
      children: [
        {
          czmObject: {
            name: "默认离线影像",
            xbsjType: "Imagery",
            xbsjImageryProvider: {
              createTileMapServiceImageryProvider: {
                url: XE.HTML.cesiumDir + "Assets/Textures/NaturalEarthII",
                fileExtension: "jpg"
              },
              type: "createTileMapServiceImageryProvider"
            }
          }
        }
      ]
    };
    this.$root._earth = earth;
    window.uia = earth;

    this.$router
      .push({ name: "flatmap", params: { area: "china" } })
      .catch(err => {
        err;
      });
  },
  // 资源销毁
  beforeDestroy() {
    // vue程序销毁时，需要清理相关资源
    this.$root._earth = this.$root._earth && this.$root._earth.destroy();
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
html,
body,
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
li {
  list-style: none;
}
img {
  width: 100%;
  height: 100%;
}
</style>
