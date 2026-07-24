-- Run after supabase-schema.sql. This seed is safe to run again.

with chapter_seed(title, subtitle, description, level, position, cover_icon, estimated_minutes) as (
  values
    ('认识 Python 与开发环境', '从第一行代码出发', '了解 Python 的用途、程序运行方式、输出、注释和常见报错。', 'beginner', 1, '🚀', 70),
    ('变量、数据类型与运算符', '让程序记住和计算', '掌握变量、字符串、整数、浮点数、布尔值、类型转换与常用运算。', 'beginner', 2, '🧩', 100),
    ('条件判断', '让程序学会做决定', '使用比较、逻辑运算以及 if、elif、else 编写分支程序。', 'beginner', 3, '🚦', 90),
    ('循环结构', '把重复工作交给程序', '理解 for、while、range、循环控制和嵌套循环。', 'basic', 4, '🔁', 110),
    ('字符串与常用容器', '组织一组真实数据', '学习字符串、列表、元组、字典、集合的读取和常用操作。', 'basic', 5, '📦', 140),
    ('函数与模块', '制造可以反复使用的工具', '掌握函数定义、参数、返回值、作用域、模块导入和代码复用。', 'basic', 6, '🛠️', 140),
    ('文件与异常处理', '让程序可靠地保存数据', '学习文件读写、with 语句、路径、异常捕获和资源清理。', 'advanced', 7, '🗂️', 130),
    ('面向对象基础', '用对象描述现实世界', '理解类、对象、属性、方法、构造方法、封装和继承。', 'advanced', 8, '🤖', 150)
)
insert into public.course_chapters(title, subtitle, description, level, position, cover_icon, estimated_minutes, active)
select title, subtitle, description, level, position, cover_icon, estimated_minutes, true from chapter_seed
on conflict (position) do update set title=excluded.title, subtitle=excluded.subtitle, description=excluded.description, level=excluded.level,
  position=excluded.position, cover_icon=excluded.cover_icon, estimated_minutes=excluded.estimated_minutes, active=true;

