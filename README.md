# TEAM FLOW — GitHub Pages + Google Sheets

팀 일정과 업무를 Google Sheets 한 곳에 저장하고, GitHub Pages에서 함께 조회·등록·수정·삭제하는 웹앱입니다.

## 구성 파일

```text
index.html
style.css
app.js
config.js
.nojekyll
apps-script/
  Code.gs
  appsscript.json
GOOGLE_SHEETS_SETUP.md
GITHUB_UPLOAD_GUIDE.md
```

## 핵심 동작

- `Members` 시트: 팀원 이름과 팀 설정
- `Tasks` 시트: 모든 업무 데이터
- `Logs` 시트: 저장·삭제 이력
- GitHub Pages: 대시보드와 업무 관리 화면
- 최초 접속 시 팀 접속키 입력
- 브라우저에는 최근 데이터를 캐시하지만, 기준 데이터는 Google Sheets입니다.

설정은 `GOOGLE_SHEETS_SETUP.md` 순서대로 진행하세요.
