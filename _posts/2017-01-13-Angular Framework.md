---
layout: post
title:  "[작성중] Spring & Single Page Application"
author: "glqdlt"
comments : true
---

## 타이틀

## 목차

1. Angular 개요
2. ECMA Script
3. Angular 개발 도구
3. 컴포넌트의 이해
4. 모듈의 이해
5. 라우터의 이해
6. 서비스의 이해
7. 실습 : CRUD



## Angular 개요

많은 이들이 AngularJS와 Angular의 차이점에 대해 자세히 아는 사람이 없다. 어떤 이들은 Angular를 AngularJS의 확장판이라고까지 생각하는 사람도 있는 데, 이는 잘 못 되었다. Angular는 Java와 Javascript의 차이점 처럼 AngularJS와 전혀 다른 이름만 같은 프레임워크이다. 실제로 Angular는 AngularJS에서 사용하던 Core 기능 절반을 제거했고 내부를 다 뜯어고쳤다. 그러나 기존에 사용하던 지시자(디렉티브), 데이터 바인딩 과 탬플릿 기반의 개발은 여전히 똑같다.
AngularJs와 Angular의 실무 관점에서의 큰 차이점이라면 Angular는 클래스 중심의 컴포넌트 기반 개발을 하게 되었다는 것이 다른 점이다.




## ECMA Script

Angular를 한다는 것은 Typescript 를 한다는 것이고, Typescript 는 자바스크립트 표준 스팩인 최신 ECMA Script(ES7)를 확장한 트랜스파일 언어이다. Typescript와 ECMA Script 의 차이점은 타입스크립트는 Type 선언을 의무화(권장) 하는 차이점이 있다. 이 차이점으로 인해 기존의 동적 언어에서 가지기 어려웠던 정적 검사나 IDE의 Code Assist 기능 등을 사용할 수 있게 되었다.
또한 기존의 자바스크립트가 객체지향 프로그래밍을 흉내 냈었다면 지금의 최신 자바스크립트는 객체지향 프로그래밍을 할 수 있게 되었고, (예를 들면 클래스(class) 와 인터페이스(interface) 를 사용할 수 있게 되었다.) 모던 랭기지 패러다임(Arrow Function, Block 등)들도 대거 추가 되어   이제 언어스럽다고 할 정도로 많은 기능이 추가 되었다.

언어를 공부한다는 것은 방대한 것이기 때문에 이 세션에서 할 수 있는 일이 없다. 개개인이 직접 책이나 교육 영상을 보고 시간을 투자해 학습해보기를 바란다. [ES6-Cheatsheet](https://github.com/DrkSephy/es6-cheatsheet) 와 같은 Cheatsheet를 참고하여도 좋다.


## Angular 개발 도구

Angular 개발을 위해서는 선행으로 NodeJS, Npm (or yarn), Angular CLI를 설치하여야 한다. 방법에 관해서는 필자의 글 보다 많은 좋은 포스트들이 있으니, 검색하여 참고해 설치하길 바란다.

Angualr는 강력한 개발 도구인, Angular CLI 을 제공 한다. terminal 과 text editor 만 있으면 대부분의 개발을 할 수가 있다. (그래도 권장한다면 Typescript를 만든 Microsoft에서 개발한 VisualStudio Code와 같은 IDE를 쓰는 것을 추천한다. Code Assistant 와 디버깅을 제공한다. 필자는 프론트엔드 개발에서 유료 툴로 가장 좋다는 Webstormp 의 부모 겪인 IntelliJ 를 쓰고 있다.)


ng new simple-project

cd simple-project

ng serve

http://127.0.0.1:4200  으로 접속을 해본다.

Welcome to app을 확인 한다.


ng build

.angular-cli.json 에서 "outDir" : 을 참고하여 빌드 폴더를 확인한다.

tsconfig.json 에서 typescript 의 컴파일(트랜스파일) 설정을 한다.
 




## 컴포넌트의 추가

ng g component simple



