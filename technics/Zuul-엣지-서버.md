---
layout: post
title:  "넷플릭스 Zuul"
author: "glqdlt"
---

# 들어가며

넷플릭스 Zuul 은 MSA 클라우드 상에서 모든 API에 접근하기 위한 진입점이 되는  게이트웨이의 성격을 가진 녀석이다. 서비스 전체 구성 안에서 로그인과 로깅과 같은 공통 관심사를 처리할 수 있는 필터링 부터, 특정 API 로 흐름을 이동시켜주는 라웉이 기능까지 가지고 있다.

- zuul 1 버전은 서블릿을 사용했었지만, zuul 2 부터 netty 를 사용하고 있다.


<img src="/images/tech/zuul.png"/>
<img src="/images/tech/zuul2.png"/>

