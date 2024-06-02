/*
** Script Name: OB Sync To Feishu
** Author: shixi
** Version: 1.0.0
*/

// 定义一个名为MyObsidian,主要负责处理Obsidian笔记与飞书之间的同步操作
class MyObsidian {
  // 构造函数，初始化类的属性
  constructor(tp, app, feishuSyncer) {
    this.tp = tp; // 模板引擎实例
    this.app = app; // Obsidian 应用实例
    this.vault = app.vault; // Obsidian 的 vault 实例
    this.activeFile = app.workspace.getActiveFile(); // 当前活动文件
    this.folder = this.activeFile.parent.path; // 当前文件所在的文件夹路径
    this.feishuSyncer = feishuSyncer; // 飞书同步器实例
  }

  // 同步到飞书的方法，fetchOnly 为 true 时只获取数据
  async syncWithFeishu(fetchOnly = false) {
    if (fetchOnly) {
      return await this.onlyFetchFromFeishu(); // 只从飞书获取数据
    } else {
      await this.twoWaySyncWithFeishu(); // 双向同步
    }
  }

  // 只从飞书获取数据的方法
  async onlyFetchFromFeishu() {
    // 如果需要，可以实现获取逻辑
  }

  // 双向同步的方法
  async twoWaySyncWithFeishu() {
    // 定义同步选项
    let actionChoices = [
      "【1】同步当前笔记到飞书",
      "【2】同步当前文件夹下的笔记到飞书",
      "【3】同步当前文件夹及子文件夹下的笔记到飞书",
      "【4】更新飞书数据到当前笔记",
      "【5】更新飞书数据到当前文件夹下的笔记",
      "【5】更新飞书数据到当前文件夹及子文件夹下的笔记",
    ];

    let actionOptions = [
      1,
      2,
      3,
      4,
      5,
      6,
    ];

    // 让用户选择同步选项
    let choice = await this.tp.system.suggester(actionChoices, actionOptions);

    // 根据用户选择执行相应的同步操作
    switch (choice) {
      case 1:
        await this.syncActiveFileToFeishu(); // 同步当前活动文件
        break;
      case 2:
        await this.syncFilesInCurrentFolderToFeishu(); // 同步当前文件夹下的文件
        break;
      case 3:
        await this.syncFilesInCurrentFolderAndSubFolderToFeishu(); // 同步当前文件夹及子文件夹下的文件
        break;
      case 4:
        await this.updateActiveFileFromFeishu(); // 更新飞书数据到当前笔记
        break;
      case 5:
        await this.updateFeishuFilesInFolder(); // 更新飞书数据到当前文件夹下的笔记
        break;
      case 6:
        await this.updateFeishuDataForFolderAndSubFolders(); // 更新飞书数据到当前文件夹及子文件夹下的笔记
        break;
      default:
    }
  }

  // 同步当前笔记到飞书
  async syncActiveFileToFeishu() {
    if (!this.hasActiveFile()) {
      return;
    }
    await this.feishuSyncer.syncFileToFeishu(this.activeFile); // 调用飞书同步器同步文件
  }

  // 同步当前文件夹下的文件到飞书
  async syncFilesInCurrentFolderToFeishu() {
    let files = await this.getAllFilesInCurrentFolder.bind(this)(); // 使用 bind 来绑定 this
    for (let file of files) {
      await this.feishuSyncer.syncFileToFeishu(file);
    }
  }

  // 同步当前文件夹及子文件夹下的文件到飞书
  async syncFilesInCurrentFolderAndSubFolderToFeishu() {
    // 获取当前文件夹及子文件夹下的所有文件
    let files = await this.getAllFilesInCurrentFolderAndSubFolder(this.folder);
    // 调用飞书同步器同步文件夹及子文件夹下的文件
    await this.feishuSyncer.syncFilesInFolderToFeishu(files);
  }

