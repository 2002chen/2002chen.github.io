-- Updates the live course without deleting learner progress or attempts.
update public.course_chapters set subtitle = '先弄懂代码是什么',
  description = '零基础起步：从电脑怎样执行指令开始，认识程序、代码、Python、运行和输出，再亲手完成第一行代码。',
  cover_icon = '🌱', estimated_minutes = 80 where position = 1;

update public.course_chapters set description = case position
  when 2 then '参考主教材的变量与简单数据类型路线，把变量理解成贴了标签的小盒子，从姓名、年龄和价格等生活信息开始。'
  when 3 then '先用“下雨就带伞”等生活选择理解真假和条件，再逐步接触 if、elif、else。'
  when 4 then '先体验复制相同代码有多麻烦，再学习用循环把重复任务交给电脑。'
  when 5 then '结合主教材的列表和字典知识，用购物清单、姓名单和学生档案学习组织数据。'
  when 6 then '把函数理解成可以反复使用的小工具，再学习参数、返回值和模块。'
  when 7 then '从电脑里的记事本理解文件，从可能失败的操作理解异常，先会使用再解释术语。'
  when 8 then '完成前面基础后，用学生档案和游戏角色理解类与对象，并为项目实践做准备。'
  else description end where position between 2 and 8;

update public.course_sections set title = '1.1 代码到底是什么',
  summary = '从完全不知道代码开始，先认识电脑、程序、代码和 Python。',
  content_html = '<div class="zero-card"><b>开始前，你不需要会任何东西</b><p>如果你从来没见过代码，甚至不知道“运行”是什么意思，这正是这节课要解决的问题。先理解意思，不背单词。</p></div><h3>电脑很快，但不会猜</h3><p>电脑会严格执行人给它的指令。比如“显示一句欢迎语”“算出两个数字的和”“记住一个名字”，都需要把步骤说清楚。</p><div class="word-map"><div><b>程序</b><span>为了完成一件事而排好顺序的一组指令。</span></div><div><b>代码</b><span>我们用编程语言写下来的具体指令。</span></div><div><b>编程语言</b><span>人和电脑约定好的一套表达规则。</span></div><div><b>Python</b><span>一种比较容易阅读、适合初学者的编程语言。</span></div></div><h3>用做菜来理解</h3><p>菜谱像程序，每一步文字像代码，厨师照步骤做菜就像电脑运行代码。步骤写得越清楚，结果越稳定。</p><div class="checkpoint"><b>现在只要记住一句话：</b><p>代码就是写给电脑看的操作说明。Python 是写这种说明的一种语言。</p></div>',
  example_code = 'print("你好，Python！")'
where chapter_id = (select id from public.course_chapters where position = 1) and position = 1;

update public.course_sections set title = '1.2 第一次运行代码',
  summary = '认识编辑区、运行按钮和结果区，逐字符完成第一行代码。',
  content_html = '<h3>“运行”是什么意思</h3><p>运行就是让电脑开始执行代码。写在编辑区里的代码不会自己工作，点击“运行”后，电脑才会读取并执行它。</p><div class="step-list"><div><i>1</i><span>找到页面里的代码编辑区，它像一张可以写指令的纸。</span></div><div><i>2</i><span>输入 <code>print("你好")</code>，注意英文括号和两个引号都要保留。</span></div><div><i>3</i><span>点击“运行”，观察下方结果区是否出现“你好”。</span></div><div><i>4</i><span>把“你好”改成自己的名字，再运行一次。</span></div></div><h3>拆开第一行代码</h3><p><code>print</code> 可以先理解为“请显示”；圆括号装着要交给它的内容；引号表示这里是一段原样显示的文字。</p><div class="note">括号和引号不是装饰。少一个、多一个或没有成对，都可能让电脑看不懂。</div>',
  example_code = 'print("你好，我开始学 Python 了！")'
where chapter_id = (select id from public.course_chapters where position = 1) and position = 2;

update public.course_sections set title = '1.3 写错了怎么办',
  summary = '把报错当作电脑给出的修改提示，并完成第一次排错。',
  content_html = '<h3>写错是正常步骤</h3><p>编程不是一次写对，而是“写一点、运行、看结果、再修改”。专业开发者每天也会遇到报错。</p><h3>先检查三个地方</h3><div class="step-list"><div><i>1</i><span><b>拼写：</b><code>print</code> 是否完整、全部小写？</span></div><div><i>2</i><span><b>符号：</b>左右括号和左右引号是否成对？</span></div><div><i>3</i><span><b>位置：</b>文字是否在括号里面，并被引号包住？</span></div></div><h3>主动制造一个小错误</h3><p>删除末尾的右括号再运行，观察提示；然后把右括号加回来再次运行。你刚完成了一次真正的调试。</p><div class="tip">现在不需要看懂全部英文报错。先知道它在提醒“某个位置无法理解”，再检查附近符号即可。</div><div class="checkpoint"><b>本节过关标准</b><p>你能说出代码、运行、输出的意思，并能修改 print 括号中的文字后看到新结果。</p></div>',
  example_code = 'print("写错不可怕，我会检查和修改。")'
where chapter_id = (select id from public.course_chapters where position = 1) and position = 3;

with concepts(position, term, definition, keyword) as (values
  (1,'电脑指令','告诉电脑需要完成什么操作的清楚说明','操作'),(2,'程序','为了完成一件事而按顺序组织的一组指令','一组指令'),
  (3,'代码','用编程语言写给电脑看的操作说明','操作说明'),(4,'编程语言','人和电脑约定好的一套表达规则','表达规则'),
  (5,'Python','一种容易阅读、适合初学者的编程语言','编程语言'),(6,'运行','让电脑开始读取并执行代码','执行'),
  (7,'print()','让 Python 把指定内容显示出来','显示'),(8,'输出','程序运行后显示或产生的结果','结果'),
  (9,'引号与括号','print 代码中不可随意缺少的成对符号','成对'),(10,'调试','发现问题、检查代码并修改后再次运行的过程','修改'))
update public.chapter_exercises e set topic = c.term,
  prompt = '关于“' || c.term || '”的说法，哪一项正确？',
  options = jsonb_build_array(c.definition, '它只在安装 Python 时使用一次', '它表示所有内容必须是英文', '它与写程序没有关系'),
  correct_answer = c.definition, correct_index = 0, explanation = c.definition
from concepts c where e.chapter_id = (select id from public.course_chapters where position = 1)
  and e.exercise_group = 'after_class' and e.position = c.position;

with concepts(position, term, keyword) as (values
  (11,'电脑指令','操作'),(12,'程序','一组指令'),(13,'代码','操作说明'),(14,'编程语言','表达规则'),
  (15,'Python','编程语言'),(16,'运行','执行'),(17,'print()','显示'),(18,'输出','结果'),
  (19,'引号与括号','成对'),(20,'调试','修改'))
update public.chapter_exercises e set topic = c.term,
  prompt = '请用自己的话解释“' || c.term || '”。可以结合做菜、发消息或按按钮的例子。',
  correct_answer = c.term || '|' || c.keyword,
  explanation = '答案不需要和参考文字完全相同，只要能说清“' || c.keyword || '”这一关键点即可。'
from concepts c where e.chapter_id = (select id from public.course_chapters where position = 1)
  and e.exercise_group = 'after_class' and e.position = c.position;

select c.title, s.position, s.title from public.course_chapters c
join public.course_sections s on s.chapter_id = c.id where c.position = 1 order by s.position;
