
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

2020-11-24

SDK를 까서 역공학을 해보니 ManagementClient 라는 이름의 클래스가 있어서 이를 사용해보았다.

최종적으로는 아래 createSubscription() 메소드를 만들어서 프로그래밍으로 처리가 가능함을 확인했으며, 또한 TopicClient 에서 사용하는 동일한 커넥션스트링도 사용이 되는걸 확인했다.

참고로 커넥션스트링의 스코프가 보내기,수신 외에 관리라는 스코프도 같이 있어야하는 것으로 보인다.

```

    public String createSubscription(String connectionString,
                                     String topic,
                                     String context) throws ServiceBusException, InterruptedException {
        ConnectionStringBuilder connectionStringBuilder = new ConnectionStringBuilder(connectionString);
        ManagementClient mng = new ManagementClient(connectionStringBuilder);
        String random = UUID.randomUUID().toString().split("-")[0];
        String time = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        final String subName = String.format("%s-%s-%s", context, time, random);

        SubscriptionDescription subscriptionDescription = new SubscriptionDescription(topic, subName);
        subscriptionDescription.setAutoDeleteOnIdle(Duration.ofDays(14));
        try {
            SubscriptionDescription aaa = mng.createSubscription(subscriptionDescription);
            return aaa.getSubscriptionName();
        } catch (MessagingEntityAlreadyExistsException e) {
            return subName;
        }
    }
    
    
```


### 메세지 속성

Java 버전의 Service Bus 는 기본적으로 IMessage 라는 클래스를 통해 메세지를 주고 받는다. 이 자료구조에는 대부분 사용할법한 기본적인 속성이 몇가지 있다. 속성에 없는 커스터마이징이 필요하다면 body에 본인이 직접 별도로 자료구조를 구성해야한다.

IMessage

-meesageId

-label

-replyTo

-replyToSessionId

-parintionKey

-deadletterSource

### 나의 무뇌함

메세지를 보내는건 단순하지만, 메세지를 수신하는 게 조금 까다롭다. 

수신 하는 방법은 기본적으로 2가지이다.

자동모드(ReceiveAndDelete) 그리고 PeekLock(명시적으로수신)

이름부터느끼겠지만, 리시브앤드딜리트는 수신하면 자동으로 수신했다는 이벤트를 브로커에 알리고 메세지가 삭제되는 개념이다.

com.microsoft.azure.servicebus.ReceiveMode
```
public enum ReceiveMode {
    /**
     * In this mode, received message is not deleted from the queue or subscription, instead it is temporarily locked to the receiver, making it invisible to other receivers. Then the service waits for one of the three events
     * <ul>
     * <li>If the receiver processes the message successfully, it calls <code>complete</code> and the message will be deleted.</li>
     * <li>If the receiver decides that it can't process the message successfully, it calls <code>abandon</code> and the message will be unlocked and made available to other receivers.</li>
     * <li>If the receiver wants to defer the processing of the message to a later point in time, it calls <code>defer</code> and the message will be deferred. A deferred can only be received by its sequence number.</li>
     * <li>If the receiver wants to dead-letter the message, it calls <code>deadLetter</code> and the message will be moved to a special sub-queue called deadletter queue.</li>
     * <li>If the receiver calls neither of these methods within a configurable period of time (by default, 60 seconds), the service assumes the receiver has failed. In this case, it behaves as if the receiver had called <code>abandon</code>, making the message available to other receivers</li>
     * </ul>
     */
    PEEKLOCK,
    /**
     * In this mode, received message is removed from the queue or subscription and immediately deleted. This option is simple, but if the receiver crashes
     * before it finishes processing the message, the message is lost. Because it's been removed from the queue, no other receiver can access it.
     */
    RECEIVEANDDELETE
}

```

PeekLock 수신했다는 이벤트를 수신했다or 실패했다 응답을 수동으로 하는 개념이다.

이것이 필요한 것은 메세지를 전달해주는 것까지만 핸들링이 가능하다. 이후에는 어떻게 잘 써먹었는지 브로커 입장에서 알턱이 없다.

