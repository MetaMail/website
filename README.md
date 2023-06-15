# MetaMail Website

This is the frontend project of [MetaMail](https://metamail.ink) which based on Next.js.

## Getting Started

First, install dependencies.

```bash
npm install
# or
yarn install
```

Then, start local development.

```bash
npm run dev
# or
yarn dev
```

There you go. Check [localhost:8000](http://localhost:8000).


Deploy to server.
```bash
npm run build
# or
yarn build
```
Then generate **out** folder in root directory. put it on the server as static html

---

```bash
.
├── assets # 资源 - img & icon
├── components # 所有组件
├── context # 全局上下文 用于共享公共函数或变量
├── hooks # 自定义hooks
├── lib # 逻辑库
├───── base # 基础类库
├───── constants # 常量 - 不变的 & 配置性的
├───── http # 业务http请求
├───── session-storage # 本地存储 - sessionStorage
├───── utils # 工具函数集
├───── sign # 签名
├───── zustand-store # 状态管理 - zustand
├── pages # 页面
├── public # 公共资源
├── styles # 样式
├── .prettierrc # 代码格式化风格配置
├── next-env.d.ts # 环境配置
├── next.config.js # 工程配置
├── package.json # 依赖包
├── postcss.config.js # postcss配置文件
├── README.md # 工程介绍
├── tailwind.config.js # tailwindcss 配置文件
├── tsconfig.json # typescript配置文件
└── yarn.lock # 锁文件 - yarn
```
