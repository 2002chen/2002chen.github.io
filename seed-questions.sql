-- Optional starter content. Once inserted, all questions can be edited in the admin panel.
insert into public.questions(level, topic, question_text, options, correct_index, explanation, position)
values
('beginner','Python 入门','Python 是什么类型的语言？','["只适合制作网页的语言","一种易学、用途广泛的编程语言","只能进行数学计算的软件","一种操作系统"]',1,'Python 是一门通用编程语言，常用于自动化、数据分析、网站开发和人工智能。',1),
('beginner','程序输出','在 Python 中，哪个函数用于显示内容？','["show()","write()","print()","display_text()"]',2,'print() 是 Python 最基础的输出函数。',2),
('beginner','字符串','下列哪个写法表示一个字符串？','["Python","\\"Python\\"","123","True"]',1,'字符串文本需要放在单引号或双引号中。',3),
('beginner','变量','执行 age = 12 后，age 是什么？','["函数","变量","注释","文件"]',1,'等号把右侧的值保存到左侧变量中。',4),
('basic','比较运算','判断两个值是否相等应使用哪个运算符？','["=","==","!=",">="]',1,'单个等号用于赋值，双等号用于判断是否相等。',1),
('basic','条件语句','if 语句结尾通常需要什么符号？','["分号","句号","冒号","逗号"]',2,'Python 的 if、for、while、def 等语句头通常以冒号结尾。',2),
('basic','列表','哪个写法创建了列表？','["(1, 2, 3)","[1, 2, 3]","{1, 2, 3}","<1, 2, 3>"]',1,'方括号用于创建列表。',3),
('basic','循环','遍历列表通常使用哪种语句？','["if","for","try","def"]',1,'for 循环适合逐个访问列表中的元素。',4),
('advanced','函数','定义函数使用哪个关键字？','["function","func","def","lambda_only"]',2,'Python 使用 def 定义普通函数。',1),
('advanced','异常处理','捕获异常通常使用什么结构？','["if/else","try/except","for/in","class/def"]',1,'try 放可能出错的代码，except 处理异常。',2),
('advanced','类','定义类使用哪个关键字？','["object","class","struct","new"]',1,'Python 使用 class 关键字定义类。',3),
('advanced','模块','导入 math 模块的正确写法是？','["include math","using math","import math","load(math)"]',2,'import 关键字用于导入模块。',4);
