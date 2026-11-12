<div align="center">

# 🎓 편입 준비 한눈에
**AI 기반 수도권 주요 26개 대학 편입학 모집요강 요약 및 수험 관리 비서**

[![Live Demo](https://img.shields.io/badge/Live_Demo-실행하기-2563eb?style=flat-square&logo=github)](https://sinw7777-netizen.github.io/overflow/pages/prototype_ver0.5.html)
[![Notion](https://img.shields.io/badge/Notion-주차별_산출물-000000?style=flat-square&logo=notion)](https://app.notion.com/p/3dcde62447b280daae42ccbf36ceb36e)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

</div>

---

### 📌 프로젝트 소개 (Team Overflow)
대학별·전형별로 상이한 편입학 모집요강을 한곳에서 비교하고, 다중 목표 대학의 준비 현황을 체계적으로 관리할 수 있는 모바일 웹 서비스 프로토타입입니다.

* **주요 26개 대학 요강 및 입학처 직통 연결**: 지원 자격·학점, 시험 과목, 공인어학 기준, 원서 일정을 4대 영역으로 구조화하여 제공
* **실시간 목표 대학 순위 변경 & 전용 엠블럼**: 드래그 앤 드롭(터치/마우스) 핸들을 통한 지망 순위(1~N순위) 즉시 재배열 및 26개교 고유 벡터 엠블럼 워터마크 반영
* **수험생 로그인 & 개인정보 보호**: 계정 연동 로그인 모달(약관 필수 동의 포함), 대학별 독립 체크리스트 및 개인 메모, JSON 백업·복원 지원
* **지능형 전형 예외 제어**: 일반편입 미선발 대학(서울대 등) 선택 시 전형 자동 고정 및 안내 배너 제공

---

### 🔗 프로젝트 링크 및 산출물
* **웹 프로토타입 실행 (최신 버전)**: [편입 준비 한눈에 실행하기](https://sinw7777-netizen.github.io/overflow/pages/prototype_ver0.5.html)
* **팀 노션 (주차별 산출물)**: [Team Overflow Notion 바로가기](https://app.notion.com/p/3dcde62447b280daae42ccbf36ceb36e)
* **기획 문서 (PRD)**: [`pages/편입 준비 한눈에_ver0.5_26.11.10_PRD.pdf`](./pages/)

---

### 📂 저장소 구조
```text
overflow/
├── css/          # 모바일 앱 UI 스타일시트
├── data/         # 수도권 주요 26개교 요강 및 엠블럼 데이터 (JSON)
├── js/           # 상태 관리, 계정 로그인, 드래그 앤 드롭, AI 요강 탐색 로직
├── pages/        # 버전별 단일 실행 파일(.html) 및 PRD 산출물 보관
├── index.html    # 메인 엔트리 페이지
└── README.md     # 프로젝트 안내 문서
