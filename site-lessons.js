/* 小菜鸟带你飞 V4 - 场景课程数据 */
window.SITE_LESSONS = [
  {
    id: 'lesson-01',
    title: '看懂并修改 AI 写的代码',
    duration_min: 12,
    device_main: 'mobile',
    goals: [
      '能说出一段短代码大概在干什么',
      '能指出一处明显问题或可改点',
      '会复制提示词，让 AI「逐行解释」或「只改一处」'
    ],
    steps: [
      {
        type: 'pain',
        content: '<p>很多人会问 AI：「帮我写个整理文件的代码。」AI 很快给出一堆英文和符号。能跑最好；一报错或结果不对，就卡住——不是你笨，是缺「看懂和改」的练习。</p>'
      },
      {
        type: 'result',
        content: '<p>看懂下面这段「计数并打印」的短代码，并完成三道点选题。<strong>全程手机即可。</strong></p>'
      },
      {
        type: 'code_block',
        lines: 'for i in range(5):\n    print(i * 2)',
        plain_talk: '让电脑从 0 数到 4，共 5 次；每次把数字乘以 2 再显示。你应看到 0 2 4 6 8（每行一个或空格分隔，视环境而定）。'
      },
      {
        type: 'prompt_card',
        bad: '这段代码什么意思',
        good: '请用初中生能懂的话，逐行解释下面 Python 代码，并告诉我运行后屏幕上会依次出现什么：\n\nfor i in range(5):\n    print(i * 2)',
        copy_label: '复制到 AI'
      },
      {
        type: 'quiz_inline',
        quiz_ids: ['q-lesson01-1', 'q-lesson01-2', 'q-lesson01-3']
      },
      {
        type: 'summary',
        content: '<p>你已经会：</p><ul><li>看 range 代表重复几次</li><li>看 print 在输出什么</li><li>知道需求变了可以改表达式或让 AI「只改一处」</li></ul>'
      },
      {
        type: 'computer_only',
        content: '<p><strong>电脑加强（可选）：</strong>在电脑打开<a href="lab.html">代码实验室</a>，运行同一段代码；再改成 <code>print(i+1)</code> 验证。手机用户可跳过，仍算完成主线。</p>'
      }
    ],
    quiz_ids: ['q-lesson01-1', 'q-lesson01-2', 'q-lesson01-3'],
    xp_reward: 10,
    badge: 'first_code_read',
    badge_label: '第一段代码'
  },
  {
    id: 'lesson-02',
    title: '写出更好的提示词',
    duration_min: 10,
    device_main: 'mobile',
    goals: ['能区分好提示词和差提示词', '会补全缺失的条件（文件类型、规则、结果）'],
    steps: [
      {
        type: 'pain',
        content: '<p>同样是问 AI 整理文件，有的人一次就得到想要的代码，有的人反复改好几次——区别在哪？提示词。</p>'
      },
      {
        type: 'result',
        content: '<p>学会写好提示词的模板：<strong>要做什么 + 文件类型 + 规则 + 输出要求 + 解释级别（可选）</strong></p>'
      },
      {
        type: 'prompt_card',
        bad: '帮我整理文件',
        good: '请写一段 Python 代码，把下载文件夹里的文件按扩展名分类：图片(.jpg/.png)放入 images 文件夹，PDF(.pdf)放入 docs 文件夹，其他放入 others 文件夹。每步加注释说明。',
        copy_label: '复制到 AI'
      },
      {
        type: 'quiz_inline',
        quiz_ids: ['q-lesson02-1', 'q-lesson02-2']
      },
      {
        type: 'summary',
        content: '<p>好的提示词 = 明确需求 + 具体条件 + 期望输出。下次问 AI 时，先写出这三点再发送。</p>'
      }
    ],
    quiz_ids: ['q-lesson02-1', 'q-lesson02-2'],
    xp_reward: 10,
    badge: 'prompt_starter',
    badge_label: '提示词新手'
  },
  {
    id: 'lesson-03',
    title: '自动整理文件夹',
    duration_min: 10,
    device_main: 'both',
    goals: ['理解按类型分类的逻辑', '能说出某后缀进哪类文件夹'],
    steps: [
      {
        type: 'pain',
        content: '<p>下载文件夹越来越乱，截图、文档、安装包混在一起。手动分类一次可以，但每周都要来一次就很烦。</p>'
      },
      {
        type: 'code_block',
        lines: 'files = ["a.jpg", "b.pdf", "c.png"]\nfor name in files:\n    if name.endswith(".jpg") or name.endswith(".png"):\n        print(name, "→ images")\n    elif name.endswith(".pdf"):\n        print(name, "→ docs")\n    else:\n        print(name, "→ others")',
        plain_talk: '电脑检查每个文件的名字，看结尾是不是 .jpg/.png（图片）或 .pdf（文档），然后告诉你它应该去哪个文件夹。'
      },
      {
        type: 'prompt_card',
        good: '请用 Python 写一段代码，把指定文件夹中的文件按扩展名分类到 images/docs/others 三个子文件夹中。每步加上中文注释说明做了什么。',
        copy_label: '复制到 AI'
      },
      {
        type: 'quiz_inline',
        quiz_ids: ['q-lesson03-1', 'q-lesson03-2']
      },
      {
        type: 'summary',
        content: '<p>用 <code>.endswith()</code> 检查文件后缀，配合 if/elif 就可以分类。真正的文件移动需要 <code>shutil.move()</code>，操作前记得备份。</p>'
      },
      {
        type: 'computer_only',
        content: '<p><strong>电脑加强：</strong>在代码实验室用示例文件名列表演示分类。<strong>警告：</strong>真实目录操作前请先备份文件。</p>'
      }
    ],
    quiz_ids: ['q-lesson03-1', 'q-lesson03-2'],
    xp_reward: 15,
    badge: 'file_sort_theory',
    badge_label: '文件整理理论家'
  }
];

