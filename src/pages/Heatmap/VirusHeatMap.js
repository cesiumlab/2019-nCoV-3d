// @ts-check

// // 根据地理点找疫情
// function createH337Data({
//     rectangle, 
//     valueRange, 
//     radius, 
//     width, 
//     height, 
//     cityCoords, 
//     createCityCoordsIteratorFunc,
//     cityInfos,
//     createCityInfosIteratorFunc,
//     // updateDate,
// }) {
//     var h337DataV = [];
//     var cci = createCityCoordsIteratorFunc(cityCoords);

//     var rw = (rectangle[2] - rectangle[0]);
//     var rh = (rectangle[3] - rectangle[1]);
//     var vd = (valueRange[1] - valueRange[0]);
//     const r = 0.5 * radius / rw * width;

//     for (let cc of cci) {
//         const cityName = cc[0];
//         // const cityInfo = findCityInfo(cityName, createCityInfosIteratorFunc(cityInfos, updateDate));
//         const cityInfo = findCityInfo(cityName, createCityInfosIteratorFunc(cityInfos));
//         if (cityInfo) {
//             const v = (cityInfo.confirmedCount - valueRange[0]) / vd;

//             // console.log('rv: ' + v);
//             h337DataV.push({
//                 x: (cc[1] - rectangle[0]) / rw * width | 0, 
//                 y: height - (cc[2] - rectangle[1]) / rh * height | 0, 
//                 value: v === 0 ? 0.001 : v,
//                 radius: r < 1.0 ? 1.0 : r,
//                 cityName: cityName,
//             });
//         } else {
//             // 加上之后就有点，还去不掉，heatmap的算法很sb
//             // h337DataV.push({
//             //     x: (cc[1] - rectangle[0]) / rw * width | 0, 
//             //     y: height - (cc[2] - rectangle[1]) / rh * height | 0, 
//             //     value: 0.0,
//             //     radius: 1.0,
//             //     cityName: cityName,
//             // });
//         }
//     }

//     return h337DataV;
// }

function findCityCoords(cityName, citiCoordsIteratorOrIterable) {
    for (let cc of citiCoordsIteratorOrIterable) {
        const ccName = cc[0];
        if (ccName === cityName || ccName + '市' === cityName || ccName === cityName + '市') {
            return cc;
        }
    }
}

// 根据疫情找地理点
function createH337Data({
    rectangle, 
    valueRange, 
    radius, 
    width, 
    height, 
    cityCoords, 
    createCityCoordsIteratorFunc,
    cityInfos,
    createCityInfosIteratorFunc,
    // updateDate,
}) {
    var h337DataV = [];

    var rw = (rectangle[2] - rectangle[0]);
    var rh = (rectangle[3] - rectangle[1]);
    var vd = (valueRange[1] - valueRange[0]);
    const r = 0.5 * radius / rw * width;

    const cii = createCityInfosIteratorFunc(cityInfos);
    for (let ci of cii) {
        const cityName = ci.name;
        const cc = findCityCoords(cityName, createCityCoordsIteratorFunc(cityCoords));
        if (cc) {
            const v = (ci.confirmedCount - valueRange[0]) / vd;

            // console.log('rv: ' + v);
            h337DataV.push({
                x: (cc[1] - rectangle[0]) / rw * width | 0, 
                y: height - (cc[2] - rectangle[1]) / rh * height | 0, 
                value: v === 0 ? 0.001 : v,
                radius: r < 1.0 ? 1.0 : r,
                cityName: cityName,
            });
        } else {
            console.warn('某地有疫情，但是未找到地理点：' + cityName);
        }
    }

    return h337DataV;
}

function createHeatMap(earth) {
    var cfg = {
        "position": [
            (70.2938 + 150.1160) * 0.5 * Math.PI / 180.0,
            (11.7733 + 49.9371) * 0.5 * Math.PI / 180.0,
            0
        ],
        // 在地球上的实际尺寸，单位是米
        "width": 1352299.693558889,
        "height": 7628130.204938413,   
        // 调色板参数，第一个代码值域，范围在0-1之间，第二个为css颜色字符串
        "gradient": [
            [
                0,
                "rgba(0, 255, 0, 0.0)"
            ],
            [
                0.05,
                "rgba(0, 255, 0, 0.3)"
            ],
            [
                0.5,
                "rgba(255, 255, 0, 0.5)"
            ],
            [
                1,
                "red"
            ]
        ],
        "maxValue": 1,
        "dataWidth": 512,
        "dataHeight": 256,
    }

    var h = new XE.Obj.HeatMap(earth);
    h.xbsjFromJSON(cfg);

    var p = Cesium.createXbsjGroundPrimitiveFromRectangle(70.2938, 11.7733, 150.1160, 49.9371)
    earth.czm.scene.groundPrimitives.add(p)
    earth.czm.scene.groundPrimitives.remove(h._customGroundRectangle._groundPrimitive);
    h._customGroundRectangle._groundPrimitive = p;
    h._customGroundRectangle._groundPrimitive.appearance.material.uniforms.image = h._customGroundRectangle._texture;
    return h;
}

