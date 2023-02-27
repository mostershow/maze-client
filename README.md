## 迷宫客户端

### 目录结构

```txt
├── css/                    // CORS & Web
├── fonts/                  // Message Struct
├── img/                    // Decoder & Encoder
├── js/                     // Server & Biz
├── proto/   
├── ws/                     // 长连接模块
│   ├── js/                 // 长连接逻辑        
│   └── pb/                 // proto
├── index.html              // 简单的入口界面
└── maze.html               // 迷宫界面
```

目前本地运行由于引用的文件都是本地的，所以浏览器会提示cors错误。
mac使用
````
sudo /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args -allow-file-access-from-files

````
打开google浏览器即可正常访问

对应服务端见：[maze-server](https://github.com/whrsss/maze-client)
