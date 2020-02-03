<template>
  <div>
    <div class="container">
      <span class="newstitle">实时播报</span>
      <div class="newsList" v-for="(news,index) in newses" :key="index">
        <div class="dateList">
          <div style="text-align: center;">{{news.pubDate|f_time}}</div>
          <div style="text-align: center; font-size: 12px;">{{news.pubDate|f_time2}}</div>
          <span class="dateItem"></span>
        </div>
        <div class="newsRight">
          <div class="newsItemTitle">
            <span class="newest" v-show="index==0">最新</span>
            {{news.title}}
          </div>
          <a :href="news.sourceUrl" target="__blank" style="font-size: 12px;">{{news.summary}}</a>
          <div style="text-align: right;">信息来源：{{news.infoSource}}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import moment from "moment";

export default {
  data() {
    return {
      newses: []
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    getData() {
      var p = this.$root.currentArea;
      if (p == "world" || p == "china") p = undefined;
      this.$root._dataserver.loadNews(p).then(news => {
        this.newses = news.results;
      });
    }
  },
  filters: {
    f_time(data) {
      moment.locale("zh-cn");
      return moment(data).fromNow();
    },
    f_time2(data) {
      return moment(data).format("M-DD HH:mm");
    }
  },
  beforeDestroy() {},
  watch: {
    "$root.currentTime"(v) {
      this.getData();
    },
    "$root.currentArea"(v) {
      this.getData();
    }
  }
};
</script>
<style scoped>
a {
  text-decoration: none;
  color: white;
}
.container {
  width: 15%;
  height: calc(100% - 60px);
  position: fixed;
  top: 80px;
  bottom: 0;
  right: 0;
  background: #152c4c99;
  color: white;
  z-index: 1;
  overflow-y: auto;
}
.newstitle {
  display: inline-block;
  width: 100%;
  font-size: 18px;
  height: 40px;
  line-height: 40px;
  font-weight: bold;
  padding-left: 20px;
}
.newsList {
  position: relative;
  display: flex;
}
.dateList {
  width: 30%;
  flex: none;
  transform: translateY(0.08rem);
  border-right: 1px solid #ebebeb;
}
.dateItem {
  display: inline-block;
  width: 10px;
  height: 10px;
  background: wheat;
  position: absolute;
  right: -5px;
  top: -2px;
  border-radius: 50%;
}
.newsItemTitle {
  font-weight: bold;
}
.newsRight {
  width: 70%;
  padding-left: 10px;
  padding-bottom: 20px;
  padding-right: 10px;
}
.newest {
  display: inline-block;
  width: 30px;
  height: 20px;
  background: red;
  text-align: center;
  border-radius: 2px;
  line-height: 20px;
}

/* 滚动条样式开始 */
/* ----chrome---- */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-thumb {
  border-radius: 10px;
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  background: rgba(0, 0, 0, 0.2);
}

::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
  border-radius: 0;
  background: rgba(0, 0, 0, 0.1);
}

/* ----chrome---- */
/* ----firefox---- */
* {
  scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.1);
  scrollbar-width: thin;
}

/* ----firefox---- */
/* edge、ie暂未找到解决方案，或者可以使用js库来进行优化 */
/* 滚动条样式结束 */
</style>