// updateDate如果为undefined，表示获取所有数值
// function* createCityInfosIterator(cityInfosData, updateDate) {
//     let ts0, ts1;
//     if (updateDate) {
//         const m = moment(updateDate + " +0800", "YYYY-MM-DD Z");
//         ts0 = m.toDate().getTime();
//         m.add(1, 'd');
//         ts1 = m.toDate().getTime();
//     }

//     for (let r of cityInfosData.results) {
//     for (let r of cityInfosData) {
//         let isInDate = true;
//         if (ts0 && ts1 && r.updateTime) {
//             isInDate = r.updateTime > ts0 && r.updateTime < ts1;
//         }

//         if (isInDate && r.cities) {
//             yield* r.cities;
//         }
//     }
// }

function* createCityInfosIterator(cityInfosData) {
    yield* cityInfosData;
}

function* createCityCoordsIterator(d) {
    for (let f of d.features) {
        const c = f.geometry.coordinates;
        const n = f.properties["NAME"];
        yield [n, c[0], c[1]];
    }
}

// function findCityInfo(cityName, cityInfosIterator) {
//     for (let ci of cityInfosIterator) {
//         if (ci.cityName === cityName || ci.cityName + '市' === cityName || ci.cityName === cityName + '市') {
//             return ci;
//         }
//     }
// }

function findCityInfo(cityName, cityInfosIterator) {
    for (let ci of cityInfosIterator) {
        if (ci.name === cityName || ci.name + '市' === cityName || ci.name === cityName + '市') {
            return ci;
        }
    }
}

