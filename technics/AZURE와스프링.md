---
layout: post
title:  "애저와 스프링"
author: "glqdlt"
---

# 들어가며

대부분의 회사에서는 클라우드 플랫폼으로 AWS 를 사용하고 있다. 나 역시 대세를 따라서 차기 회사에서는 AWS를 접할 거라 생각하고 관련 공부를 틈틈히 해왔었다. 

하지만 웃프게도 생각과는 달리 이직한 조직에서는 AZURE 를 도입이 진행되고 있었다. =_=

오프 더 레코드이지만 AZURE 는 관련 담당자 조차도 AZURE 가 AWS를 쫓아가는 모양새라고 말할 정도로 기술적 차이가 다소 있다.

그렇지만 한국 기준으로 게임 업계와 MS 간의 친근(?)한 분위기가 있다 보니 AWS 에 비해 비용적으로 가성비가 매우 좋아 게임 업계에서는 AZURE 로의 도입을 많이들 하는 것으로 보여진다.

무엇이든 간에 클라우드에서의 개발은 가슴 설레이지만 실무자 차원에서 자바와 AWS 관련해서는 자료가 매우 풍부한 것에 비해 AZURE를 기반으로 한 자료는 오래 되었거나, 거의 전무한 상태다. -_-;

이런 이유 땜에 팀 공유 차원에서 시작한 파일럿 프로젝트의 흔적을 다른 이들에게도 도움이 되었으면 하는 바램으로 공유하고자 한다.

이 아티클은 [MS 공식 AZURE Spring Boot Starter](https://docs.microsoft.com/ko-kr/java/azure/spring-framework/spring-boot-starters-for-azure?view=azure-java-stable) 를 베이스로 한다.

# 본문

우선 AZURE 에서 [체험 계정](https://azure.microsoft.com/ko-kr/free/)을 발급 받아서 진행해야 한다.




1. AD 만들기

자신의 AZURE 포털에서 리소스 만들기 > Identity > Azure AD 만들기로 접근

조직 이름과 도메인 이름을 기입하고 만들기 한다.

대략 4분 걸리는 듯, 오래걸린다.