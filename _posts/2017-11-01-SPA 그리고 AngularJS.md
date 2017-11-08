---
layout: post
title:  "SPA(Single Page Application) 그리고 AngularJS"
author: "glqdlt"
---

# Why, Angular? (Single Page Application)

## 요즘 Web App..

요즘 웹 트랜드에서 자주 언급 되는 이야기들이 많다. AngularJS, React, Vue.JS .. AWS, 서버리스 참 많은 이야기가 오고 간다. 무엇이 되었든 그 중점에는 Web App, 거기에 Front 엔지니어링에 포커싱 된 많은 트랜드가 화두가 되었다. 특히 약 4년 전에는 MEAN Stack (Full Stack) 이란 말이 유행 했던 적도 있을 정도로.. 벡엔드 진영에서는.. '화면 개발자가 북치고 장구치고를 다 한다고?' 거대한 어떠한 틀이 바뀐 인상이었다.

최근에 감명 깊게 읽었던 [클라이언트 서버 웹 앱 만들기. 저, 캐지미어 새터노스]() 는, 책의 모든 맥락에서 '클라이언트 // 서버' 라고 명확히 단절해서 이라고 표현한다. 포지셔닝을 뜻 하는 것이 아니라, 완전 별개의 이야기로 얘기를 한다. 이 말은 프론트/벡엔드가 명확히 나뉘어 지는 워크 아키텍처 떄문일 수도 있지만, 기능상으로만 봐도 SPA 는 단순 Document 가 아닌 Application 이라고 보는 것이 옳다, MVC를 스트럭처를 가진 SPA를 어찌 단순 Web Page로 볼 수 있단 말인가? 즉 Html로 접근 할 것이 아닌 하나의 Application 으로 접근해야 한다.

어려운 말을 했던 것 같다, 굉장히 추상적이어서 아리까리하게 느껴질 수도 있는데, 이제 쉽게 접근해보자. SPA(Single Page Application)은 문자 그대로 '화면 전환이 없는 단 하나의 페이지(인스턴스)' 를 뜻 한다. 어떤 사람은 SPA를 User 인터렉션 (사용자 반응)이 강한 다이나믹한 UI(Page) 라고 생각할 수도 있다. 틀린 말은 아니다, 위에서도 말했지만 하나의 Application과 다를 것 없는 기능들을 가지고 있기 때문이다. 하지만 이 말은 굉장히 단순하게 극히 일부분만 바라본 이야기이다. 기존의 Web App 환경에서도 Javascript 라이브러리를 통한 여러가지 User 이벤트 처리와, 비동기 데이터바인딩(롱 폴링, 흔히 Ajax라고 부르는 것), 역동적인 애니메이션을 구사할 수 있기 때문이다.

요지는 이러하다, SPA의 화면 전환이 없는 것은 우리 벡엔드 개발자가 기존에 생각하던 View관점의 UI와는 근간이 다르다. 개인적으로 안드로이드 혹은 애플릿 개발하고 다를 바 없다고 생각한다. 실제로 후에 Angular 에 대해 설명을 하겠지만, 흔히 학원에서 가르키는 Spring MVC 아키텍처를 Angular에서 유사하게 처리하고 있다. 그리고 벡엔드 개발에서는 MVC에서 M,C만 활용을한다. 즉 Resutful interface를 구현해서 오는 요청을 컨트롤하고 데이터만 응답해줄 뿐이다. 


# 기초로 돌아가봅시다, 서버에서 브라우저로

## Http 통신 과정

## 마크업과 렌더링의 이해

후에 나오겠지만, SPA는 이러한 렌더링 과정에서의 근본적인 구동원리 때문에 SEO라는 문제를 안고 있다.이는 뒤에서 자세히 설명하겠다.  

# 자 그럼.. SPA는 뭘까요?


## SPA의 개요

SPA는 앞서 말했던 것처럼, '단일 페이지 어플리케이션'이다. 절대 단순 마크업을 위한 Html 문서라고 생각하지 말고, Application 관점으로 이해하면 좋겠다. 단순 정보 전달을 위했던 Html이 이런 막강한 기능을 갖게 된 것은, Angular,EemberJS,Meteor.JS,React.JS 등의 고수준의 자바스크립트 라이브러리(혹은 프레임워크) 덕분이다.


