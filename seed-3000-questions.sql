-- Expands the dynamic question bank to 3,000 unique rows without touching attempts.
-- The wording is generated from reviewed concept templates and deterministic values.

with concepts(level, topic, concept, definition, distractor_a, distractor_b, distractor_c, base) as (
  values
  ('beginner','代码与程序','代码','写给电脑执行的操作说明','电脑硬件的名称','只能保存图片的文件','网络连接的密码',1),
  ('beginner','程序输出','print()','在屏幕上显示指定内容','删除一段代码','接收键盘输入','创建文件夹',2),
  ('beginner','字符串','字符串','由引号包住的一段文本','只能进行加法的数字','永远为真的条件','函数的另一种名称',3),
  ('beginner','变量','变量','保存数据并带有名称的容器','无法修改的错误信息','Python 安装程序','网页上的按钮',4),
  ('beginner','整数','int','表示没有小数部分的整数类型','表示一段文本的类型','专门保存图片的类型','用于结束程序的命令',5),
  ('beginner','小数','float','表示带小数部分的数值类型','表示真假状态的类型','代码注释的标记','循环的停止按钮',6),
  ('beginner','布尔值','bool','表示 True 或 False 的真假类型','表示任意长度文本的类型','只能保存零的类型','文件读取模式',7),
  ('beginner','用户输入','input()','接收用户键盘输入并返回文本','把内容打印到屏幕','自动关闭程序','创建一个类',8),
  ('beginner','类型转换','int()','把符合格式的内容转换成整数','把整数永久删除','把代码变成注释','把列表变成文件',9),
  ('beginner','注释','# 注释','给人阅读且通常不会被执行的说明','必须执行的数学公式','创建变量的唯一方法','导入模块的关键字',10),
  ('basic','条件判断','if','条件成立时执行对应代码块','无条件重复所有代码','定义一个新函数','读取一个文件',11),
  ('basic','条件分支','else','前面条件都不成立时执行的分支','列表的第一个元素','函数必须返回的值','表示相等的运算符',12),
  ('basic','比较运算','==','判断两个值是否相等','把右侧值保存到左侧','判断两个值都不相等','表示大于等于',13),
  ('basic','逻辑运算','and','要求左右两个条件都成立','要求条件全部不成立','只检查右侧条件','用于结束循环',14),
  ('basic','列表','list','按顺序保存多个元素且可以修改的容器','只能保存一个数字','永远不能修改的文本','专门处理异常的结构',15),
  ('basic','列表方法','append()','把一个元素添加到列表末尾','删除列表中的所有元素','把列表转换成函数','返回列表长度',16),
  ('basic','字典','dict','使用键和值组织数据的容器','只能按位置存数字的容器','不允许任何重复字符','专门存放代码注释',17),
  ('basic','循环','for','依次处理可迭代对象中的元素','只执行一次条件判断','定义类的关键字','捕获异常的结构',18),
  ('basic','循环范围','range()','生成一系列整数供循环使用','把文本转换成字典','读取用户输入','关闭打开的文件',19),
  ('basic','条件循环','while','条件为真时重复执行代码块','无论条件如何只执行一次','专门创建列表','定义函数参数',20),
  ('advanced','函数','def','定义一个可重复调用的函数','导入第三方模块','创建文件路径','捕获所有异常',21),
  ('advanced','函数返回','return','结束函数并把结果交回调用处','只在屏幕上打印内容','开始一个无限循环','创建类属性',22),
  ('advanced','异常处理','try/except','尝试执行代码并处理可能发生的异常','重复执行固定次数','定义对象的属性','按索引读取列表',23),
  ('advanced','文件操作','with open()','打开文件并在代码块结束后自动关闭','创建一个无限循环','把函数转换成类','获取用户键盘输入',24),
  ('advanced','类与对象','class','定义一类对象的属性和行为蓝图','创建普通字符串','开始条件判断','导入 JSON 文件',25),
  ('advanced','对象初始化','__init__','创建实例时初始化对象数据的方法','结束程序的特殊函数','读取列表长度的方法','捕获异常的关键字',26),
  ('advanced','继承','继承','让子类复用和扩展父类能力','让变量永久不能修改','把字典转换成列表','让循环永远停止',27),
  ('advanced','模块','import','把模块中的能力引入当前程序','把代码输出到屏幕','删除当前文件','定义局部变量',28),
  ('advanced','JSON','JSON','常用于交换和保存结构化数据的文本格式','Python 的循环关键字','只能保存图片的格式','定义函数的语句',29),
  ('advanced','测试','测试','用预期结果检查程序行为是否正确','把代码发布到互联网','删除所有错误提示','只阅读代码不运行',30)
), generated as (
  select c.*, g.n,
    case g.n % 5
      when 0 then '关于“' || c.concept || '”，下面哪一项描述正确？'
      when 1 then '初学者正在学习“' || c.concept || '”。应当记住的核心含义是什么？'
      when 2 then '在 Python 学习中，“' || c.concept || '”最接近下面哪种说法？'
      when 3 then '小明需要解释“' || c.concept || '”。以下回答哪项最准确？'
      else '复习知识点“' || c.concept || '”时，哪一项理解没有错误？' end as prompt
  from concepts c cross join generate_series(1,100) as g(n)
)
insert into public.questions(level,topic,question_text,options,correct_index,explanation,position,active)
select level,topic,prompt || '（训练编号 ' || lpad(n::text,3,'0') || '）',
  case n % 4
    when 0 then jsonb_build_array(definition,distractor_a,distractor_b,distractor_c)
    when 1 then jsonb_build_array(distractor_a,definition,distractor_b,distractor_c)
    when 2 then jsonb_build_array(distractor_a,distractor_b,definition,distractor_c)
    else jsonb_build_array(distractor_a,distractor_b,distractor_c,definition) end,
  n % 4, '“' || concept || '”的核心含义是：' || definition || '。',
  100000 + (case level when 'beginner' then 0 when 'basic' then 1000 else 2000 end) + (base-1)*100 + n, true
from generated g
where not exists (
  select 1 from public.questions q
  where q.position = 100000 + (case g.level when 'beginner' then 0 when 'basic' then 1000 else 2000 end) + (g.base-1)*100 + g.n
);

select level,count(*) as question_count from public.questions where active group by level order by level;