class VirusHeatMap {
    // constructor(earth) {
    /**
     * 创建VirusHeatMap
     * @param {*} earth 
     * @param { (updateTime: number, callback: (result: any) => void) => void } fetchCityInfosCallback 
     * @param {string} cityCoordsJsonPath
     */
    constructor(earth, fetchCityInfosCallback, cityCoordsJsonPath) {
        const heatMapJSPath = './static/XbsjEarth/thirdParty/heatmap/v2.0.5/heatmap.min.js';
        // const cityCoordsJsonPath = './static/test/cities.json';
        // const cityInfosJsonPath = './static/test/area.json';
        const cityInfosJsonPath = 'http://ncov.earthsdk.com/area';

        this._earth = earth;
        this._disposers = [];

        var loadHeatMapJS$ = rxjs.iif(
            () => (typeof h337 !== 'undefined'),
            rxjs.of(0),
            //XE.HTML.loadJS('http://localhost:9530/Apps/Examples/scripts/heatmap.js')
            XE.HTML.loadJS(heatMapJSPath)
        );

        this._h = undefined;
        this._disposers.push(() => {
            this._h = this._h && this._h.destroy();
        });
        
        this._h337i = undefined;
        this._disposers.push(() => {
            this._h337i = undefined;
        });

        let resolveFunc;
        this._readyPromise = new Promise(resolve => resolveFunc = () => resolve(true));
        this._loadingHeatMap = loadHeatMapJS$.subscribe(() => {
            this._h = createHeatMap(earth);
            this._h.show = this._show;

            this._h337i = h337.create({
                container: document.createElement('div'),
                //maxOpacity: 0.5,
                radius: 1.0,
                blur: 0.9,
                width: 512, // 必须设置宽高，否则h337的创建会有问题
                height: 256,
                // backgroundColor: 'rgba(0, 0, 58, 0.96)'
                backgroundColor: 'rgba(0, 0, 0, 0)'
            });

            resolveFunc();
            this._loadingHeatMap = undefined;
        });
        this._disposers.push(() => {
            if (this._loadingHeatMap) {
                this._loadingHeatMap.unsubscribe();
                this._loadingHeatMap = undefined;
            }
        });

        // const getCityInfos$ = rxjs.iif(
        //     () => (this._updateDate === ''),
        //     rxjs.fetch.fromFetch(cityInfosJsonPath),
        //     rxjs.fetch.fromFetch(cityInfosJsonPath + '?latest=0'),
        // ).pipe(
        //     rxjs.operators.switchMap(response => response.ok ? response.json() : of(undefined))
        // );
        // const fetchCityInfosCallbackWrap = callback => {
        //     this._debug && console.log('正在获取城市数据...');
        //     return fetchCityInfosCallback(this._updateTime, callback);
        // };
        // const getCityInfos$ = rxjs.bindCallback(fetchCityInfosCallbackWrap)().pipe(
        //     rxjs.operators.map(result => ({ data: result, isCityInfos: true })),
        // );
        const getCityInfos$ = rxjs.of(0).pipe(
            rxjs.operators.concatMap(() => {
                return rxjs.bindCallback(fetchCityInfosCallback)(this._updateTime);
            }),
            rxjs.operators.map(result => ({ data: result, isCityInfos: true })),
        );



        // const getCityCoords$ = rxjs.fetch.fromFetch(cityCoordsJsonPath).pipe(
        //     rxjs.operators.switchMap(response => response.ok ? response.json() : of(undefined))
        // );
        // 这种方式实际上只会请求一次
        const getCityCoords$ = rxjs.from(fetch(cityCoordsJsonPath).then(response => response.ok ? response.json() : undefined));

        var cityResults$ = rxjs.merge(getCityInfos$, getCityCoords$).pipe(
            rxjs.operators.toArray(),
            rxjs.operators.tap(() => this._debug && console.log('数据已加载！')),
            rxjs.operators.map(r => ({
                cityCoords: r[0] && r[0].isCityInfos && r[1] || r[0],
                cityInfos: r[0] && r[0].isCityInfos && r[0].data || (r[1] && r[1].data),
            }))
        );

        // this._updateDate = ''; // 为空字符串时，表示获取实时数据；否则获取历史数据
        this._updateTime = undefined;
        this._show = true;
        this._valueRange = [0, 50];
        this._realTimeInterval = 1000;
        this._debug = false;
        this._propChanged$ = new rxjs.Subject();

        var realTime$ = this._propChanged$.pipe(
            rxjs.operators.switchMap(() => {
                if (this.show) {
                    // if (this._updateDate === '') {
                    //     return rxjs.timer(0, this._realTimeInterval);
                    // } else {
                    //     return rxjs.of(0);
                    // }
                    return rxjs.of(0);
                } else {
                    return rxjs.EMPTY;
                }
            }),
            rxjs.operators.tap(() => this._debug && console.log('正在更新数据...')),
            rxjs.operators.concatMapTo(rxjs.from(this._readyPromise)),
            rxjs.operators.exhaustMap(() => cityResults$)
        );

        this._realTimeSubscription = realTime$.subscribe(({cityCoords, cityInfos}) => {
            if (!cityCoords || !cityInfos) {
                console.error('数据获取失败！');
                return;
            }

            var h337Data = createH337Data({
                rectangle: [70.2938, 11.7733, 150.1160, 49.9371], // 度数
                valueRange: this._valueRange, // 数量
                radius: 2.0,  // 度数
                width: 512, 
                height: 256, 
                cityCoords, 
                createCityCoordsIteratorFunc: createCityCoordsIterator,
                cityInfos,
                createCityInfosIteratorFunc: createCityInfosIterator,
                // updateDate: this._updateDate,
            });

            var h = this._h;
            var h337i = this._h337i;

            h337i.setData({
                min: 0,
                max: 1,
                data: h337Data,
            });

            // copyfromOtherCanvas函数可以直接拷贝别的canvas中的内容，前提是需要保证canvas尺寸一致！
            h.copyfromOtherCanvas(h337i._renderer.canvas);
        });

        this._disposers.push(() => {
            if (this._realTimeSubscription) {
                this._realTimeSubscription.unsubscribe();
                this._realTimeSubscription = undefined;
            }
        });

        this._propChanged$.next();
    }

    get show() {
        return this._show;
    }

    set show(val) {
        if (this._show !== val) {
            this._show = val;
            this._h && (this._h.show = val);
            this._propChanged$.next();
        }
    }

    get realTimeInterval() {
        return this._realTimeInterval;
    }

    set realTimeInterval(val) {
        if (this._realTimeInterval !== val) {
            this._realTimeInterval = val;
            this._propChanged$.next();
        }
    }

    setValueRange(minValue, maxValue) {
        this._valueRange = [minValue, maxValue];
        this._propChanged$.next();
    }

    getValueRange() {
        return [...this._valueRange];
    }

    // get updateDate() {
    //     return this._updateDate;
    // }

    // set updateDate(val) {
    //     // val为''时，表示实时
    //     if (this._updateDate !== val) {
    //         if ((val === '' || moment(val, "YYYY-MM-DD").isValid())) {
    //             this._updateDate = val;
    //             this._propChanged$.next();
    //         } else {
    //             console.error('时间设置错误！');
    //         }
    //     }
    // }

    get updateTime() {
        return this._updateTime;
    }

    set updateTime(val) {
        // val为''时，表示实时
        if (this._updateTime !== val) {
            this._updateTime = val;
            this._propChanged$.next();
        }
    }

    destroy() {
        this._disposers.reverse();
        this._disposers.forEach(d => d());
        this._disposers.length = 0;
    }
}

///////////////////////////////////////////////////////////////

// var vhm = new VirusHeatMap(uia.earth);

export default VirusHeatMap;
