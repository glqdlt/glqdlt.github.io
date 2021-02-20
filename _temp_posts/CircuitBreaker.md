# Circuit Breaker

MSA 에서의 서비스 영속성 개념의 패턴이다. Circuit Breaker 는 단어 그대로로 보면 두꺼비집이라고 한다. 

Armeria 를 잠깐 알아보다가, Armeria 의 Circuit Breaker 가 잘 구현되어 있다는 이야기에 이게 먼소린가 싶어서 찾아봤더니 디자인패턴이었다.

개념은 예외상황이 발생해서 서비스 중단을 어떻게 막을것이냐에 대한 이야기이다.

여기서 말하는 서비스 중단이란, 유저 경험을 떨어뜨리는 행위이다. 예를 들어 어떠한 이커먼스의 상품 리스트를 조회하다가, 최우선 상단에 노출되는 추천상품이 표시가 될수 없는 상황이 되어서 해당 웹서비스가 중단이되거나 상단 추천 화면이 하얗게 나온다면 어떻게 될까?

기존 모놀리스한 구성에서는 어플리케이션 내부의 모듈과 모듈이 서로 커뮤니케이션을 하는 과정에서 예외상황이 발생한다면 예외를 처리가능한 지점까지 전파하거나 발생한 시점에서 적절히 핸들링하는 방법으로 했지만 MSA 에서는 서비스와 서비스 간의 커뮤니케이션으로 이러한 부분이 기존 방식과는 접근 개념에서 차이가 난다.

아래와 같은 구성의 서비스 노드가 있다고 가정을 해보자.

User << >> Service A << >> Service B 

여기서 Service B 에 병목형상이 발생해서 응답이 늦어지는 경우, Service A 까지 느려지는 것으로 User 는 착각하게 된다. 병목 전파이지만 혹여나 느린게 아니라 Service B가 죽기라도 한다면 장애 전파로 발생할수 있다.

보통은 이러한 경우에 Service A가 Service B 대신해서 적절한 응답을 할수있도록 예외처리를 하는 경우가 많다. 일반적으로 Service B 의 핵심 도메인에 대해서는 Service A가 잘 알지 못함으로, 적절한 에러메세지나 에러 화면을 이쁘게 보여는 정도로 하기 때문에, 크게 와닿지 않을 수 있다. 

이 경우에는 새벽 시간과 같은 유저폴이 적은 시간대에는 가능하지만, 문제는 유저가 피크타임으로 몰릴 때에는 Service A 에서 Service B의 장애가 어떻게 해결됬는지 알턱이 없어 계속해서 Service B로 계속 호출하고.. 호출한 갯수만큼 Service B 의 응답을 무한정 기다리게 되면서 리소스 고갈(스레드 부족 등)로 교착상태에 빠지게 된다. 이렇게 되면 교착상태에 빠진 이후부터의 User 의 요청은 장애로 발생하게 된다.


이러한 경우의 솔루션이 Circuit Breaker 이다.  즉 서비스 간의 네트워킹에서 교착상태에 빠질 때의 두꺼비집인 셈이다.

<img src='https://docs.aws.amazon.com/whitepapers/latest/modern-application-development-on-aws/images/image8.png'>


- Hystrix

넷플릭스에서 구현한 자바 기반의 라이브러리이다.

- envoy.io

역방향 프록시 개념으로 인프라 차원에서 처리가 필요할 경우에 고려를 한다.


# Reference

- https://bcho.tistory.com/1247

- https://jupiny.com/2020/01/30/armeria-circuit-breaker/

- https://docs.aws.amazon.com/whitepapers/latest/modern-application-development-on-aws/circuit-breaker.html