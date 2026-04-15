-- morelol 커뮤니티 테이블 설정
-- Supabase 대시보드 > SQL Editor 에서 실행하세요

-- 회원
CREATE TABLE IF NOT EXISTS community_users (
  id          text PRIMARY KEY,
  nickname    text UNIQUE NOT NULL,
  password    text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

-- 탈퇴 회원 (재가입 제한)
CREATE TABLE IF NOT EXISTS community_deleted_users (
  id          text PRIMARY KEY,
  deleted_at  timestamptz NOT NULL
);

-- 게시글
CREATE TABLE IF NOT EXISTS community_posts (
  id               text PRIMARY KEY,
  title            text NOT NULL,
  content          text NOT NULL,
  category         text NOT NULL,
  author_id        text NOT NULL,
  author_nickname  text NOT NULL,
  views            integer DEFAULT 0,
  likes            integer DEFAULT 0,
  dislikes         integer DEFAULT 0,
  images           jsonb DEFAULT '[]'::jsonb,
  parent_id        text REFERENCES community_comments(id) ON DELETE CASCADE,
  created_at       timestamptz DEFAULT now()
);

-- 댓글 (게시글 삭제 시 자동 삭제)
CREATE TABLE IF NOT EXISTS community_comments (
  id               text PRIMARY KEY,
  post_id          text NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id        text NOT NULL,
  author_nickname  text NOT NULL,
  content          text NOT NULL,
  created_at       timestamptz DEFAULT now()
);

-- 좋아요/싫어요
CREATE TABLE IF NOT EXISTS community_post_reactions (
  post_id   text NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id   text NOT NULL,
  type      text NOT NULL CHECK (type IN ('like', 'dislike')),
  PRIMARY KEY (post_id, user_id, type)
);

-- RLS 활성화 + anon 키로 전체 접근 허용
ALTER TABLE community_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON community_users;
CREATE POLICY "anon_all" ON community_users FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE community_deleted_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON community_deleted_users;
CREATE POLICY "anon_all" ON community_deleted_users FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON community_posts;
CREATE POLICY "anon_all" ON community_posts FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON community_comments;
CREATE POLICY "anon_all" ON community_comments FOR ALL TO anon USING (true) WITH CHECK (true);

ALTER TABLE community_post_reactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON community_post_reactions;
CREATE POLICY "anon_all" ON community_post_reactions FOR ALL TO anon USING (true) WITH CHECK (true);

-- 조회수 원자적 증가 함수
CREATE OR REPLACE FUNCTION increment_post_views(post_id text)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE community_posts SET views = views + 1 WHERE id = post_id;
$$;
GRANT EXECUTE ON FUNCTION increment_post_views TO anon;