  // 更新飞书数据到当前笔记
  async updateActiveFileFromFeishu() {
    if (!this.hasActiveFile()) {
      return;
    }
    // 获取当前激活文件对应的recordId
    const recordId = await this.getFeishuRecordIdForActiveFile();
    if (recordId) {
      await this.feishuSyncer.updateNoteFromFeishuRecord(this.activeFile, recordId);
    } else {
      // 如果没有记录recordId，发出提示
      new this.tp.obsidian.Notice(`该笔记在飞书中没有记录：${this.activeFile.basename}\n请先同步笔记……`);
      console.log(`该笔记在飞书中没有记录: ${this.activeFile.path}`);
    }
  }

  // 更新飞书数据到当前文件夹下的笔记
  async updateFeishuFilesInFolder() {
    if (!this.hasActiveFile()) return;

    // 获取当前文件夹下的所有文件
    let files = await this.getAllFilesInCurrentFolder();

    // 遍历文件并更新
    for (let file of files) {
      // 创建 OBNote 实例
      const obNote = new OBNote(this.tp, this.app, file);

      // 检查笔记是否有飞书记录ID
      if (obNote.getNocodbRecordID()) {
        // 调用飞书同步器的 updateNoteFromFeishuRecord 方法更新笔记
        await this.feishuSyncer.updateNoteFromFeishuRecord(file, obNote.getNocodbRecordID());
      } else {
        // 如果没有记录recordId，发出提示
        new this.tp.obsidian.Notice(`该笔记在飞书中没有记录：${file.basename}\n请先同步笔记……`);
        console.log(`该笔记在飞书中没有记录: ${file.path}`);
      }
    }
  }

  // 更新飞书数据到当前文件夹及子文件夹下的笔记
  async updateFeishuDataForFolderAndSubFolders() {
    if (!this.hasActiveFile()) return;

    // 获取当前文件夹及子文件夹下的所有文件
    let files = await this.getAllFilesInCurrentFolderAndSubFolder();

    // 遍历文件并更新
    for (let file of files) {
      // 创建 OBNote 实例
      const obNote = new OBNote(this.tp, this.app, file);

      // 检查笔记是否有飞书记录ID
      if (obNote.getNocodbRecordID()) {
        // 调用飞书同步器的 updateNoteFromFeishuRecord 方法更新笔记
        await this.feishuSyncer.updateNoteFromFeishuRecord(file, obNote.getNocodbRecordID());
      } else {
        // 如果没有记录recordId，发出提示
        new this.tp.obsidian.Notice(`该笔记在飞书中没有记录：${file.basename}\n请先同步笔记……`);
        console.log(`该笔记在飞书中没有记录: ${file.path}`);
      }
    }
  }

  // 获取当前激活文件对应的飞书记录ID
  async getFeishuRecordIdForActiveFile() {
    if (!this.hasActiveFile()) {
      return null;
    }
    // 创建 OBNote 实例并获取前置元数据中的 recordId
    const obNote = new OBNote(this.tp, this.app, this.activeFile);
    return obNote.getNocodbRecordID(); // 使用 OBNote 类的现有方法获取 recordId
  }

  // 获取当前文件夹下的所有文件
  async getAllFilesInCurrentFolder() {
    if (!this.hasActiveFile()) {
      return;
    }
    let files = this.activeFile.parent.children; // 获取当前文件夹下的所有子文件
    return files.filter(file => file.extension === "md"); // 过滤出 Markdown 文件
  }

  // 获取当前文件夹及子文件夹下的所有文件
  async getAllFilesInCurrentFolderAndSubFolder(folder = this.folder) {
    let allMDFiles = await this.getAllMarkdownFilesInVault(); // 获取 vault 中的所有 Markdown 文件
    return allMDFiles.filter(file => file.path.startsWith(folder)); // 过滤出指定文件夹及其子文件夹下的文件
  }

  // 获取 vault 中的所有 Markdown 文件
  async getAllMarkdownFilesInVault() {
    if (!this.hasActiveFile()) {
      return;
    }

    return this.vault.getMarkdownFiles(); // 获取 vault 中的所有 Markdown 文件
  }