with section_seed(chapter_title, title, summary, content_html, example_code, position, section_type) as (
  values
    ('认识 Python 与开发环境', '1.1 Python 能做什么', '认识 Python、解释器和源代码文件。', '<h3>Python 是什么</h3><p>Python 是一门通用编程语言。你写下的源代码会交给 Python 解释器执行，因此同一门语言可以用来做自动化、网站、数据分析和人工智能。</p><h3>程序怎样运行</h3><p>源文件通常以 <code>.py</code> 结尾。解释器从上到下执行语句，遇到无法理解的语法就会给出错误信息。</p><div class="tip">学习编程时不要只看代码。每学一个概念，都亲自修改并运行一次。</div>', 'print("你好，Python！")', 1, 'lesson'),
    ('认识 Python 与开发环境', '1.2 输出、输入与注释', '使用 print、input 与注释完成第一次交互。', '<h3>向屏幕输出</h3><p><code>print()</code> 会显示括号里的内容。文字要放进引号，数字可以直接写。</p><h3>接收用户输入</h3><p><code>input()</code> 会暂停程序并等待输入，得到的结果默认是字符串。井号 <code>#</code> 后的单行内容是注释，不会执行。</p>', 'name = input("你的名字：")\nprint("欢迎", name)\n# 这一行是注释', 2, 'lesson'),
    ('认识 Python 与开发环境', '1.3 看懂报错并调试', '学会从错误类型、行号和错误信息定位问题。', '<h3>错误不是失败</h3><p><code>SyntaxError</code> 常表示语法写错，<code>NameError</code> 常表示使用了不存在的名字。报错通常会指出文件和行号。</p><h3>最小化排查</h3><p>先读最后一行错误，再检查对应行的括号、引号、拼写和缩进。一次只改一个地方，然后重新运行。</p><div class="note">复制报错前，先试着用自己的话解释它在说什么。</div>', 'message = "调试也是学习"\nprint(message)', 3, 'lesson'),

    ('变量、数据类型与运算符', '2.1 变量与基本类型', '使用变量保存字符串、整数、浮点数和布尔值。', '<h3>变量是有名字的数据</h3><p><code>age = 12</code> 把整数 12 绑定给变量 age。变量名应表达含义，只能由字母、数字和下划线组成，且不能以数字开头。</p><h3>四种常见类型</h3><p><code>str</code> 保存文字，<code>int</code> 保存整数，<code>float</code> 保存小数，<code>bool</code> 保存 True 或 False。可用 <code>type()</code> 查看类型。</p>', 'name = "小菜鸟"\nage = 12\nscore = 96.5\nis_ready = True\nprint(type(name), type(age))', 1, 'lesson'),
    ('变量、数据类型与运算符', '2.2 类型转换与格式化输出', '转换输入数据并用 f-string 组织结果。', '<h3>input 得到的是文字</h3><p>即使输入 18，<code>input()</code> 得到的仍是字符串。计算前可用 <code>int()</code> 或 <code>float()</code> 转换。</p><h3>f-string</h3><p>在字符串前加 <code>f</code>，就能把变量写进花括号，例如 <code>f"{name} 得了 {score} 分"</code>。</p>', 'age_text = "12"\nage = int(age_text)\nprint(f"明年 {age + 1} 岁")', 2, 'lesson'),
    ('变量、数据类型与运算符', '2.3 运算符与优先级', '进行算术、赋值和比较运算。', '<h3>常用算术运算</h3><p><code>+</code>、<code>-</code>、<code>*</code>、<code>/</code> 分别表示加减乘除，<code>//</code> 是整除，<code>%</code> 求余数，<code>**</code> 求幂。</p><h3>优先级</h3><p>乘除通常先于加减。需要明确顺序时使用括号，这也会让代码更容易阅读。</p>', 'price = 12.5\ncount = 4\ntotal = price * count\nprint(f"总价：{total}")', 3, 'lesson'),

    ('条件判断', '3.1 比较与布尔表达式', '把数据比较结果转换成 True 或 False。', '<h3>比较产生布尔值</h3><p><code>==</code> 判断相等，<code>!=</code> 判断不等，此外还有 <code>&gt;</code>、<code>&lt;</code>、<code>&gt;=</code>、<code>&lt;=</code>。</p><p>单个等号是赋值，双等号才是比较。这是初学者最常见的混淆之一。</p>', 'temperature = 28\nprint(temperature >= 25)', 1, 'lesson'),
    ('条件判断', '3.2 if、elif 与 else', '根据互斥条件执行不同代码。', '<h3>分支结构</h3><p><code>if</code> 后的条件成立时执行缩进代码；否则继续检查 <code>elif</code>；所有条件都不成立时进入 <code>else</code>。</p><h3>缩进属于语法</h3><p>同一代码块通常使用 4 个空格。缩进不一致会引发错误或改变逻辑。</p>', 'score = 86\nif score >= 90:\n    print("优秀")\nelif score >= 60:\n    print("及格")\nelse:\n    print("继续努力")', 2, 'lesson'),
    ('条件判断', '3.3 逻辑运算与嵌套判断', '使用 and、or、not 组合多个条件。', '<h3>组合条件</h3><p><code>and</code> 要求两边都成立，<code>or</code> 只需一边成立，<code>not</code> 会反转真假。</p><p>条件复杂时，优先用有意义的布尔变量拆开表达式，而不是堆叠很多层嵌套。</p>', 'age = 20\nhas_ticket = True\nif age >= 18 and has_ticket:\n    print("可以入场")', 3, 'lesson'),

    ('循环结构', '4.1 for 与 range', '按次数或序列重复执行代码。', '<h3>遍历序列</h3><p><code>for</code> 会依次取出序列中的元素。<code>range(start, stop, step)</code> 能生成整数序列，并且不包含 stop。</p><p>当循环次数明确，或者需要逐个处理一组数据时，通常选择 for。</p>', 'for number in range(1, 6):\n    print(number)', 1, 'lesson'),
    ('循环结构', '4.2 while 循环', '在条件保持成立时持续执行。', '<h3>条件驱动的循环</h3><p><code>while</code> 每轮开始前检查条件。循环体内必须让条件逐渐接近 False，否则可能出现无限循环。</p><p>不知道要重复多少次，但知道停止条件时，while 很合适。</p>', 'count = 3\nwhile count > 0:\n    print(count)\n    count -= 1', 2, 'lesson'),
    ('循环结构', '4.3 break、continue 与嵌套', '控制循环提前结束、跳过本轮或构造二维遍历。', '<h3>控制循环流程</h3><p><code>break</code> 立即结束当前循环，<code>continue</code> 跳过本轮剩余代码。</p><h3>嵌套循环</h3><p>循环中还可以放循环，常用于表格、坐标和组合。注意它的执行次数是内外层次数的乘积。</p>', 'for number in range(1, 6):\n    if number == 3:\n        continue\n    print(number)', 3, 'lesson'),

    ('字符串与常用容器', '5.1 字符串与切片', '读取、切片和处理文本。', '<h3>字符串是字符序列</h3><p>索引从 0 开始，负索引从末尾开始。切片 <code>text[start:stop]</code> 包含 start，不包含 stop。</p><p>字符串不可变，调用 <code>upper()</code>、<code>strip()</code> 等方法会得到新字符串。</p>', 'text = "Python"\nprint(text[0])\nprint(text[1:4])\nprint(text.upper())', 1, 'lesson'),
    ('字符串与常用容器', '5.2 列表与元组', '保存有顺序的一组数据。', '<h3>列表可以修改</h3><p>列表用方括号创建，可通过 <code>append()</code> 添加元素，通过索引修改元素。</p><h3>元组通常不修改</h3><p>元组用圆括号创建，适合表达坐标、配置等固定结构。</p>', 'names = ["迪权", "得喜"]\nnames.append("得军")\nprint(names)\npoint = (10, 20)', 2, 'lesson'),
    ('字符串与常用容器', '5.3 字典与集合', '用键值对和不重复集合组织数据。', '<h3>字典按键查找</h3><p>字典保存 <code>key: value</code>，可用方括号或 <code>get()</code> 读取。遍历 <code>items()</code> 可同时得到键和值。</p><h3>集合自动去重</h3><p>集合适合成员判断、去重以及交集、并集运算。</p>', 'student = {"name": "得龙", "score": 95}\nprint(student["name"])\ntags = {"Python", "入门", "Python"}\nprint(tags)', 3, 'lesson'),

    ('函数与模块', '6.1 定义和调用函数', '使用 def 封装一项明确任务。', '<h3>函数让代码可复用</h3><p>用 <code>def</code> 定义函数，函数体需要缩进。函数只有被调用时才执行。</p><p>函数名应使用动词或动宾短语，体现它做什么。</p>', 'def say_hello():\n    print("你好")\n\nsay_hello()', 1, 'lesson'),
    ('函数与模块', '6.2 参数与返回值', '让函数接收数据并产生结果。', '<h3>参数是函数的输入</h3><p>位置参数按顺序传入，关键字参数写出参数名。默认参数能提供常用值。</p><h3>return 是函数的输出</h3><p><code>return</code> 会返回结果并结束当前函数。不要把打印结果和返回结果混为一谈。</p>', 'def rectangle_area(width, height=1):\n    return width * height\n\narea = rectangle_area(4, 3)\nprint(area)', 2, 'lesson'),
    ('函数与模块', '6.3 作用域与模块', '理解局部变量并导入标准库。', '<h3>局部作用域</h3><p>函数内部创建的变量通常只能在函数内使用，这能减少不同代码之间的意外影响。</p><h3>模块组织工具</h3><p><code>import math</code> 导入模块，随后可使用 <code>math.sqrt()</code>。也可以把自己的函数保存在模块文件中。</p>', 'import math\n\ndef circle_area(radius):\n    return math.pi * radius ** 2\n\nprint(round(circle_area(2), 2))', 3, 'lesson'),

    ('文件与异常处理', '7.1 读取和写入文件', '使用 open 与 with 安全操作文件。', '<h3>文件模式</h3><p><code>r</code> 读取，<code>w</code> 覆盖写入，<code>a</code> 追加写入。文本文件通常指定 <code>encoding="utf-8"</code>。</p><h3>使用 with</h3><p><code>with open(...) as file</code> 会在代码块结束后自动关闭文件。</p>', 'with open("note.txt", "w", encoding="utf-8") as file:\n    file.write("今天学习了 Python")\n\nwith open("note.txt", encoding="utf-8") as file:\n    print(file.read())', 1, 'lesson'),
    ('文件与异常处理', '7.2 路径与结构化数据', '使用 pathlib 和 JSON 管理数据文件。', '<h3>路径对象</h3><p><code>pathlib.Path</code> 能跨系统拼接路径、判断文件是否存在。</p><h3>JSON 数据</h3><p>JSON 很适合保存字典和列表。<code>json.dump()</code> 写入，<code>json.load()</code> 读取。</p>', 'from pathlib import Path\nimport json\n\ndata = {"name": "得女", "xp": 120}\nPath("data.json").write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")', 2, 'lesson'),
    ('文件与异常处理', '7.3 捕获和处理异常', '用 try、except、else、finally 提升程序可靠性。', '<h3>异常处理</h3><p>把可能失败的代码放进 <code>try</code>，用具体的 <code>except ValueError</code> 等分支处理已知问题。</p><p><code>else</code> 在没有异常时运行，<code>finally</code> 无论成功失败都会运行。不要用空泛的 except 隐藏所有错误。</p>', 'try:\n    number = int("12")\nexcept ValueError:\n    print("不是有效数字")\nelse:\n    print(number * 2)\nfinally:\n    print("处理结束")', 3, 'lesson'),

    ('面向对象基础', '8.1 类与对象', '用类定义对象共同的数据和行为。', '<h3>类是蓝图</h3><p>类描述一类对象具有哪些属性和方法，对象是根据类创建的具体实例。</p><p><code>self</code> 代表当前对象，用它访问当前对象的数据。</p>', 'class Student:\n    def greet(self):\n        print("你好，我正在学 Python")\n\nstudent = Student()\nstudent.greet()', 1, 'lesson'),
    ('面向对象基础', '8.2 构造方法与实例属性', '通过 __init__ 初始化每个对象的数据。', '<h3>初始化对象</h3><p>创建对象时 Python 会调用 <code>__init__</code>。参数可以保存为 <code>self.name</code> 等实例属性。</p><p>不同对象拥有各自的实例属性，因此数据互不干扰。</p>', 'class Student:\n    def __init__(self, name, score):\n        self.name = name\n        self.score = score\n\nstudent = Student("得得女", 98)\nprint(student.name)', 2, 'lesson'),
    ('面向对象基础', '8.3 封装与继承', '把职责放进对象，并复用父类能力。', '<h3>封装</h3><p>把相关数据和操作放进同一个类，外部通过清晰的方法使用它，而不依赖内部细节。</p><h3>继承</h3><p>子类可以继承父类属性和方法，也可以重写方法。优先保证职责清楚，不要为了继承而继承。</p>', 'class Learner:\n    def study(self):\n        return "学习中"\n\nclass PythonLearner(Learner):\n    def study(self):\n        return "正在学习 Python"\n\nprint(PythonLearner().study())', 3, 'lesson')
)
insert into public.course_sections(chapter_id, title, summary, content_html, example_code, position, section_type, active)
select c.id, s.title, s.summary, s.content_html, s.example_code, s.position, s.section_type, true
from section_seed s join public.course_chapters c on c.title=s.chapter_title
on conflict (chapter_id, position) do update set title=excluded.title, summary=excluded.summary, content_html=excluded.content_html,
  example_code=excluded.example_code, position=excluded.position, section_type=excluded.section_type, active=true;

