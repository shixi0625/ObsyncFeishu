# ObsyncFeishu
一个实现Obsidian与飞书多维表格之间数据双向同步的脚本

与区别于Obsidian官方的同步功能，这个脚本是把我们Obsidian库中指定的笔记数据和内容同步到飞书多维表格，或者把飞书多维表格数据库里的内容同步到Obsidian库中

以实现更好的数据使用和管理的目的，而不是单纯的文件同步
# 脚本功能
- [x] Obsidian与飞书多维表格之间数据的双向同步
![ObsyncFeishu_脚本功能_20240603_#功能框_1.png](https://shixi-rioto.oss-cn-shenzhen.aliyuncs.com/ObsyncFeishu_%E8%84%9A%E6%9C%AC%E5%8A%9F%E8%83%BD_20240603_%23%E5%8A%9F%E8%83%BD%E6%A1%86_1.png)
- [ ] 为指定文件夹单独设置同步表格、同步字段（暂未实现）
# 使用教程
- 获取飞书的appId、appSecret、appToken、tableID
	- 登录[飞书开放平台 (feishu.cn)](https://open.feishu.cn/app/) 创建一个企业自建应用
		- 点击左侧的"版本管理与发布"，发布版本
		- 点击左侧的“权限管理”，开通三个权限
			- 查看、评论、编辑和管理多维表格
			- 获取用户基本信息
			- 获取用户 user ID
		- 在凭证与基础信息这，你可以看到你的appId和appSecret
		- 创建一个飞书多维表格，建议直接使用我的模板：[ObsyncFeishu模板](https://q2ssq80kzt.feishu.cn/base/Y4JcbyaqmawV8tsJ4h2c6Kp5nkf?from=from_copylink)
		- 获取appToken：[接入指南 - 服务端 API - 开发文档 - 飞书开放平台 (feishu.cn)](https://open.feishu.cn/document/server-docs/docs/bitable-v1/notification)
		- 获取tableID：多维表格URL中 table=xxxxx&view，中的xxxxx部分即为tableID
- 运行本地代理服务器
	- 安装Node.js和Node包管理器（npm）
		- 访问Node.js官方网站：[Node.js](https://nodejs.org/)
		- 检查是否完成安装：在Windows上，按`Win + R`，输入`cmd`，然后按`Enter`。在CMD 窗口中依次输入`node -v`和`npm -v`，出现版本号就表示已安装
	- 在电脑任意位置创建一个文件夹`proxy-server`
		- 导航进入该文件夹，在CMD 窗口中依次输入`proxy-server文件夹所在磁盘`、`cd proxy-server文件夹路径`
	- 初始化项目
		- 在CMD 窗口中输入：`npm init -y`
	- 安装项目依赖
		- 在CMD 窗口中输入：`npm install express nodemon`
	- 安装`node-fetch`包
		- 在CMD 窗口中输入：`npm install node-fetch`
	- 安装`cors`包
		- 在CMD 窗口中输入：`npm install cors`
	- 在proxy-server文件夹下的`package.json`文件中添加代码
		- `"type": "module",`
	- 把proxy.js文件下载到`proxy-server`文件夹中
	- 输入`node proxy.js`运行代理服务器
		- 窗口出现`Proxy server running at http://localhost:3000`就表示代理服务器运行成功
		- 窗口就相当于是这个代理服务器，关闭窗口就把这个代理服务器关闭了
	- 之后需要启动代理服务器的话只需要导航到proxy-server文件夹，输入`node proxy.js`即可
		- **为了避免每次同步前都要手动打开代理服务器，可以创建Quicke动作，将两个步骤和为一个步骤**
			- 这是我创建的动作：[Quicker动作](https://getquicker.net/Sharedaction?code=9fd4c11f-480f-459f-b932-08dc83042634) （需要根据你自己的实际配置做些修改）
- 将配置文件ObSyncFeishu.js、My-TP-OBSyncFeishu.md导入到自己的Obsidian库中
	- My-TP-OBSyncFeishu.md文件放在Templater插件加载的文件夹下
	- Templater插件使用教程：[PKMer_Obsidian 插件：Templater 可以替代核心模板插件的效率神器](https://pkmer.cn/Pkmer-Docs/10-obsidian/obsidian%E7%A4%BE%E5%8C%BA%E6%8F%92%E4%BB%B6/templater/templater-obsidian/)
	- 在My-TP-OBSyncFeishu.md文件，填入自己的appId、appSecret、appToken、tableID
- 现在ObsyncFeishu脚本就能够正常运行了！