  // 检查是否有活动文件
  hasActiveFile() {
    if (!this.activeFile) {
      //obsidian中的弹窗提示
      new this.tp.obsidian.Notice("你必须打开一个笔记再运行此命令！！"); // 提示用户必须打开一个笔记
      return false;
    } else {
      return true;
    }
  }
}

// 定义一个名为OBNote的类，主要功能是封装Obsidian笔记的元数据和内容
class OBNote {
  // 构造函数，初始化类的属性
  constructor(tp, app, file) {
    // 初始化第三方插件平台实例、Obsidian应用实例和当前文件
    this.tp = tp; // 模板引擎实例
    this.app = app; // Obsidian 应用实例
    this.file = file; // 当前文件

    // 初始化笔记的标题、文件夹路径、仓库名称、前置元数据、创建和更新时间
    this.title = file.basename; // 文件名
    this.folder = file.parent.path; // 文件所在的文件夹路径
    this.vault = file.vault.getName(); // vault 名称
    this.frontmatter = app.metadataCache.getFileCache(file)?.frontmatter; // 文件的 frontmatter
    this.createTime = moment(new Date(file.stat.ctime)).format("YYYY-MM-DD HH:mm"); // 文件的创建时间
    this.updateTime = moment(new Date(file.stat.mtime)).format("YYYY-MM-DD HH:mm"); // 文件的最后更新时间

    // 初始化笔记的缓存、别名和标签
    this.cache = app.metadataCache.getFileCache(file); // 文件的缓存
    this.aliases = this.cache?.frontmatter?.aliases || [];
    this.tags = this.cache ? this.getDocumentPropertyTags(this.cache) : [];
    this.tags = this.tags.map(tag => tag.replace("#", "")).filter((value, index, self) => self.indexOf(value) === index);

    // 初始化YAML处理器
    this.yamlCooker = new YAMLCooker(tp);
  }

  // 从文档属性中获取tags
  getDocumentPropertyTags(cache) {
    // 从 cache.frontmatter 中获取标签数组
    let tagsFromFrontmatter = cache?.frontmatter?.tags || [];

    // 如果 tagsFromFrontmatter 已经是一个数组，则直接返回；如果不是数组，尝试使用 Object.keys() 将其转换为数组
    return Array.isArray(tagsFromFrontmatter) ? tagsFromFrontmatter : Object.keys(tagsFromFrontmatter);
  }

  // 获取笔记中的recordId
  getNocodbRecordID() {
    return this.frontmatter && "recordId" in this.frontmatter ? this.frontmatter.recordId : false;
  }


  // 获取前置元数据的字符串形式
  getFrontmatterAsString() {
    if (!this.frontmatter) {
      return '';
    }
    // 使用 YAMLCooker 将前置元数据对象转换为 YAML 字符串
    return this.yamlCooker.dumpsFm(this.frontmatter);
  }

  // 准备笔记内容的方法，移除前置元数据部分
  async prepareNoteContent() {
    let noteContent = await this.app.vault.read(this.file); // 读取文件内容
    this.content = this.removeFrontMatterFromContent(noteContent); // 移除 frontmatter
  }

  // 移除 frontmatter 的方法
  removeFrontMatterFromContent(content) {
    let docArray = content.split("\n");
    for (let [index, line] of docArray.entries()) {
      if (index !== 0 && line === "---") {
        return docArray.slice(index + 1).join("\n").trim();
      }
    }
    return content;
  }

  // 更新前置元数据并保存笔记
  async updateFrontmatterAndSave(record, newFrontmatter) {

    //合并frontmatter
    this.frontmatter = { ...this.frontmatter, ...newFrontmatter };

    // 准备新的笔记内容，包括前置元数据和正文内容
    const newContent = `${this.yamlCooker.dumpsFm(this.frontmatter)}${record.fields.Content}`;

    // 使用 Obsidian API 保存笔记
    await this.app.vault.modify(this.file, newContent);

  }
}