insert into public.course_sections(chapter_id, title, summary, content_html, example_code, position, section_type, active)
select id, position || '.4 章节小结', '整理本章知识地图，确认自己能解释、能判断、能动手。',
  '<h3>本章知识地图</h3><p>' || description || '</p><h3>完成标准</h3><p>你应当能用自己的话解释核心概念，能看懂典型代码，并能独立完成本章的 10 道选择题、10 道问答题和 5 道动手题。</p><div class="tip">小结不是结束。先回忆，再查看教程；先动手，再看答案。</div>',
  '', 4, 'summary', true
from public.course_chapters
on conflict (chapter_id, position) do update set title=excluded.title, summary=excluded.summary, content_html=excluded.content_html,
  position=excluded.position, section_type='summary', active=true;

-- Ten core concepts per chapter drive ten choice questions and ten short-answer questions.
with concept_seed(chapter_title, concepts) as (
  values
    ('认识 Python 与开发环境', '[{"term":"Python 解释器","definition":"读取并执行 Python 源代码的程序","keyword":"执行"},{"term":".py 文件","definition":"保存 Python 源代码的常用文件","keyword":"源代码"},{"term":"print()","definition":"把内容输出到屏幕","keyword":"输出"},{"term":"input()","definition":"接收用户输入并返回字符串","keyword":"字符串"},{"term":"注释","definition":"帮助人阅读且不会作为语句执行的说明","keyword":"不执行"},{"term":"SyntaxError","definition":"代码不符合 Python 语法规则时常见的异常","keyword":"语法"},{"term":"NameError","definition":"使用了尚未定义的名字时常见的异常","keyword":"未定义"},{"term":"字符串引号","definition":"用于标记一段文本的边界","keyword":"文本"},{"term":"执行顺序","definition":"普通语句通常从上到下依次运行","keyword":"从上到下"},{"term":"调试","definition":"定位、解释并修正程序问题的过程","keyword":"修正"}]'::jsonb),
    ('变量、数据类型与运算符', '[{"term":"变量","definition":"用名字绑定并引用一个值","keyword":"值"},{"term":"str","definition":"保存文本的字符串类型","keyword":"文本"},{"term":"int","definition":"保存没有小数部分的整数类型","keyword":"整数"},{"term":"float","definition":"保存带小数数据的浮点类型","keyword":"小数"},{"term":"bool","definition":"只有 True 和 False 两个值的布尔类型","keyword":"True"},{"term":"type()","definition":"查看一个值所属的数据类型","keyword":"类型"},{"term":"int()","definition":"把符合格式的数据转换为整数","keyword":"转换"},{"term":"f-string","definition":"把表达式嵌入字符串的格式化方式","keyword":"花括号"},{"term":"//","definition":"得到向下取整结果的整除运算符","keyword":"整除"},{"term":"%","definition":"计算除法余数的取模运算符","keyword":"余数"}]'::jsonb),
    ('条件判断', '[{"term":"==","definition":"判断两个值是否相等的比较运算符","keyword":"相等"},{"term":"!=","definition":"判断两个值是否不相等的比较运算符","keyword":"不等"},{"term":"if","definition":"在条件成立时执行代码块","keyword":"条件"},{"term":"elif","definition":"前面条件不成立时继续检查另一条件","keyword":"另一条件"},{"term":"else","definition":"前面条件都不成立时执行的分支","keyword":"都不成立"},{"term":"缩进","definition":"标识 Python 代码块层级的空格","keyword":"代码块"},{"term":"and","definition":"两边条件都成立时结果才为真","keyword":"都成立"},{"term":"or","definition":"至少一个条件成立时结果为真","keyword":"至少一个"},{"term":"not","definition":"把布尔结果取反的逻辑运算符","keyword":"取反"},{"term":"布尔表达式","definition":"计算结果为 True 或 False 的表达式","keyword":"False"}]'::jsonb),
    ('循环结构', '[{"term":"for","definition":"依次遍历序列元素的循环语句","keyword":"遍历"},{"term":"range()","definition":"生成一个整数序列范围","keyword":"整数"},{"term":"stop 不包含","definition":"range 和切片通常不包含结束位置","keyword":"结束位置"},{"term":"while","definition":"条件保持为真时重复执行代码","keyword":"条件"},{"term":"循环变量","definition":"每轮保存当前元素或计数值的变量","keyword":"每轮"},{"term":"break","definition":"立即结束当前循环","keyword":"结束"},{"term":"continue","definition":"跳过当前轮剩余代码进入下一轮","keyword":"下一轮"},{"term":"无限循环","definition":"停止条件始终无法满足的循环","keyword":"停止条件"},{"term":"嵌套循环","definition":"一个循环体中包含另一个循环","keyword":"包含"},{"term":"累加器","definition":"在循环中持续汇总结果的变量","keyword":"汇总"}]'::jsonb),
    ('字符串与常用容器', '[{"term":"索引","definition":"通过位置读取序列中的单个元素","keyword":"位置"},{"term":"切片","definition":"按起止范围取得序列的一部分","keyword":"范围"},{"term":"字符串不可变","definition":"字符串创建后不能原地修改字符","keyword":"不能原地"},{"term":"列表","definition":"有顺序且可以修改的容器","keyword":"修改"},{"term":"append()","definition":"向列表末尾加入一个元素","keyword":"末尾"},{"term":"元组","definition":"有顺序且通常不修改的容器","keyword":"不修改"},{"term":"字典","definition":"使用键值对保存数据的容器","keyword":"键值对"},{"term":"get()","definition":"按键安全读取字典值的方法","keyword":"按键"},{"term":"集合","definition":"保存不重复元素的无序容器","keyword":"不重复"},{"term":"items()","definition":"遍历字典键和值的方法","keyword":"键和值"}]'::jsonb),
    ('函数与模块', '[{"term":"def","definition":"定义一个函数使用的关键字","keyword":"定义"},{"term":"调用函数","definition":"通过函数名和括号执行函数体","keyword":"执行"},{"term":"参数","definition":"函数接收外部数据的入口","keyword":"外部数据"},{"term":"实参","definition":"调用函数时实际传入的值","keyword":"传入"},{"term":"默认参数","definition":"调用时省略后采用预设值的参数","keyword":"预设值"},{"term":"return","definition":"返回结果并结束当前函数","keyword":"返回"},{"term":"局部变量","definition":"通常只能在函数内部访问的变量","keyword":"函数内部"},{"term":"模块","definition":"组织可复用 Python 代码的文件","keyword":"代码文件"},{"term":"import","definition":"把模块能力引入当前程序","keyword":"引入"},{"term":"纯函数","definition":"相同输入通常产生相同输出且少依赖外部状态的函数","keyword":"相同输入"}]'::jsonb),
    ('文件与异常处理', '[{"term":"open()","definition":"打开文件并返回文件对象","keyword":"文件对象"},{"term":"读取模式 r","definition":"以只读方式打开文件","keyword":"只读"},{"term":"写入模式 w","definition":"写入并覆盖原有文件内容","keyword":"覆盖"},{"term":"追加模式 a","definition":"把新内容添加到文件末尾","keyword":"末尾"},{"term":"with 语句","definition":"代码块结束时自动清理文件等资源","keyword":"自动"},{"term":"UTF-8","definition":"常用的文本字符编码","keyword":"编码"},{"term":"Path","definition":"pathlib 提供的面向对象路径工具","keyword":"路径"},{"term":"JSON","definition":"常用于交换和保存结构化数据的文本格式","keyword":"结构化"},{"term":"try","definition":"包围可能发生异常的代码","keyword":"异常"},{"term":"finally","definition":"无论是否异常都会执行的代码块","keyword":"都会执行"}]'::jsonb),
    ('面向对象基础', '[{"term":"类","definition":"描述一类对象属性和行为的蓝图","keyword":"蓝图"},{"term":"对象","definition":"根据类创建的具体实例","keyword":"实例"},{"term":"self","definition":"方法中代表当前对象的参数","keyword":"当前对象"},{"term":"方法","definition":"定义在类中并描述对象行为的函数","keyword":"行为"},{"term":"属性","definition":"保存在对象上的数据","keyword":"数据"},{"term":"__init__","definition":"创建对象时用于初始化数据的方法","keyword":"初始化"},{"term":"实例属性","definition":"分别属于每个对象的数据","keyword":"每个对象"},{"term":"封装","definition":"把相关数据和操作组织在对象内部","keyword":"组织"},{"term":"继承","definition":"子类复用和扩展父类能力的机制","keyword":"父类"},{"term":"方法重写","definition":"子类重新实现父类同名方法","keyword":"重新实现"}]'::jsonb)
), expanded as (
  select c.id chapter_id, c.title, item, ordinality::int position
  from concept_seed s join public.course_chapters c on c.title=s.chapter_title,
  jsonb_array_elements(s.concepts) with ordinality as x(item, ordinality)
)
insert into public.chapter_exercises(chapter_id, exercise_group, question_type, topic, prompt, options, correct_answer, correct_index, explanation, position, active)
select chapter_id, 'after_class', 'choice', item->>'term', '关于“' || (item->>'term') || '”的说法，哪一项正确？',
  jsonb_build_array(item->>'definition', '它只在安装 Python 时使用一次', '它表示程序中所有内容都必须是文字', '它与当前章节没有关系'),
  item->>'definition', 0, item->>'definition', position, true from expanded