/* V4 场景题（lesson-01 绑定） */
window.SCENE_QUESTIONS = [
  {
    id: 'q-lesson01-1',
    lesson_id: 'lesson-01',
    type: 'read_code',
    stem: '这段代码会让电脑重复几次？\n\nfor i in range(5):\n    print(i * 2)',
    options: ['2 次', '5 次', '10 次', '无限次'],
    correct_index: 1,
    explain: 'range(5) 产生 0,1,2,3,4 共 5 个数，所以重复 5 次。'
  },
  {
    id: 'q-lesson01-2',
    lesson_id: 'lesson-01',
    type: 'read_code',
    stem: '第一次循环中，打印出来的数是多少？',
    options: ['1', '2', '0', '5'],
    correct_index: 2,
    explain: '第一次循环 i=0，0×2=0，所以第一次打印 0。'
  },
  {
    id: 'q-lesson01-3',
    lesson_id: 'lesson-01',
    type: 'choose_fix',
    stem: '若要变成打印 1 2 3 4 5（每个数比之前大 1），应改哪类地方？',
    options: [
      '把 range(5) 改成 range(100) 即可',
      '打印 i+1 而不是 i*2',
      '删掉 for',
      '只能重问 AI 整段'
    ],
    correct_index: 1,
    explain: '需求变了要改计算方式。你也可以用提示词说「请改成打印 1 到 5」。'
  },
  {
    id: 'q-lesson02-1',
    lesson_id: 'lesson-02',
    type: 'better_prompt',
    stem: '下面哪个提示词更可能得到你想要的代码？',
    options: [
      '帮我写个代码',
      '写一个 Python 脚本：读取当前文件夹下所有 .csv 文件，删除重复行，保存为 cleaned.csv'
    ],
    correct_index: 1,
    explain: '明确需求（读 .csv、去重、保存为 cleaned.csv）让 AI 一次给出正确代码。'
  },
  {
    id: 'q-lesson02-2',
    lesson_id: 'lesson-02',
    type: 'scene_judge',
    stem: '提示词里缺少什么重要信息？\n\n「请整理我的下载文件夹」',
    options: ['缺少文件类型和分类规则', '缺少问候语', '缺少标点符号', '什么都不缺'],
    correct_index: 0,
    explain: '好提示词要说明：什么文件、按什么规则分、结果放哪里。这里全都没说。'
  },
  {
    id: 'q-lesson03-1',
    lesson_id: 'lesson-03',
    type: 'read_code',
    stem: 'report.pdf 应该放进哪个文件夹？',
    options: ['images', 'docs', 'others'],
    correct_index: 1,
    explain: '.pdf 结尾的文件会被分到 docs 文件夹。'
  },
  {
    id: 'q-lesson03-2',
    lesson_id: 'lesson-03',
    type: 'read_code',
    stem: '要增加对 .docx 文件的分类，应该在代码的哪里加条件？',
    options: ['在 if 之前', '在 elif 部分加一行', '在 for 循环外面', '在 print 语句里改'],
    correct_index: 1,
    explain: '用 elif name.endswith(".docx"): 加在 elif name.endswith(".pdf") 之后，把 .docx 也分到 docs。'
  }
];