//定义一个名为YAMLCooker的类，提供了一系列处理 YAML frontmatter 的方法，包括解析、序列化、排序和特殊格式处理。
class YAMLCooker {
  constructor(tp) {
    this.tp = tp;// 初始化第三方插件平台实例
    this.forceQuotesProperties = ["defaultTemplate"];// 定义需要被强制引用的属性列表
  }

  // 序列化字典到YAML frontmatter字符串
  dumpsFm(fmDict, sort = false) {
    let sortedFmDict = sort ? this.sortFmDict(fmDict) : fmDict;
    let fmText = Object.entries(sortedFmDict).map(([key, value]) => key + ": " + this.makeFmValue(value)).join("\n");
    fmText = fmText ? "---\n" + fmText + "\n---\n" : "";
    return fmText;
  }

  // 对fmDict进行排序
  sortFmDict(fmDict) {
    const sortedDict = Object.keys(fmDict)
      .sort()
      .reduce((accumulator, key) => {
        accumulator[key] = fmDict[key];
        return accumulator;
      }, {})
    return sortedDict;
  }

  // 创建YAML frontmatter的值
  makeFmValue(value) {
    if (value instanceof Array) {
      // 数组类型的值需要特殊处理
      return "\n" + value.map(item => {
        // 确保每个 item 是字符串
        let text = typeof item === 'string' ? item : '';
        return "- " + this.addQuotesForOBLink(text);
      }).join("\n");
    } else if (typeof value === "string") {
      // 字符串类型的值需要添加引号
      return this.addQuotesForOBLink(value);
    } else if (typeof value !== "undefined") {
      // 其他类型的值直接返回
      return value;
    } else {
      return "";
    }
  }

  // 为Obsidian链接添加引号
  addQuotesForOBLink(text) {
    if (text.includes("[[") && text.includes("]]")) {
      return text.replace(/\[\[/g, '"[[').replace(/\]\]/g, ']]"');
    } else {
      return text;
    }
  }
}

// 定义一个名为 FeishuSync 的类，用于处理Obsidian与飞书之间同步的逻辑的核心类，确保Obsidian笔记与飞书之间的数据保持一致
class FeishuSync {
  // 构造函数，初始化类的属性。
  constructor(feishuSettings, tp, app) {
    this.feishuSettings = feishuSettings; // 存储飞书相关的设置信息。
    this.tp = tp; // 第三方插件平台实例。
    this.app = app; // Obsidian 应用实例。
    this.vault = app.vault; // 用于操作文件的Obsidian仓库对象
    this.obNote = null;// 添加一个属性来存储 OBNote 实例
    this.apiUrlBase = `https://open.feishu.cn/open-apis/bitable/v1/apps/${this.feishuSettings.appToken}/tables/${this.feishuSettings.tableID}/records`;
  }

  // 辅助函数，用于从文件夹路径，并转换为数组
  getFolderNames(folderPath) {
    // 示例：将 "MyIOTO/1-输入-电商运营/测试笔记1" 转换为 ["MyIOTO", "1-输入-电商运营", "测试笔记1"]
    return folderPath.split('/').map(part => part.trim()).filter(part => part.length > 0);
  }

  // 辅助函数，用于将日期转换为 Unix 时间戳
  dateToTimestamp(dateString) {
    // 将日期字符串转换为 Date 对象，然后转换为 Unix 时间戳
    return new Date(dateString).getTime();
  }

