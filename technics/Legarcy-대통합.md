---
layout: post
title:  "Legarcy Intergration 의 설계"
author: "glqdlt"
---

# 들어가며

## 문제점

- DRY 원칙을 무시하는 반복된 화면 개발 

    - --> SPA 기반의 각 화면의 엘리먼트를 Module 화 하여 사용이 가능할 텐데

- 컨텐츠 서버와 CMS 간의 같은 Context Point 가 있음에도 불구하고 DRY 를 위배 

    - -->  프로모션 서버와 CMS 간의 Persistence Layer 의 공유가 가능할 텐데 등

- 각 도메인 서비스 마다 각기 다른 Dependency 와 Coding Style, 그렇다고 폴리그랏 한 것도 아님 

    - --> 어차피 다른 스타일이라면 폴리그랏 하게 처리하고 싶어짐

- 커다란 레거시 프로젝트의 문제로 TC 커버리지를 50% 이상을 넘기기가 힘듬 
    
    - --> 레거시는 레거시대로 두기로 하고, 프로젝트를 가벼운 Weight 로 새로 시작

- 엔지니어 입장에서 신기술을 적용해보고픈 욕구를 거대한 레거시 프로젝트들과 그의 사용자들로 인하여 발목이 잡힘
    
    - --> 기존 레거시 프로젝트를 잘 이용하던 유저들을 설득하기 위해, 그들의 업무 환경에 변화에 위화감이 없어야함.


# 설계

## 설계 고려 사항

- 기존 레거시 SSO(세션 기반) 인증을 그대로 두고 진행할 수 있는가? 

    - --> 기존 레거시 SSO 인증은 그대로 두고, 앞 단에 새로운 인증 서버와 [엣지 서버(ZuulGateway)](https://spring.io/guides/gs/routing-and-filtering/)를 개발하고, 새로운 통합 UI에서는 엣지 서버와 통신하게만 처리함. 
    
        엣지 서버와 레거시 서버에는 Private Network 망으로 구성하게 하면, 레거시와 신규 인증간의 충돌에 대해 고려하지 않을 수 있음.

- 기존 레거시 API 엔드포인트의 프로토콜 스펙이 제각각인 것을 어떻게 처리할 것인가? 

    - --> 레거시 전용 API Request Wrapping 서버를 만들어서, 투명성을 제공하도록함.

> 제각각인 것 : 1CMS 에서는 ```/api/**```, 2CMS에서는 ```/GAME/**``` 로 시작하거나, return HTTP Status Code 와 Object Type (어떤 놈은 Object를 CSV 직렬화해서 보내기도 -_-)이 제각각인 문제를 말함

- MSA 관점에서 관리 포인트가 늘어남에 따라, 각 서비스 컴포넌트 간의 로깅이나 장애에 대한 모니터링은 어떻게 할 것인가? 

    - --> Central Logging Server를 만들어야하나? 이건 잘 모르곘음.

## 구성도

<img src="/images/tech/arc.png">


## 기술적 고려 사항

- 각 서비스 컴포넌트 간의 Connection Timeout 은 몇 초로 할 것인가?

- API 엔드포인트와 Retury Status 에 대해 어떻게 정형화 할 것인가? 

    - --> 의도 된 에러 발생시 500으로 던질 것인가? 200으로 던질 것인가?

- 폴리그랏한 환경에서 팀원 간의 Skill Point 가 다른 것에 대해 어떻게 고려할 것인가?

    - --> A 언어를 다룰 수 있는 개발자가 1명인 경우에, A 언어로 작은 단위의 APP을 만들 수 있게 할 것인가?


## 레퍼런스

### 넷플릭스 Zuul

[구글검색](https://www.google.co.kr/search?newwindow=1&source=hp&ei=_PLjW6b-OILe8wWO-KbQAg&q=%EB%84%B7%ED%94%8C%EB%A6%AD%EC%8A%A4+zuul&oq=%EB%84%B7%ED%94%8C%EB%A6%AD%EC%8A%A4+zu&gs_l=psy-ab.3.0.0l2.182.2452.0.3348.21.11.0.2.2.0.254.1205.0j5j2.7.0....0...1c.1j4.64.psy-ab..15.6.727.0..35i39k1j0i131k1.0.dPTWEPtpSAg)

[잘 정리된 블로그](http://kerberosj.tistory.com/228)

[우아한 형제들 기술 블로그](http://woowabros.github.io/r&d/2017/06/13/apigateway.html)