on conflict (chapter_id, exercise_group, position) do update set question_type=excluded.question_type, topic=excluded.topic, prompt=excluded.prompt,
  options=excluded.options, correct_answer=excluded.correct_answer, correct_index=excluded.correct_index, explanation=excluded.explanation, active=true;

with concept_seed(chapter_title, concepts) as (
  select title, case position
    when 1 then '[{"term":"Python 解释器","keyword":"执行"},{"term":".py 文件","keyword":"源代码"},{"term":"print()","keyword":"输出"},{"term":"input()","keyword":"字符串"},{"term":"注释","keyword":"不执行"},{"term":"SyntaxError","keyword":"语法"},{"term":"NameError","keyword":"未定义"},{"term":"字符串引号","keyword":"文本"},{"term":"执行顺序","keyword":"从上到下"},{"term":"调试","keyword":"修正"}]'
    when 2 then '[{"term":"变量","keyword":"值"},{"term":"str","keyword":"文本"},{"term":"int","keyword":"整数"},{"term":"float","keyword":"小数"},{"term":"bool","keyword":"True"},{"term":"type()","keyword":"类型"},{"term":"int()","keyword":"转换"},{"term":"f-string","keyword":"花括号"},{"term":"整除 //","keyword":"整除"},{"term":"取模 %","keyword":"余数"}]'
    when 3 then '[{"term":"==","keyword":"相等"},{"term":"!=","keyword":"不等"},{"term":"if","keyword":"条件"},{"term":"elif","keyword":"另一条件"},{"term":"else","keyword":"都不成立"},{"term":"缩进","keyword":"代码块"},{"term":"and","keyword":"都成立"},{"term":"or","keyword":"至少一个"},{"term":"not","keyword":"取反"},{"term":"布尔表达式","keyword":"False"}]'
    when 4 then '[{"term":"for","keyword":"遍历"},{"term":"range()","keyword":"整数"},{"term":"左闭右开","keyword":"结束位置"},{"term":"while","keyword":"条件"},{"term":"循环变量","keyword":"每轮"},{"term":"break","keyword":"结束"},{"term":"continue","keyword":"下一轮"},{"term":"无限循环","keyword":"停止条件"},{"term":"嵌套循环","keyword":"包含"},{"term":"累加器","keyword":"汇总"}]'
    when 5 then '[{"term":"索引","keyword":"位置"},{"term":"切片","keyword":"范围"},{"term":"字符串不可变","keyword":"不能原地"},{"term":"列表","keyword":"修改"},{"term":"append()","keyword":"末尾"},{"term":"元组","keyword":"不修改"},{"term":"字典","keyword":"键值对"},{"term":"get()","keyword":"按键"},{"term":"集合","keyword":"不重复"},{"term":"items()","keyword":"键和值"}]'
    when 6 then '[{"term":"def","keyword":"定义"},{"term":"调用函数","keyword":"执行"},{"term":"参数","keyword":"外部数据"},{"term":"实参","keyword":"传入"},{"term":"默认参数","keyword":"预设值"},{"term":"return","keyword":"返回"},{"term":"局部变量","keyword":"函数内部"},{"term":"模块","keyword":"代码文件"},{"term":"import","keyword":"引入"},{"term":"纯函数","keyword":"相同输入"}]'
    when 7 then '[{"term":"open()","keyword":"文件对象"},{"term":"读取模式 r","keyword":"只读"},{"term":"写入模式 w","keyword":"覆盖"},{"term":"追加模式 a","keyword":"末尾"},{"term":"with 语句","keyword":"自动"},{"term":"UTF-8","keyword":"编码"},{"term":"Path","keyword":"路径"},{"term":"JSON","keyword":"结构化"},{"term":"try","keyword":"异常"},{"term":"finally","keyword":"都会执行"}]'
    else '[{"term":"类","keyword":"蓝图"},{"term":"对象","keyword":"实例"},{"term":"self","keyword":"当前对象"},{"term":"方法","keyword":"行为"},{"term":"属性","keyword":"数据"},{"term":"__init__","keyword":"初始化"},{"term":"实例属性","keyword":"每个对象"},{"term":"封装","keyword":"组织"},{"term":"继承","keyword":"父类"},{"term":"方法重写","keyword":"重新实现"}]' end::jsonb
  from public.course_chapters
), expanded as (
  select c.id chapter_id, item, ordinality::int position from concept_seed s join public.course_chapters c on c.title=s.chapter_title,
  jsonb_array_elements(s.concepts) with ordinality as x(item, ordinality)
)
insert into public.chapter_exercises(chapter_id, exercise_group, question_type, topic, prompt, correct_answer, explanation, position, active)
select chapter_id, 'after_class', 'short_answer', item->>'term', '请用自己的话解释“' || (item->>'term') || '”，并说明它在程序中的作用。',
  (item->>'term') || '|' || (item->>'keyword'), '参考答案至少应准确说明“' || (item->>'keyword') || '”这一关键点。', position + 10, true from expanded
