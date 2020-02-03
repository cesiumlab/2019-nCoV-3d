export {} // 这个必须有，将文件转化为模块
 
declare global {
  interface Window {
    g_heatMap: any,
  }
}
