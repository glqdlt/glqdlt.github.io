
스프링 시큐리티 OAUTH2 기반의 SSO 를 구성해서 사용하고 있다.

문제는 아래와 같다.

로컬 PC에서 SSO 통합 테스트를 하는 경우, 다양한 포트에 대해서 저장해야한다.

- http://localhost:8081
- http://localhost:8082

RedirectURL 에 대한 패턴 매칭은 RedirectResolver 가 담당한다.

현재 사용중인 모듈에서는 DefaultRedirectResolver 가 있고 이를 사용중에 있는데, 

이 기본 구현체에서는 port 생략 기능이 포함되어 있다.

그런데 문제는 구현체 내부 필드로 구성이 되기 떄문에, 특정 클라이언트만 포트 생략을 한다는 개념은 적용이 불가능하다.

그래서 port 에 대한 wildcard 방법이 없나 찾아보고싶었다.

이슈 히스토리를 뒤져보니, 2년 전에 누군가 나와 같은 생각을 한 사람이 있다.

이 사람은 Path Variable 에 대한 답답함을 호소했다.

웃긴건 이 답변은 2년이 지나서야 이제 답변이 달렸다.

https://github.com/spring-projects/spring-security-oauth/issues/1331

답변은 best parctice 가 아니기 때문에 와일드 카드를 지원할 생각이 없다고 한다.

그리고 필요하다면 니가 알아서 구현체를 만들고 구성해서 사용해라고 한다. 결국 질문한 사람은 직접 만들어서 쓰기로 했다고 한다..



이는 굉장히 무책임한 얘기로 들린다. 기본 구현체는 DefaultRedirectResolver 를 사용하되, 유저에 입맛에 맞게 다양한 구현체를 제공할수 있다고 생각한다.

심지어 요즘은 대 클라우드 시대에 오토스케일아웃 구성이 기본이기 때문에 포트번호가 다양하게 구성될수 있다.

예를 들면 벡엔드 VM 풀을 만들고, 이 벡엔드 VM들을 가르키는 역방향 프록시주소가 있다면
- https://proxy:1 --> route matchine 1
- https://proxy:2 --> route matchine 2

이런식으로 구성이 될수도 있기 때문이다.

이런 불만을 생각하다 보니 도메인에 대해서도 처리가 될수도 있다는 생각이 들었다.


아래는 PR 에 적으려고 준비했던 case 들이다

---

case 1) domain name 에 대한 wildcard 지원 ( IP 인경우도)
서브도메인과 루트도메인

request 
- https://a.domain/home
- https://b.domain/home
regist 
- https://*.domain/home

request
- https://127.0.0.1/home

regist
- https://*.*.*.*/home

case 2) port 에 대한 wildcard 지원
서버 포트번호가 자유롭게 구성 되는 경우가 있습니다.

request
-  http://a.domain:8081/home
-  http://a.domain:8082/home
-  http://a.domain:8083/home

regist :
- http://a.domain:*/home

case 3) path variable 에 대한 widlcard 지원
웹 서버 안에서 특정 PATH 경로가 동적으로 구성될 수 있습니다.
request 
- https://a.domain/home1
- https://a.domain/home2
- https://a.domain/home3

regist
- https://a.domain/*

case 4) query param 에 대한 wildcard 지원
case 3 과 유사하게도, path variable 이 아닌 query param 으로 구성될수도 있습니다.

request 
- https://a.domain/home?identity=1
- https://a.domain/home?identity=2
- https://a.domain/home?identity=3

regist 
- https://a.domain/home?identity=*

case 5)
이런 일은 자주 없지만, 모든 case 를 조합할수 있어야 합니다.

request 
- https://a.domain/home1?identity=1
- https://b.domain/home2?identity=2

regist
- https://*.domain/*?identity=*


---

오픈소스 이력에도 남길겸 이에 대한 구현체를 만들어보기로 했다.