on conflict (chapter_id, exercise_group, position) do update set question_type=excluded.question_type, topic=excluded.topic, prompt=excluded.prompt,
  correct_answer=excluded.correct_answer, explanation=excluded.explanation, active=true;

-- Five runnable coding tasks per chapter. Browser tests compare output and required code snippets.
with task_seed(chapter_position, position, topic, prompt, starter_code, expected_output, required) as (
  values
    (1,1,'输出','输出：你好，Python！','print("你好，Python！")','你好，Python！','["print("]'::jsonb),(1,2,'变量输出','创建变量 name="小菜鸟" 并输出它。','name = "小菜鸟"\nprint(name)','小菜鸟','["name =", "print("]'),(1,3,'多行输出','分两行输出 Python 和 起飞。','print("Python")\nprint("起飞")','Python\n起飞','["print("]'),(1,4,'字符串拼接','用两个变量拼接并输出：学习Python。','a = "学习"\nb = "Python"\nprint(a + b)','学习Python','["a =", "b ="]'),(1,5,'注释','保留注释并输出：调试成功。','# 说明这行程序的作用\nprint("调试成功")','调试成功','["#", "print("]'),
    (2,1,'变量','保存 age=12 并输出。','age = 12\nprint(age)','12','["age = 12"]'),(2,2,'算术','计算 8 与 5 的和并输出。','print(8 + 5)','13','["+"]'),(2,3,'类型转换','把字符串 "20" 转为整数，加 2 后输出。','number = int("20")\nprint(number + 2)','22','["int("]'),(2,4,'f-string','name="得喜"，用 f-string 输出：得喜在学习。','name = "得喜"\nprint(f"{name}在学习")','得喜在学习','["f\""]'),(2,5,'取模','输出 17 除以 5 的余数。','print(17 % 5)','2','["%"]'),
    (3,1,'if','score=80，大于等于60时输出：及格。','score = 80\nif score >= 60:\n    print("及格")','及格','["if ", ":"]'),(3,2,'if else','number=7，输出：奇数。','number = 7\nif number % 2 == 0:\n    print("偶数")\nelse:\n    print("奇数")','奇数','["else:"]'),(3,3,'elif','score=90，按优秀/及格/努力输出：优秀。','score = 90\nif score >= 90:\n    print("优秀")\nelif score >= 60:\n    print("及格")\nelse:\n    print("努力")','优秀','["elif "]'),(3,4,'and','age=20 且 has_ticket=True 时输出：入场。','age = 20\nhas_ticket = True\nif age >= 18 and has_ticket:\n    print("入场")','入场','[" and "]'),(3,5,'三元表达式','temperature=30，输出：热。','temperature = 30\nresult = "热" if temperature >= 28 else "舒适"\nprint(result)','热','[" if ", " else "]'),
    (4,1,'for','用循环逐行输出 1、2、3。','for n in range(1, 4):\n    print(n)','1\n2\n3','["for ", "range("]'),(4,2,'累加','用循环计算 1 到 5 的和并输出。','total = 0\nfor n in range(1, 6):\n    total += n\nprint(total)','15','["for ", "+="]'),(4,3,'while','用 while 倒序输出 3、2、1。','n = 3\nwhile n > 0:\n    print(n)\n    n -= 1','3\n2\n1','["while "]'),(4,4,'continue','输出 1 到 5 中除 3 外的数字。','for n in range(1, 6):\n    if n == 3:\n        continue\n    print(n)','1\n2\n4\n5','["continue"]'),(4,5,'嵌套循环','用嵌套循环输出四个星号，每行两个。','for row in range(2):\n    print("**")','**\n**','["for "]'),
    (5,1,'切片','输出 "Python" 的前三个字符。','text = "Python"\nprint(text[:3])','Pyt','["[:3]"]'),(5,2,'列表','创建列表 [1,2]，追加 3 后输出。','numbers = [1, 2]\nnumbers.append(3)\nprint(numbers)','[1, 2, 3]','["append("]'),(5,3,'字典','从字典中读取 name 并输出得龙。','student = {"name": "得龙"}\nprint(student["name"])','得龙','["{", "["]'),(5,4,'集合去重','把 [1,1,2,3] 去重后排序输出。','values = [1, 1, 2, 3]\nprint(sorted(set(values)))','[1, 2, 3]','["set("]'),(5,5,'遍历字典','按顺序输出 name=得女 和 xp=100。','data = {"name": "得女", "xp": 100}\nfor key, value in data.items():\n    print(f"{key}={value}")','name=得女\nxp=100','["items("]'),
    (6,1,'函数','定义 add(a,b) 返回和，并输出 add(2,3)。','def add(a, b):\n    return a + b\n\nprint(add(2, 3))','5','["def add", "return"]'),(6,2,'默认参数','定义 greet(name="小菜鸟") 并输出默认名字。','def greet(name="小菜鸟"):\n    return f"你好，{name}"\n\nprint(greet())','你好，小菜鸟','["def greet", "return"]'),(6,3,'关键字参数','定义 area(width,height)，用关键字参数输出 12。','def area(width, height):\n    return width * height\n\nprint(area(height=3, width=4))','12','["height=3", "width=4"]'),(6,4,'模块','导入 math 并输出 sqrt(81) 的整数结果。','import math\nprint(int(math.sqrt(81)))','9','["import math"]'),(6,5,'函数复用','定义 double 并用列表推导输出 [2,4,6]。','def double(n):\n    return n * 2\n\nprint([double(n) for n in [1, 2, 3]])','[2, 4, 6]','["def double", "return"]'),
    (7,1,'文件写入','写入 note.txt 后读取并输出：Python。','with open("note.txt", "w", encoding="utf-8") as f:\n    f.write("Python")\nwith open("note.txt", encoding="utf-8") as f:\n    print(f.read())','Python','["with open", "encoding="]'),(7,2,'异常','捕获 int("abc") 的 ValueError 并输出：格式错误。','try:\n    int("abc")\nexcept ValueError:\n    print("格式错误")','格式错误','["try:", "except ValueError"]'),(7,3,'finally','使用 finally 输出：结束。','try:\n    print("开始")\nfinally:\n    print("结束")','开始\n结束','["finally:"]'),(7,4,'JSON','把字典转成 JSON 后读取，输出 100。','import json\ntext = json.dumps({"xp": 100})\ndata = json.loads(text)\nprint(data["xp"])','100','["import json", "json.loads"]'),(7,5,'Path','使用 Path 写入并读取 hello.txt，输出：你好。','from pathlib import Path\npath = Path("hello.txt")\npath.write_text("你好", encoding="utf-8")\nprint(path.read_text(encoding="utf-8"))','你好','["from pathlib import Path"]'),
    (8,1,'类','定义 Student 类，创建对象并输出其类型名。','class Student:\n    pass\n\nstudent = Student()\nprint(type(student).__name__)','Student','["class Student"]'),(8,2,'构造方法','用 __init__ 保存 name 并输出迪权。','class Student:\n    def __init__(self, name):\n        self.name = name\n\nstudent = Student("迪权")\nprint(student.name)','迪权','["__init__", "self.name"]'),(8,3,'实例方法','定义 greet 方法返回你好并输出。','class Student:\n    def greet(self):\n        return "你好"\n\nprint(Student().greet())','你好','["def greet", "self"]'),(8,4,'继承','Dog 继承 Animal，并输出 Animal 的 move 结果。','class Animal:\n    def move(self):\n        return "移动"\n\nclass Dog(Animal):\n    pass\n\nprint(Dog().move())','移动','["class Dog(Animal)"]'),(8,5,'方法重写','子类重写 speak 并输出：喵。','class Animal:\n    def speak(self):\n        return "声音"\n\nclass Cat(Animal):\n    def speak(self):\n        return "喵"\n\nprint(Cat().speak())','喵','["class Cat", "def speak"]')
), rows as (
  select c.id chapter_id, t.position + 20 as position, t.topic, t.prompt, t.starter_code, t.expected_output, t.required
  from task_seed t join public.course_chapters c on c.position=t.chapter_position
)
insert into public.chapter_exercises(chapter_id, exercise_group, question_type, topic, prompt, starter_code, test_config, explanation, position, active)
select chapter_id, 'after_class', 'coding', topic, prompt, starter_code,
  jsonb_build_object('expected_output', expected_output, 'required_snippets', required), '运行代码后，输出必须与目标完全一致。', position, true from rows
