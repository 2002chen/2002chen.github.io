-- 修复 RLS：允许匿名用户读取活跃的课程和题目
-- 在 Supabase SQL Editor 中执行

-- course_chapters: 允许 anon 读取 active 课程
DROP POLICY IF EXISTS "public read active chapters" ON public.course_chapters;
CREATE POLICY "public read active chapters" ON public.course_chapters 
  FOR SELECT USING (active OR public.is_admin());

-- course_sections: 允许 anon 读取 active 小节
DROP POLICY IF EXISTS "public read active sections" ON public.course_sections;
CREATE POLICY "public read active sections" ON public.course_sections 
  FOR SELECT USING (active OR public.is_admin());

-- questions: 允许 anon 读取 active 题目
DROP POLICY IF EXISTS "public read active questions" ON public.questions;
CREATE POLICY "public read active questions" ON public.questions 
  FOR SELECT USING (active OR public.is_admin());
