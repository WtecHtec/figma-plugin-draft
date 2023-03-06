class DaWebSocket {
  private websocket;
  private handles = [];
  private watchHanle = {};
  private times = 5;
  private timeout = 5000;
  constructor(url: string) {
    if (window.WebSocket) {
      this.handles = []
      this.init(url)
    } else {
      console.error('no websocket')
    }
  }
  init(url) {
    this.websocket = new window.WebSocket(url);
    this.websocket.addEventListener("close", (event) => {
      console.log('websocket 已关闭', event)
    });
    this.websocket.addEventListener("error", (event) => {
      console.log('websocket 连接错误', event)
      setTimeout( () => {
        this.times--
        if (this.times > 0) {
          console.log('重连---')
          this.init(url)
        }
      }, this.timeout)
      // handle close event
    });
    this.websocket.addEventListener("message", (event) => {
      console.log('websocket 接收数据', event)
      try {
        const data = JSON.parse(event.data) ;
        const { type } = data;
        this.handles.forEach(cb => cb(data))
        this.watchHanle[type] && this.watchHanle[type](data)
        setTimeout(()=> this.handles = [], 0)
      } catch (error) {
        console.error(' websocket  message 处理失败')
      }
    });
  }
  watch(name, callBack) {
    this.watchHanle[name] = callBack;
  }
  fetch(params, callBack) {
    this.websocket.send(params)
    this.handles.push(callBack)
  }
}

export default DaWebSocket;