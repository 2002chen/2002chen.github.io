# 小菜鸟带你飞

A responsive, animated landing page for an interactive Python learning website.

## GitHub Pages

This site is published from the `main` branch root.
# 小菜鸟带你飞

公开网站：<https://2002chen.github.io/python-learning-lab/>

## 动态课程平台配置

1. 在 Supabase 新建项目。
2. 在 SQL Editor 运行 `supabase-schema.sql`。
3. 运行 `seed-course.sql` 导入 8 章教程，以及每章 10 道选择题、10 道问答题、5 道动手题和 5 道小结题。
4. 可选运行 `seed-questions.sql`，导入独立闯关题库。
5. 将 Project URL 与 anon key 填入 `supabase-config.js`。
6. 注册第一个账号，并在 SQL Editor 将其设为管理员：

```sql
update public.profiles
set role = 'admin'
where id = '管理员用户 UUID';
```

教程、题目、用户进度、练习记录和留言均保存在 Supabase。RLS 策略保证普通用户只能访问自己的学习数据。