on conflict (chapter_id, exercise_group, position) do update set question_type=excluded.question_type, topic=excluded.topic, prompt=excluded.prompt,
  starter_code=excluded.starter_code, test_config=excluded.test_config, explanation=excluded.explanation, active=true;

-- Five chapter-summary questions: two checks plus three open thinking prompts.
insert into public.chapter_exercises(chapter_id, exercise_group, question_type, topic, prompt, options, correct_answer, correct_index, explanation, position, active)
select id, 'summary', 'choice', '章节小结', '学习“' || title || '”后，最可靠的学习方式是什么？',
  '["先回忆概念，再亲手编写和运行代码","只背诵答案","只看视频不练习","跳过报错"]'::jsonb,
  '回忆|动手|运行', 0, '有效学习需要主动回忆、动手运行和根据反馈修改。', 1, true from public.course_chapters
on conflict (chapter_id, exercise_group, position) do update set question_type=excluded.question_type, prompt=excluded.prompt, options=excluded.options,
  correct_answer=excluded.correct_answer, correct_index=excluded.correct_index, explanation=excluded.explanation, active=true;

insert into public.chapter_exercises(chapter_id, exercise_group, question_type, topic, prompt, options, correct_answer, correct_index, explanation, position, active)
select id, 'summary', 'choice', '章节小结', '遇到本章代码报错时，首先应该怎么做？',
  '["阅读错误类型、行号和最后一行信息","立即删除全部代码","反复点击运行但不看信息","更换电脑"]'::jsonb,
  '错误类型|行号|信息', 0, '先阅读错误提供的线索，再做有针对性的修改。', 2, true from public.course_chapters
