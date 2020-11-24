
Azure 서비스 버스를 다루었던 경험을 기록한다.

## 짚고 넘어갈 점

### 용어의 정리

#### 메세징 브로커

일반적으로 아무생각없이 얘기하는 메세지 큐에 해당한다. 사실 메세지 큐만 있는 것이 아니라, 메세지 토픽도 있다. 2개의 차이는 유니캐스팅 vs 브로드캐스팅(멀티캐스팅) 차이이다.

MSA 해봤어요 라 얘기할 때, 메세지 큐를 썻습니다 ㅎㅎ 하는 사람은 경험이 없는 것이다, 메세지 브로크 시스템(플랫폼)을 써봤습니다 라 얘기해야한다.

왜냐면 토픽도 큐도 모두 둘다 사용하기 때문이다.

이유는 메세지 큐는 유니캐스트 기반의 라운드로빈 식의 스레드 풀처럼 하나의 메세지를 하나의 메세지 수신자(또는 구독자, 또는 워커)가 받아가면 메세지는 삭제되는 개념이고,

메세지 토픽은 디자인패턴의 옵저버 패턴 처럼 메세지가 수신되었을 때 감지를 위한 옵저버(또는 구독자, 또는 워커) 들에게 모두 메세지를 복사해서 던져주는 브로드캐스팅 개념이다.

아래 이미지를 참고하자

https://i.stack.imgur.com/B6H90.png


#### 큐

http://activemq.apache.org/how-does-a-queue-compare-to-a-topic.html

위에서 얘기했던 것처럼 큐의 경우는 아래의 시나리오에 사용된다.

- 특정 이벤트 (또는 작업)에 대해서 여러 인스턴스들이 순차적으로(또는 라운드로빈, 또는 랜덤) 이벤트를 처리해야하는 경우는 메세지 큐를 사용해야 한다.

#### 토픽

http://activemq.apache.org/how-does-a-queue-compare-to-a-topic.html

- 특정 이벤트를 관심있는 모든 이가 동시에(사실 거의 동시에) 이벤트를 수신해야하는 경우, 즉 브로드캐스팅이 필요한 경우

- 특정 이벤트를 위의 예시처럼 브로드캐스팅 되지만, 이벤트를 수신하고 이벤트가 관심있는 경우만 처리해야하는 경우, 즉, 멀티캐스팅으로 특정 이벤트만 필터링하고 싶은 경우



Azure 에서도 JMS 의 큐와 토픽과 같은 개념으로 설계가 되어있다. 

내 경험상 레빗엠큐와 조금 차이가 있다면, 토픽에 수신하고 싶은 구독자를 등록하는 과정이 꽤 번거롭고 복잡하다.

레빗엠큐는 특정 토픽 이름만 알면 자유롭게 구독자로 등록할 수 있다. 나는 UUID로 랜덤 문자열을 뽑아서 등록하게 했었다.

Azure 에서는 이 과정이 번거롭다. Azure Template 이라는 것을 통해 하드웨어 서버 OS 단에서 스크립트를 실행해서 등록하는 식의 과정이 있다.

파이썬의 경우에는 동적으로 등록하는 예제가 있던데, 자바의 경우는 어쩐지 모르겠다. 있을 거 같은데 좀 불편하더라.


또 특이한 부분이 토픽 리스너 클라이언트 생성자에 entrypath 를 셋업하는 문자열이 겁나 골때린다.

일반적으로 토픽/구독 이런 구성으로 접근해야하는데,

"topic/subscriptions/subs1" 과 같이 중간에 subscipriotns 키워드가 무조건 있어야한다.

뭐랄까 어트리뷰트키로 쓰려고 하는거같은데.. 저런 문자열 구성이라면 배열에 같이 섞이는 느낌인데 골때린다.

이거가지고 삽질하다가 빡쳐서 PR 날렸다, 자세한 것은 아래 내용 참고

https://github.com/Azure/azure-service-bus/pull/395

## 2번째빡침

Topic 을 리스너가 붙을 때, Topic/Subscriptions/Susb1 이런 식으로 중간에 SUbscriptions 딜리미터를 붙이는것도 짜증나는데, Subs1 이런것처럼 커넥션에 붙을 때 존재하지 않을수 있는 SUbscriptions 명을 붙여서 연결해야한다. 이게 좀 괴랄한게

Azure에서 구독 이란 개념은, 구독풀 또는 구독accessPoint 개념이 아니다. 이게 무슨 말이냐면, 

Topic/Subscriptions/Sub1 이란 곳에 3개의 서비스 인스턴스가 붙었다고 가정하자. 이 경우 Sub1로 토픽의 이벤트가 흘러들어왔을 때, 3개 모두가 브로드캐스팅 되는개념이 아니고 큐처럼 동작한다. 

즉 이 말은 3개의 인스턴스가 각 TOPIC에 붙을수있게 구독이 3개가 동적으로 만들어져야 한다. 아래 처럼 말이다.

- Topic/Subscriptions/App1(hostname)
- Topic/Subscriptions/App2(hostname)
- Topic/Subscriptions/App3(hostname)

문제는 rabbitmq 의 경우 subject(azure 에서는 topic) 의 구독이 선언된게 없으면 바로 자동으로 신규 구독이 만들어지는 데, azure 의 경우 없다고 하고 에러내고 끝이다 -_-

그렇다면 없을 경우 내가 새로이 createApi 호출해서 만들수있게 해야하는데, 그 개념이 없다.

management api 를 제공하기는 하는데 (https://docs.microsoft.com/en-us/previous-versions/azure/reference/hh780748(v=azure.100)?redirectedfrom=MSDN)

이걸 사용하려면 새로이 AD에 연결해서 토큰을 발급받는 등의 별도의 세션으로 접근해야한다.

왜 이런가해서 찾아봤더니, topic 에 붙을수있는 방법이, azure 의 서버 인스턴스가 로드되는 시점에 파워쉘과 같은 초기화 스크립트, 또는 리소스 식별 AD로 접근할수 있게 설계를 했던것이다.

이 경우 AZURE에서 관리 제공하는 PAAS나 SAAS 의 경우 쉽게 프로비저능 되는데, IAAS 또는 외부에서 연결하는 형태는 불가능하다 ㅡㅡ

com.microsoft.azure.servicebus.SubscriptionClient.class
```java
public final class SubscriptionClient extends InitializableEntity implements ISubscriptionClient {
    private static final Logger TRACE_LOGGER = LoggerFactory.getLogger(SubscriptionClient.class);
    private static final String SUBSCRIPTIONS_DELIMITER = "/subscriptions/";
}
```





## 레퍼런스

https://docs.microsoft.com/en-us/azure/service-bus-messaging/service-bus-queues-topics-subscriptions#topics-and-subscriptions

https://stackoverflow.com/questions/45872802/azure-service-bus-topics-multiple-subscribers

https://docs.microsoft.com/ko-kr/azure/service-bus-messaging/service-bus-dotnet-get-started-with-queues

https://docs.microsoft.com/ko-kr/azure/architecture/patterns/publisher-subscriber

https://docs.microsoft.com/ko-kr/azure/event-grid/compare-messaging-services

https://docs.microsoft.com/ko-kr/azure/architecture/guide/architecture-styles/event-driven

https://www.serverlessnotes.com/docs/en/publish-subscribe-with-azure-service-bus

https://www.serverlessnotes.com/docs/en/azure-service-bus-fifo-pattern


