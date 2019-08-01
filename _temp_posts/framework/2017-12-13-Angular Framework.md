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

많은 이들이 AngularJS와 Angular의 차이점에 대해 자세히 아는 사람이 없다. 어떤 이들은 Angular를 AngularJS의 확장판이라고까지 생각하는 사람도 있는 데, 이는 잘 못 되었다. Angular는 Java와 Javascript의 차이 처럼 AngularJS와 전혀 다르며 이름만 비슷한 프레임워크이다. 실제로 Angular는 AngularJS에서 사용하던 Core 기능 절반을 제거했고 내부를 다 뜯어고쳤다. 그러나 기존에 사용하던 지시자(디렉티브), 데이터 바인딩 과 탬플릿 기반의 개발은 여전히 똑같다.
AngularJs와 Angular의 큰 차이점이라면 Angular는 클래스 중심의 모듈 구조의 개발을 더욱 직관적이고 쉽게 할 수 있게 되었다는 것이 다른 점이다.


## Angular 를 선택한 이유

Angular를 선택한 이유는 아래와 같다.

잘 만들어지고 구조적인 틀 : 프론트엔드 기반 경험이 적으므로 좋은 레퍼런스로 활용할 수 있는 Angular의 잘 짜여지고 강제화 된 뼈대는 기반 체계를 잡는 데 용이할 것으로 생각.

객체 지향 프로그래밍 : Typescript 와 Angualr Framework로 개발한다면 기존의 SpringMVC와 비슷한 개발흐름을 갖는 것을 느꼈다. 상속을 지원하고 서비스를 분리함으로써 얻을 수 있는 형태에서 많은 유사함을 느꼈다. 기존의 자바스크립트도 프로토타입을 통한 Class와 상속을 할 수 있다지만, Typescript 문법은 Java 개발하고 거의 유사하여 적응하는 데 용이했다.

Google 지원 : Google 에서 Angular 를 확실하게 밀어주고 있다는 인상.

템플릿 의 분리 : React를 고려하지 않은 이유 중 하나인데, template 과 코드가 합쳐지는 형태인 JSX는 원만한 협업 분리가 불가능할 것으로 보여서 고려하지 않았었다. 이와는 반대로 angular와 vue는 템플릿이 분리되는 형태임으로(물론 디렉티브는 template에서 적용 되지만..) 관심을 가졌었다.

[Reference](https://medium.com/unicorn-supplies/angular-vs-react-vs-vue-a-2017-comparison-c5c52d620176)



## ECMA Script

Angular는 공식적으로 개발 언어를 Typescript로 진행할 것을 권장한다. Typescript 는 자바스크립트 표준 스팩인 최신 ECMA Script 2015를 확장한 트랜스파일 언어이기에, Typescript를 한다는 것은 ES6를 빼놓을 수가 없다. 

Typescript와 ECMA Script 의 차이점은 잔잔한 요소들이 있지만, 유일하게 가장 큰 차이점으로 타입스크립트는 Type 선언을 의무화 하는 차이점이 있다. 이 차이점으로 인해 기존의 동적 언어에서 가지기 어려웠던 정적 검사나 개발 도구의 Code Assist 기능 등을 좀 더 명확하게 사용이 가능해졌다.

또한 기존의 자바스크립트가 객체지향 프로그래밍을 흉내 냈었다면 지금의 최신 자바스크립트는 기존의 겉햝기 느낌의 객체지향 프로그래밍이 보다 완성도 있게 개발할 수 있게 되었고, (예를 들면 클래스(class) 와 인터페이스(interface) 를 사용할 수 있게 되었다.) 대부분의 모던 언어 패러다임(Arrow Function, Block 등)을 대거 수용하는 등, 개인적으로  언어스럽다고 할 정도로 많은 기능이 추가 되었다는 인상이다.

언어를 공부한다는 것은 방대한 것이기 때문에 (사실 나의 지식이 짧아서..-_-;) 이 세션에서 할 수 있는 일이 없다. 개개인이 직접 책이나 교육 영상을 보고 시간을 투자해 학습해보았으면 한다. [ES6-Cheatsheet](https://github.com/DrkSephy/es6-cheatsheet) 와 같은 Cheatsheet를 참고하여도 좋다.


## Angular 개발 도구

Angular 개발을 위해서는 선행으로 NodeJS, Npm (또는 Yarn), Angular CLI를 설치하여야 한다. 방법에 관해서는 필자의 글 보다 많은 좋은 포스트들이 있으니, 검색하여 참고해 설치하여 주면 좋겠다.

Angualr는 강력한 개발 도구인 Angular CLI 을 제공 한다. terminal 과 text editor 만 있으면 대부분의 개발을 할 수가 있다. (그래도 권장한다면 Typescript를 만든 Microsoft에서 개발한 Visual Studio Code와 같은 IDE를 쓰는 것을 추천한다. Code Assistant 와 디버깅을 제공한다. 필자의 경우는 Webstormp 의 아버지인 IntelliJ 를 쓰고 있다.)



TODO 작성 필요

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



