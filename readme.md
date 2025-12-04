# 一.搭建modern.js脚手架和链接大模型接口

### 1.本地缓存实现

本地缓存使用indexDB，实现数据的持续性存储以及离线存储

### 2.前端页面的实现

##### （1）实现和AI交互的对话框

![img](https://ai.feishu.cn/space/api/box/stream/download/asynccode/?code=MDE3ZDNlMDlmNWUxMzcwNmNiNTRiZWEzMWZlZWMzMGVfRmdIcnBUSW1UdXh1eGZ3emlwSXROTDh5SGE1Z0cxNlpfVG9rZW46U015R2JiZFZub083bWJ4eHZkS2NMWTcxbm5kXzE3NjQxNjcxNzQ6MTc2NDE3MDc3NF9WNA)

##### （2）实现markdown文档的实现

1.基于react的原生的markdown的处理

![img](https://ai.feishu.cn/space/api/box/stream/download/asynccode/?code=OTRlYTdmNDZiZTE1ZDdkNmE3ZDIxYzgwOWM5MDRiNTZfR1RKZTR4YklkV25yNUZKTm45TGhYbXBWYzU2ZFN3bDlfVG9rZW46T2oyWmJMN1Bob3ByMnB4VXdJNGNQYTF3bndkXzE3NjQxNjY4MDc6MTc2NDE3MDQwN19WNA)

##### （3）实现sse数据的流式返回接收

1.通过后端配置/api/stream流式接口（开启streaming配置）

![img](https://ai.feishu.cn/space/api/box/stream/download/asynccode/?code=NmRlYTE4M2JkZmMyMzc4MTNjZTFkMzA1NzA3MTg3OGNfSTRseWE4MUlvd3ZqaGx1R1ZpaTlicFBFU2dzOGY1bWJfVG9rZW46WjVBcWJBdjM1b21yVHp4V1B3a2NiUnFsbmJkXzE3NjQxNjY4NDk6MTc2NDE3MDQ0OV9WNA)

2.前端创建websoker接收后端放回数据（在后端调用大模型放回数据到前端）

![img](https://ai.feishu.cn/space/api/box/stream/download/asynccode/?code=MzNiZDRmNDRjZTQ0NzI3MDM0OTZlOGI2YjdlNDc3YWFfajAzWDJUdThWNHY4QWJlTnpkM09WQnBodE1lYTRyVWVfVG9rZW46SzNOc2JKOENrb2oxU3l4dkVtZGNwS2VZbnlrXzE3NjQxNjY4NDk6MTc2NDE3MDQ0OV9WNA)

# 二.后端搭建

### 1.调用大模型接口

得到模型放回的数据，同时调用后端接口，在服务器持久性存储数据

#### 2.在本地端使用node.js加mongodb

存储对话数据，实现上下文的判断

#### 3.通过前端按钮控制大模型实现联网操作

1.根据是否联网选择工具

![img](https://ai.feishu.cn/space/api/box/stream/download/asynccode/?code=NzA0NDNkOWZjY2YyOTg0NWY4NTI3ODE5MTc2MzMwN2FfYjFHdHY1NkVMaWxxZGlyWmRNaWhDZzNvcTZuRVNGc2ZfVG9rZW46S0VMVGJIbXVwb1Jud0t4VGlUUWNkWFl6bkpiXzE3NjQxNjY4NDk6MTc2NDE3MDQ0OV9WNA)

2.创建ReAct Agent（核心：让模型学会思考和使用工具）

![img](https://ai.feishu.cn/space/api/box/stream/download/asynccode/?code=NjdjMTI0YmZmMmFiYmQ1OWQzNTkxYTg0ZjE1OWFkNzZfZ0VudzFBb08ybFR3SWtMV2QxZ0JyWnBHS203cmJMdVlfVG9rZW46Q1dncGJ4WTJnbzlURE54MDZIdWM5Ym5jbjhiXzE3NjQxNjY4NDk6MTc2NDE3MDQ0OV9WNA)

3.创建Agent执行器

![img](https://ai.feishu.cn/space/api/box/stream/download/asynccode/?code=OTk4MjkyN2NlZjNmNWM4ZDNmNDFiYTAzN2EyZmE4NzFfWEpNc3YwT0RoTmVuYkUzZVZwZnlZU1dLUHF4UGp5RTRfVG9rZW46UVFINmJBdTVEb3pBZ2J4c2tlSGNvdnYzbmRlXzE3NjQxNjY4NDk6MTc2NDE3MDQ0OV9WNA)

4.调用模型

![img](https://ai.feishu.cn/space/api/box/stream/download/asynccode/?code=YjY0MzEyZjYwYzI2NTJhMGZkMDRmZjNmZmJlMGM0ODFfRXF4WWthbURMbWc0ZWhlbEtjSmpmVFE2MGw1QkcxdnFfVG9rZW46QlNxd2J0ZHd3b3JkbjV4aWNLb2Nnc1pSbmhlXzE3NjQxNjY4NDk6MTc2NDE3MDQ0OV9WNA)

# 三.项目实现处理问题

### 1.对于langchain包新旧版本不同

新版本：

![img](https://ai.feishu.cn/space/api/box/stream/download/asynccode/?code=ZGVkYTQ4MzRlZWExNjY4ZjQyY2Y0NDBiYzQ5NjIzN2VfbnJ6b3k3UWRwUWN3ejhyUXAySHY0OXI1TUpYaHA3aHBfVG9rZW46Qk1IR2JqbG9Yb3l1aFR4cE9VemNONzZVbkJoXzE3NjQxNjY4NDk6MTc2NDE3MDQ0OV9WNA)

旧版本：

![img](https://ai.feishu.cn/space/api/box/stream/download/asynccode/?code=NmI3ODRiMGRkYWFkMzBlZjA3MTY1ZDQ3Y2ZiZTgxOWFfeGdxMEtQU3hHVFNKR3RtWTl2aEZkWG1qcHpDbjdleFdfVG9rZW46SzNCSGJMQlNJb1J4YjZ4S0JGUmNZRGI2bk9oXzE3NjQxNjY4NDk6MTc2NDE3MDQ0OV9WNA)

### 2.关于连接大模型的路径配置不同

openAi的路径配置（注意baseURL的配置）：

![img](https://ai.feishu.cn/space/api/box/stream/download/asynccode/?code=ZGI0Nzk4YjJjY2M2MjY5MDdlNzNlNzc3YWJhZWEzOGRfVG1xTlNVQ3NTclI4QXZtN3ZacjhRTUJQMWRNZDdaaURfVG9rZW46WHJEQWI4VW45b2diM2p4b0I0WmNKdUdnbkZkXzE3NjQxNjY4NDk6MTc2NDE3MDQ0OV9WNA)