기본적으로 메세지가 전달시도할때부터 메세지는 전달당할 리스너에 의해 메세지 락킹이 된다. 락킹이 되면 다른 수신자는 이 메세지의 존재를 알수가 없다.

TOPIC 이나 QUEUE 나 모두 메세지 큐를 사용하기 때문에, 이러한 개념은 공통적이다.

리마인드 차원에서 얘기하면 큐의 경우 로드밸런싱 처럼 분배작업이 가능하다. 토픽은 큐를 이용해서 발행-구독 패턴을 적용한 개념일뿐, 결국은 큐다.

즉 토픽의 구독에 여러명이 하나의 구독에 달라붙게 되면, 메세지 큐처럼 동작하게 되어 메세지 수신 락킹 선점 싸움을 하게 된다. 먼저 선점한놈이 메세지 받고 끝인거다.

결론적으로 아래 설명할 PeekLock은 메세지 선점 싸움을 다시 시킬지 말지를 브로커가 알기 위한 작업인 셈이다. 메세지를 잘 써먹었는 지를 모르는 동안은 메세지가 락킹되고,

잘 써먹었는지 실패했는지를 알게 되면 메세지 수신을 다시 경쟁할수있게 언락킹 되는 것이다.

아래는 PeekLock 에서 해주어야할 ack 개념에 대해 이야기한다.

메세지를 수신했다는 ack 를 보내주어야한다. 왜냐면 queue 입장에서 메세지가 잘 수신됬는지 판단을 해야, 다시 보내줄지 말지를 고려할수 있기 때문이다.

응답ack 로 총 3가지의 개념이 있다. complete() , abandon(), deadletter() 3가지이다.

complete는 초딩도 알수있는것처럼 성공처리이다. abandon (거부하다)와 deadletter(죽은편지) 는 모두 실패한다는 개념인데, 무슨 차이가 있는지 경계가 조금 애매모해서 삽질을 좀 했다.

abandon은 메세지를 일시적으로 수신할수 없다는 개념이다. 즉 메세지를 다시 보내달라는 요청이다. 다시 보내달라는 요청은 제한 값이 있다, 이 것은 abandon 은 구독을 생성할 때 있는 "최대 배달 횟수" 를 의미한다. 즉 최대 배달 횟수가 10개로 설정되어있다면 abandon() 이벤트로 다시 보내주는 메세지 최대 갯수는 10번이라는 것이다.

abandon() 이 최대 배달 횟수의 최대치에 도달하면, 원본 메세지는 dead letter 처리 된다. 한국 번역판에 배달하지 못한 메세지로 되어있어서 번역상의 괴리감 떄문에 조금 헤맸다.

dead letter(죽은 메세지) 는 일반 메세지와는 별도의 큐에서 관리가 된다. 일반적으로 메트릭에 알람이나 통계용으로 사용되는 게 기본이며, 별도로 dead letter 를 관리하는 큐에 직접 죽은 메세지를 수신해서 다시 처리할지 말지의 로직을 본인이 직접 구현해볼수도 있다.


## 레퍼런스

https://docs.microsoft.com/en-us/azure/service-bus-messaging/service-bus-queues-topics-subscriptions#topics-and-subscriptions

https://stackoverflow.com/questions/45872802/azure-service-bus-topics-multiple-subscribers

https://docs.microsoft.com/ko-kr/azure/service-bus-messaging/service-bus-dotnet-get-started-with-queues

https://docs.microsoft.com/ko-kr/azure/architecture/patterns/publisher-subscriber

https://docs.microsoft.com/ko-kr/azure/event-grid/compare-messaging-services

https://docs.microsoft.com/ko-kr/azure/architecture/guide/architecture-styles/event-driven

https://www.serverlessnotes.com/docs/en/publish-subscribe-with-azure-service-bus

https://www.serverlessnotes.com/docs/en/azure-service-bus-fifo-pattern


