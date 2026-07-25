# 小菜鸟带你飞

面向完全零基础学习者的 Python 教学平台。

公开网站：<https://2002chen.github.io/>

## 功能

- 游客可试学教程并使用浏览器 Python 实验室
- 登录后同步教程、答题、留言和学习中心数据
- 3000 题库支持筛选、搜索、练习、考试和错题重做
- 管理员可管理题库、课程章节和用户留言
- 管理员可发布站点公告，用户可在首页查看
- 管理员可查看访问量、独立访客、热门页面、访问趋势和学习活跃度
- 管理员回复留言后，用户可在学习中心消息通知中查看并标记已读
- 桌面端与移动端响应式界面、键盘访问和高对比度模式

## Supabase 配置

1. 在 Supabase SQL Editor 运行 `supabase-schema.sql`。
2. 运行 `seed-course.sql` 导入教程和章节练习。
3. 运行 `seed-3000-questions.sql` 导入独立题库。
4. 将 Project URL 与 anon key 填入 `supabase-config.js`。
5. 注册管理员账号，然后设置管理员角色：

```sql
update public.profiles
set role = 'admin'
where id = '管理员用户 UUID';
```

升级已有数据库时，也需要重新运行最新的 `supabase-schema.sql`，以创建题目讨论、个人资料头像、站点公告、访问统计和消息已读字段及对应 RLS 策略。已有线上项目可以只运行 `supabase-announcements-migration.sql`，它会一次性补齐公告、访问统计和消息通知所需结构。

## 本地预览

项目是静态网站，需通过本地 HTTP 服务打开；不要直接双击 HTML 文件，否则 Web Worker 无法正常运行。
