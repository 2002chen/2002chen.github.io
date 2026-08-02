(function () {
  'use strict';

  const lessons = [
    {
      id: 'mobile-lesson-01',
      module: '第一站 · 手机上手',
      module_short: '手机上手',
      title: '先认识这堂课怎么学',
      duration_min: 5,
      cover: 'assets/course/start-on-phone.webp',
      cover_alt: '学习者在手机上开始第一节 Python 实战课',
      intro: '不用先背单词，也不用安装软件。每一屏只做一个动作：先猜、再点、看结果。',
      result: '你会亲手运行第一段代码，并知道屏幕为什么会出现一句话。',
      choice: {
        question: '零基础用手机学代码，哪种顺序更轻松？',
        options: ['先背完所有语法，再开始操作', '先猜结果，点一下运行，再看解释', '先复制一大段代码，出错再说'],
        correct: 1,
        explain: '先做一个很小的动作，马上看到结果，更容易建立信心。'
      },
      code: {
        title: '点一个内容，再运行',
        lead: '你不用输入代码，只要选择想显示的话。',
        variants: [
          { label: '你好，Python', code: 'print("你好，Python")', output: '你好，Python' },
          { label: '今天学 5 分钟', code: 'print("今天学 5 分钟")', output: '今天学 5 分钟' }
        ],
        plain: '<code>print</code> 可以先理解成“把括号里的内容显示出来”。'
      },
      steps: [
        ['先猜', '运行前先想一想会出现什么，不怕猜错。'],
        ['点运行', '手机上只点一次按钮，不需要切换页面。'],
        ['对结果', '结果不同就看解释，不用把错误记成失败。']
      ],
      summary: '你已经完成第一次运行。现在只要记住：代码是一条给电脑的明确指令。',
      badge: 'mobile-first-run',
      badge_label: '手机第一次运行',
      quiz: [
        ['<code>print("你好")</code> 最可能做什么？', ['显示“你好”', '删除“你好”', '打开相机'], 0, 'print 会把括号里的内容显示出来。'],
        ['运行前先猜结果有什么用？', ['容易发现自己哪里没理解', '让手机充电更快', '可以不看结果'], 0, '预测和结果对比，是理解代码最快的方法之一。']
      ]
    },
    {
      id: 'mobile-lesson-02',
      module: '第一站 · 手机上手',
      module_short: '手机上手',
      title: '只改一句话，看到变化',
      duration_min: 6,
      cover: 'assets/course/start-on-phone.webp',
      cover_alt: '手机学习页面与桌面笔记本',
      intro: '初学时不要一次改很多地方。只换掉引号里的文字，马上就能判断修改有没有成功。',
      result: '你会完成一次“只改一处”的代码修改。',
      choice: {
        question: '想把显示内容改成“我学会修改了”，最稳妥的做法是？',
        options: ['只替换引号里的文字', '把整行全部删掉', '同时改五个地方'],
        correct: 0,
        explain: '一次只改一处，结果变化就容易判断。'
      },
      code: {
        title: '选择你想显示的话',
        lead: '点选后，代码会自动替你修改。',
        variants: [
          { label: '我开始了', code: 'message = "我开始了"\nprint(message)', output: '我开始了' },
          { label: '我学会修改了', code: 'message = "我学会修改了"\nprint(message)', output: '我学会修改了' },
          { label: '明天继续', code: 'message = "明天继续"\nprint(message)', output: '明天继续' }
        ],
        plain: '<code>message</code> 像一个贴了标签的小盒子，里面暂时放着一句话。'
      },
      steps: [
        ['找变化', '先看三段代码哪里不同。'],
        ['只改一处', '这次只换引号里的内容。'],
        ['用结果确认', '屏幕显示的新句子，就是修改成功的证据。']
      ],
      summary: '你不需要重写整段代码。会找到要改的位置，并一次只改一处，就已经在真正编程。',
      quiz: [
        ['<code>message</code> 在这里装着什么？', ['一句文字', '一个手机应用', '一张照片'], 0, '变量可以暂时保存文字、数字等数据。'],
        ['为什么建议一次只改一处？', ['更容易知道变化由哪里造成', 'Python 只能修改一次', '为了让代码更长'], 0, '小步修改更容易定位问题。']
      ]
    },
    {
      id: 'mobile-lesson-03',
      module: '第一站 · 手机上手',
      module_short: '手机上手',
      title: '用变量记住一个数字',
      duration_min: 6,
      cover: 'assets/course/start-on-phone.webp',
      cover_alt: '学习者用手机完成短时学习任务',
      intro: '做小工具时，数字经常会变。把数字放进变量里，以后只改一个位置就够了。',
      result: '你会让程序记住今天准备学习多少分钟。',
      choice: {
        question: '代码是 <code>minutes = 5</code>，minutes 现在代表多少？',
        options: ['5', 'minutes 这个英文单词', '不知道'],
        correct: 0,
        explain: '等号右边的 5 被放进了 minutes 这个变量。'
      },
      code: {
        title: '选一个学习时长',
        lead: '点选数字，再运行看看。',
        variants: [
          { label: '5 分钟', code: 'minutes = 5\nprint("今天学习", minutes, "分钟")', output: '今天学习 5 分钟' },
          { label: '10 分钟', code: 'minutes = 10\nprint("今天学习", minutes, "分钟")', output: '今天学习 10 分钟' },
          { label: '15 分钟', code: 'minutes = 15\nprint("今天学习", minutes, "分钟")', output: '今天学习 15 分钟' }
        ],
        plain: '变量名帮助我们看懂这个数字的用途，<code>minutes</code> 就是“分钟数”。'
      },
      steps: [
        ['看名字', '变量名最好能说明它保存的是什么。'],
        ['换数字', '只改等号右边的值。'],
        ['看整句', '同一份代码会自动使用新的分钟数。']
      ],
      summary: '变量就是带名字的数据盒子。名字不变，里面的内容可以换。',
      quiz: [
        ['要把学习时间改为 20 分钟，最直接改哪里？', ['把 5 改成 20', '删掉 print', '把 minutes 改成手机'], 0, '修改变量的值即可。'],
        ['变量名写成 minutes 的好处是什么？', ['能看出它表示分钟数', '手机会更亮', '代码会自动翻译'], 0, '清楚的变量名能减少猜测。']
      ]
    },
    {
      id: 'mobile-lesson-04',
      module: '第一站 · 手机上手',
      module_short: '手机上手',
      title: '把三笔支出放在一起',
      duration_min: 7,
      cover: 'assets/course/expense-helper.webp',
      cover_alt: '手机上的三笔支出卡片与真实票据',
      intro: '一笔支出用一个数字，三笔支出可以放进同一个列表。列表就像手机里的购物清单。',
      result: '你会看懂一个包含三笔支出的列表。',
      choice: {
        question: '<code>expenses = [12, 8, 15]</code> 一共记录了几笔支出？',
        options: ['1 笔', '3 笔', '35 笔'],
        correct: 1,
        explain: '方括号里有三个数字，所以是三笔。'
      },
      code: {
        title: '选择想查看的内容',
        lead: '同一个列表，可以查看数量，也可以查看全部内容。',
        variants: [
          { label: '看有几笔', code: 'expenses = [12, 8, 15]\nprint(len(expenses))', output: '3' },
          { label: '看全部支出', code: 'expenses = [12, 8, 15]\nprint(expenses)', output: '[12, 8, 15]' }
        ],
        plain: '<code>len</code> 会告诉你列表里有几项，不会把金额加起来。'
      },
      steps: [
        ['方括号', '列表用方括号包住多项数据。'],
        ['逗号分开', '每一笔支出之间用逗号分隔。'],
        ['先看数量', '确认数量正确，再继续做合计。']
      ],
      summary: '列表能把同一类数据放在一起。下一课，我们让 Python 自动算总额。',
      quiz: [
        ['<code>len(expenses)</code> 得到的是什么？', ['支出数量', '支出总额', '最大支出'], 0, 'len 计算列表里有多少项。'],
        ['列表中的项目通常用什么分开？', ['逗号', '问号', '图片'], 0, 'Python 列表的各项用逗号分隔。']
      ]
    },
    {
      id: 'mobile-lesson-05',
      module: '第二站 · 记账小助手',
      module_short: '记账助手',
      title: '自动算出今日合计',
      duration_min: 7,
      cover: 'assets/course/expense-helper.webp',
      cover_alt: '手机记账练习与纸质票据',
      intro: '手算三笔不难，但数据一多就容易漏。Python 可以按同一规则快速合计。',
      result: '你会使用 <code>sum</code> 算出列表总额。',
      choice: {
        question: '12、8、15 三笔支出合计是多少？',
        options: ['23', '35', '38'],
        correct: 1,
        explain: '12 + 8 + 15 = 35。先手算，再用程序核对。'
      },
      code: {
        title: '换一组支出再运行',
        lead: '点选一组数据，程序会自动合计。',
        variants: [
          { label: '12、8、15', code: 'expenses = [12, 8, 15]\ntotal = sum(expenses)\nprint("今日合计", total)', output: '今日合计 35' },
          { label: '10、20、5', code: 'expenses = [10, 20, 5]\ntotal = sum(expenses)\nprint("今日合计", total)', output: '今日合计 35' },
          { label: '6、9、10', code: 'expenses = [6, 9, 10]\ntotal = sum(expenses)\nprint("今日合计", total)', output: '今日合计 25' }
        ],
        plain: '<code>sum</code> 负责相加，<code>total</code> 负责保存合计结果。'
      },
      steps: [
        ['确认输入', '先看列表里是否真的是三笔支出。'],
        ['运行合计', '让 sum 把列表中的数字相加。'],
        ['手算抽查', '至少选一组数据手算，确认程序结果。']
      ],
      summary: '自动计算不等于不用检查。先确认输入，再用简单样例抽查结果。',
      quiz: [
        ['<code>sum(expenses)</code> 的作用是什么？', ['把列表数字相加', '统计列表数量', '删除支出'], 0, 'sum 会对数字列表求和。'],
        ['为什么还要手算一组？', ['用简单样例验证程序', '让代码变慢', '因为 Python 不会算数'], 0, '已知答案的小样例可以帮助发现错误。']
      ]
    },
    {
      id: 'mobile-lesson-06',
      module: '第二站 · 记账小助手',
      module_short: '记账助手',
      title: '超过预算就提醒',
      duration_min: 8,
      cover: 'assets/course/expense-helper.webp',
      cover_alt: '手机预算检查界面与日常票据',
      intro: '小工具不只显示数字，还可以根据条件给提醒。if 就像一句“如果……就……”。',
      result: '你会让程序判断今天是否超出预算。',
      choice: {
        question: '今日合计 35 元，预算 30 元，应该显示什么？',
        options: ['预算内', '已超预算', '无法判断'],
        correct: 1,
        explain: '35 大于 30，所以已经超出预算。'
      },
      code: {
        title: '切换预算，观察提醒',
        lead: '支出不变，只改预算，看看结果如何变化。',
        variants: [
          { label: '预算 30', code: 'total = 35\nbudget = 30\n\nif total > budget:\n    print("已超预算")\nelse:\n    print("预算内")', output: '已超预算' },
          { label: '预算 40', code: 'total = 35\nbudget = 40\n\nif total > budget:\n    print("已超预算")\nelse:\n    print("预算内")', output: '预算内' },
          { label: '预算 35', code: 'total = 35\nbudget = 35\n\nif total > budget:\n    print("已超预算")\nelse:\n    print("预算内")', output: '预算内' }
        ],
        plain: '<code>&gt;</code> 表示“大于”。刚好等于预算时，并没有大于预算。'
      },
      steps: [
        ['先说规则', '只有 total 大于 budget 才算超预算。'],
        ['试两个结果', '分别试一个超预算和一个预算内的数据。'],
        ['别漏边界', '再测试“刚好等于预算”的情况。']
      ],
      summary: '条件判断要测试三种情况：小于、等于、大于。边界值最容易被忽略。',
      quiz: [
        ['<code>total &gt; budget</code> 表示什么？', ['合计大于预算', '合计等于预算', '删除预算'], 0, '&gt; 是大于号。'],
        ['合计和预算都是 35 时，当前代码显示什么？', ['已超预算', '预算内', '报错'], 1, '35 不大于 35，所以会走 else。']
      ]
    },
    {
      id: 'mobile-lesson-07',
      module: '第二站 · 记账小助手',
      module_short: '记账助手',
      title: '一笔一笔检查支出',
      duration_min: 7,
      cover: 'assets/course/expense-helper.webp',
      cover_alt: '手机逐条检查支出列表',
      intro: '循环的作用不是让内容变复杂，而是把同一个动作重复做。这里的动作是“显示一笔支出”。',
      result: '你会看懂循环如何依次处理三笔数据。',
      choice: {
        question: '列表有三笔支出，循环通常会执行几次？',
        options: ['1 次', '3 次', '无限次'],
        correct: 1,
        explain: '列表里每一项都会被处理一次。'
      },
      code: {
        title: '选择列表，逐笔显示',
        lead: '注意输出有几行，顺序是否一致。',
        variants: [
          { label: '三笔支出', code: 'expenses = [12, 8, 15]\n\nfor amount in expenses:\n    print("支出", amount)', output: '支出 12\n支出 8\n支出 15' },
          { label: '两笔支出', code: 'expenses = [20, 6]\n\nfor amount in expenses:\n    print("支出", amount)', output: '支出 20\n支出 6' }
        ],
        plain: '<code>amount</code> 每一轮只代表当前这一笔支出。'
      },
      steps: [
        ['从第一项开始', '第一轮 amount 是列表里的第一个数字。'],
        ['一次只看一轮', '不要一眼扫完整段，逐行追踪。'],
        ['数输出行', '输出行数通常和列表项目数一致。']
      ],
      summary: '循环就是按顺序重复动作。读循环时，一次只追踪一轮。',
      quiz: [
        ['第二轮循环时，amount 是多少？', ['12', '8', '15'], 1, '第二项是 8，所以第二轮 amount 等于 8。'],
        ['两笔支出会打印几行？', ['1 行', '2 行', '3 行'], 1, '每一笔打印一次。']
      ]
    },
    {
      id: 'mobile-lesson-08',
      module: '第二站 · 记账小助手',
      module_short: '记账助手',
      title: '找出最大的一笔',
      duration_min: 7,
      cover: 'assets/course/expense-helper.webp',
      cover_alt: '手机支出分析练习',
      intro: '知道总额以后，还可以继续问：哪一笔最高？max 就是用来找最大值的。',
      result: '你会从列表中找出最大支出，并用原始数据核对。',
      choice: {
        question: '[12, 8, 15] 中最大的一笔是多少？',
        options: ['8', '12', '15'],
        correct: 2,
        explain: '15 是三个数字中最大的。'
      },
      code: {
        title: '换一组数据找最大值',
        lead: '运行后回头看列表，确认结果确实存在。',
        variants: [
          { label: '12、8、15', code: 'expenses = [12, 8, 15]\nlargest = max(expenses)\nprint("最大支出", largest)', output: '最大支出 15' },
          { label: '30、9、18', code: 'expenses = [30, 9, 18]\nlargest = max(expenses)\nprint("最大支出", largest)', output: '最大支出 30' },
          { label: '6、6、6', code: 'expenses = [6, 6, 6]\nlargest = max(expenses)\nprint("最大支出", largest)', output: '最大支出 6' }
        ],
        plain: '<code>max</code> 返回列表中的最大数字，不会告诉你这笔钱花在了哪里。'
      },
      steps: [
        ['先肉眼判断', '数据少时先自己找出最大值。'],
        ['运行 max', '让程序给出答案。'],
        ['回看原数据', '最大值必须能在输入列表中找到。']
      ],
      summary: '程序给出的结论要能回到原数据核对。下一站，我们让 AI 帮忙扩展这个小工具。',
      badge: 'expense-helper-ready',
      badge_label: '记账助手入门',
      quiz: [
        ['<code>max(expenses)</code> 得到什么？', ['支出数量', '最大支出', '总支出'], 1, 'max 返回最大值。'],
        ['为什么要回看原列表？', ['确认结果确实来自输入数据', '让列表变长', '修改手机时间'], 0, '结论应该可以追溯到输入。']
      ]
    },
    {
      id: 'mobile-lesson-09',
      module: '第三站 · 和 AI 合作',
      module_short: 'AI 合作',
      title: '先把需求说成四张卡',
      duration_min: 8,
      cover: 'assets/course/check-ai-result.webp',
      cover_alt: '学习者在手机上检查 AI 方案',
      intro: '直接说“帮我做个记账程序”太模糊。手机上最好先写四项：目标、输入、规则、输出。',
      result: '你会得到一段可以直接复制给 AI 的清楚需求。',
      choice: {
        question: '下面哪个需求更清楚？',
        options: ['帮我做个好用的程序', '输入三笔支出，计算合计，超过 40 元时提醒，输出合计和状态', '随便写点 Python'],
        correct: 1,
        explain: '它说明了输入、规则和输出，AI 不需要猜。'
      },
      code: {
        title: '四张需求卡',
        lead: '代码也可以把需求整理成清楚的结构。',
        variants: [
          { label: '记账助手', code: 'request = {\n    "目标": "检查每日支出",\n    "输入": "三笔金额",\n    "规则": "超过40元提醒",\n    "输出": "合计和状态"\n}\n\nprint(request)', output: "{'目标': '检查每日支出', '输入': '三笔金额', '规则': '超过40元提醒', '输出': '合计和状态'}" }
        ],
        plain: '先把需求分格，比直接让 AI 猜更可靠。'
      },
      steps: [
        ['目标', '你最终想解决什么问题？'],
        ['输入与规则', '数据是什么，怎样处理？'],
        ['输出', '最后要看到什么结果？']
      ],
      prompt: {
        title: '一键复制这段需求',
        text: '你是零基础 Python 教练。请帮我做一个“每日支出提醒”小程序。\n目标：计算当天支出并判断是否超预算。\n输入：三笔虚构金额，例如 12、8、15。\n规则：合计大于 40 元时显示“已超预算”，否则显示“预算内”。\n输出：先给 6 行以内的代码，再逐行解释。不要读取手机文件，不要安装第三方库。'
      },
      summary: '好需求不是写得长，而是目标、输入、规则、输出都清楚。',
      quiz: [
        ['“超过 40 元时提醒”属于哪一项？', ['规则', '输入', '文件名'], 0, '它规定了如何判断。'],
        ['为什么要求使用虚构金额？', ['保护真实隐私并方便测试', '让代码更漂亮', '因为 Python 不支持真实数字'], 0, '练习时不需要提交真实消费记录。']
      ]
    },
    {
      id: 'mobile-lesson-10',
      module: '第三站 · 和 AI 合作',
      module_short: 'AI 合作',
      title: '让 AI 一次只做一步',
      duration_min: 7,
      cover: 'assets/course/check-ai-result.webp',
      cover_alt: '手机上的 AI 对话和纸面检查清单',
      intro: 'AI 一次给出一大段代码，零基础很难判断。更好的方法是让它先解释方案，等你确认后再写代码。',
      result: '你会用“先解释、等确认、再修改”的方式控制节奏。',
      choice: {
        question: '哪句话最能控制 AI 不要一次做太多？',
        options: ['全部替我做好', '先用三句话解释方案，等我回复“继续”再给代码', '代码越长越好'],
        correct: 1,
        explain: '明确分阶段，才能在关键位置停下来检查。'
      },
      code: {
        title: '人的确认点',
        lead: 'AI 可以建议，但是否继续由你决定。',
        variants: [
          { label: '先停下来确认', code: 'ai_step = "先解释方案"\nhuman_reply = "继续"\n\nprint(ai_step)\nprint("人工确认：", human_reply)', output: '先解释方案\n人工确认： 继续' }
        ],
        plain: '把任务分段，不是拖慢，而是避免方向错了还继续做。'
      },
      steps: [
        ['先要方案', '只让 AI 说明准备做什么。'],
        ['你来确认', '检查目标、数据和规则有没有误解。'],
        ['再要代码', '一次只生成当前这一步。']
      ],
      prompt: {
        title: '复制分步教练提示词',
        text: '请当我的零基础 Python 教练。每次只带我做一步：先说明这一步的目的，再给不超过 6 行的代码，然后让我预测结果。等我回复“继续”后再进入下一步。不要一次给完整项目。'
      },
      summary: '你负责目标和确认，AI 负责建议和解释，Python 负责按规则执行。',
      quiz: [
        ['谁应该决定是否进入下一步？', ['使用者本人', 'AI 自动决定', '浏览器'], 0, '目标和风险由使用者确认。'],
        ['分步让 AI 输出的主要好处是什么？', ['更容易发现理解偏差', '让回答更长', '可以不检查'], 0, '每一步都能及时校正方向。']
      ]
    },
    {
      id: 'mobile-lesson-11',
      module: '第三站 · 和 AI 合作',
      module_short: 'AI 合作',
      title: '用三组数据检查答案',
      duration_min: 8,
      cover: 'assets/course/check-ai-result.webp',
      cover_alt: '手机上的确认按钮与纸面测试流程',
      intro: 'AI 写出代码不代表结果一定对。最简单的验收，是准备三组你知道答案的数据。',
      result: '你会测试预算内、刚好等于预算、超预算三种情况。',
      choice: {
        question: '预算是 40 元，哪三组合在一起最适合测试边界？',
        options: ['10、20、30', '39、40、41', '100、200、300'],
        correct: 1,
        explain: '39、40、41 分别覆盖小于、等于、大于预算。'
      },
      code: {
        title: '逐个跑边界数据',
        lead: '点选测试值，确认提醒是否符合规则。',
        variants: [
          { label: '合计 39', code: 'total = 39\nbudget = 40\nprint("已超预算" if total > budget else "预算内")', output: '预算内' },
          { label: '合计 40', code: 'total = 40\nbudget = 40\nprint("已超预算" if total > budget else "预算内")', output: '预算内' },
          { label: '合计 41', code: 'total = 41\nbudget = 40\nprint("已超预算" if total > budget else "预算内")', output: '已超预算' }
        ],
        plain: '边界值就是规则刚好发生变化的位置，这里是 40。'
      },
      steps: [
        ['正常值', '先试一个明显在预算内的数据。'],
        ['边界值', '再试刚好等于预算。'],
        ['越界值', '最后试刚刚超过预算的数据。']
      ],
      prompt: {
        title: '让 AI 先给测试，不急着改代码',
        text: '请不要修改代码。先根据“合计大于 40 元才算超预算”这个规则，给我三组最小测试数据，分别覆盖预算内、刚好等于预算、超预算，并写出每组预期结果。'
      },
      summary: '验收不是问“有没有问题”，而是用已知答案的数据逐项核对。',
      quiz: [
        ['规则是“大于 40 才超预算”，40 元属于哪种情况？', ['预算内', '超预算', '无法判断'], 0, '等于 40 并没有大于 40。'],
        ['最可靠的检查方式是什么？', ['只看 AI 说成功', '用已知答案的测试数据运行', '代码越长越可靠'], 1, '可预测的样例能直接验证规则。']
      ]
    },
    {
      id: 'mobile-lesson-12',
      module: '第三站 · 和 AI 合作',
      module_short: 'AI 合作',
      title: '完成第一个记账小助手',
      duration_min: 8,
      cover: 'assets/course/check-ai-result.webp',
      cover_alt: '手机学习项目完成前的最终检查',
      intro: '最后一课把列表、合计和预算判断连起来。代码已经准备好，你只需要选择预算、运行并验收。',
      result: '你会完成一个能计算三笔支出并给出预算提醒的小工具。',
      choice: {
        question: '这个小工具最重要的三个步骤是什么？',
        options: ['输入支出、计算合计、判断预算', '换颜色、加动画、发朋友圈', '下载软件、注册账号、上传账单'],
        correct: 0,
        explain: '先完成核心流程，再考虑外观和扩展。'
      },
      code: {
        title: '运行你的完整小工具',
        lead: '三笔支出合计 35 元。切换预算，检查两种结果。',
        variants: [
          { label: '预算 40', code: 'expenses = [12, 8, 15]\nbudget = 40\ntotal = sum(expenses)\n\nprint("今日合计", total)\nprint("已超预算" if total > budget else "预算内")', output: '今日合计 35\n预算内' },
          { label: '预算 30', code: 'expenses = [12, 8, 15]\nbudget = 30\ntotal = sum(expenses)\n\nprint("今日合计", total)\nprint("已超预算" if total > budget else "预算内")', output: '今日合计 35\n已超预算' }
        ],
        plain: '输入是支出和预算，处理是求和与比较，输出是合计和提醒。'
      },
      steps: [
        ['先验合计', '12 + 8 + 15 应该等于 35。'],
        ['再验判断', '预算 40 显示预算内，预算 30 显示已超预算。'],
        ['保存成果', '记住需求、测试数据和两组运行结果。']
      ],
      prompt: {
        title: '下一步扩展，但仍只改一处',
        text: '下面代码已经能计算三笔支出并判断预算。请先不要重写，只告诉我：如果想增加第四笔支出，应该只修改哪一行？给出修改前后对照和新的预期合计。'
      },
      summary: '你已经走完“说清需求—看懂短代码—小步修改—运行—测试—验收”的完整闭环。这才是零基础实战的第一步。',
      badge: 'mobile-practical-graduate',
      badge_label: '手机实战第一程',
      quiz: [
        ['当前三笔支出合计是多少？', ['30', '35', '40'], 1, '12 + 8 + 15 = 35。'],
        ['项目完成的证据是什么？', ['代码看起来很长', '两组测试结果都符合规则', 'AI 说没问题'], 1, '可复现的测试结果比口头保证可靠。']
      ]
    }
  ];

  const questions = [];
  lessons.forEach((lesson, lessonIndex) => {
    lesson.position = lessonIndex + 1;
    lesson.device_main = 'mobile';
    lesson.xp_reward = lessonIndex === lessons.length - 1 ? 30 : 10;
    lesson.quiz_ids = lesson.quiz.map((question, questionIndex) => {
      const id = `${lesson.id}-q${questionIndex + 1}`;
      questions.push({
        id,
        lesson_id: lesson.id,
        type: 'mobile_check',
        stem: question[0],
        options: question[1],
        correct_index: question[2],
        explain: question[3]
      });
      return id;
    });
  });

  window.SITE_LESSONS = lessons;
  window.SCENE_QUESTIONS = questions;
})();
