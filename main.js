"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
function createWindow() {
    // 创建浏览器窗口
    var win = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            nodeIntegrationInWorker: true,
        }
    });
    // 并且为你的应用加载index.html
    win.loadFile('index.html');
    // 打开开发者工具
    win.webContents.openDevTools();
}
// Electron会在初始化完成并且准备好创建浏览器窗口时调用这个方法
// 部分 API 在 ready 事件触发后才能使用。
electron_1.app.whenReady().then(createWindow);
//当所有窗口都被关闭后退出
electron_1.app.on('window-all-closed', function () {
    // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
    // 否则绝大部分应用及其菜单栏会保持激活。
    if (process.platform !== 'darwin') {
        electron_1.app.quit();
    }
});
electron_1.app.on('activate', function () {
    // 在macOS上，当单击dock图标并且没有其他窗口打开时，
    // 通常在应用程序中重新创建一个窗口。
    if (electron_1.BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEscUNBQTRDO0FBRTVDLFNBQVMsWUFBWTtJQUNqQixVQUFVO0lBQ1YsSUFBTSxHQUFHLEdBQUcsSUFBSSx3QkFBYSxDQUFDO1FBQzVCLEtBQUssRUFBRSxHQUFHO1FBQ1YsTUFBTSxFQUFFLEdBQUc7UUFDWCxjQUFjLEVBQUU7WUFDZCxlQUFlLEVBQUUsSUFBSTtZQUNyQix1QkFBdUIsRUFBQyxJQUFJO1NBQzdCO0tBQ0YsQ0FBQyxDQUFBO0lBRUYsc0JBQXNCO0lBQ3RCLEdBQUcsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLENBQUE7SUFFMUIsVUFBVTtJQUNWLEdBQUcsQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLENBQUE7QUFDaEMsQ0FBQztBQUVELHFDQUFxQztBQUNyQyw0QkFBNEI7QUFDNUIsY0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQTtBQUVsQyxjQUFjO0FBQ2QsY0FBRyxDQUFDLEVBQUUsQ0FBQyxtQkFBbUIsRUFBRTtJQUMxQixpQ0FBaUM7SUFDakMsc0JBQXNCO0lBQ3RCLElBQUksT0FBTyxDQUFDLFFBQVEsS0FBSyxRQUFRLEVBQUU7UUFDakMsY0FBRyxDQUFDLElBQUksRUFBRSxDQUFBO0tBQ1g7QUFDSCxDQUFDLENBQUMsQ0FBQTtBQUVGLGNBQUcsQ0FBQyxFQUFFLENBQUMsVUFBVSxFQUFFO0lBQ2pCLGdDQUFnQztJQUNoQyxvQkFBb0I7SUFDcEIsSUFBSSx3QkFBYSxDQUFDLGFBQWEsRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7UUFDOUMsWUFBWSxFQUFFLENBQUE7S0FDZjtBQUNILENBQUMsQ0FBQyxDQUFBIn0=