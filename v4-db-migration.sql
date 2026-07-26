-- ============================================================
-- 小菜鸟带你飞 V4.0 数据库迁移
-- 在 Supabase SQL Editor 中执行此文件
-- ============================================================

-- 1. 插入 V4 场景课程（作为新的 course_chapters）
INSERT INTO public.course_chapters (title, subtitle, description, level, position, cover_icon, estimated_minutes, active)
VALUES 
  ('看懂并修改 AI 写的代码', '全程手机可完成', '从AI给出的代码入手，学会看懂和修改短代码', 'beginner', 101, '👀', 12, true),
  ('写出更好的提示词', '手机可完成', '学会用正确的提示词让 AI 生成你想要的代码', 'beginner', 102, '✍️', 10, true),
  ('自动整理文件夹', '原理手机可学；真整理建议电脑', '理解按扩展名分类文件的逻辑', 'beginner', 103, '📁', 10, true)
ON CONFLICT (position) DO NOTHING;

-- 2. 获取刚插入的 chapter ID（用于后续关联）
DO $$
DECLARE
  ch1_id BIGINT;
  ch2_id BIGINT;
  ch3_id BIGINT;
BEGIN
  SELECT id INTO ch1_id FROM public.course_chapters WHERE position = 101 LIMIT 1;
  SELECT id INTO ch2_id FROM public.course_chapters WHERE position = 102 LIMIT 1;
  SELECT id INTO ch3_id FROM public.course_chapters WHERE position = 103 LIMIT 1;

  -- 3. 插入 lesson-01 课程小节（作为 course_sections）
  IF ch1_id IS NOT NULL THEN
    INSERT INTO public.course_sections (chapter_id, title, summary, content_html, example_code, position, section_type, active)
    VALUES
      (ch1_id, '1.1 先说说痛点',
       '很多人会问AI写代码，但一报错就卡住——不是你笨，是缺看懂和改的练习。',
       '<p>很多人会问 AI：「帮我写个整理文件的代码。」AI 很快给出一堆英文和符号。能跑最好；一报错或结果不对，就卡住——不是你笨，是缺「看懂和改」的练习。</p>',
       '', 1, 'lesson', true),
      (ch1_id, '1.2 本节结果',
       '看懂下面这段短代码，并完成三道点选题。全程手机即可。',
       '<p>看懂下面这段「计数并打印」的短代码，并完成三道点选题。<strong>全程手机即可。</strong></p>',
       '', 2, 'lesson', true),
      (ch1_id, '1.3 短代码',
       '让电脑从0数到4，共5次；每次把数字乘以2再显示。',
       '<div class="lesson-plain-talk"><b>人话：</b>让电脑从0数到4，共5次；每次把数字乘以2再显示。你应看到 0 2 4 6 8。</div>',
       'for i in range(5):\n    print(i * 2)', 3, 'lesson', true),
      (ch1_id, '1.4 提示词卡',
       '好提示词：请用初中生能懂的话，逐行解释代码并告诉我屏幕上会依次出现什么。',
       '<p><b>差问法示例：</b>这段代码什么意思</p><p><b>好问法：</b>请用初中生能懂的话，逐行解释下面 Python 代码，并告诉我运行后屏幕上会依次出现什么：\n\nfor i in range(5):\n    print(i * 2)</p>',
       '', 4, 'lesson', true),
      (ch1_id, '1.5 练习',
       '三道点选题：读代码、读结果、会改代码。',
       '<p>3道点选练习题</p>',
       '', 5, 'lesson', true),
      (ch1_id, '1.6 小结',
       '你已经会：看range代表重复几次；看print在输出什么；知道需求变了可以改表达式。',
       '<ul><li>看 range 代表重复几次</li><li>看 print 在输出什么</li><li>知道需求变了可以改表达式或让AI只改一处</li></ul>',
       '', 6, 'lesson', true),
      (ch1_id, '1.7 电脑加强（可选）',
       '在电脑打开实验室运行同一段代码。手机用户可跳过，仍算完成主线。',
       '<p>在电脑打开代码实验室，运行同一段代码；再改成 print(i+1) 验证。</p>',
       '', 7, 'lesson', true)
    ON CONFLICT (chapter_id, position) DO NOTHING;
  END IF;

  -- 4. lesson-02 小节
  IF ch2_id IS NOT NULL THEN
    INSERT INTO public.course_sections (chapter_id, title, summary, content_html, example_code, position, section_type, active)
    VALUES
      (ch2_id, '2.1 先说说痛点',
       '同样问AI，结果差很多——区别在提示词。',
       '<p>同样是问 AI 整理文件，有的人一次就得到想要的代码，有的人反复改好几次——区别在哪？提示词。</p>',
       '', 1, 'lesson', true),
      (ch2_id, '2.2 好提示词模板',
       '好提示词 = 要做什么 + 文件类型 + 规则 + 输出要求 + 解释级别。',
       '<p>学会写好提示词的模板：<strong>要做什么 + 文件类型 + 规则 + 输出要求 + 解释级别</strong></p>',
       '', 2, 'lesson', true),
      (ch2_id, '2.3 对比',
       '差：帮我整理文件 | 好：请写Python代码，把下载文件夹里的文件按扩展名分类。',
       '<p><b>差问法：</b>帮我整理文件</p><p><b>好问法：</b>请写一段 Python 代码，把下载文件夹里的文件按扩展名分类：图片(.jpg/.png)放入 images 文件夹，PDF(.pdf)放入 docs 文件夹，其他放入 others 文件夹。每步加注释说明。</p>',
       '', 3, 'lesson', true),
      (ch2_id, '2.4 练习',
       '2道练习：选更好提示词，补全缺失条件。',
       '<p>2道点选练习题</p>',
       '', 4, 'lesson', true)
    ON CONFLICT (chapter_id, position) DO NOTHING;
  END IF;

  -- 5. lesson-03 小节
  IF ch3_id IS NOT NULL THEN
    INSERT INTO public.course_sections (chapter_id, title, summary, content_html, example_code, position, section_type, active)
    VALUES
      (ch3_id, '3.1 先说说痛点',
       '下载文件夹越来越乱，手动分类太烦。',
       '<p>下载文件夹越来越乱，截图、文档、安装包混在一起。手动分类一次可以，但每周都要来一次就很烦。</p>',
       '', 1, 'lesson', true),
      (ch3_id, '3.2 短代码',
       '用 .endswith() 检查后缀，if/elif 分类。',
       '<p>电脑检查每个文件的名字，看结尾是不是图片或文档。</p>',
       'files = ["a.jpg", "b.pdf", "c.png"]\nfor name in files:\n    if name.endswith(".jpg") or name.endswith(".png"):\n        print(name, "→ images")\n    elif name.endswith(".pdf"):\n        print(name, "→ docs")\n    else:\n        print(name, "→ others")', 2, 'lesson', true),
      (ch3_id, '3.3 练习',
       '2道练习：某后缀进哪类文件夹，如何扩展新文件类型。',
       '<p>2道点选练习题</p>',
       '', 3, 'lesson', true),
      (ch3_id, '3.4 电脑加强（⚠️先备份）',
       '在代码实验室运行真实分类。警告：操作真实目录前请备份文件。',
       '<p>用示例文件名列表演示分类。<strong>警告：</strong>真实目录操作前请先备份文件。</p>',
       '', 4, 'lesson', true)
    ON CONFLICT (chapter_id, position) DO NOTHING;
  END IF;
