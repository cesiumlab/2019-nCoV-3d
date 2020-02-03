import axios from "axios";
import moment from "moment"
// post请求头
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';

//const nCovServer = 'https://lab.isaaclin.cn/nCoV/api';
const nCovServer = 'https://ncov.earthsdk.com';
/**
 * CesiumLab服务访问控制
 * @class
 */
class DataServer {

    constructor(root) {
        this._root = root;

        this.dataCach = [];

        // geojson服务地址
        this.earthsdkServer = 'https://www.earthsdk.com/static/data/';
    }


    loadScene() {

        return new Promise((resolve, reject) => {
            axios
                .get("./static/scene.json")
                .then(res => {
                    if (res.status == 200) {
                        resolve(res.data);
                    } else {
                        reject(res.data);
                    }
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    //加载最新新闻
    loadNews(p) {

        return new Promise((resolve, reject) => {
            var url = nCovServer + "/news";
            if (p)
                url += '?p=' + p;
            axios
                .get(url)
                .then(res => {
                    if (res.status == 200) {
                        resolve(res.data);
                    } else {
                        reject(res.status);
                    }
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    //加载area的统计数据
    loadArea() {
        return new Promise((resolve, reject) => {

            //如果dataCach里有数据，那么增加ut参数
            var ut;
            if (this.dataCach.length > 0) {
                ut = this.dataCach[0].updateTime;
            }

            let url = nCovServer + "/area";
            if (ut) {
                url += '?ut=' + ut;
            }
            axios.get(url)
                .then(res => {
                    if (res.status == 200) {
                        var newd = res.data.results;

                        //最新数据的最晚时间
                        //this.dataCach = this.dataCach.concat(newd);
                        if (this.dataCach.length == 0) {
                            this.dataCach = newd;
                        } else {
                            var ft = this.dataCach[0].updateTime;
                            for (var i = 0; i < newd.length; i++) {
                                if (newd[i].updateTime <= ft)
                                    break;
                                this.dataCach.splice(0, 0, newd[i]);
                            }
                        }

                        resolve(this.dataCach);

                    } else {
                        reject(res.status);
                    }
                })
                .catch(error => {
                    reject(error);
                });
        });
    }


    getProvinceLatest(data, ut) {
            //遍历data
            var provinceMap = {};

            data.forEach((province) => {
                //如果有最晚截取时间
                if (ut && ut > 0 && province.updateTime > ut)
                    return;
                //因为数据我们都已经按照时间倒叙排列了 ，所以不包含该省才存入
                if (!provinceMap.hasOwnProperty(province.provinceName)) {
                    provinceMap[province.provinceName] = province;
                }
            });
            return provinceMap;
        }
        //加载全球总览数据
    loadWorldOverall(ut) {

            return new Promise((resolve, reject) => {

                this.loadArea().then((data) => {
                    //获取每个区域的最新数据
                    var provinceMap = this.getProvinceLatest(data, ut);

                    //统计总量
                    var ret = {
                        confirmedCount: 0,
                        suspectedCount: 0,
                        curedCount: 0,
                        deadCount: 0,
                        updateTime: 0
                    };

                    for (var key in provinceMap) {
                        var province = provinceMap[key];

                        ret.updateTime = Math.max(ret.updateTime, province.updateTime);
                        ret.confirmedCount += province.confirmedCount;
                        ret.suspectedCount += province.suspectedCount;
                        ret.curedCount += province.curedCount;
                        ret.deadCount += province.deadCount;
                    }

                    resolve(ret);

                }).catch(error => {
                    reject(error);
                });
            });

        }
        //加载全球分区数据 和 上一个函数一样
    loadWorldSubArea(ut) {
        return new Promise((resolve, reject) => {

            this.loadArea().then((data) => {
                //获取每个区域的最新数据
                var provinceMap = this.getProvinceLatest(data, ut);

                //统计总量
                var ret = {
                    confirmedCount: 0,
                    suspectedCount: 0,
                    curedCount: 0,
                    deadCount: 0,
                    updateTime: 0,
                    subs: []
                };

                for (var key in provinceMap) {
                    var province = provinceMap[key];

                    ret.updateTime = Math.max(ret.updateTime, province.updateTime);
                    ret.confirmedCount += province.confirmedCount;
                    ret.suspectedCount += province.suspectedCount;
                    ret.curedCount += province.curedCount;
                    ret.deadCount += province.deadCount;


                    var finded = ret.subs.find(el => {
                        return el.name == province.country;
                    });
                    if (finded) {
                        finded.confirmedCount += province.confirmedCount;
                        finded.suspectedCount += province.suspectedCount;
                        finded.curedCount += province.curedCount;
                        finded.deadCount += province.deadCount;
                        finded.updateTime = Math.max(finded.updateTime, province.updateTime);
                    } else {
                        ret.subs.push({
                            confirmedCount: province.confirmedCount,
                            suspectedCount: province.suspectedCount,
                            curedCount: province.curedCount,
                            deadCount: province.deadCount,
                            updateTime: province.updateTime,
                            name: province.country,
                            shortName: province.country
                        });
                    }
                }

                resolve(ret);

            }).catch(error => {
                reject(error);
            });
        });

    }


    //加载中国总览数据
    loadChinaOverall(ut) {
            return new Promise((resolve, reject) => {

                let url = nCovServer + "/overall";
                if (ut && ut > 0) {
                    url += '?ut=' + ut;
                }
                axios
                // .get("https://lab.isaaclin.cn/nCoV/api/overall?latest=1")
                // .get("../../static/area.json")
                    .get(url)
                    .then(res => {
                        if (res.status == 200) {
                            var d = res.data.results[0];
                            if (!d) {
                                var ret = {
                                    confirmedCount: 0,
                                    suspectedCount: 0,
                                    curedCount: 0,
                                    deadCount: 0,
                                    updateTime: 0
                                };
                                resolve(ret);
                            } else {
                                var ret = {
                                    confirmedCount: d.confirmedCount,
                                    suspectedCount: d.suspectedCount,
                                    curedCount: d.curedCount,
                                    deadCount: d.deadCount,
                                    updateTime: d.updateTime
                                };
                                resolve(ret);
                            }

                        } else {
                            reject(res.status);
                        }
                    })
                    .catch(error => {
                        reject(error);
                    });
            });
        }
        //加载中国分区数据 
    loadChinaSubArea(ut) {
        return new Promise((resolve, reject) => {

            this.loadArea().then((data) => {
                //获取每个区域的最新数据
                var provinceMap = this.getProvinceLatest(data, ut);

                //统计总量
                var ret = {
                    confirmedCount: 0,
                    suspectedCount: 0,
                    curedCount: 0,
                    deadCount: 0,
                    updateTime: 0,
                    subs: []
                };

                for (var key in provinceMap) {
                    var province = provinceMap[key];
                    if (province.country != '中国')
                        continue;

                    ret.updateTime = Math.max(ret.updateTime, province.updateTime);
                    ret.confirmedCount += province.confirmedCount;
                    ret.suspectedCount += province.suspectedCount;
                    ret.curedCount += province.curedCount;
                    ret.deadCount += province.deadCount;


                    var finded = ret.subs.find(el => {
                        return el.name == province.provinceShortName;
                    });
                    if (finded) {
                        finded.confirmedCount += province.confirmedCount;
                        finded.suspectedCount += province.suspectedCount;
                        finded.curedCount += province.curedCount;
                        finded.deadCount += province.deadCount;
                        finded.updateTime = Math.max(finded.updateTime, province.updateTime);
                    } else {
                        ret.subs.push({
                            confirmedCount: province.confirmedCount,
                            suspectedCount: province.suspectedCount,
                            curedCount: province.curedCount,
                            deadCount: province.deadCount,
                            updateTime: province.updateTime,
                            name: province.provinceShortName,
                            shortName: province.provinceShortName
                        });
                    }
                }

                resolve(ret);

            }).catch(error => {
                reject(error);
            });
        });
    }


    //加载某省总览数据
    loadProvinceOverall(province, ut) {
            return new Promise((resolve, reject) => {

                this.loadArea().then((data) => {
                    //获取每个区域的最新数据
                    var provinceMap = this.getProvinceLatest(data, ut);

                    if (provinceMap.hasOwnProperty(province)) {

                        var ret = provinceMap[province];


                        resolve(ret);

                    } else {
                        resolve({});
                    }

                }).catch(error => {
                    reject(error);
                });
            });
        }
        //加载某省分区数据
    loadProvinceSubArea(province, ut) {

        return new Promise((resolve, reject) => {

            this.loadArea().then((data) => {
                //获取每个区域的最新数据
                var provinceMap = this.getProvinceLatest(data, ut);

                if (provinceMap.hasOwnProperty(province)) {

                    var ret = provinceMap[province];

                    ret.subs = [];
                    if (ret.cities) {
                        ret.cities.forEach(c => {
                            ret.subs.push({
                                name: c.cityName,
                                confirmedCount: c.confirmedCount,
                                suspectedCount: c.suspectedCount,
                                curedCount: c.curedCount,
                                deadCount: c.deadCount
                            });
                        })
                    }

                    resolve(ret);

                } else {
                    resolve({});
                }

            }).catch(error => {
                reject(error);
            });
        });
    }


    //加载某个区域的 总览数据
    loadOverall(area, ut) {
        if (area == 'world')
            return this.loadWorldOverall(ut);
        else if (area == 'china')
            return this.loadChinaOverall(ut);
        else return this.loadProvinceOverall(area, ut);
    }

    //加载某个区域的 子分区 数据
    loadSubArea(area, ut) {
        if (area == 'world')
            return this.loadWorldSubArea(ut);
        else if (area == 'china')
            return this.loadChinaSubArea(ut);
        else return this.loadProvinceSubArea(area, ut);
    }


    //获取数据的最早抓取时间
    getEarliestTime() {
        return new Promise((resolve, reject) => {

            this.loadArea().then((data) => {

                if (data.length == 0)
                    resolve(new Date());
                else
                    resolve(data[data.length - 1].updateTime);

            }).catch(error => {
                reject(error);
            });
        });
    }

    //获取用来做日期分析的所有时间
    getHistoryDays() {

        return new Promise((resolve, reject) => {

            this.loadArea().then((data) => {

                if (data.length == 0)
                    resolve([]);
                else {
                    var start = new Date(data[data.length - 1].updateTime);

                    const daytime = 24 * 60 * 60 * 1000;

                    //注意 -1 避免数据显示在0点
                    var startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime() + daytime - 1;

                    // var endDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()).getTime();
                    var endDay = new Date();
                    var ret = [];

                    while (startDay < endDay) {

                        ret.push(new Date(startDay));

                        startDay += daytime;
                    }


                    resolve(ret);

                }
            }).catch(error => {
                reject(error);
            });
        });
    }

    //获取中国所有市级数据
    loadCitiesData(ut) {
        return new Promise((resolve, reject) => {
            this.loadArea().then((data) => {
                //获取每个区域的最新数据
                var provinceMap = this.getProvinceLatest(data, ut);

                //统计总量
                var ret = [];

                for (var key in provinceMap) {
                    var province = provinceMap[key];
                    if (province.country != '中国')
                        continue;

                    var pn = province.provinceShortName;
                    if (pn == '北京' || pn == '重庆' || pn == '上海' || pn == '天津') {
                        ret.push({
                            name: province.provinceName,
                            confirmedCount: province.confirmedCount,
                            suspectedCount: province.suspectedCount,
                            curedCount: province.curedCount,
                            deadCount: province.deadCount
                        });
                        continue;
                    }

                    if (!province.cities)
                        continue;
                    province.cities.forEach(c => {
                        ret.push({
                            name: c.cityName,
                            confirmedCount: c.confirmedCount,
                            suspectedCount: c.suspectedCount,
                            curedCount: c.curedCount,
                            deadCount: c.deadCount
                        });
                    });
                }
                resolve(ret);

            }).catch(error => {
                reject(error);
            });

        });
    }
}

export default DataServer;