# Pro PhoneBook PRD (Product Requirements Document)

## 1. 프로젝트 개요
- **프로젝트 명**: Pro PhoneBook (보안 중심 프리미엄 연락처 관리 시스템)
- **목표**: 개인 정보를 안전하게 암호화하여 저장하고, 세련된 대시보드 UI를 통해 효율적으로 연락처를 관리하는 웹 서비스 개발.
- **주요 가치**: 보안성(Privacy), 세련된 디자인(Sophistication), 사용 편의성(Usability).

## 2. 디자인 및 사용자 경험 (UX/UI)
- **컨셉**: 모던 프리미엄 대시보드 (Modern Premium Dashboard)
- **브랜딩**: "facebook" 클론에서 벗어나 독자적인 "Pro PhoneBook" 아이덴티티 구축.
- **색상**: 
  - Primary: #1877F2 (Pro Blue)
  - Background: #F8FAFC (Modern Soft Gray)
  - Text: #0F172A (Slate 900)
- **타이포그래피**: Outfit (헤드라인용), Inter (본문용)
- **요소**: 둥근 모서리(12px), 부드러운 그림자(Shadow-pro), 글래스모피즘(Header/Sidebar).

## 3. 핵심 기능
### 3.1 회원 시스템 (Authentication)
- 이메일/비밀번호 기반 가입 및 로그인.
- 본인만의 고유한 연락처 데이터 격리 (RLS 적용).

### 3.2 연락처 관리 (CRUD)
- 이름, 전화번호, 카테고리, 메모, 프로필 사진 저장.
- **보안**: 이름과 전화번호는 클라이언트 측에서 암호화(CryptoJS) 후 저장.
- **검색**: 암호화된 데이터에서도 검색이 가능하도록 검색용 해시 토큰(Hashed Token) 생성 및 활용.

### 3.3 커스텀 파일 업로드
- Supabase Storage를 이용한 연락처 프로필 이미지 업로드 기능.

## 4. 기술 스택
- **Frontend**: Next.js (App Router), React, Tailwind CSS.
- **Backend/DB**: Supabase (PostgreSQL, Auth, Storage).
- **Encryption**: CryptoJS (AES-256).
- **Typography**: Google Fonts (Outfit, Inter).

## 5. 단계별 개발 계획
1. **v1.0**: 기본 CRUD 및 암호화 구현 (FB 스타일 Prototype).
2. **v1.1**: 인증(Auth) 및 이미지 업로드 추가.
3. **v2.0**: **[현재 단계]** 전체적인 디자인 고도화 및 "Pro PhoneBook" 브랜딩 적용.
