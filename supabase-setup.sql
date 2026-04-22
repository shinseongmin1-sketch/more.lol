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

-- AI 피드백 캐시
CREATE TABLE IF NOT EXISTS ai_match_feedback (
  match_id   text PRIMARY KEY,
  feedback   text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_match_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON ai_match_feedback;
CREATE POLICY "anon_all" ON ai_match_feedback FOR ALL TO anon USING (true) WITH CHECK (true);

-- 조회수 원자적 증가 함수
CREATE OR REPLACE FUNCTION increment_post_views(post_id text)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  UPDATE community_posts SET views = views + 1 WHERE id = post_id;
$$;
GRANT EXECUTE ON FUNCTION increment_post_views TO anon;

-- ══════════════════════════════════════
-- 캐시 테이블
-- ══════════════════════════════════════

-- Riot API 응답 캐시 (개별 엔드포인트)
CREATE TABLE IF NOT EXISTS riot_api_cache (
  cache_key  text PRIMARY KEY,
  data       jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_riot_api_cache_expires ON riot_api_cache (expires_at);

ALTER TABLE riot_api_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON riot_api_cache;
CREATE POLICY "anon_all" ON riot_api_cache FOR ALL TO anon USING (true) WITH CHECK (true);

-- 랭킹 사전적재 캐시 (overall / pro)
CREATE TABLE IF NOT EXISTS ranking_cache (
  type       text PRIMARY KEY,
  data       jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ranking_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_all" ON ranking_cache;
CREATE POLICY "anon_all" ON ranking_cache FOR ALL TO anon USING (true) WITH CHECK (true);

-- 만료된 캐시 자동 정리 함수 (필요 시 pg_cron으로 주기적 실행)
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  DELETE FROM riot_api_cache WHERE expires_at < now();
$$;
GRANT EXECUTE ON FUNCTION cleanup_expired_cache TO anon;