on conflict (chapter_id, exercise_group, position) do update set question_type=excluded.question_type, prompt=excluded.prompt, options=excluded.options,
  correct_answer=excluded.correct_answer, correct_index=excluded.correct_index, explanation=excluded.explanation, active=true;

with thinking(position, prompt) as (
  values (3, '请画出或描述本章的知识地图：哪些概念互相关联？'),
         (4, '如果要把本章知识教给零基础朋友，你会选择什么例子？为什么？'),
         (5, '本章哪一点最容易出错？请设计一个自我检查方法。')
)
insert into public.chapter_exercises(chapter_id, exercise_group, question_type, topic, prompt, correct_answer, explanation, position, active)
select c.id, 'summary', 'thinking', '章节思考', t.prompt, '结合本章概念给出有理由的个人答案',
  '思考题没有唯一答案，重点是观点清楚、例子具体、理由充分。', t.position, true
from public.course_chapters c cross join thinking t
on conflict (chapter_id, exercise_group, position) do update set question_type=excluded.question_type, prompt=excluded.prompt,
  correct_answer=excluded.correct_answer, explanation=excluded.explanation, active=true;

-- Verify every chapter has the requested 10 + 10 + 5 + 5 structure.
select c.position as chapter, c.title,
  count(*) filter (where e.exercise_group='after_class' and e.question_type='choice') as choices,
  count(*) filter (where e.exercise_group='after_class' and e.question_type='short_answer') as short_answers,
  count(*) filter (where e.exercise_group='after_class' and e.question_type='coding') as coding_tasks,
  count(*) filter (where e.exercise_group='summary') as summary_questions
from public.course_chapters c left join public.chapter_exercises e on e.chapter_id=c.id and e.active
group by c.id order by c.position;
