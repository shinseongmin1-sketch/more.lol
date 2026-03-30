import { useState } from 'react'
import './SubPage.css'
import './NoticePage.css'

const tabs = ['전체', '업데이트', '점검', '이벤트', '일반']
const notices = [
  { id: 1, tag: 'update', tagLabel: '업데이트', title: '[업데이트] more.lol 14.24 패치 데이터 반영 완료', date: '2026.03.30', views: 8412, pinned: true, isNew: true },
  { id: 2, tag: 'check', tagLabel: '점검', title: '[점검] 3월 31일 서버 점검 안내 (02:00 ~ 06:00)', date: '2026.03.29', views: 5231, pinned: true, isNew: true },
  { id: 3, tag: 'event', tagLabel: '이벤트', title: '[이벤트] more.lol 오픈 기념 이벤트 — 피드백 남기고 리그 포인트 받아가세요', date: '2026.03.28', views: 12847, pinned: false, isNew: true },
  { id: 4, tag: 'update', tagLabel: '업데이트', title: '[업데이트] 챔피언 분석 페이지 아이템 빌드 기능 추가', date: '2026.03.25', views: 4129, pinned: false, isNew: false },
  { id: 5, tag: 'general', tagLabel: '일반', title: 'more.lol 서비스 이용 안내 및 데이터 출처 공지', date: '2026.03.20', views: 3841, pinned: false, isNew: false },
  { id: 6, tag: 'check', tagLabel: '점검', title: '[완료] 3월 20일 긴급 점검 결과 안내', date: '2026.03.20', views: 2103, pinned: false, isNew: false },
  { id: 7, tag: 'update', tagLabel: '업데이트', title: '[업데이트] 소환사 전적 검색 속도 개선 안내', date: '2026.03.15', views: 3200, pinned: false, isNew: false },
  { id: 8, tag: 'event', tagLabel: '이벤트', title: '[이벤트] 베타 테스터 모집 — 선착순 100명', date: '2026.03.10', views: 9810, pinned: false, isNew: false },
]

export default function NoticePage() {
  const [activeTab, setActiveTab] = useState('전체')
  const filtered = activeTab === '전체' ? notices : notices.filter(n => n.tagLabel === activeTab)
  return (
    <div className="subpage notice-page">
      <div className="subpage-header">
        <div className="subpage-header-inner">
          <div>
            <h1 className="subpage-title">공지사항</h1>
            <p className="subpage-desc">more.lol 서비스 업데이트, 점검, 이벤트 공지</p>
          </div>
          <div className="subpage-meta">
            <span className="patch-badge">공식 채널</span>
            <span className="update-info"><span className="update-dot" />최신 공지</span>
          </div>
        </div>
      </div>
      <div className="subpage-body">
        <div className="notice-tabs">
          {tabs.map(t => (
            <button key={t} className={`notice-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>{t}</button>
          ))}
        </div>
        <div className="notice-list">
          {filtered.map(n => (
            <div key={n.id} className={`notice-item${n.pinned ? ' pinned' : ''}`}>
              {n.pinned ? <span className="notice-tag pin">📌 고정</span> : <span className={`notice-tag ${n.tag}`}>{n.tagLabel}</span>}
              <div className="notice-content">
                <div className="notice-title">{n.title}{n.isNew && <span className="notice-new">NEW</span>}</div>
                <div className="notice-meta"><span>{n.date}</span><span>조회 {n.views.toLocaleString()}</span></div>
              </div>
              <span className="notice-arrow">›</span>
            </div>
          ))}
        </div>
        <div className="notice-pagination">
          <button className="page-btn">‹</button>
          {[1,2,3,4,5].map(pg => <button key={pg} className={`page-btn ${pg === 1 ? 'active' : ''}`}>{pg}</button>)}
          <button className="page-btn">›</button>
        </div>
      </div>
    </div>
  )
}