## SPA의 장점

SPA의 장점을 [Angular Tech Blog](https://blog.angular-university.io/why-a-single-page-application-what-are-the-benefits-what-is-a-spa/) 에서는 아래와 같이 설명하고 있다.

* 유저 경험성(UX) 향상
* 새로고침(리다이렉션 등)이 발생하지 않아 전체 페이지를 새로 로드하지 않음 == 퍼포먼스 향상
* 프론트/벡엔드의 명확한 분리로 인해 쉬운 배포/유지보수/버전 관리

* 프로토타입 개발에 용이.

나는 여기에 벡엔드 관점에서의 말을 더 하고 싶다.
* 유연한 Multi-Device
* 배포와 확장의 용이 (서비스의 영속성)
* Server Core에 집중.
이 말은, 프론트와 벡엔드가 명확히 나뉘기 때문에 나오는 말이다. 프론트 관점에서의 장점은 아니고 사실 SPA 아키텍처를 적용하게 된 벡엔드 단의 장점이다. 이 말은 후에 있을 MSA와 큰 연관이 깊다. 가볍게 얘기하면 네트워크 관점에서 하나의 서비스에 다양한 부피 있는 큰 Node로 이루어진 서비스 레이어를 잘게 나누어서(세그먼트) 유닛별로 Node를 구성하는 아키텍처이다.


서버 개발자 입장에서 중요하게 봐야 할 것은 SPA가 시사하는 것은 Web Application 제어의 주객이 서버에서 -> 클라이언트로 바뀌었다는 점이다. 이 말은 즉슨, 벡엔드에서 개발해서 제어를 처리하던 부분이 프론트 단으로 넘어갔다는 말이다. 이제 벡엔드는 프론트가 요청하는 데이터만 전송해주고 핸들링 해줄 뿐이다. 조금 더 나간 이야기이지만, On Cloud 플랫폼에서 'ServerLess' 라는 비지니스 모델도 나오고 있는 추세이다. Spa 에서 더 이상의 우리가 알고 있는 Server Side 개발자는 없다. 서버의 손에서 넘어간 Web App의 제어권을 코딩하기 위해서는 자바에서 자바스크립트로(혹은 타입스크립트로), 포지션을 Front Side 개발자로 변모해야 한다. 기존의 벡엔드 환경에서 개발을 고수하겠다고 한다면 Server Core(커넥션 처리와 데이터 처리) 에 집중해야 한다. 



* 디바이스의 다양화

가트너에서는 2014년에 PC의 자리를 위협하는 개인 클라우드화가 본격적으로 시장에 활성화 될 것이라고 이야기 했다. 이 말은 사용자로 하여금 다양한 방법으로 애플리케이션에 접근하고 사용할 수 있는 환경을 제공 받는 것이 당연시된다는 말이기도 한다. 이를 비추어서 우리 웹 개발자의 관점에서 생각해보면 웹 앱 개발에 중요 터닝 포인트로 받아들여야 한다.
웹 서비스 관점에서 보면 요즘은 많은 디바이스를 지원 한다. 안드로이드, 아이폰, 웹 브라우저(pc) 를 대표적으로 둘 수 있는 데.. 웹 브라우저의 크로스브라우징 (pc, 태블릿, 스마트폰) 관점에서는 서버 중점으로 가더라도 괜찮지만, 안드로이드, IOS 등의 브라우저 기반이 아닌 App관점으로는 디바이스에 따라 제약이 많아지게 된다.

* 클라이언트 하드웨어 스펙 업 (평준상향)

나 같은 자바개발자 입장에서 대체로 서버에서 처리하는 동적 컨텐츠 방식(모노리틱 아키텍처 라고도 한다)에 친숙하다. 서블릿을 확장한(친숙한) JSP를 작성하면 (혹은 Thymleaf 와 같은 탬플릿 언어) JSP Parser 가 알아서 Html 을 만들어 준다(렌더링이라 표현하는 게 옳겠다). 이는 당시 클라이언트에서 Html View template을 렌더링하기에는 하드웨어 인프라가 부담스러웠기 때문이다. (당시에는 서버가 클라이언트보다 빨랐고, JS 엔진은 불안정하고 느렸다.) 
이 와는 반대로 지금의 SPA 에서는 서버에서 데이터가 없는 WebAPP(index.html) 을 보내고, 클라이언트에서 필요한 데이터를 동기화하거나 요청하면서 클라이언트의 브라우저에서 View 가 렌더링되고 확장된다, 서버는 단순히 이벤트 요청에 대한 데이터만 제공할 뿐이다.(또는 커넥션 처리)

* RestFul API

사실 SPA도 그렇고, RestFul API도 그렇고 모두 다 웹 서비스의 비약적인 발전으로 탄생한 산물들이다.

* MSA(Micro Service Architecture)

개발론 중에 폭포수 모델을 들어보았는가? (필자는 강의 시간에 졸아서 잘 모른다), 간단하게 설명하면 어떠한 프로젝트를 하는 데에 있어 철저한 조사와 절차를 폭포가 흐르듯이 하는 개발 방법론이다. 거의 거대한 프로젝트에서 많이 쓰이던 방식인데, 폭포수 모델에 따라 진행된 프로젝트들은 실패했을 떄의 리스크가 너무나도 크다. 실제로 많은 수의 대형 프로젝트들이 실패하는 사례가 나타나면서 프로젝트의 궁극적인 성공을 위해서는 소규모로 잘게 나누어서 프로젝트를 유지하는 방식이 보다 성공 확률이 오를 수 있다는 것이 명확해졌다.

* 프로젝트의 기술적인 부분을 점검 가능
* 목업(프로토타입)을 통해 의도와 부합하는 지 확인이 가능하다.
* 시스템과 시스템 간의 인터페이스와 데이터 구조가 명확해진다.
* 개발자의 테스트와 릴리즈가 자유로워 진다.
* 확장이 쉬워 진다.

(MSA 의 설명)

네이버나 다음(카카오)의 포탈 서비스의 메인 화면을 보면, 사용자는 html 페이지 하나를 보는 것 같지만(실제로 그러하다), 각 서비스 레이아웃(예: 뉴스 , 카페, 증권, 스포츠 등)은 각기 다른 서버와 커넥션 되어 있다. 여기서 뉴스 서버가 어떠한 사정으로 마비가 되더라도 전체 서버를 재기동하거나.. www.naver.com 의 메인이 접속 불가능해지지 않는다. 또는 동계올림픽 시즌이 되어서 스포츠 서비스의 부하가 예상되면 전체 서버를 확장할 필요 없이, 스포츠 서버만 스케일 업하면 된다.

* 웹의 본질 (서버 중심 웹 서비스의 해로움)

잘 디자인 된 웹 앱이란 잘 실행되고, 확장 가능하고, 간결하고 우아하게 설계되고, 쉽게 수정 가능하며 신뢰할 수 있는 앱을 뜻한다.
이를 위해서 권위 있는 학자들과 w3c 에서 수 년에 걸쳐서 표준을 위한 고민을 한다.
이런 관점에서 보면 서버 중심의 웹 개발(모노로틱)은 해롭다, 특정 포인트에 부하가 들어와서 스케일 업을 해야한다면 서버 전체를 스케일 업 해야 한다. 유저 입장에서는 윈도우 부팅을 빠르게 하기 위해서 돈 투자를 해서 SSD를 달았는 데.. 10년 된 삼보 매직스테이션을 쓰는 유저나 SSD가 달린 최신형 컴퓨터를 쓰는 사람이나.. 서버가 렌더링해주는 결과물을 똑같이 불합리하게 기다려야 한다.

* stateful? no stateless

(캐지미어 새터노스 37 page)

(캐지미어 세터노스 72 page)


아래의 장단점은 결국 Mpa의 반대적인 성향이다.

## 개발자 입장에서 SPA 의 장점은

1. 코드 조직화 용이

2. 프로토타입 제작에 용이

3. 배포의 유연성 (테스트와 릴리즈, 배포의 자유로움)

4. 퍼포먼스 향상

5. 분리 된 업무능률 향상 (이는 Mpa 에선 꿈도 못 꾼다.)

## 서비스 입장에서의 SPA 의 장점은

1. 쉬운 서비스 확장

2. Multi-Device 유연성 (이는 Mpa 에선 꿈도 못 꾼다.)



## SPA의 단점

1. SEO 처리의 어려움. (CSR 의 한계)

2. 주객의 이전, 스크립트 기반 코딩에서 고급 테크닉이 필요해짐 (자바스크립트의 중요도 상승) : 변태 언어 자바스크립트의 OOM의 위험

3. 명확한 인터페이스 스펙 정의 필요.

4. Front 에서 Componenet간의 데이터 바인딩의 어려움

5. 클라이언트 스펙(하드웨어)에 따라서 성능이 천지만별 (그리고, 자바스크립트 버전 별 퍼포먼스 차이)

6. 두서 없는 Javascript 표준의 변경. 크로스 브라우징(브라우저 버전에 따른 성능차이)


단점들 속에 결국 자바스크립트의 집중도가 가장 걱정 될 것이다, 그렇다면 우리 같은 골수 벡엔드 개발자는 SPA를 개발할 수가 없을까? 아니다. 감사하게도 [Vaadin]() 이라는 훌륭한 자바 SPA 프레임워크가 있다. 이는 나중의 별도의 [세션]()에서 알아보도록 하자.

## SEO 에 대해서

SEO는 구글, 네이버와 같은 (크롤링을 통한 검색 엔진을 구축한 곳) 검색 엔진을 제공하는 서비스에서 웹봇들이 Web Application의 데이터를 얻지 못하는 것을 뜻한다. 이 말은 SPA는 브라우저에서 (정확히는 레이아웃 -> 렌더링 엔진) 렌더링 가공이 된 이후에 데이터(바인딩)가 채워지므로 웹 패킷으로만 데이터를 체크하는 웹봇 입장에서는 당연히 알 턱이 없다. 필자는 과거 '웹 악성코드 수집 엔진'을 개발한 적이 있다. 이 엔진은 말 그대로 네이버나 구글과 같은 크롤링 봇(웹 봇)을 만드는 일이었다, 주로 악성코드는 자바스크립트에서 이벤트가 일어나기 때문에 이러한 SEO문제로 골머리를 섞힌 적이 많다. 근본적으로는 이를 해결하려면 SPA를 제공하는 서버에서 SSR(Server Side Rendering)을 미리 해서 주어야 해결이 되지만, 이런 경우는 필자가 어떻게 할 수 있는 문제가 아니어서 웹 봇 단에서 자바스크립트 인터프리터를 설치하여 이가 안 되니 잇몸으로라도 해결해보고자 노력했었던 기억이 있다.


-----

여기까지가 Angular를 이해하기 위한 백그라운드 지식이었다고 보면 된다.
축하한다, 이제 Angular에 대해 알아갈 시간이 되었다.


# What, Angular




## Angluar

## Javascript Framework의 등장

웹의 초창기에는 웹 페이지를 시작하는 것은, Text editer 에서 HTML 문서를 하드코딩하는 것이었다. 이런 방식은 불편함을 초래했고, 웹의 초창기에도 IDE개념의 (우리나라에는 나모웹에디터) 많은 워크 에디터가 생겨났다. 그때야 html 하나의 마크업 language 만 있었지만 html 의 발전과 함께, CSS, JS .. CAAS, TS 정말 무수히 많은 개념들이 나누어지고 발전되고 탄생했다. 그 과정에서 BootStrap, Jquery 와 같은 라이브러리들이 생겨나기도 했고 더 확장되고 기능이 강력해지는 다양한 라이브러리들이 생겨났다. 이를 일일히 관리하고 하나하나 배워나가기에는 부담이 많이 되기에 하나의 단일 페이지 어플리케이션을 개발하기 위한 프레임워크들이 생겨나기 시작했다. Angular는 이러한 프레임워크들 중에서 많은 유저층을 확보한 인기 프레임워크이다.


## JS의 브라우저 호환성
흔히들, 크로스 브라우징에서의 CSS와 같은 view관점의 layout만이 브라우저마다 특성이 다르다고 생각하는 데, 자바스크립트도 표준(ECMA Script) 언어 임에도 불구하고, 브라우저 마다 처리 방식이 조금씩 다르다. 이러다 보니 이를 해결하기 위해 Jquery(DOM 이벤트 조작) 와 같은 라이브러리들이 생겨나기 시작했다. Jquery를 예로 든다면 DOM 이벤트를 조작하는 관점에서는 중,소 규모의 프로젝트에 적합하다. 또 다른 View 관점에서는 Coffee, vue.js 등 다양한 라이브러리가 있다.

## MVC 

대표적으로 JS의 MVC 프레임워크를 뽑는다면, 백본, 앵귤러, 엠버 3가지를 둘 수 있다. (page 119)


## Angular 의 버전 체계.. 그리고 흑역사

angular는 최초에 AngularJS 라는 이름으로 세상에 알려졌다. 당시의 타겟 유저는 코딩이 불편한 웹 디자이너들을 위한 목표로 디자인이 되었는 데, 실제로 작업은 엔지니어링에 가깝다 보니 제한적인 개발 환경과 추상적인 개념 프레임워크 구조에 빈틈이 많았다. 결국 제작하던 Angular 구글 팀 조차 만들다가 헷갈려서 때려치고, AngularJs에서 Angular로 리네이밍 하기로 했다.
재밌던 것은 필자인 나도 그렇고 

//TODO



(page 209)



## npm 이란

npm 에 대해서..

## framework 란 단어에 대해서..

* vue.js 는 데이터를 바인딩하기 위한 좋은 라이브러리
* react도 라이브러리

프레임웍의 정의를 해보자.
ANglur는 Client Application 을 만들려고 있는 프레임워크다.
Angluar는 Webapp이 빠르지만, 사실 구글의 가장 큰 목표는 EE기반의 Native Mobile, Native Desktop, Native Mobile 까지 커버하는거임.. ㅅㅂ. what the?

google 은 open source 지원을, 주간 회의 일정, 스케줄, 마일스톤도 공개해놓음.

* Angular4 부터는 Typescript 를 정식 지원함.
* Google 모든 javascript 는 typescript 로 포팅되고, 공식 프론트 언어로 선정함.
* 웃긴건 이걸 만든 곳은 MS임..


## ES 는 자바 EE와 같음



## Componenet

web component 라는 브라우저의 원래 기본 개념이 있음. Angular는 이 아키텍처를 구현한 형태일 뿐.
view의 기본 단위임.
기존 App은 컴퍼넌트 개념이 있었음, 그래서 하나의 컴퍼넌트(네비게이션) 을 만들고 거기의 색상 크기 기능만 정의하고 갖다가 붙여쓰면 되는데.. 웹은 css ..하아 복잡하다.
대부분의 웹 view template은 이러한 component가 있음.
Componenet 간의 트리 리스트

단 component는 컴퍼넌트 간의 데이터 바인딩이 관건임.


spring bean 처럼 componenet 는 자기만의 라이프사이클을 프레임웍에서 관리 받음
필요한 순간이 올떄 new  class() 처럼 new component로 그떄 생성이되는거임

## template

한마디로 우리가 친숙하게 아는 html, css 의 덩어리이다.
반드시 view를 구성하기 위해서는 component 와 template 이 같이 있다.
url 을 적거나, markup 을 바로 써도 됨.


* import 구문 : 자바의 import 랑 같음 :: es6의 기본 문법
* @ 데코레이터 : 자바로 치면 어노테이션 :: es7의 표준으로 감, 원래는 ts 의 문법임, class의 힌트를 주는 것.
* select :: dom , custom tag 이름. 
* template url: 실체화된 url이 있는 경로
* style's url: 이 컴퍼넌트에만 해당하는 css의 경로

## class

js에서는 es6 부터 class란 문법이 생김.


## 세미나의 마지막..

어찌되었든 프레임워크가 만능은 아니다, 스프링을 안다고해서 그 사람이 개발을 잘하냐? 그건 NO 아닌가?
결국 이걸 하려면 프론트 엔드 개발자의 기본 소양을 가져야함.. 이 소양에는 웹 디자인에 사용되는 웹 설계, 웹 디자인, 퍼블리싱 등의 모든 게 필요함.




## intellij 로 시작하는 angularjs 

1. angularCli 로 프로젝트를 시작한다.

2. 프로젝트가 만들어지면 자동적으로 Git, Npm 이 Structure가 만들어진다.

3. readme.md 를 읽어보면 지원하는 내용이 많다.

edit run config..

npm을 추가한다.

npm serv dev 명령을 위해서

command : run
sciprts: ng
arguments : serve dev 

입력하고 RUn



## where is angluarJs 3 ??

앙귤러 버전의 설명..

## ts(typeScript) ??

type script 에 대한 설명..

## ECMA 에 대해서..

ESx(ECMA)는 말 그대로, Client Script(JS) 에 대한 Spec 을 정의한 것이다. ECMA는 협회의 이름이고.. 뭐 유럽 표준 컴퓨팅 뭐시기깽이다, 궁금하면 이쪽을 참조하도록 하자.
현재는 ES7이 나왔고, 곧 있으면 ES8 가 발표 예정이다. 현재 JS는 ES5까지 지원하고 있다. 왜 이러할까? 사실 그럴 수 밖에 없는 것이, 하향평준화란 말이 있잖은가? 브라우저의 벤더는 다양하다.
크게 봐서 브라우저이지, 내부적으로 보면 다양한 파서와 엔진들이 존재한다. 그들과의 상호작용을 저 표준에 맞추어서 구현하려면 브라우저 쪽에서의 반영이 느릴 수 밖에 없다.
우리 자바 개발자를 예로 들어보면, JAVA EE나, Servlet 표준에 권고하는 SPEC에 맞는 WAS 개발이 발표 된다고 바로 적용되는 것도 아니다, 그렇게 이해하면 된다. (적어도 나는 이렇게 이해했다)
사실 Servlet 스펙도, 그 위에 w3c에서 http spec 을 따라 순차적으로 구현하니, 복잡하게 얽힌 트리 구조이다. ECMA를 읽을 떄 문자 그대로 '에크마' 읽는 사람이 있고, '이씨엠에이' 라고 읽는 사람이 있다.
나는 후자였는 데, 찾아 보니 전자가 맞다고 한다(웁스).


[ECMA에 대해서](http://bbs.nicklib.com/?mid=application&category=5082&page=1&document_srl=5084) 이 링크를 참조하자.
[여기도있다](http://d2.naver.com/helloworld/2809766)

## AngularJs4

[간단한 셋팅의 동영상](https://www.youtube.com/watch?v=ND0TugBPid8)
[책 저자의 발표자료](https://www.slideshare.net/jwj0831/angular-seminar)
[사려는 책 저자-1](https://www.youtube.com/watch?v=ynULx0mtQGE)
[사려는 책 저자-2](https://www.youtube.com/watch?v=idUbhCegL9A)
[사려는 책 저자-3](https://www.youtube.com/watch?v=XM4samWG9b0)




* package.json 은, maven으로 치면 pom.xml 이다. 이곳에 dependencies가 있음.
* mvn install == npm i
* ng new 
* ng serv
* ng generate --help (compile 하는 개념)


## 인텔리J Live EDIT + NPM

Npm serv 를 실행 된 상태에서, 크롬의 Live EDIT plugin 을 실행하게 한다. 그러면 자동으로 intellij 에 debug 모드로 동작하게 한다. 그 뒤로는 반영된다.



## bowel 하고 webpack 이 같이 있다.

* npm, yarn, bowel : 패키지 관리 도구 
* grunt, gulp, npm : 컴파일 자동화 도구 (난독화 및 소스 코드 용량 줄이기)
* babel, typescript, coffeescript : js port language (전처리 컴파일러, jsp 같은 느낌이라 보면 됨.)

* (내가 카톡에 보낸 사진)
* 모듈(빌드)화를 위한 노력 : webpack : Ecms6



live edit 로 적용되서 save 하면 콘솔에  webpack 이 계속 빌드하는 것을 볼 수 있다.



## 이클립스로 시작하는 angularjs

start hehe

## spring boot + anglura Cli

1. ng build

2. spring boot 

3. spring boot 의 static 폴더를 연다

4. 빌드 된 ng module을 /dist/**   - copy to /static/** 폴더로 복사한다.

5. start spring boot 잘 된다 ^^

요약을 하면..

* ng cli ==> copy to /dist/** >>> /static/**  ==> mvn spring-boot:run 

## Node.Js 그리고 NPM

이벤트 루프, 코어 라이브러리로 구성 된 서버 사이드 자바스크립트 Runtime Enverimenet 이다. 한창 3~4년 전에 Vert.X vs Node.JS란 얘기가 트랜드(나는 이 떄 Vert.X에 관심을 가졌었다.)가 될 정도로 원래는 고성능 네트워킹 I/O 비동기 서버를 모토로 만들어졌었다. 문제는 자바스크립트 진영에서 이렇다고 할 마땅한 Js Runtimer(인바이런먼트) 가 없었기 때문에 (있기는 하지만 복잡하고 사용성이 떨어졌다) Node.JS의 출현은 한 줄기의 단비와도 같았다고 한다.

프론트 개발자의 입장에서 Node.JS가 설치된 곳이라면 어디서든 본인의 밥줄인 Javascript 로 여러가지 실험적인 것을 해볼 수가 있었다. 즉, 이 말은 JsApp 생태계의 탄생이라고도 볼 수 있는 데, 이런 환경 덕분에 NPM 이라는 Node Package Manager 의 생태계가 자연스럽게 만들어졌다. NPM은 Node.js에서 기본으로 사용하는 패키지 관리 도구이고(초기에는 아니었다), NPM을 이용해서 여러가지 리소스 or 라이브러리를 패키징해서 공유할 수가 있다. (나 같은 JVM 기반 개발자라면, Maven Community를 떠 올리면 적당할 것이다.)

Angular에서는 프레임워크란 방대한 덩치 만큼이나마 많은 도구와 라이브러리를 내포하고 있다, 고로 NPM을 통해서 프로젝트를 구성하고 의존 패키지를 관리한다.

정리를 하면 Node.JS는 JRE라고 보면 되고, NPM은 Maven 라고 생각하는 것이 속 편하다.
> mkdir helloNode

> cd helloNode

> npm init

> npm install jquery

> npm list

npm init을 하고 나면, package.json 이 생기는 것을 볼 수 있는 데.. 열어서 살펴 보면 pom.xml 과 흡사하다.


더 자세한 사항이 궁금하면 [Node.js's Docs](https://nodejs.org/ko/docs/) 를 참고하자.



## TypeScript

TypeScript 는 간단히 얘기하면, '자바스크립트를 확장하게 해주는 언어(MS, 아네르스 하일스베르)' 라고 말할 수 있다. 즉, 자바스크립트이고 그 이하도 아니지만 그 이상이다 (응?). 실제로 Google에서 TypeScript를 공식적인 자사 언어로 채택하고 마이그레이션 과정에서 별 어려움 없이 80%가 수월하게 했음을 이야기 한 건 유명한 일화다. 그러면 그들이 한 20%의 어려움은 무엇일까? 중요한 Core 로직을 리팩토링 하면서 TypeDeclration(TypeSafe) 적용한 것이다. 즉 변수에 Type을 명시 선언한 것 뿐. 재밌는 이야기로 순수 Javascript 언어로 작성 된 1.js 를 1.ts로 저장해서 Build하여도 동작 한다, 단 무수한 Warning 이 뜨겠지만..
개인적으로 동적 언어를 극혐하는 데, 이러한 움직임은 좋은 것이라고 생각한다.
기본적으로 TypeScript는 Javascript 로 컴파일할 때, ES3 코드로 변환한다고 한다. 설정에 따라서는 Es5,Es6 도 되는 듯 하다. 그리고 듣기 로는 es7에 공식적으로 반영 예정이라고 한다.

> npm install -g typescript

> sampleCode.ts

> tsc sampleCode.ts

> tsc SampleCode.ts --target es6


## AngularCli

ng new 로 생성 된 프로젝트 구조에 대해 알아 보자.

* e2e 폴더 : end-to-end 를 의미. protractor 툴을 이용해서 애플리케이션 통합 테스트.
* src 폴더 : 애플리케이션 소스.
* .angular-cli.json : angular-cli 의 metadata.
* karma.conf.js : karma 단위 테스트 설정 파일.
* protractor.conf.js : protractor 통합 테스트 설정 파일.
* tslint.json : 타입스크립트용 구문 체크 파일.
* tsconfig.json : 타입스크립트 컴파일 설정 파일.
* src/typings.d.ts : 타입스크립트에서 사용 될 타입 선언 정보 파일.


## componnent & template



## Directve 와 Pipe

View(Template) 만을 위한 아키텍처관점에서의 요소

* Structural Directives
Dom 구조를 동적으로 변화시킬 때 사용


* Attribute Directives
컴포넌트, DOM 요소의 표현 및 동작 방식을 변경


Pipe

View에 노출하는 데이터를 변형할 때 사용
데이터는 같은 데, 다르게 보여야할 때.. (Time, 화페 단위 등..)


## Data Binding

Componenet(+Template) 과 View 사이의 연결고리

* 절차적인 방식
* 선언적인 방식

## Service & DI

가장 중요한 개념.

* Serverice : 순수한 자바스크립트 로직을 담고 있는 class, 단 이 Service 는 Angular에서 DI로 처리함. Bean이랑 비슷한거임.
OOP에서 가장 중요한 SRP(단일) 을 구현한 형태임.

* DI : 앵귤러에만 있는 거임, 우리가 아는 DI랑 같음.


## module

Angular 의 모든 요소들을 하나로 담은 컨테이너,
자바로 치면 자바 라이브러리 (jar) 개념이라 보면 됨.


## Angular

Angular 에 대해 다시 되짚어 보자, Angular는 Clint Side Application FrameWork 이다.
프레임워크는 라이브러리랑 다르게, 어떠한 구성, 방식으로 개발하지는 못 한다. 어느 정도의 프레임워크에서 제공하는 일정한 틀에서 작업하는 것을 전제로 하기 때문이다. 그래서 나는 스프링을 공부 헀었던 것이고,  다르게 얘기하면 개발자는 편하게 필요한 비지니스 로직만 작성하면 된다는 말이기도 하다.
이 관점에서 앵귤러는 1. 사용자와 인터렉션 할 View를 개발 2. View에 표기할 데이터바인딩과 서버와의 상호작용 의 개발 을 뜻한다.



### 뽀너스  Vaadin

Vaadin 은 AngularJS와 마찬가지로 SPA 기반의 아키텍처를 지원하는 Java Ui FrameWork 이다.

Angular 는 Client 성격이 강하고, Vaadin 은 기존 자바 개발자들이 개발하던 Server Side 프로그래밍을 하면 SPA 구성의 WebApp을 자연스레 짤 수 있게 해준다.
여기서 함정이 있는 것이, Vaadin 이 단순히 Render 엔진(Java Source를 Web Client 포팅)의 성격을 가진 프레임워크는 아니고, ( JSP 코딩을 하던 느낌을 생각하면 된다. )Full Structure를 지원한다.
기본적으로 Vaadin 의 Architecrue를 보면서 느낀 것은 SPA기반의 서버 사이드 프로그래밍을 쉽게 도와준다 ==> 역동적인 Dynamic UI 컨테이너 기반 WebApp 제작을 지원해준다는 느낌이다.
현재까지 Vaadin은 Tomcat 과 같은 서블릿 컨테이너가 없으면 동작하기 어려운 구조로 판단하고 있다.
즉 내가 헤맸던 것처럼 Vaadin + NodeJS 와 같은 끔찍한 혼종은 만들어질 수 없는 구조이다.



## 참고

* [앵귤러 첫걸음, 조우진](http://book.naver.com/bookdb/book_detail.nhn?bid=12096305)
* [클라이언트-서버 웹 앱 만들기, 캐지미너 새터노스](http://book.naver.com/bookdb/book_detail.nhn?bid=8302910)