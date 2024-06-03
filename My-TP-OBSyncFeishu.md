<%*
/*
** 这是你个人使用的飞书数据同步模板的设置文件模板。
*/

// 飞书同步设置
const feishuSettings = {
  appId: "替换成你的appId",
  appSecret: "替换成你的appSecret",
  appToken: "替换成你的appToken",
  tableID: "替换成你的tableID",
}

//把feishuSettings中的参数内容传递给ObSyncFeishu
await tp.user.ObSyncFeishu(tp, this.app, feishuSettings);

%>
