---
layout: post
title:  "gRPC(작성 중)"
author: "glqdlt"
---















### gRPC 는 restful 한가요?

gRPC 가 restful 한 지에 대한 설명을 하기 전에 먼저 http2 에 대해 알아 볼 필요가 있습니다.

https://stackoverflow.com/questions/28582935/does-http-2-make-websockets-obsolete

http2 는 restful 한가에 대한 질문이 있다면 이에 대한 대답은 예니오 (예 + 아니오) 입니다. 대답이 웃겨보이지만 restful 의 의미에 대해 먼저 정의 해야 이야기가 진행될 수 있습니다. (restful 에 대한 자세한 이야기는 [REST WIKI](https://ko.wikipedia.org/wiki/REST)) 그럼 restful 에 대한 대상을 connection 으로 바라본다고 정의를 하고 얘기를 해볼까 합니다. 

http2 의 connection 은 지속적 한가요? 란 질문을 한다면 예라고 대답할 것 입니다. http2의 몇몇 기능 중 헤더 압축은 stateful 하게 커넥션을 계속 맺고 있기 때문입니다. 그렇다면 기존 http1.1 과 달리 http2 는 restful 하지 않는걸까요?

[HTTP2 의 RFC7540](https://tools.ietf.org/html/rfc7540) 에는 http2 는 기존 http 의 의미와 다르지 않다고 되어 있습니다. 

>   This specification is an alternative to, but does not obsolete, the
   HTTP/1.1 message syntax.  HTTP's existing semantics remain unchanged.

즉 stateless 하다는 의미로 해석될 수 있는 데요. 사실 여기서 계승 한다는 의미는 전통적인 http 의 request가 있으면 response 가 있다 라는 의미를 계승한다는 것입니다.

위에서 잠시 얘기 했지만 헤더압축 기능이 얇은 커넥션을 sateful 하게 맺고 있습니다. 이러한 쟁점을 활용해서 http2 에서는 요청과 응답이 발생할 때의 커넥션 비용을 저렴하게 처리할 수 있습니다. 

이러한 이유로 예니오라고 말했던 것이고, 전통적인 요청과 응답 마다 커넥션을 (다시)새로 맺는다 는 의미에서는 기존 http 1.1 과 마찬가지로 stateless 합니다. 

즉 http2 는 기존 http 의 응답과 요청에 대한 매카니즘을 그대로 활용하되, 기존 http 의 비효율적인 커넥션 비용을 효율적으로 관리하기 위한 방안을 고안한 겁니다.

정리를 하면 http2 의 커넥션은 지속적이냐고 묻는다면 Yes 이지만, 그러면 HTTP가 아닌 새로운 프로토콜이냐? 하면 NO 입니다. 

http2의 커넥션은 한 페이지 탭에서 사용자가 화면을 끄거나 전환할 때 까지는 커넥션이 계속 유지되고 있을 거라고 기대합니다.

다만 이 헤더압축 기술의 커넥션도 결국은 http 프로토콜 안에서 이루어지기에, 특정 네트워크 중간자의 정책에 따라 (프록시나 라우터 등)가 연결이 오래동안 맺혀있을 경우 암묵적으로 컷팅 해버릴 수도 있습니다.


사실 전통적인 restful 이라는 의미에서도, 요청과 응답이 오는 동안에는 커넥션을 맺고 있습니다.
효율적으로 데이터를 주고 받기 위한다라는 의미에서 http2 는 커넥션을 유지하게 되는 것인데
전통적인 웹에서 요청과 응답은 추가적으로 요청을 새로 만들게 설계 되었기 때문에 (포트 당 최대 6개 까지의 소켓을 병렬로 열어두게 된다.)  
http2 에서는 이 개념을 메세지와 프레임이라는 개념을 새로 만들었습니다.

최초의 요청과 응답에 사용되어진 커넥션은 암묵적으로 백그라운드에서 지속적으로 맺고 있어지는 데,
여기서, 요청과 응답에 해당하는 메세지가 발생되면 (필요해지면) 해당 메세지(프레임들을) 커넥션에 올려서 요청과 응답을 보내게 됩니다.
이때 커넥션에 올라갈 때 사용되어지는 .. 마치, 메세지가 사람이라면 기차 같은 '스트림' 이라는 통신 파이프라인에 올려서 전송하게 됩니다.
스트림은 N개 이상으로 여러개로 만들어질 수 있다. N 개가 만들어지는 기준은, 최초 요청에서 파생되는 추가 요청이 있거나 할 때 트리구조 형태로 스트림이 추가 되고 이런 식입니다.
또한 기존 스트림 외에 추가적으로 요청 이벤트가 발생할경우 새로운 스트림이 만들어지고 통신이 되는 구조입니다.


이런 구조때문에 스트림 예니오라고 표현한 것인데,
암묵적으로 연결만 지속적으로 맺고 있는 단순한 커넥션은 ([hpack](https://http2.github.io/http2-spec/compression.html) 관련) persistence connection (예전에는 keep alive)처럼 맺고 있어서 예라고 표현한 것이고,
실제 리소스 소모가 있는 의미 있는 연결이 되는 메세지가 스트림에 올라가서 통신이 되는 것은 기존 request response 구조처럼 restful 한.. 아니오 인 것입니다.

재밌는 것은 클라이언트나 서버에서 의도적으로 암묵적으로 지속적으로만 맺고 있는 커넥션을 끊을 수도 있습니다. 여기에서 사용 되는 것이 rst_stream 이라는 연결 자체를 완전히 끊겠다는 옥탯을 보냅니다. (밑에 gRPC 예제에서는 ```server.awaitTermination();``` 을 사용해서 끊을 수 있습니다.)
hpack 자체도 stateless 하게 사용하고 싶은 몇몇 사람들이 만든 [cashpack](https://github.com/Dridi/cashpack)이라는 것도 있습니다.

2개에서 뭐가 더 장점이 될지는 모르겠습니다.

어차피 나는 gRPC 를 사용하기 위해서 http2 를 알아 본 거니깐..


### http2 vs weboscket

저 역시 그랬지만, 많은 이들이 http2 의 서버 푸시 기능을 바라보고는 웹소켓과 많이들 비교를 하는 모습을 봤습니다.

http2 의 서버 푸시 기능은 원칙적으로 static assets (리소스) 들을 클라이언트에 효율적으로 보내주기 위해 클라이언트에게 사전 캐싱을 내려주는 개념이며, http 의 사상에 의거해서 요청이 없으면 서버에서 일방적으로 응답하는 push 개념과는 다릅니다.

반면 웹소켓은 요청 없이도 일방적인 서버에서 클라이언트로 push 가 가능하다 보니, http2 와 webscoket 은 개념부터 완전 다릅니다, 즉 의미 없는 고민인 셈이지요.



#### 스트리밍(server push promise)와 Pub/Sub 

본 주제와는 조금 상관 없는 이야기이지만 MSA 위에서 node 들 간의 커뮤니케이션(통신)으로 기존의 restful api 외에도 RPC 외에 메세징 솔루션(예: apache kafka)들의 사용도 고려해 볼 수 있습니다. 이렇다 보니 노드 간의 커뮤니케이션 이라는 개념으로 보면 gRPC의 스트리밍과 메세징 솔루션(Pub/Sub 모델)의 차이점을 얘기해볼 수 있습니다. 메세징 솔루션은 불규칙한 시점에 구독자들에게 publish 해주는 sub/pub 모델이고, RPC는 원하는 시점에 대상에게 호출하는 설계와 개념에서 차이가 있습니다. ([gRPC vs Kafka](https://www.quora.com/How-should-I-choose-between-gRPC-and-Kafka-when-building-microservices) )

저 같은 경우에는 http2의 서버 푸시가 단어 어감 때문인지 [Pub / Sub 모델](https://ko.wikipedia.org/wiki/%EB%B0%9C%ED%96%89-%EA%B5%AC%EB%8F%85_%EB%AA%A8%EB%8D%B8)과 비슷한 아키텍처라고 오해하고 많은 삽질을 했었습니다. 아키텍처에서 차이가 있다는 점을 이해하시길 바랍니다.


##### pub/ sub 모델이란?

혹시나 Pub/Sub 모델에 대해 궁금하신 분이 있을까 해서 잠시 짚고 넘어가볼까 합니다. Pub/Sub 는 제공자(publisher) 와 구독자(subcriber) 그리고 중계자(broker)라는 개념이 있습니다.

<img src="https://cloud.solace.com/learn/_images/concept_pubsub_01.gif">

데이터를 제공하는 publisher 와 데이터를 수신하는 subscriber 계층이 존재하고, 이를 중간에서 제어해주는 broker(topic) 가 있습니다. 구독자들은 제공자에게 매번 데이터가 있는지를 체크하지 않고, 데이터가 '갱신' 될 때에만 데이터를 수신할 수 있습니다.

쉽게 예를 들어 설명하면 이벤트 문자메세지 구독서비스와 비슷합니다. 우리가 특정이벤트가 발생했는 지를 이벤트 회사에 매번 물어보기 보다는 자신의 휴대폰번호를 이벤트회사에 알려서 등록이 되면, 이벤트가 생겨 난 시점에 문자 메세지가 휴대폰으로 수신되어서 이벤트 발생 여부를 알 수가 있습니다. pub /sub 모델은 이와 같은 개념입니다. (여담이지만 여기서 이벤트 회사에 매번 물어보는 식은 Comet(Ajax Long Pooling) 기법이라 합니다.)

여기서 RPC 와 Pub/Sub 간의 차이가 나는 데, RPC 는 요청이 있어야 응답이 있는 반면, pub / sub 은 요청이 없더라도 최초의 구독 이후에는 해지되기 전까지 일방적으로 응답을 수신할 수 있습니다.



## gRPC 의 스트리밍과 HTTP/2

이런 걸 극복하고자 gRPC 에서는 스트리밍이란 개념을 도입했습니다. gRPC는 스트리밍을 통해 pub/sub 모델과 유사하게 요청이 없더라도 응답을 받을 수 있습니다. 여기서 제가 많은 삽질을 하게 된 원인인데, pub / sub 은 구독을 해지하기 전까지라는 조건에서 알 수 있듯, 한번 연결되면 계속 연결을 유지합니다. 반면 gRPC 는 요청이 없더라도 최종 응답이 오면 연결이 종료 됩니다. 이는 Http 의 속성인 restful 의 제약을 지키기 위한 것입니다.

http2 에 와서 서버 푸시라는 기능 덕분에 일반 TCP 처럼 연결이 지속 되는 stateful 하게 바뀐 게 아니냐는 이야기가 있었습니다. 이는 반은 맞는 말이고, http2 도 역시 stateless(restful) 한 프로토콜입니다. 

[http 1.1 의 RFC](https://tools.ietf.org/html/rfc2616) 를 보면 stateless 하다고 정의 되었습니다.  

> The Hypertext Transfer Protocol (HTTP) is an application-level
   protocol for distributed, collaborative, hypermedia information
   systems. It is a generic, stateless,

또한 [Http/2 의 RFC](https://tools.ietf.org/html/rfc7540) 역시 기존 http의 restful 한 것을 계승했음을 알 수 있습니다.

>    This specification is an alternative to, but does not obsolete, the
   HTTP/1.1 message syntax.  HTTP's existing semantics remain unchanged.


여기서 조금 의아하게 되는 것이, 왜 다른 사람들은 http/2 를 stateful 하다고 믿게 되는 걸까요? http 1.1 과 http 2 는 버전 업(대체하는)이 아닌 새로 설게된 프로토콜이기 때문입니다. http/2 는 stateless 하지만 restful 하지는 않은 특징이 있습니다. (이게 말이야 방귀야)

http2 에 대한 내용은 다른 아티클에서 자세히 다루어보겠습니다.

## http2 와 websocket


<img src="https://cdn-images-1.medium.com/max/800/1*2EduxBOtJ7ENgIna-aU4WA.png">

ajax long pulling 을 응용해서 setTimer를 이벤트 리스너에 등록하고 서버에 지속적으로 request 를 보냄으로써 실시간 갱신 차트 화면을 만들기도 합니다. 하지만 이에 대한 방안은 많은 오버헤드가 일어납니다. DRY 하고 무거운 http 헤더를 지속적으로 보낼 뿐 더러, 매 요청마다 새로운 커넥션이 일어나게 됩니다. 이에 대한 대안으로 sse(server sent events) 를 통해 대체할 수는 있습니다. sse 는 pub/sub 모델과 흡사한 http 기반 프로토콜입니다. 단 sse에는 치명적인 단점이 있는 데, 브라우저 호환성을 타는 것과 함께 양방향&바이너리 통신 인 websocket(서버 <-> 클라이언트)에 비해 sse 는 단방향 메세징 통신이라는 단점이 있습니다.(서버 -> 클라이언트)
[sse](https://spoqa.github.io/2014/01/20/sse.html)

이에 대한 얘기는 다른 아티클에서 다루어 보겠습니다.

http 2 는 websocket 을 완전 대체하지 못합니다. 

http 2 의 서버 푸시 기술은 브라우저에서만 처리 되고, 웹 asset 들을 효율적으로 보내기 위한 개념입니다. 서버에서 브라우저로 일방적으로 전송할 수 는 없습니다. 이 경우에는 SSE(Server send events)가 필요해집니다.

SSE는 javascript 만 있으면 가능합니다. http 1.1 에서도 됩니다. 단 빛을 발하지 못했던 것은 SSE는 http 패킷을 그대로 사용하기 때문에 패킷 오버헤드가 있어서 데이터가 무거웠습니다. 사실, comet 과 같은 ajax long pooling 기법을 썼던 기술에도 오버헤드가 있는데도 쓰는 것을 생각해보면 SSE 의 이러한 것은 상관없는 얘기가 됩니다.

SSE 는 HTTP 2에 들어서면 빛을 발하게 됬습니다. HTTP2 의 헤더 압축으로 틴해 패킷 오버헤드가 줄어들게 되어서 웹소켓과 거의 대등한 수준의 퍼포먼스를 가집니다. 단, 웹소켓은 양방향인 반면 SSE 는 단방향입니다. 거기에 웹소켓은 바이너리 데이터를 보낼수 있는 반면 SSE는 UTF-8 의 문자 데이터만 보낼 수 있도록 설계 되었습니다.

SSE 는 기본적으로 연결이 긴 일반 HTTP 커넥션으로 데이터를 받아옵니다. 단지 투명하게(어떻게 구현하고 커넥션을 관리하는지 신경아쓰고) browser 의 dom api 를 호출하고 구현만하면.. 서버에서 response 가 있어야할 때에만 데이터를 받아오게 할 수 있습니다. 사용자가 브라우저 탭을 다른 곳에 돌리게 되면 SSE 가 일시적으로 커넥션을 해지한다던가, 사용자가 브라우저를 끌 때에 SSE 커넥션을 해지한다던가.. 등의 커넥션 관리는 신경 쓰지 않아도 됩니다, SSE 를 구현한 브라우저에서 알아서 처리해줍니다.

SSE는 일반적으로 연결된 HTTP 커넥션에서 사용됩니다. 연결이 도중에 끊기더라도 SSE를 구현한 브라우저가 알아서 다시 이벤트를 수신하게 해줍니다. [https://stackoverflow.com/questions/33265773/http-1-1-message-protocol-and-server-sent-events](https://stackoverflow.com/questions/33265773/http-1-1-message-protocol-and-server-sent-events)

https://hpbn.co/server-sent-events-sse/

이야기가 또 옆으로 새는 것이지만 -_-;; http2 에서 서버 푸시라는 기능은 (server push promise라 불리는) '1커넥션에서 n 개의 데이터를 보낼 수 있다' 이지, 1커넥션이 계속 지속된다는 것은 아닙니다. [http2 에서 keep-alive 는 무시가 됩니다.](https://developer.mozilla.org/ko/docs/Web/HTTP/Headers/Keep-Alive)

http://kimseunghyun76.tistory.com/447

```java

// 아래 디펜던시 필요
    //    <dependency>
    //         <groupId>org.springframework.boot</groupId>
    //         <artifactId>spring-boot-starter-webflux</artifactId>
    //         <version>2.1.1.RELEASE</version>
    //     </dependency>


@CrossOrigin
    @GetMapping(path = "/stream-flux", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> streamFlux() {
        return Flux.interval(Duration.ofSeconds(1))
                .map(sequence -> "Flux - " + LocalTime.now().toString());
    }


```


https://okky.kr/article/380704

https://okky.kr/article/380704

[https://beyondj2ee.wordpress.com/2014/01/27/tcp-keep-alive-%ED%80%B5-%EC%A0%95%EB%A6%AC/](https://beyondj2ee.wordpress.com/2014/01/27/tcp-keep-alive-%ED%80%B5-%EC%A0%95%EB%A6%AC/)

[http://b.pungjoo.com/entry/HTTP-11-Keep-Alive-%EA%B8%B0%EB%8A%A5%EC%97%90-%EB%8C%80%ED%95%B4](http://b.pungjoo.com/entry/HTTP-11-Keep-Alive-%EA%B8%B0%EB%8A%A5%EC%97%90-%EB%8C%80%ED%95%B4)



[웹소켓 과 차이](https://www.infoq.com/articles/websocket-and-http2-coexist)

물론 http2 스펙의 덕에 추가 커넥션(또는 추가 Request) 없이도 특정 Message를 push 할 수는 있습니다. 이는 newStub() 

이런 이유 떄문인지 gRPC 에는 sub/pub 기능을 지원하지 않고 있고, 이는 [Google Cloud PubSub - with the power of gRPC!](https://cloud.google.com/pubsub/docs/quickstart-client-libraries#pubsub-client-libraries-java) 라이브러리를 사용하라고 권유하고 있습니다. gRPC Pub/Sub 가이드는[여기](https://cloud.google.com/pubsub/docs/quickstart-client-libraries#pubsub-client-libraries-java), [또는 여기](https://github.com/googleapis/googleapis/blob/master/google/pubsub/v1beta2/pubsub.proto) 확인할 수 있습니다.


하지만 [gRpc-pubsub-broker](https://github.com/IAmMorrow/grpc-pubsub-broker) 와 같은 여러가지 노력을 보면 gRPC 의 스트리밍을 통해 pub/sub 을 구현하는 것이 불가능한 것은 아닙니다.



## http2 와 서버 푸시(server push promise) 에 대한 단상

서버 푸시가 pub / sub 랑 동일한 개념이라고 생각을 했다. 이게 무슨 말이냐면, pub / sub 개념에서는 push 를 받고자 하는 client 가 server 에 구독 (subscribe)을 하며 push 가 올 것을 생각하고 있게 되고, server 에서는 푸시 조건이 트리거 되면 메세지를 구독자들에게 push 해주는 개념이다. 즉 요청이 없이 일방적으로도 push 를 할 수 있다.

나는 http2 의 서버푸시도 이와 같은 것이 아닌가 생각했다. 구글링을 해보면 많은 이들이 나와 똑같이 'http2 server push vs websocket' 이란 키워드로 검색이 많이 된다. websocket 은 브라우저와 웹 서버 간의 pub / sub 아키텍처 로 된 프로토콜이다. 즉 서버 푸시를 pub / sub 으로 오해하면 당연히 web socket 과 http2 서버 푸시를 비교하게 된다.

얘기가 많이 샜는 데, 말하고 싶은 바는 http2 에서의 서버 푸시는 pub / sub 와 달랐다. 이게 무슨 소리냐면 http 2 에서의 server push 는 pub /sub 처럼 일방적으로 푸시 하는 게 아니라, client의 단일 요청에서 여러가지 응답을 보낼수 있다는 것이다. 그리고 이 요청은 keep alive 에 의해 오래 유지될 뿐이고, 영원히 유지되지는 않는다. 아직 학습이 덜 되어서 개인적으로는 개선된 keep alive 로 생각하고 있다.

이걸 기존 http 1.1 과 비교를 해보면 쉽게 이해할 수 있다. 기존 http 1.1 에서는 server에서 특정 리소스와 데이터를 여러번 보내려면  req <-> server 요청과 응답이 4번 있어야 했다. 예를 들어서 아래와 같은 4개의 웹 리소스가 있다고 가정하자.

```
index.html
app.js
app.png
style.css
```

이 경우 http 1.1 은 아래와 같이 된다.

1. index.html 요청, 서버에서  index.html 응답

2. app.js 요청, 서버에서 app.js 응답

...

4. style.css 요청, 서버에서 style.css 응답

즉, 총 4번의 요청과 4번의 응답이 있다. 단순하게 서버에서 여러번 보내주면 되잖아? 로 생각할 수 있는 데.. 서버에서는 응답할 수 있는 건 1종류의 데이터타입으로 1건의 응답할 수 있다. 무조건이다, can 이 아니라 must -_-; 그래서 불가능했다.

반면 http 2 에서는

1. index.html 요청, 서버에서 index.html 응답

2. 서버에서 추가적으로 app.js , app.png , style.css 를 응답

최초의 요청에서 index.html 에 관련 된 모든 리소스들을 서버에서 한 요청(커넥션)에서 모두 다 보내줄 수 있다. 

1번의 요청에 4번의 응답 (정확히는 1번의 응답과 3번의 추가 push 이다.)

이게 바로 서버 푸시개념이다.

이 푸시 개념이 유익한 것은 '하나의 커넥션에서 병렬로 데이터를 수신' 할 수 있다는 점이 포인트이다, 이것만 기억하면 대부분 다 납득이 된다.

이걸 나는 pub / sub 처럼 생각하다보니, 요청 없이도 원하는 순간에 서버에서 push 해줄 수 있어야 하지 않나? 라는 생각에 사로잡혀서 삽질을 하고 있었다 -_-;

gRPC 를 보면.. onNext(){...}; 가 push 를 해주는 메소드이고(http2 spec 상에서 최대 100번까지 push 가 가능하다고 한다.), 마지막 onCompleted(){..} 에서  최종 응답 헤더(finish call)를 보내게 되면서, 커넥션이 닫히게 된다.

내가 했던 방법은 onNext 후에 onCompleted 를 여러번 호출해서 http1.1 에서 여러번 호출하는 것과 유사하게 처리한 것인데, 짧은 시간안에 여러번 호출하면 악의적인 행동으로 감지하고 자동으로 에러가 나는 것 이다. -_-;

그렇다면 gRPC 에서 pub / sub 모델처럼 client 와 server 사이에 원활하게 불특정 시간에 메세지(데이터)를 밀어넣는 것은 불가능할까? 무조건 client 에서 server 에서 메세지(데이터) 를 달라는 식의 단방향 요청식으로 처리해야할까?

이에 대해 고민을 해봤는 데, 쉽게 생각해봤을 때는 결론적으로 가능하단 생각이 들었다.

client 에서 원하는 시점에서 server 에 메세지를 달라고 요청할 수 있는 것이 RPC 이다. 이걸 이용하면 가능하다. client 와 server 의 역활을 바꾸어서, server 에서 client 에게 메세지를 가져가라고 알리는 notification 을 호출 당할 메소드를 client 에 정의해주면 된다. 이렇게 되면 client 의 메소드는 2개가 정의될 것이고, 서버에서는 1개가 될 것이다. 

클라이언트에서는 ```receiveNotification(notification){..};```  과 ``` receiveMessage(message){...} ``` 2개와, 서버에서는 ``` sendMessage(request)  ``` 1개가 구성된다. 

어떻게 보면 pub / sub 의 아키텍처와 매우 흡사하다.

이 외에도 gRPC 에 있는 양방향 스트리밍이 위와 같은 아키텍처와 유사하게 동작하는 지를 살펴본다면 더욱 더 깔끔한 방법으로 원하는 기능을 만들 수 있겠단 생각이 들었다.

살펴본 결과.. 양방향 스트리밍은 단순히 한 커넥션에서 N 개의 Request 와 N 개의 Response 를 응답하는 형태이다. 즉, pub / sub 형태로 개발은 위에서 고안한 아이디어로 notifiaction 을 알려주는 client method 를 정의해줘야 한다.

왜이렇게 만든 것일까


[https://github.com/grpc/grpc-java/blob/master/examples/src/main/java/io/grpc/examples/routeguide/RouteGuideServer.java](https://github.com/grpc/grpc-java/blob/master/examples/src/main/java/io/grpc/examples/routeguide/RouteGuideServer.java)





```java

 @io.grpc.stub.annotations.RpcMethod(
      fullMethodName = SERVICE_NAME + '/' + "serverToClientStream",
      requestType = com.glqdlt.ex.grpcexam.model.Simple.SimpleRequest.class,
      responseType = com.glqdlt.ex.grpcexam.model.Simple.SimpleResponse.class,
      methodType = io.grpc.MethodDescriptor.MethodType.SERVER_STREAMING)
  public static io.grpc.MethodDescriptor<com.glqdlt.ex.grpcexam.model.Simple.SimpleRequest,
      com.glqdlt.ex.grpcexam.model.Simple.SimpleResponse> getServerToClientStreamMethod() {
    io.grpc.MethodDescriptor<com.glqdlt.ex.grpcexam.model.Simple.SimpleRequest, com.glqdlt.ex.grpcexam.model.Simple.SimpleResponse> getServerToClientStreamMethod;
    if ((getServerToClientStreamMethod = SImpleServiceGrpc.getServerToClientStreamMethod) == null) {
      synchronized (SImpleServiceGrpc.class) {
        if ((getServerToClientStreamMethod = SImpleServiceGrpc.getServerToClientStreamMethod) == null) {
          SImpleServiceGrpc.getServerToClientStreamMethod = getServerToClientStreamMethod = 
              io.grpc.MethodDescriptor.<com.glqdlt.ex.grpcexam.model.Simple.SimpleRequest, com.glqdlt.ex.grpcexam.model.Simple.SimpleResponse>newBuilder()


              .setType(io.grpc.MethodDescriptor.MethodType.SERVER_STREAMING)



              .setFullMethodName(generateFullMethodName(
                  "com.glqdlt.ex.grpcexam.model.SImpleService", "serverToClientStream"))
              .setSampledToLocalTracing(true)
              .setRequestMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.glqdlt.ex.grpcexam.model.Simple.SimpleRequest.getDefaultInstance()))
              .setResponseMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.glqdlt.ex.grpcexam.model.Simple.SimpleResponse.getDefaultInstance()))
                  .setSchemaDescriptor(new SImpleServiceMethodDescriptorSupplier("serverToClientStream"))
                  .build();
          }
        }
     }
     return getServerToClientStreamMethod;
  }


  @io.grpc.stub.annotations.RpcMethod(
      fullMethodName = SERVICE_NAME + '/' + "serverToClient",
      requestType = com.glqdlt.ex.grpcexam.model.Simple.SimpleRequest.class,
      responseType = com.glqdlt.ex.grpcexam.model.Simple.SimpleResponse.class,
      methodType = io.grpc.MethodDescriptor.MethodType.UNARY)
  public static io.grpc.MethodDescriptor<com.glqdlt.ex.grpcexam.model.Simple.SimpleRequest,
      com.glqdlt.ex.grpcexam.model.Simple.SimpleResponse> getServerToClientMethod() {
    io.grpc.MethodDescriptor<com.glqdlt.ex.grpcexam.model.Simple.SimpleRequest, com.glqdlt.ex.grpcexam.model.Simple.SimpleResponse> getServerToClientMethod;
    if ((getServerToClientMethod = SImpleServiceGrpc.getServerToClientMethod) == null) {
      synchronized (SImpleServiceGrpc.class) {
        if ((getServerToClientMethod = SImpleServiceGrpc.getServerToClientMethod) == null) {
          SImpleServiceGrpc.getServerToClientMethod = getServerToClientMethod = 
              io.grpc.MethodDescriptor.<com.glqdlt.ex.grpcexam.model.Simple.SimpleRequest, com.glqdlt.ex.grpcexam.model.Simple.SimpleResponse>newBuilder()



              .setType(io.grpc.MethodDescriptor.MethodType.UNARY)


              .setFullMethodName(generateFullMethodName(
                  "com.glqdlt.ex.grpcexam.model.SImpleService", "serverToClient"))
              .setSampledToLocalTracing(true)
              .setRequestMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.glqdlt.ex.grpcexam.model.Simple.SimpleRequest.getDefaultInstance()))
              .setResponseMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  com.glqdlt.ex.grpcexam.model.Simple.SimpleResponse.getDefaultInstance()))
                  .setSchemaDescriptor(new SImpleServiceMethodDescriptorSupplier("serverToClient"))
                  .build();
          }
        }
     }
     return getServerToClientMethod;
  }


```

https://b.luavis.kr/http2/http2-overall-operation

https://developers.google.com/web/fundamentals/performance/http2/?hl=ko



https://github.com/saturnism/grpc-java-by-example/tree/master/metadata-context-example/src/main/java/com/example/grpc


## next

- gRPC 인증 과 보안







## Bidirectional Streaming(양방향 스트리밍)

[https://github.com/nddipiazza/grpc-java-bidirectional-streaming-example/blob/master/src/main/java/GrpcExampleClient.java](https://github.com/nddipiazza/grpc-java-bidirectional-streaming-example/blob/master/src/main/java/GrpcExampleClient.java)



[https://www.programcreek.com/java-api-examples/?api=io.grpc.stub.StreamObserver](https://www.programcreek.com/java-api-examples/?api=io.grpc.stub.StreamObserver)

[https://github.com/grpc/grpc-java/tree/master/examples](https://github.com/grpc/grpc-java/tree/master/examples)

[https://github.com/grpc/grpc-java/blob/master/examples/src/main/java/io/grpc/examples/routeguide/RouteGuideClient.java](https://github.com/grpc/grpc-java/blob/master/examples/src/main/java/io/grpc/examples/routeguide/RouteGuideClient.java)


[https://developers.google.com/web/fundamentals/performance/http2/?hl=ko#_8](https://developers.google.com/web/fundamentals/performance/http2/?hl=ko#_8)
