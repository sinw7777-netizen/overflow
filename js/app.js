const STORAGE_KEY = 'transfer_prep_prototype_v1';

// 최적화된 수도권 주요 26개 대학 라인업
const UNIVERSITY_LIST = [
  '서울대', '연세대(신촌)', '고려대(서울)', '서강대', '성균관대', '한양대',
  '중앙대', '이화여대', '경희대', '한국외대', '서울시립대', '건국대',
  '동국대', '홍익대', '숙명여대', '국민대', '숭실대', '세종대',
  '단국대', '광운대', '인하대', '아주대', '서울과기대', '가천대',
  '경기대', '성신여대'
];

// 26개 대학 직통 입학처 및 편입 공지 맵핑
const UNIVERSITY_SOURCES = {
  '서울대': 'https://admission.snu.ac.kr/transfer/notice?sc=y',
  '연세대(신촌)': 'https://admission.yonsei.ac.kr/seoul/',
  '고려대(서울)': 'https://oku.korea.ac.kr/oku/cms/FR_CON/index.do?MENU_ID=1770',
  '서강대': 'https://admission.sogang.ac.kr/enter/html/transfer/notice.asp',
  '성균관대': 'https://admission.skku.edu/admission/html/transfer/notice.html',
  '한양대': 'https://go.hanyang.ac.kr/',
  '중앙대': 'https://admission.cau.ac.kr/',
  '경희대': 'https://iphak.khu.ac.kr/',
  '한국외대': 'https://adms.hufs.ac.kr/',
  '서울시립대': 'https://admission.uos.ac.kr/admissionNew/noticeBoard/list.do?list_id=OB1&menuid=2002004001000000000',
  '건국대': 'https://admission.konkuk.ac.kr/admission/37887/subview.do',
  '동국대': 'https://ipsi.dongguk.edu/admission/html/transfer/notice.asp',
  '홍익대': 'https://admission.hongik.ac.kr/',
  '숙명여대': 'https://admission.sookmyung.ac.kr/',
  '이화여대': 'https://admission.ewha.ac.kr/',
  '성신여대': 'https://ipsi.sungshin.ac.kr/',
  '국민대': 'https://admission.kookmin.ac.kr/',
  '숭실대': 'https://iphak.ssu.ac.kr/',
  '세종대': 'https://ipsi.sejong.ac.kr/',
  '단국대': 'https://ipsi.dankook.ac.kr/',
  '광운대': 'https://iphak.kw.ac.kr/help/notice_list.php?nPage=1',
  '인하대': 'https://admission.inha.ac.kr/cms/FR_CON/index.do?MENU_ID=210',
  '아주대': 'https://www.iajou.ac.kr/',
  '서울과기대': 'https://admission.seoultech.ac.kr/',
  '가천대': 'https://admission.gachon.ac.kr/admission/html/transfer/notice.asp',
  '경기대': 'https://enter.kyonggi.ac.kr/'
};

// 26개 대학 전체 정밀 단색 벡터 SVG 엠블럼
const EMBLEMS = {
  '서울대': `<svg viewBox="0 0 100 100" fill="currentColor">
    <circle cx="50" cy="50" r="44" stroke="currentColor" stroke-width="4" fill="none"/>
    <path d="M22 68 L50 20 L78 68 Z" stroke="currentColor" stroke-width="3.5" fill="none"/>
    <circle cx="50" cy="46" r="8" fill="none" stroke="currentColor" stroke-width
