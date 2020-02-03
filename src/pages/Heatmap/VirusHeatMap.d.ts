declare global {
    var XE: any;
    var Cesium: any;
    var rxjs: any;
    var h337: any;
}

export = VirusHeatMap;

declare class VirusHeatMap {
    constructor(
        earth: any, 
        fetchCityInfosCallback: (updateTime: number, callback: (result: any) => void) => void,
        cityCoordsJsonPath: string,
    );
    updateTime: number;
    show: boolean;
};
