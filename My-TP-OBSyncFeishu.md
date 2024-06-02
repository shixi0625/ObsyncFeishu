<%*
/*
** 这是你个人使用的飞书数据同步模板的设置文件模板。
*/

// 飞书同步设置
const feishuSettings = {
  appId: "cli_a6def2f27262d00c",
  appSecret: "DkzLF8S0SqHhdZ9nbppBCfgFv3kNhjzE",
  appToken: "QlRjbXqMtak2BAsTgLMcmknjneh",
  tableID: "tblPc05bn821bRET",
}

const customFields = {
  appId: "cli_a6def2f27262d00c",
  appSecret: "DkzLF8S0SqHhdZ9nbppBCfgFv3kNhjzE",
  appToken: "QlRjbXqMtak2BAsTgLMcmknjneh",
  tableID: "tblPc05bn821bRET",
}

//把feishuSettings中的参数内容传递给ObSyncFeishu
await tp.user.ObSyncFeishu(tp, this.app, feishuSettings);

%>