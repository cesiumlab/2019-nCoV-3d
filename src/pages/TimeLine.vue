<template>
  <div>
    <div class="footer">
      <p style="padding-left: 20px; font-size: 18px; font-weight: bold; margin-top: 4px;">
        {{areaName}}病例历史
        <button class="playbutton" @click="play()">
          <span style="font-size: 14px;">回顾</span>
          <span v-show="!intervalID" class="play"></span>
          <span v-show="intervalID" class="zanting"></span>
        </button>
      </p>

      <div class="charts" ref="charts"></div>
    </div>
  </div>
</template>
<script>
import echarts from "echarts";

export default {
  data () {
    return {
      areaName: "全国",
      days: [],
      current: -1,
      intervalID: undefined,
      options: {}
    };
  },
  mounted () {
    this._eChart = echarts.init(this.$refs.charts);

    //根据窗口的大小变动图表
    window.addEventListener("resize", () => {
      this._eChart.resize();
    });

    this.updateChart();
  },
  computed: {
    btnText () {
      return this.intervalID ? "停止" : "播放";
    }
  },
  methods: {
    nextTime () {
      this.current++;
      if (this.current >= this._xData.length) {
        this.current = 0;
      }

      //修改root的 currentTime
      this.$root.currentTime = this.days[this.current].getTime();

      this.setChartOptions();
    },
    stopAnim () {
      if (this.intervalID) {
        clearInterval(this.intervalID);
        this.intervalID = undefined;
        this.current = -1;
      }
      this.$root.startGlobeUpdate();
    },
    play () {
      if (!this.intervalID && this._xData && this._xData.length > 0) {
        var self = this;
        this.intervalID = setInterval(this.nextTime, 1000);

        this.$root.stopGlobeUpdate();
      } else {
        this.stopAnim();
      }
    },
    updateChart () {
      //获取所有统计时间

      this.$root._dataserver.getHistoryDays().then(days => {
        //console.log(days);
        this.days = days;

        this._xData = [];

        //根据时间获取所有历史数据
        var ps = [];
        days.forEach(day => {
          ps.push(
            this.$root._dataserver.loadOverall(
              this.$root.currentArea,
              day.getTime()
            )
          );
          this._xData.push(echarts.format.formatTime("M月dd日", day.getTime()));
        });
        this.stopAnim();
        Promise.all(ps).then(data => {
          //data 是个数组 和days 长度一致
          this._confirmed = [];
          this._suspected = [];
          this._cured = [];
          this._dead = [];
          this._curedRatio = [];
          this._deadRatio = [];
          data.forEach(element => {
            this._confirmed.push(element.confirmedCount);
            this._suspected.push(element.suspectedCount);
            this._cured.push(element.curedCount);
            this._dead.push(element.deadCount);
            this._curedRatio.push(
              element.confirmedCount === 0
                ? 0
                : Math.round(
                  (element.curedCount * 10000) /
                  (element.confirmedCount +
                    element.deadCount +
                    element.curedCount)
                ) / 100
            );
            this._deadRatio.push(
              element.confirmedCount === 0
                ? 0
                : Math.round(
                  (element.deadCount * 10000) /
                  (element.confirmedCount +
                    element.deadCount +
                    element.curedCount)
                ) / 100
            );
          });

          this.setChartOptions();
        });
      });
    },
    setChartOptions () {
      var series = [
        {
          name: "确诊",
          type: "line",
          data: this._confirmed,
          itemStyle: {
            normal: {
              color: "#f56262"
            }
          },
          symbolSize: 5,
          symbol: "circle"
        },
        {
          name: "疑似",
          type: "line",
          data: this._suspected,
          itemStyle: {
            normal: {
              color: "#e8b77d"
            }
          },
          symbolSize: 5,
          symbol: "circle"
        },
        {
          name: "死亡",
          type: "line",
          data: this._dead,
          itemStyle: {
            normal: {
              color: "rgb(127, 127, 127)"
            }
          },
          symbolSize: 5,
          symbol: "circle"
        },
        {
          name: "治愈",
          type: "line",
          data: this._cured,
          itemStyle: {
            normal: {
              color: "green"
            }
          },
          symbolSize: 5,
          symbol: "circle"
        },
        {
          yAxisIndex: 1,
          name: "死亡率",
          type: "line",
          data: this._deadRatio,
          itemStyle: {
            normal: {
              color: "rgb(127, 127, 127)"
            }
          },
          lineStyle: {
            color: "rgb(127, 127, 127)",
            width: 2
          },
          symbolSize: 5,
          symbol: "circle"
        },
        {
          yAxisIndex: 1,
          name: "治愈率",
          type: "line",
          data: this._curedRatio,
          itemStyle: {
            normal: {
              color: "green"
            }
          },
          lineStyle: {
            color: "green",
            width: 2
          },
          symbolSize: 5,
          symbol: "circle"
        }
      ];

      //如果不是全国，那么删除疑似病例（因为数据都是0）
      if (this.areaName != "全国") {
        series.splice(1, 1);
      }

      var ldata = [];
      series.forEach(l => {
        ldata.push(l.name);
      });
      let self = this;
      var option = {
        tooltip: {
          trigger: "axis",
          formatter: function (param) {
            var tip = param[0].name + "</br>";
            for (var i = 0; i < param.length; i++) {
              tip += param[i].marker + param[i].seriesName + ": " + param[i].data + (param[i].seriesName.indexOf("率") > 0 ? "%" : "") + "</br>";
            }
            return tip;
          }
        },
        legend: {
          data: ldata,
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
          type: "category",
          boundaryGap: false,
          data: this._xData,
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
          }
        },
        yAxis: [
          {
            type: "value",
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
            },
            splitLine: {
              show: false,
              lineStyle: {
                type: "dashed"
              }
            }
          },
          {
            type: "value",
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
            },
            axisLabel: {
              formatter: "{value} %"
            },
            splitLine: {
              show: true,
              lineStyle: {
                type: "dashed"
              }
            }
          }
        ],
        series: series
      };

      if (this.current >= 0 || this.current < this._xData.length) {
        option.xAxis.axisPointer = {
          value: this._xData[this.current],
          snap: true,
          lineStyle: {
            color: "white",
            opacity: 0.5,
            width: 2
          },
          label: {
            show: true,
            backgroundColor: "#03d8da"
          },
          handle: {
            show: true,
            color: "#03d8da"
          }
        };
      }

      this._eChart.setOption(option, true);

      this._eChart.dispatchAction({
        type: "showTip",
        seriesIndex: 0,
        dataIndex: this.current
      });

      this.options = option;
    }
  },
  watch: {
    "$root.currentArea" (v) {
      if (v == "world") this.areaName = "全球";
      else if (v == "china") this.areaName = "全国";
      else this.areaName = v;
      this.updateChart();
    }
  }
};
</script>
<style scoped>
.footer {
  height: 272px;
  position: fixed;
  bottom: 0;
  left: 15%;
  width: 70%;
  background: #152c4c99;
  color: white;
}

.charts {
  position: absolute;
  width: 100%;
  top: 10px;
  bottom: 10px;
}

.playbutton {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  outline: none;
  position: absolute;
  right: 0;
  z-index: 1;
}
.playbutton .play {
  display: inline-block;
  width: 20px;
  height: 16px;
  background: url(../img/play.png) no-repeat;
  background-size: contain;
  vertical-align: middle;
  margin-right: 12px;
  margin-top: -3px;
}
.playbutton .play:hover {
  background: url(../img/play_on.png) no-repeat;
  background-size: contain;
}
.playbutton .zanting {
  display: inline-block;
  width: 20px;
  height: 16px;
  background: url(../img/zanting.png) no-repeat;
  background-size: contain;
  vertical-align: middle;
  margin-right: 12px;
  margin-top: -3px;
}
.playbutton .zanting:hover {
  background: url(../img/zanting_on.png) no-repeat;
  background-size: contain;
}
</style>
