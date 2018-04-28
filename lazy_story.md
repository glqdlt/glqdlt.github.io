---
layout: post
title: "Reviews"
author: "glqdlt"
permalink: reviews
comments : false
---

# 게으른 일상

## 책 관리가 안 되어서 시작한 프로젝트

#### 1. 자바 웹 어플리케이션 개발

+ [repository](https://github.com/glqdlt/bms)

+ 책을 들고 다니기 싫어서, 종이책을 스캔하거나 전자책으로 보는 편임. 

+ 저작권 법이 생긴 이후로 업체가 없어지자, 스캔 기기를 구매해서 [직접 스캔하고 있음](#)

+ 100개가 넘어가는 책들이 분산되어서 저장되어서 관리가 필요해짐 (리디북스, 개인NAS, GOOGLE Drive 등)

+ 이 프로젝트를 하면서 여러가지 트랜디한 WEB APP 기술을 많이 접하게 됨.

##  NAS, PIE 의 전원 제어를 위해서 시작한 프로젝트

#### 1. 자바 에이전트 개발

+ [repository](https://github.com/glqdlt/server-manager-agent)

+ 작은 웹 어플리케이션을 에이전트 개념으로 개발해서 PIE와 NAS에 설치(서비스 등록까지)

+ RestAPI를 통해 원격으로 Shutdown/Restart 가능케함.

+ 임베디드 톰켓이라서, Tomcat Manager를 통해 원격 배포를 할 수가 없었음.

+ 스크립트로 CURL 날리게 스크립트를 짜고, 바로가기 만듬.

+ 한계성이 보이기 시작

#### 2. Deplyment tool의 활용

+ 파이썬에는 [fabric](http://www.fabfile.org/), 자바스크립트에는 [shipit](https://github.com/shipitjs/shipit) 라는 좋은 배포 프레임워크가 있음.

+ SSH로 직접 접근해서 deply 및 원격 작업을 할 수 있었음, 이거다 하고 시작.


## 블로그 이전

+ 원래는 블로깅을 티스토리에서 했었음

+ 다음이 카카오톡에 합병 되면서 서비스 중지 될까봐, 구글의 blogger 라던지 이것저것 알아본게 이전의 계기

+ Git으로 관리가 가능하다는 gitpage를 알게 되고, 이전하게 됨

+ 마크다운(.md)을 알게 됨, 정말 좋은 문서 타입이라고 생각함.

## 모든 문서(논문, 이력서 포함) 마크다운으로 관리

+ gitpage 로 블로깅을 이전하면서 모든 문서를 마크다운으로 쓰게 됨

+ [pandoc](https://pandoc.org/) 이라는 유틸리티를 알게 되어서 더더욱 많이 쓰게 됨. 

+ [vs-code](https://code.visualstudio.com/)는 정말 좋은 문서 편집기(일기장) 임.

