---
layout: post
title:  "[작성중][Angular]#1, What is Single Page Application (Angular) ?"
author: "glqdlt"
---

# What is Single Page Application (Angular)?

이 포스트의 이해를 돕는 데모 프로젝트를 하나 만들었다, 자세한 것은 [Github](https://github.com/glqdlt/seminar_demo) 를 참고.

## Intro

어느 때와 별 일 없는 주말 저녁, 곤히 꿀잠 자면서 뒹굴거리고 있었는 데 갑작스레 팀장님으로 부터 메일을 받았다. 'Angular' 에 대해서 세미나를 준비해달라는 메일이었다.

메일을 읽자 마자 느낀 감정은 수 많은 사람 중에 왜 나인지에 대한 지명보다는 "왜 하필 Angular?" 라는 주제 선정에 대해 궁금했다.

그도 그럴 것이 내가 근무하고 있는 곳은 서버 엔지니어 팀으로, 데이터의 핸들링과 유저 요청을 처리하는 (팀에서는 딜리버리 라고 표현한다.) 서버 팀에서 근무하고 있는 데, Angular를 써야 할 정도의 프로젝트들과는 접점이 없는 일을 하고 있다.

하는 일에 대해서 조금 더 자세히 얘기하면 외부의 데이터나 내부의 데이터를 취합하거나 변경하는 biz service를 만들고 Restful Api를 통해 내/외부에 제공하는.. 요즘 흔하게 볼 수 있는 API 서버 개발이 대부분의 일이다.

이렇다 보니 팀에 있어 Web Application은 서버 운영 Tool 정도로 활용하고 있다. (내가 쓰기 보다는 대부분 고객이나 운영자가 쓰기 위한 Tool 이다.)
Application은 간단한 CRUD 형태의 게시판이나 운영 데이터의 설정 값을 제어하는 로직이 대부분이다. 이런 팀 환경에서 갑작스레 Angular를 들고 세미나를 하겠다고 하는 것은.. 마치 분식집에서 일본식 돈코츠 라멘을 주문하는 것과 같다. 비유가 조금 우스꽝 스럽지만 괜찮은 비유라고 생각 한다. 푸라면이나 너구리탕면 이 가득한 분식집에서 돈코츠라멘을 주문하다니..      라면과 돈코츠라멘의 차이 처럼 Angular는 완전히 다른 존재이기 때문이다. 팀장님의 Angular 세미나 요청은 위의 일본 라면의 예처럼 굉장히 아이러니(?)한 주문인 셈이다. 

사실 예제라고 비유하기 위해 말한 것이지만 국내에서 나름 알아주는 서버 엔지니어링이 모인 팀을 분식집에 비유한다는 것은 어찌 보면 실례를 겸한 걸 지도 모른다. 어찌 보면 팀 동료들도 Angular 든 ReactJS든 이름은 많이 들어봤을 텐데, 굳이 직접적인 필요성이 없다 보니 선뜻 관심을 가지진 못했을 수도 있고 말이다.
나야 단순히 트랜드에 관심이 많은 호기심 탓에 Angular에 관심을 가졌을 뿐이지, 특별나게 필요성을 이유로 둔다면 딱히 관심을 가질 껀덕지는 없었을 것이다. 일본 라멘 예시는 단순히 예시로만 말하는 것이니 큰 의미는 두지 말았으면 한다. 

잡설이 많았는 데 다시 본론으로 들어가서 일단 Angular라는 주제는 방금도 얘기 했듯이 분식집의 주방 이모들님들에게 일본식 라멘 제조법을 설명해야 하는 상황 처럼 팀과는 크게 어울리는 주제가 아니다. 그런데  엉뚱한 이야기로 볼수 있지만 생각을 바꾸어서 만약 분식집의 주방 이모가 라멘을 만들 수 있는 재료와 실력이 있다면 만들어서 식탁에 내놓을 수 있다면 ..? 그게 계기가 되어서 갑자기 장사가 대박이 난다면?

설마 하는 생각이지만 팀장님의 이런 요청은 팀내의 분위기 전환을 위한 큰 그림을 그리는 요청일 일지도 모른단 생각도 든다. 만약에 평소처럼 바로 옆자리에서 구언으로 요청하셨더라면 이러하냐고 질문이라도 했었겠지만.. 저 먼 외국 에서 메일로 요청하신 일이기에 의문을 품는 것보단 거룩한 뜻이 있을 것이란 생각을 갖고 준비를 했다.

이런 생각도 있고 준비하면서도 여러가지 잡념이 Mix 되면서, 틈틈히 연구 했던 Angular 프레임워크에 대해 자세히 들어 가는 것 보다는 Angular는 소개만 하고, SPA 아키텍처에 대해서 설명을 하면서, 왜 SPA가 요즘 많이 쓰이는지, 어떤 차이가 있는 지를 설명하는 것이 중요하단 생각이 들었다, 마치 라면과 일본 라면의 차이를 알아야 하는 것처럼..


## 요즘 Web App : Single Page Application

<<<<<<< HEAD:_posts/2017-11-01-SPA 그리고 AngularJS.md
## 요즘 JavaScript
 
요즘 웹 트랜드에서 자바스크립트 Stack에 대해 이야기를 하면 무수히 많은 이야기가 나온다. Angular, ReactJS, VueJS.. 내가 많이 몰라서 그렇지 종류를 나열만 해도 한 페이지를 채울 수도 있을 것 같다. 

이제는 많은 웹 개발자들이 자바스크립트에 대한 이야기와 트랜드에 화두에 올리고 있다. 약 4~5 년 전에는 Full Stack == MEAN Stack 이란 말이 유행 했던 적도 있을 정도로 자바스크립트는 이제 무시하지 못 할 만큼 자리를 잡았다. 
=======
SPA는 Single Page Application 이란 의미로, Angular 는 이를 구현하기 쉽게한 워크-셋(프레임워크) 이다. 주로 SPA는 대형 웹 서비스를 다루는 회사에서 주로 많이 쓰이고 있는 데, 대부분 국내 이름만 되도 알만한 포털/이커먼스 회사들은 필수적으로 사용하고 있다 보면 된다. 후에 자세히 알아 보겟지만, 확장성(Multi-Device)도 가능하고, 클라우드에도 특화 되어 있는 점 때문에 요즘은 스타트업에서도 많이 사용하기도 한다. 
>>>>>>> ee60841ba49bbb20b340c54bbb2b9535d9c6ce60:_temp_posts/2017-11-01-SPA 그리고 AngularJS.md

개인적으로 SPA에 관심을 가지게 된 것은 코흘리게 시절에 대형 포털 회사들에 대해 막연한 동경을 품던 시절이 있었다. 매일 퇴근 길에 포털 회사에서 많이 구현하는 MSA(Micro Service Archtecture) 와 SPA(Single Page Application) 을 다룬 회사들의 테크노트(Tech-note)를을 읽으면서 큰 관심을 가진 것이 시발점이었다.

SPA(Single Page Application) 을 하나의 문장으로 표현하면 이렇다고 말하고 싶다.  "Document 가 아닌 하나의 Application"

"Web Page 가 아닌 Application..?"

사람에 따라서는 이 말이 다소 황당하게 느껴 질 수도 있을 지도 모르겠다, 만약 Web의 초창기에 시간이 머물러 있는 사람이라면 "Web은 문서를 공유하기 위한 것인데 빼애액!!" 이라며 괴성을 지를 지도.. 

SPA(Single Page Application)라는 문장 그대로를 풀이해보면 '화면 전환이 없는 단 하나의 페이지(인스턴스)' 를 뜻 한다. 화면 전환이 없다는 말은 이야기만 봐서는 아무것도 하지 않는 대기 상태(No Action)를 뜻하는 것 같기도 하다, 뭐 하나 클릭 안 하고 마우스에서 손을 때고 말이다. 

이게 무슨 말이냐면 우리가 만드는 Web Servlet을 보면 Web Service는 굉장히 Server에 종속적이다. User는 자기가 보고 싶은 화면(서비스)에 대해 Server에 요청(Action)을 하고 Server에서 요청에 맞는 View를 응답(제공) 해준다. Server 가 다운 되면 다음 Page로 넘어갈 수가 없다. 

그런데 Angular나 ReactJS 로 만들어진 트랜디한 웹 서비스를 보면 Android App처럼 가만히 대기 상태에서도 보고 있던 화면의 데이터가 갱신이 되거나, 어떤 메시지를 알려주거나 광고를 담은 팝업이 뙇 하고 나타나기도 한다. 또한 Server의 상태가 맛이 가더라도 동작을 멈추지 않는다. 과연 이걸 보고 No Action 상태라고 말할 수 있을까? 

이런 역동적인 Event가 구현 가능함에 어떤 사람은 SPA를 사용자 인터렉션에 특화 된 Dynamic View를 구현한 것으로 생각하기도 한다. 틀린 말은 아니다, 기능적인 측면에서 User의 Event를 원하는 데로 처리할 수 있는 막강한 기능들을 가지고 있기 때문이다. 하지만 이 말은 단순하게 일부 만을 바라본 이야기이다. 기존의 전통적인 Web Page 환경에서도 Javascript 를 통한 여러가지 이벤트 처리 및 애니메이션, 비동기 데이터 갱신 등을 할 수 있었다. 그럼 무엇을 보고 SPA라고 말하는 것일까?

SPA가 말하는 화면 전환이 없다는 말의 의미는 독립적인 Application이기 때문에 나오는 말이다. SPA의 Structure을 살펴 보면 우리가 밥 먹듯이 만들던 서블릿 MVC와 매우 흡사하다.

(Angular는 초창기에는 MVC 라고 홍보를 했는 데, 지금은 MVW(Model View Whatever) 라고 홍보하고 있다. 말이 나온김에 Whatever가 무엇이냐면, 사실 별 거창한 것 없고 Contoler 를 뜻 하는 것이다. Angular는 Client Multi-Device를 구현하기 위한 Framework를 구현하고자 하다 보니 각 Device마다 다른 단어로 불리울 수도 있어서 Whatever 라고 하는 것, 결국 App을 구성할 수 있는 모든 것들을 뜻 하는 거라 보면 된다. )

Client에서도 MVC가 가능해지다 보니, 기존의 Server에서 하던 일은 많이 퇴색되었다. Server는 이제 API 서버로서의 Model(데이터) 제공 하는 Core Service에 집중하면 되고, User의 모든 Event는 User가 직접 처리하게 된다, 즉 화면은 결국 Client가 보기 위한 것이니깐 Client가 가져 것 처럼.

그런데 왜 Model 하고 Controler 도 Client도 생겼을 까? View Layer를 Client가 직접 처리한다는 말은, 자기가 어떤 View(Template)를 볼 지 직접 처리한다는 말로, 서블릿 MVC 모델에서 컨트롤러가 하던 기능과 똑같다. 

서블릿 MVC에서 Controler가 하던 걸 떠올려보자, Template을 정하고(JSP 나 Typeleaf) Service logic에서 처리된 데이터(model)을 View에 반영한다, Angular의 MVW에서도 말했지만 SPA 의 MVC도 이런 구조이다.

 어떤 template 을 써야 할지 정해주는 Controler 가 있고, Service에서 제공해주는 데이터를 받아서 화면에 뿌리는 역활까지 한다. (Angular에서는 이것들을 Component 에서 제공하고 있다. 자세한 건 다음 Post에서 다루겠다). 그리고 Url 핸들링은 Angular에서는 Route 라는 모듈로 제공하고 있다. Route는 Url 경로에 따른 맞는 Component(module)을 호출해주는 일만 한다. 따지고 보면 마치 User는 새로운 Page로 간 것 같지만 사실상 보고 있던 화면이 이동이 아닌, 갱신 된 것일 뿐이다. (그래서 Single Page Application의 특징 중에 Unlimited Scrolling 이라는 표현도 있다.)

잠시 언급헀던 Service는 위의 Component와는 별도의 개별적인 레이어에 존재한다. 또한 모든 라이프 사이클을 Angular에서 직접 관리한다. 개발자는 Logic을 작성만 하고 Component에 호출하게끔만 하면 된다, 직접 new 키워드로 생성하질 않는다. 이걸 보면 Spring의 DI와 비슷한 것 같은데.. Angular에서도 DI라도 표현 하고 있다. 수행하는 역활도 똑같고, User 서비스를 수행 할 비지니스 로직을 가지고 있다.

이처럼 이런 서버와 많이 흡사한 점이 결국 Application의 구실을 할 수 있게 된 것이다. 굳이 서버가 있을 필요가 있나 싶기도 하다. (하여 많은 클라우드 벤더들은 [Serverless](https://www.slideshare.net/awskorea/serverless-architecture-lambda-api-gateway) 서비스를 제공하고 있다.) 이런 느낌으로 봐서는 SPA는 캐쥬얼 게임 Application 같기도 하다. 이런 부분에서 Web Page 가 아닌 Application 이라고 말을 헀던 것이다.


## 요즘 JavaScript
 
요즘 자바스크립트가 갖는 의미는 (그것이 웹 서비스이든 아니든..) 상당하다. 자바스크립트 프레임웍이나 라이브러리 갯수만 놓고 보아도 (Angular, ReactJS, VueJS.. 등) 한 페이지를 채울 정도로 많이 생겨났는 데, 양이 많다고 해서 질이 좋다고는 못하지만.. 적어도 많은 관심과 사랑을 받고 있다고는 확실하게 볼 수 있다.

자바스크립트가 사랑을 받기 시작한 것은 생각보다 오래 되었다. 이슈가 될 만한 계기는 많았지만 개인적으로 2005년 Google 의 Google Map 발표 현장이었다고 생각 한다. 당시의 다른 웹 기반의 Map 서비스는 확대/축소 기능을 위해서는 Map을 다운로드 받아서 실행시켜야 했었다고 한다, 문제는 Google은 자바스크립트를 통한 비동기 데이터 갱신(지금은 Ajax라고 많이 부르는 그것)을 통해서 실시간으로 Map 의 확대/축소 기능의 구현을 보여주면서 세상을 놀라게 했다.

또 다른 이야기로는 약 4~5년 전에 [Mean Stack](http://mean.io/)(MongoDB - Express- Angular - NodeJS ) 이란 이름으로 자바스크립트로 웹 서비스 전체를 구현(Full Stack)하는 것이 큰 화제가 됬던 적이 있다. 당시 초년생이었던 나는 뭔지도 모를 Mean Stack이라는 어감에 훅해서 (뭔가 멋져 보였다) 자바 보다 자바스크립트에 많은 관심을 가졌던 때가 있었다. 지금은 자바 개발자로 먹고 살고 있지만 만약 누군가가 조금이라도 등을 밀어줬더라면 지금은 자바가 아닌 자바스크립트로 밥을 먹고 살고 있을 지도..

오늘 날에 있어 자바스크립트는 단순히 브라우저의 스크립트 이상의 의미를 가지고 있다. Mean Stack 이라는 말에서도 알 수 있지만, 이제 웹서버의 구실도 하는 데다가, 웹 브라우저에 종속적이던 스크립트가 웹 브라우저 밖에서 동작하는 Application으로 등장하고 있는 세상이다. (NodeJs --global 명령으로 윈도우 cmd 환경에서 Javascript App(Node Module) 을 동작 시켰을 떄의 쇼킹함은 아직도 잊지 못하고 있다.)

또한 컨버팅 도구만 있다면 Web App을 Device에 사용할 수 있는 Hybrid App으로 빌드가 가능해진다고도 한다. (물론 Native App 보다는 성능 하락이 있다고 한다. ) 

여기에 클라우드 플랫폼에 있어서 '서버리스' 라는 (AWS, Azure 등) User Interface Application (그것이 Web App일지, Device App 일지는 모르지만) 만 구현하면 빠른 비지니스 서비스를 시작할 수 있는 클라우드 비지니스 모델도 나오기 시작했다.

이처럼 대부분의 Server Side 개발자가 UI를 만들 때 사용하던.. Jquery를 이용해 단순히 User Event 를 제어하기 위한, 또는 친숙한 AJAX를 사용하기만을 위했던 Javascript 는 더 이상 찾아보기가 힘들어져 가고 있는 세상이 왔다. 이야기만 놓고 보면, 서버 개발자들의 밥그릇에 대해서 걱정해야 하나 하는 생각도 문득 들지도 모르겠다. 뭐, 이러니 저러니 해도.. 굳이 알면 좋지만 몰라도 한국 IT는 잘 굴러간다.. 나 역시 실무에 쓰지도(가끔 몰래몰래.. 노력 하고 있다) 못하고 있고 말이다.



## 요즘 Web : Single Page Application 


## SPA 의 문제점

[LINK](http://m.mkexdev.net/374)


## F / B 포지셔닝의 명확한 포지셔닝

최근에 감명 깊게 읽었던 책으로 [클라이언트 서버 웹 앱 만들기. 저, 캐지미어 새터노스]() , 모든 맥락에서 '클라이언트 // 서버' 라고 명확히 단절해서 이라고 표현한다. 완전 별개의 단절 된 형태로 이야기하는 것은 아니지만, 포지셔닝에 대해서 명확히 선을 긋고 있다. 흔히 야생이라고 불리우는 SI 시장에서 전통적인 웹 페이지 개발로 밥을 먹고 살고 있는 이들에게는 이게 무슨 뚱딴지 같은 소리일까 싶을 것 같다. 

SPA 아키텍처 모델에서 프론트 와 벡엔드가 명확해지는 것은 마치 안드로이드 게임 개발 과 서버 개발의 포지셔닝과 같다. VIEW 개발이 무슨 안드로이드 게임과 견주냐고?

요지는 이러하다 SPA 아키텍처 모델에서 VIEW는 우리 벡엔드 개발자가 기존에 생각하던 template관점의 VIEW와는 근간이 다르다. 후에 Angular 를 다루어보면 더욱 자세히 이해가 되겠지만, SPA 에서 Web Application 은 기존 서블릿 MVC 디자인과 유사한 MVW(Model - View - Whatever) 디자인을 가진다. MVW는 MVC에서 조금 더 진화한 형태로, Model 과 View는 거의 흡사하고 W는 Web App 개발에 있어 필요한 모든 것을 뜻한다. 굉장히 추상적인 말이지만 C 외에도 더 필요한 요소가 있음을 뜻한다.


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
웹 서비스 관점에서 보면 요즘은 많은 디바이스를 지원 한다. 안드로이드, 아이폰, 웹 브라우저(pc) 를 대표적으로 둘 수 있는 데.. 웹 브라우저의 크로스브라우징 (pc, 태블릿, 스마트폰) 관점에서는 서버 중점으로 가더라도 괜찮지만, 안드로이드, IOS 등에서는 기존의 전통적인 WebPage 방식으로는 서비스 대응이 어렵다. 이를 위해서 MSA/SPA 아키텍처를 적용하여 유연한 Multi-Device 확장을 꽤하고자 하는 것이다. 사실 Google이 Angular에 많은 지원을 하고 있는 것은 이 Multi-Device 시장을 독식할 Client 플랫폼의 프레임워크를 만들자는 것에 의의를 두고 있다.

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

1. SEO 처리의 어려움. (CSR의 근본 문제)

2. 자바스크립트의 높은 이해도 필요.

3. 명확한 인터페이스 스펙 정의 필요.

4. 데이터 바인딩에 대한 고민.

5. 클라이언트 스펙(하드웨어 및 브라우저)에 따라서 성능이 천지만별.

6. Application의 성격을 갖는 특성 상, 보안 설계의 중요도 상승.


단점들 속에 결국 자바스크립트의 집중도가 가장 걱정 될 것이다, 그렇다면 우리 같은 골수 벡엔드 개발자는 SPA를 개발할 수가 없을까? 아니다. 감사하게도 [Vaadin]() 이라는 훌륭한 자바 SPA 프레임워크가 있다. 이는 나중의 별도의 [세션]()에서 알아보도록 하자.

## SEO 에 대해서


SEO는 구글, 네이버와 같은 (크롤링을 통한 검색 엔진을 구현한) 검색 엔진을 제공하는 서비스에서 웹봇들이 데이터에 접근하지 (얻지) 못하는 것을 뜻한다. 이것은 SPA의 기본적인 CSR(Client Side Rendring) 의 특징 떄문인데, SPA 어플리케이션은 View 에 표현할 데이터를 Browser의 Rendring 과정에서 (정확히는 최초 Web Application 이 Load 되는 순간) 반영한다. 그렇다 보니 순수한 Http Request / Response 로 동작하는 웹 봇 입장에서는 데이터가 반영 되지 않은 텅 빈 Static Resource(Html, JSS, CSS 등)을 받는 꼴이니.. 데이터를 알 턱이 없다.

필자는 과거 '웹 악성코드 수집 모듈'을 개발한 적이 있다. 이 모듈은 말 그대로 웹 데이터를 수집하는 크롤링 모듈을 만든 것으로, 네이버나 구글과 같은 유사 웹봇을 만드는 일이었다.

이 일을 하는 과정에서 SEO 문제를 많이 겪었는 데, 주로 내가 수집해야 할 웹 상의 악성코드(Drive By Download)는 자바스크립트에서 이벤트를 통해 일어나기 때문에 모듈에서는 이벤트가 일어나지 않은 텅 빈 데이터만 수집하다 보니 많은 골머리를 섞힌 적이 많다. 이 문제를 해결 하기 위해 Selenium 과 같은 자바스크립트 인터프리터를 내장한 Web Service Test 모듈을 내장해서 동적 렌더링을 강제로 일으켜서 해결을 했던 기억이 있다. 대신 이 방법은 많은 리소스가 소모 되고, 오버헤드의 문제점이 있어 수집 성능에서 많은 성능 하락을 하는 결과를 낳았다. 

이 SEO를 해결하려면 근본적으로는 SPA를 서비스하는 웹 서버에서 SSR(Server Side Rendering)을 통해 미리 데이터를 반영한 패킷을 보내주어야지 해결을 할 수 있다.

많은 프론트엔드 개발 프레임워크 개발진에서는 이 SEO를 해결하기 위해서 SSR 기능 개발에 열을 올리고 있다. 자세히는 모르지만 SSR을 가장 잘 해결한 라이브러리로는 ReactJS가 좋다는 말을 들었고, Angular에서는 Angular Universal 라는 프로젝트로 SSR 을 지원하는 모듈을 개발하고 있다고 한다.

요지를 정리하면 SEO는 Rendring(Model 반영)을 Client / Server 어느 시점에서 하느냐에서 오는 문제이다.



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




## intellij 로 시작하는 angularjs 

1. statc -> angularCli 로 프로젝트를 시작한다.

2. 프로젝트가 만들어지면 자동적으로 Git 과 Angular Project 가 generated 된다.

3. readme.md 를 읽어보면 angular-cli 에 대한 using manual 이 있다.


## Angular 학습하는 데에 따르는 고충.

1. 두서없는 버전 체계 : AngularJs vs Angular

2. 정신 없는 프론트엔드 생태계

## TypeScript

MS에서 만듬.

Google에서 자사 사무 언어로 지정.



## ECMA 에 대해서..

ES(ECMA Script)는 Client Script(JS) 에 대한 Spec 을 정의한 것이다. 
(ECMA는 관리 조직의 이름이다.. 뭐 유럽 표준 컴퓨팅 뭐시기라고 함, 궁금하면 구글링을 하도록 하자, 나는 별 관심이 없어서..)

현재는 ES7이 나왔고, 곧 있으면 ES8 가 발표 예정이다. 현재 JS는 ES5까지 지원하고 있다. 왜 이러할까? 사실 그럴 수 밖에 없는 것이 브라우저의 벤더들이 다양하기 때문, 이상과 구현의 차이에 대해서는 개발자라면 잘 알것 이다, 표준이라는 것은 그럼.

우리 자바 개발자들도 보면, JAVA EE나, Servlet 표준에 권고하는 SPEC에 맞는 WAS 개발이 바로 적용되는 것도 아니지 않던가.

* 더 궁금하다면 [이 곳](http://bbs.nicklib.com/?mid=application&category=5082&page=1&document_srl=5084)과 [이곳](http://d2.naver.com/helloworld/2809766) 에 좋은 자료가 있으니 읽어보자.


## Angular (4)

[간단한 셋팅의 동영상](https://www.youtube.com/watch?v=ND0TugBPid8)
[책 저자의 발표자료](https://www.slideshare.net/jwj0831/angular-seminar)
[사려는 책 저자-1](https://www.youtube.com/watch?v=ynULx0mtQGE)
[사려는 책 저자-2](https://www.youtube.com/watch?v=idUbhCegL9A)
[사려는 책 저자-3](https://www.youtube.com/watch?v=XM4samWG9b0)




* package.json 은, maven으로 치면 pom.xml 이다. 이곳에 npm 들의 dependencies가 명시 되어 있다.
* angular-cli 은, 실제 build 에 사용되는 angular-cli 명령들의 모움이다, 사실 이게 더 pom.xml 같다.


## 인텔리J Live EDIT + NPM

Npm serv 를 실행 된 상태에서, 크롬의 Live EDIT plugin 을 실행하게 한다. 그러면 자동으로 intellij 에 debug 모드로 동작하게 한다. 그 뒤로는 반영된다.



## bowel 하고 webpack 이 같이 있다.

* npm, yarn, bowel : 패키지 관리 도구 
* grunt, gulp, npm : 컴파일 자동화 도구 (난독화 및 소스 코드 용량 줄이기: Optimizing) 
* babel, typescript, coffeescript : js port language (전처리 컴파일러, jsp 같은 느낌이라 보면 됨.)

* (내가 카톡에 보낸 사진)
* 모듈(빌드)화를 위한 노력 : webpack : Ecms6



live edit 로 적용되서 save 하면 콘솔에  webpack 이 계속 빌드하는 것을 볼 수 있다.



## spring boot + angluraCli 워크 시나리오

angular cli의 커맨드는 [이곳](https://cli.angular.io/)을 참조 하기를 바람.

(Maven에서 FrontEnd Build Plugin 으로 하는 방안도 있는 데, 그건 추후에 업데이트 하도록 하겠다.)


1. spring boot project 를 만듬.

2. 간단한 RestController 를 만듬.

3. src/main/의 위치에 ng 폴더를 만듬 (src/main/ng/* 가 angular working package가 된다.)

4. terminal(cmd) 를 이용해서 src/main/ng 위치에서 ng new project를 하나 만든다.

5. angular project 가 generated 되면 angular-cli.json 을 오픈.

6. 많은 config key 중에서 'outDir' 의 value에 build export 대상을 지정하면 되는 데, spring boot의 static에 보낼 것이므로.. "outDir": "../../resources/static" 요로콤 설정.

7. terminal(cmd) 에서 ng build 명령으로 bundling 한다.

8. src/main/resources/static 에 보면 build 된 bundle이 생성 되있는 것을 알 수 있다.

9. spring boot를 run. 끝



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

[바딘 DEMO](https://github.com/vaadin/dashboard-demo)


### 보너스 : WebApp을 Android IOS에 포팅해보자

흔히 학원에서 강의를 홍보할 때 Html5 로 만드는 .. 하이브리드 앱, 웹 앱 이라는 말을 들어본 적이 있는가? Html5 하고 Javascript 로 앱에 포팅을하는 것으로 다 만들 수 있다고 홍보하는 데.. 터무니 없는 말은 아니다 가능 하다. 단, Native App에 비해서 퍼포먼스는 구더기이지만.. 기본적으로 텍스트 기반의 또는 Webp의 레이아웃을 따르는 가벼운 Information app 이나, Server ontroler App, Community App 등의 제작을 할 수 있다. [link](https://thebhwgroup.com/blog/hybrid-mobile-apps)

#### Apache Cordova

[link](https://thebhwgroup.com/blog/converting-angularjs-website-cordova-app-ios-and-android)



## 마지막으로

Angular를 적용한다는 것은, F / B 의 명확한 분리를 한다는 것이다.
이것이 의미하는 것은 결국 집중을 뜻한다. 즉, Angular 도입은 명확한 서비스의 목적과 규모 그리고 SPA의 이해가 있어야 한다는 말이다. 괜히 어정쩡한 작은 규모에서 트랜드에 휩쓸려서 혹은 template 관점으로 접근하면 배보다 배꼽이 더 커지게 된다. (이 경우는 [Vaadin](#)으로 접근하는 것이 현명하다고 생각한다.)

시간이 난다면 자바지기님으로 유명하신 [박재성 교수님의 토론](https://www.slipp.net/questions/368) 에서 고수들의 대화를 엿보는 것도 도움이 많이 된다.



## 참고한 도서

* [앵귤러 첫걸음, 조우진](http://book.naver.com/bookdb/book_detail.nhn?bid=12096305)
* [클라이언트-서버 웹 앱 만들기, 캐지미너 새터노스](http://book.naver.com/bookdb/book_detail.nhn?bid=8302910)