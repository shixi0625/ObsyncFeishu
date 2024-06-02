import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors'; // 保留这个导入

const app = express();
const port = 3000;

// 使用 CORS 中间件
app.use(cors());

app.use(express.json());

// 处理预检请求
app.options('*', cors());

app.post('/proxy', async (req, res) => {
  const { url, options } = req.body;

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    console.log(`Response data: ${JSON.stringify(data)}`);
    res.json(data);
  } catch (error) {
    console.error('Error during fetch:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});