END;
$$;

-- 6. 插入 V4 场景练习题
INSERT INTO public.questions (level, topic, question_text, options, correct_index, explanation, position, active)
VALUES
  -- lesson-01
  ('beginner', 'lesson-01',
   '这段代码会让电脑重复几次？\n\nfor i in range(5):\n    print(i * 2)',
   '["2 次", "5 次", "10 次", "无限次"]', 1,
   'range(5) 产生 0,1,2,3,4 共 5 个数，所以重复 5 次。',
   1001, true),
  ('beginner', 'lesson-01',
   '第一次循环中，打印出来的数是多少？',
   '["1", "2", "0", "5"]', 2,
   '第一次循环 i=0，0×2=0，所以第一次打印 0。',
   1002, true),
  ('beginner', 'lesson-01',
   '若要变成打印 1 2 3 4 5（每个数比之前大 1），应改哪类地方？',
   '["把 range(5) 改成 range(100) 即可", "打印 i+1 而不是 i*2", "删掉 for", "只能重问 AI 整段"]', 1,
   '需求变了要改计算方式。你也可以用提示词说「请改成打印 1 到 5」。',
   1003, true),
  -- lesson-02
  ('beginner', 'lesson-02',
   '下面哪个提示词更可能得到你想要的代码？',
   '["帮我写个代码", "写一个 Python 脚本：读取当前文件夹下所有 .csv 文件，删除重复行，保存为 cleaned.csv"]', 1,
   '明确需求（读 .csv、去重、保存为 cleaned.csv）让 AI 一次给出正确代码。',
   1004, true),
  ('beginner', 'lesson-02',
   '提示词里缺少什么重要信息？\n\n「请整理我的下载文件夹」',
   '["缺少文件类型和分类规则", "缺少问候语", "缺少标点符号", "什么都不缺"]', 0,
   '好提示词要说明：什么文件、按什么规则分、结果放哪里。这里全都没说。',
   1005, true),
  -- lesson-03
  ('beginner', 'lesson-03',
   'report.pdf 应该放进哪个文件夹？',
   '["images", "docs", "others"]', 1,
   '.pdf 结尾的文件会被分到 docs 文件夹。',
   1006, true),
  ('beginner', 'lesson-03',
   '要增加对 .docx 文件的分类，应该在代码的哪里加条件？',
   '["在 if 之前", "在 elif 部分加一行", "在 for 循环外面", "在 print 语句里改"]', 1,
   '用 elif name.endswith(".docx"): 加在 elif name.endswith(".pdf") 之后，把 .docx 也分到 docs。',
   1007, true)
ON CONFLICT DO NOTHING;