  // 配置需要同步到飞书中的字段内容
  prepareFeishuRecordData(file, note) {
    const obNote = new OBNote(this.tp, this.app, file); // 创建 OBNote 实例
    const frontmatterString = obNote.getFrontmatterAsString(); // 获取前置元数据字符串

    return {
      fields: {

        Title: file.basename,           //文件名
        Frontmatter: frontmatterString, // 将前置元数据字符串写入飞书的 Frontmatter 字段
        Content: note.content,          //笔记内容，不包含frontmatter
        CreatedTime: this.dateToTimestamp(note.createTime),
        UpdatedTime: this.dateToTimestamp(note.updateTime), // 转换为 Unix 时间戳的最新更新时间
        Folder: this.getFolderNames(note.folder), // 笔记的文件路径
        Value: note.vault, // 文件所在Obsidian库
        Tags: note.tags,   // frontmatter中的tags
        aliases: note.aliases.map(alias => alias.replace("#", "")), // 将 aliases 转换为飞书多选字段需要的格式

      },
    };
  }

  // 通过代理服务器发送API请求
  async proxyServer(url, options) {

    // 代理服务器地址
    let proxyUrl = 'http://localhost:3000/proxy';

    // 发送请求到代理服务器。
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ url: url, options: options }),
    });
    return await response.json();
  }

  // 获取最新的app_access_token
  async getNewApiKey() {
    const body = JSON.stringify({
      app_id: this.feishuSettings.appId, // 飞书应用的 ID。
      app_secret: this.feishuSettings.appSecret, // 飞书应用的密钥。
    });

    // 构造请求飞书 API 的 URL 和选项。
    const apiUrl = 'https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal/';

    let options = {
      method: 'POST', // 请求方法。
      headers: {
        "Content-Type": "application/json"
      }, // 请求头。
      body: body // 请求体。
    };

    // 通过代理发送请求。
    const proxyServerdataData = await this.proxyServer(apiUrl, options);
    return proxyServerdataData.app_access_token;
  }

  // 同步单个文件到飞书的方法。
  async syncFileToFeishu(file) {
    const apiKey = await this.getNewApiKey(); // 获取 API 密钥。
    const note = new OBNote(this.tp, this.app, file); // 创建 OBNote 实例。
    await note.prepareNoteContent(); // 准备笔记内容。
    const recordId = note.frontmatter?.recordId; // 获取前置元数据中的 recordId。
    this.obNote = new OBNote(this.tp, this.app, file);// 创建 OBNote 实例并存储到 this.obNote
    const recordExists = false; // 标记记录是否存在。

    if (recordId) { // 如果存在 recordId
      const recordExists = await this.checkRecordExists(recordId, apiKey); // 检查记录是否存在。
      if (recordExists) { // 如果飞书存在该recordId，则直接更新记录
        await this.updateRecordInFeishu(file, note, apiKey);
      } else {// 如果飞书不存在该recordId，则先创建记录，再更新Obsidian笔记
        const record = await this.createRecordsTOfeishu(file, note, apiKey);
        await this.updateNoteToObsidian(file, record);
      }
    } else {// 如果不存在 recordId，则先创建记录，再更新Obsidian笔记
      const record = await this.createRecordsTOfeishu(file, note, apiKey);
      await this.updateNoteToObsidian(file, record);
    }
  }

  // 同步当前文件夹及子文件夹下的文件到飞书的方法
  async syncFilesInFolderToFeishu(files) {
    for (let file of files) {
      await this.syncFileToFeishu(file);
    }
  }

  // 从飞书获取记录更新到当前Obsidian笔记中
  async updateNoteFromFeishuRecord(file, recordId) {
    //obsidian中的弹窗提示
    new this.tp.obsidian.Notice(`正在更新笔记：${file.basename}\n记录写入Obsidian中，请稍候……`);
    // 根据recordId从飞书获取记录的方法
    const record = await this.getFeishuRecord(recordId);
    if (record) {
      // 创建 OBNote 实例并赋值给 this.obNote
      this.obNote = new OBNote(this.tp, this.app, file);
      // 使用获取的记录更新Obsidian笔记
      await this.updateNoteToObsidian(file, record)
    }
  }

  // 根据recordId从飞书获取记录的方法
  async getFeishuRecord(recordId) {
    const apiKey = await this.getNewApiKey(); // 获取 API 密钥
    const apiUrl = `${this.apiUrlBase}/${recordId}`; // 构造请求 URL

    let options = {
      method: 'GET', // 请求方法
      headers: {
        Authorization: `Bearer ${apiKey}`, // 认证信息
      },
    };

    try {
      // 使用 proxyServer 发送请求
      const response = await this.proxyServer(apiUrl, options);
      return response.data.record; // 返回飞书记录对象
    } catch (error) {
      console.error("Error fetching Feishu record: ", error);
      throw error; // 出现错误时抛出异常
    }
  }

  // 根据recordId检查记录是否存在于飞书
  async checkRecordExists(recordId, apiKey) {
    const apiUrl = `${this.apiUrlBase}/${recordId}`; // 构造请求 URL。

    let options = {
      method: 'GET', // 请求方法。
      headers: {
        Authorization: `Bearer ${apiKey}`, // 认证信息。
      }
    };

    const proxyUrl = 'http://localhost:3000/proxy'; // 代理服务器地址。

    try {
      // 发送请求到飞书检查记录是否存在。
      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ url: apiUrl, options: options })
      });

      const data = await response.json();
      // 检查返回的数据中是否有对应的 recordId
      const recordExists = data.data.record.record_id === recordId;
      return recordExists; // 返回检查结果。
    } catch (error) {
    }
  }

  //创建飞书记录,并返回record
  async createRecordsTOfeishu(file, note, apiKey) {
    //obsidian中的弹窗提示
    new this.tp.obsidian.Notice(`正在同步笔记：${file.basename}\n记录创建中，请稍候……`);
    const apiUrl = `${this.apiUrlBase}`;

    // 使用准备数据的函数
    let data = this.prepareFeishuRecordData(file, note);

    let options = {
      method: 'POST', // 请求方法。
      headers: {
        Authorization: `Bearer ${apiKey}`, // 认证信息。
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data) // 请求体。
    };

    // 使用 proxyServer 发送请求
    const proxyServerdata = await this.proxyServer(apiUrl, options);

    const record = proxyServerdata.data.record;
    return record; // 返回recordId

  }

  //更新飞书记录
  async updateRecordInFeishu(file, note, apiKey) {
    //obsidian中的弹窗提示
    new this.tp.obsidian.Notice(`正在更新记录：${file.basename}\n记录更新中，请稍候……`);
    const apiUrl = `${this.apiUrlBase}/${note.frontmatter?.recordId}`;

    let data = this.prepareFeishuRecordData(file, note); // 使用准备数据的函数

    let options = {
      method: 'PUT', // 请求方法。
      headers: {
        Authorization: `Bearer ${apiKey}`, // 认证信息。
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data) // 请求体。
    };

    // 使用 proxyServer 发送请求
    const proxyServerdata = await this.proxyServer(apiUrl, options);
  }

  //配置需要更新到Obsidian笔记中frontmatter的字段内容
  async updateNoteToObsidian(file, record) {

    // 获取飞书中的字段内容，放入笔记的前置元数据
    let newFrontmatter = {

      recordId: record.record_id,
      tags: record.fields.Tags,
      aliases: record.fields.aliases,

    };

    if (!this.obNote) {
      // 如果 this.obNote 未初始化，使用当前文件创建一个 OBNote 实例
      this.obNote = new OBNote(this.tp, this.app, file);
    }
    // 确保 obNote 实例存在
    if (this.obNote) {
      await this.obNote.updateFrontmatterAndSave(record, newFrontmatter);
    } else {
      console.error("OBNote 实例未初始化");
    }
  }
}

//同步到飞书的主函数
async function obSyncFeishu(tp, app, feishuSettings, fetchOnly = false) {
  let feishuSync = new FeishuSync(feishuSettings, tp, app);
  let myObsidian = new MyObsidian(tp, app, feishuSync);
  return await myObsidian.syncWithFeishu(fetchOnly);
}

// 导出主函数
module.exports = obSyncFeishu;
