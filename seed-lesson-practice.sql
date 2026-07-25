-- Run after supabase-schema.sql and seed-course.sql.
-- The sequence is informed by common beginner Python curricula, including the
-- scope of Python Crash Course (3rd ed.), but every task and example is original.

create temporary table lesson_practice_seed (
  chapter_position integer not null,
  section_position integer not null,
  thinking_topic text not null,
  thinking_prompt text not null,
  thinking_answer text not null,
  coding_topic text not null,
  coding_prompt text not null,
  starter_code text not null,
  expected_output text not null,
  required_snippets jsonb not null default '[]'::jsonb
) on commit drop;

insert into lesson_practice_seed values
(1,1,'指令要清楚',$q$如果你只对电脑说“帮我整理一下”，它为什么很难直接完成？请把这句话改写成三条更清楚的指令。$q$,$q$电脑不会猜测意图；答案应包含有顺序、可执行且结果明确的三条指令。$q$,'三步指令',$q$写三行 print，把“打开书包、放入课本、合上书包”按顺序输出。$q$,$q$print("打开书包")
# 在这里补上第二步和第三步$q$,$q$打开书包
放入课本
合上书包$q$,'["print("]'::jsonb),
(1,2,'运行与输出',$q$代码已经写在编辑器里，却还没有出现结果。“代码”“运行”“输出”分别指什么？$q$,$q$答案应区分书写的指令、执行动作和执行后产生的结果。$q$,'第一次运行',$q$补全第二行，让程序依次输出“你好，Python”和“这是我的第一次运行”。$q$,$q$print("你好，Python")
# 补全下一行$q$,$q$你好，Python
这是我的第一次运行$q$,'["print("]'::jsonb),
(1,3,'调试顺序',$q$看到语法错误时，为什么先检查报错附近的拼写、引号和括号，比随意重写全部代码更有效？$q$,$q$答案应提到缩小检查范围、保留正确部分和逐步验证。$q$,'修好括号',$q$下面的代码少了一个右括号。修正后运行，让它输出“我会检查报错”。$q$,$q$print("我会检查报错"$q$,$q$我会检查报错$q$,'["print(", ")"]'::jsonb),
(2,1,'变量命名',$q$在“a = 18”和“student_age = 18”之间，哪一个更适合保存学生年龄？说明理由。$q$,$q$应选择 student_age；有意义的名字能降低阅读和维护成本。$q$,'个人信息卡',$q$创建 name、age、is_beginner 三个变量，并按示例格式输出一行个人信息。$q$,$q$name = "小林"
age = 16
is_beginner = True
print(name, age, is_beginner)$q$,$q$小林 16 True$q$,'["name =","age =","is_beginner ="]'::jsonb),
(2,2,'转换的时机',$q$为什么字符串“18”不能直接和整数 1 相加？在什么情况下应使用 int()？$q$,$q$应区分文本与数值，并在确认输入格式后转换。$q$,'计算明年年龄',$q$把 age_text 转成整数，计算并输出“明年 19 岁”。$q$,$q$age_text = "18"
age = int(age_text)
print(f"明年 {age + 1} 岁")$q$,$q$明年 19 岁$q$,'["int(","f\""]'::jsonb),
(2,3,'运算顺序',$q$表达式 20 + 5 * 2 和 (20 + 5) * 2 的结果为什么不同？括号给读者提供了什么信息？$q$,$q$应说明乘法优先级、括号改变顺序，并强调可读性。$q$,'购物总价',$q$单价 12.5 元，购买 4 件，优惠 6 元。计算并输出“应付：44.0”。$q$,$q$price = 12.5
count = 4
discount = 6
total = price * count - discount
print(f"应付：{total}")$q$,$q$应付：44.0$q$,'["*","-","total ="]'::jsonb),
(3,1,'比较与赋值',$q$单等号和双等号分别完成什么任务？把它们写错可能造成什么问题？$q$,$q$= 用于赋值，== 用于比较；应各举一个例子。$q$,'判断是否成年',$q$设置 age = 17，输出 age >= 18 的布尔结果。$q$,$q$age = 17
is_adult = age >= 18
print(is_adult)$q$,$q$False$q$,'[">=","is_adult ="]'::jsonb),
(3,2,'分支顺序',$q$多个分数区间使用 if/elif/else 时，为什么通常应先检查更高的分数？$q$,$q$分支按顺序匹配，前面的宽泛条件可能提前截走结果。$q$,'成绩等级',$q$根据 score = 86 输出“良好”：90 分以上优秀，75 分以上良好，60 分以上及格，否则继续努力。$q$,$q$score = 86
if score >= 90:
    print("优秀")
elif score >= 75:
    print("良好")
elif score >= 60:
    print("及格")
else:
    print("继续努力")$q$,$q$良好$q$,'["if ","elif ","else:"]'::jsonb),
(3,3,'拆分复杂条件',$q$“已成年并且有票，或者是工作人员”包含哪些基本条件？先拆成变量有什么好处？$q$,$q$应识别年龄、票和工作人员身份，并说明拆分后更易读和测试。$q$,'入场判断',$q$使用 and 与 or，让年龄 20、有票、非工作人员的用户输出“可以入场”。$q$,$q$age = 20
has_ticket = True
is_staff = False
if (age >= 18 and has_ticket) or is_staff:
    print("可以入场")$q$,$q$可以入场$q$,'[" and "," or "]'::jsonb),
(4,1,'次数与范围',$q$range(1, 5) 为什么只产生 1、2、3、4？这种“不包含结束值”的规则有什么好处？$q$,$q$stop 不包含；这种规则便于配合长度、索引和连续范围。$q$,'累计练习时间',$q$遍历 [10, 15, 20]，累计并输出“总计：45 分钟”。$q$,$q$minutes = [10, 15, 20]
total = 0
for value in minutes:
    total += value
print(f"总计：{total} 分钟")$q$,$q$总计：45 分钟$q$,'["for ","+="]'::jsonb),
(4,2,'停止条件',$q$设计 while 循环时，怎样确认它最终会停止？请指出循环变量、继续条件和更新动作。$q$,$q$应说明初始值、布尔条件和每轮更新如何让条件趋向 False。$q$,'倒计时',$q$使用 while 从 3 输出到 1，最后再输出“开始”。$q$,$q$count = 3
while count > 0:
    print(count)
    count -= 1
print("开始")$q$,$q$3
2
1
开始$q$,'["while ","-="]'::jsonb),
(4,3,'选择控制语句',$q$遇到无效数据时，什么时候用 continue 跳过本轮，什么时候用 break 结束整个循环？$q$,$q$应区分“单项无效但可继续”和“后续处理已无意义”。$q$,'跳过指定数字',$q$遍历 1 到 6，跳过 3，并在遇到 6 时结束，只输出 1、2、4、5。$q$,$q$for number in range(1, 7):
    if number == 3:
        continue
    if number == 6:
        break
    print(number)$q$,$q$1
2
4
5$q$,'["continue","break"]'::jsonb),
(5,1,'不可变字符串',$q$字符串不能原地修改，为什么 text.upper() 不会自动改变原变量 text？怎样保留新结果？$q$,$q$方法会返回新字符串；可重新赋值或保存到新变量。$q$,'提取文件名',$q$从字符串“report_2026.txt”中切出并输出“report”。$q$,$q$filename = "report_2026.txt"
name = filename[:6]
print(name)$q$,$q$report$q$,'["[:6]"]'::jsonb),
(5,2,'列表还是元组',$q$购物清单和地图坐标分别更适合列表还是元组？请从“是否需要修改”解释。$q$,$q$列表适合可变清单，元组适合表达固定坐标。$q$,'维护待办列表',$q$向 todos 末尾加入“运行代码”，再把第一项改成“复习变量”，最后输出列表。$q$,$q$todos = ["学习变量", "完成练习"]
todos.append("运行代码")
todos[0] = "复习变量"
print(todos)$q$,$q$['复习变量', '完成练习', '运行代码']$q$,'["append(","todos[0]"]'::jsonb),
(5,3,'按键还是按位置',$q$学生档案为什么更适合用字典而不是只用列表？集合又适合解决什么问题？$q$,$q$字典键具有语义，集合适合去重和成员判断。$q$,'统计独立标签',$q$读取 student 的 name，再把重复标签去重并输出标签数量。$q$,$q$student = {"name": "小林", "tags": ["Python", "入门", "Python"]}
print(student["name"])
unique_tags = set(student["tags"])
print(len(unique_tags))$q$,$q$小林
2$q$,'["student[","set("]'::jsonb),
(6,1,'函数职责',$q$一个函数同时读取文件、计算成绩、打印报告，为什么难以复用和测试？怎样拆分更清楚？$q$,$q$应提出单一职责，并给出读取、计算、展示等拆分方式。$q$,'问候函数',$q$定义 greet(name)，返回“你好，小林”，再打印调用结果。$q$,$q$def greet(name):
    return f"你好，{name}"

print(greet("小林"))$q$,$q$你好，小林$q$,'["def greet","return"]'::jsonb),
(6,2,'打印与返回',$q$函数内部 print(result) 和 return result 有什么区别？哪一种更方便继续计算？$q$,$q$print 只展示，return 把值交回调用方，更便于组合。$q$,'带默认值的总价函数',$q$定义 total(price, count=1)，返回乘积；用关键字参数计算 12.5×4 并输出 50.0。$q$,$q$def total(price, count=1):
    return price * count

print(total(count=4, price=12.5))$q$,$q$50.0$q$,'["count=1","return","count=4"]'::jsonb),
(6,3,'模块边界',$q$把所有工具都写在一个文件中会遇到什么问题？模块名和函数名怎样帮助读者找到能力？$q$,$q$应提到组织、复用、命名空间和维护。$q$,'使用标准库',$q$导入 math，定义 circle_area(radius)，输出半径 2 的面积并保留两位小数。$q$,$q$import math

def circle_area(radius):
    return math.pi * radius ** 2

print(round(circle_area(2), 2))$q$,$q$12.57$q$,'["import math","def circle_area"]'::jsonb),
(7,1,'安全操作文件',$q$为什么推荐用 with 打开文件？w 模式与 a 模式最重要的差别是什么？$q$,$q$with 会自动关闭资源；w 覆盖写入，a 在末尾追加。$q$,'保存学习记录',$q$用 UTF-8 写入 note.txt，再读取并输出“今天运行了 3 次代码”。$q$,$q$with open("note.txt", "w", encoding="utf-8") as file:
    file.write("今天运行了 3 次代码")
with open("note.txt", encoding="utf-8") as file:
    print(file.read())$q$,$q$今天运行了 3 次代码$q$,'["with open","encoding="]'::jsonb),
(7,2,'选择数据格式',$q$只保存一段文章与保存包含姓名、等级、标签的结构化数据，分别适合普通文本还是 JSON？$q$,$q$连续文章适合普通文本；键值和列表数据适合 JSON。$q$,'JSON 往返',$q$把 data 转成 JSON 字符串再读回，输出“120 XP”。$q$,$q$import json
data = {"xp": 120}
text = json.dumps(data, ensure_ascii=False)
loaded = json.loads(text)
print(f"{loaded['xp']} XP")$q$,$q$120 XP$q$,'["json.dumps","json.loads"]'::jsonb),
(7,3,'只捕获已知错误',$q$为什么 except Exception 或空 except 可能隐藏真正的问题？什么情况下应捕获 ValueError？$q$,$q$应使用具体异常处理可恢复场景，避免吞掉未知错误。$q$,'友好处理输入错误',$q$尝试把“十六”转换为整数，捕获 ValueError 并输出“请输入数字”。$q$,$q$try:
    age = int("十六")
except ValueError:
    print("请输入数字")$q$,$q$请输入数字$q$,'["try:","except ValueError"]'::jsonb),
(8,1,'类与对象',$q$“学生”这个类与“小林这名学生”这个对象有什么区别？类中为什么要定义方法？$q$,$q$类描述共同结构和行为，对象保存具体数据。$q$,'学习者对象',$q$定义 Learner 类和 study 方法，创建对象并输出“正在学习 Python”。$q$,$q$class Learner:
    def study(self):
        return "正在学习 Python"

learner = Learner()
print(learner.study())$q$,$q$正在学习 Python$q$,'["class Learner","self"]'::jsonb),
(8,2,'实例数据',$q$两个 Student 对象为什么可以拥有不同的 name 和 score？self 在初始化时代表谁？$q$,$q$实例属性分别归属每个对象，self 指向当前对象。$q$,'初始化学生',$q$使用 __init__ 保存 name 和 score，创建“小林，92”并输出“小林：92”。$q$,$q$class Student:
    def __init__(self, name, score):
        self.name = name
        self.score = score

student = Student("小林", 92)
print(f"{student.name}：{student.score}")$q$,$q$小林：92$q$,'["__init__","self.name","self.score"]'::jsonb),
(8,3,'继承还是组合',$q$子类什么时候适合继承父类？如果两个对象只是“合作”，为什么组合通常比继承更自然？$q$,$q$继承表达“是一种”，组合表达“拥有/使用”，应关注职责边界。$q$,'重写学习方法',$q$让 PythonLearner 继承 Learner 并重写 study，输出“正在练习 Python”。$q$,$q$class Learner:
    def study(self):
        return "正在学习"

class PythonLearner(Learner):
    def study(self):
        return "正在练习 Python"

print(PythonLearner().study())$q$,$q$正在练习 Python$q$,'["class PythonLearner(Learner)","def study"]'::jsonb);

with matched as (
  select p.*, c.id as chapter_id, s.id as section_id
  from lesson_practice_seed p
  join public.course_chapters c on c.position = p.chapter_position and c.active
  join public.course_sections s on s.chapter_id = c.id and s.position = p.section_position
    and s.section_type = 'lesson' and s.active
)
insert into public.chapter_exercises(chapter_id, section_id, exercise_group, question_type, topic, prompt, correct_answer, explanation, position, active)
select chapter_id, section_id, 'after_class', 'thinking', thinking_topic, thinking_prompt, thinking_answer,
  '思考题没有唯一表述，请检查概念准确、例子具体、理由清楚。', section_position * 100 + 1, true
from matched
on conflict (chapter_id, exercise_group, position) do update set
  section_id = excluded.section_id, question_type = excluded.question_type, topic = excluded.topic,
  prompt = excluded.prompt, correct_answer = excluded.correct_answer, explanation = excluded.explanation,
  starter_code = '', test_config = '{}'::jsonb, active = true;

with matched as (
  select p.*, c.id as chapter_id, s.id as section_id
  from lesson_practice_seed p
  join public.course_chapters c on c.position = p.chapter_position and c.active
  join public.course_sections s on s.chapter_id = c.id and s.position = p.section_position
    and s.section_type = 'lesson' and s.active
)
insert into public.chapter_exercises(chapter_id, section_id, exercise_group, question_type, topic, prompt, correct_answer, explanation, starter_code, test_config, position, active)
select chapter_id, section_id, 'after_class', 'coding', coding_topic, coding_prompt, expected_output,
  '运行结果应与期望输出一致，并保留题目要求的关键代码片段。', starter_code,
  jsonb_build_object('expected_output', expected_output, 'required_snippets', required_snippets), section_position * 100 + 2, true
from matched
on conflict (chapter_id, exercise_group, position) do update set
  section_id = excluded.section_id, question_type = excluded.question_type, topic = excluded.topic,
  prompt = excluded.prompt, correct_answer = excluded.correct_answer, explanation = excluded.explanation,
  starter_code = excluded.starter_code, test_config = excluded.test_config, active = true;

-- Verify every active lesson has one thinking task and one coding task.
select c.position as chapter, s.position as section,
  count(*) filter (where e.question_type = 'thinking') as thinking_tasks,
  count(*) filter (where e.question_type = 'coding') as coding_tasks
from public.course_sections s
join public.course_chapters c on c.id = s.chapter_id
left join public.chapter_exercises e on e.section_id = s.id and e.active
where s.active and s.section_type = 'lesson'
group by c.position, s.position
order by c.position, s.position;
