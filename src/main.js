// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
//import ViewUI from 'view-design';
//import 'view-design/dist/styles/iview.css';

Vue.config.productionTip = false;

/* eslint-disable no-new */
// XE.ready()用来加载Cesium.js等相关资源

XE.ready().then(() => {
    // 加载标绘插件
    return XE.HTML.loadJS('../static/XbsjEarth-Plugins/plottingSymbol/plottingSymbol.js');
}).then(() => {
    // 加载标绘插件
    return XE.HTML.loadJS('../static/XbsjEarth-Plugins/customPrimitive/customPrimitive.js');
}).then(() => {
    // vtxf g_app赋值，方便调试
    window.g_app = new Vue({
        el: '#app',
        router,
        data() {
            return {
                currentArea: 'china',
                mousemoveArea: '',
                //修改 currentDay 为 currentTime 表示整形，DataServer的所有数据查询接口 具有 ut 参数，表示查询的截至时间, 为0 表示取最新值
                currentTime: new Date().getTime(),
                intervalID: undefined
            }
        },
        components: {
            App
        },
        template: '<App/>',
        mounted() {
            this.startGlobeUpdate();
        },
        methods: {
            startGlobeUpdate() {
                this.currentTime = new Date().getTime();
                if (!this.intervalID) {
                    var self = this;
                    this.intervalID = setInterval(() => {
                        self.currentTime = new Date().getTime();

                        console.log('globe update', self.currentTime);
                    }, 60000);
                }
            },
            stopGlobeUpdate() {
                if (this.intervalID) {
                    clearInterval(this.intervalID);
                    this.intervalID = undefined;
                }
            }
        }
    })
});
