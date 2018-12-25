---
layout: post
title:  "Static과 final"
author: "glqdlt"
---

gRPC 에서 .proto 파일로 generated source 를 보다 아래처럼 static final class 가 있길래 이에 대해서 생각을 해봤다.
```java
...
  public static final class UserServiceBlockingStub extends io.grpc.stub.AbstractStub<UserServiceBlockingStub> {
    private UserServiceBlockingStub(io.grpc.Channel channel) {
      super(channel);
    }

    private UserServiceBlockingStub(io.grpc.Channel channel,
        io.grpc.CallOptions callOptions) {
      super(channel, callOptions);
    }

    @java.lang.Override
    protected UserServiceBlockingStub build(io.grpc.Channel channel,
        io.grpc.CallOptions callOptions) {
      return new UserServiceBlockingStub(channel, callOptions);
    }
...
```

static 은 innerClass 의 생성을 위해서는 알겠는 데, 경험 부족으로 final class 에 대해서 의미가 이해되질 않았다.

상상의 나래를 펼치며 final class 로 생성된 인스턴스는 최초 선언된 변수에 할당되어 상수처럼 된다는 것인가? 싶었는 데.. 그건 아니었다 -_-;

실험을 해보니, 답은 간단하게 나왔다.

```java

public class SomeOuter {

    public String getOuterName() {
        return outerName;
    }

    public void setOuterName(String outerName) {
        this.outerName = outerName;
    }

    private String outerName;

    public static final class SomeInner{

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        private String name;
    }
}

```

특정 class에서 final 정의 된 class를 상속하게 하려 해보면 아래의 메세지를 확인할 수 있다.

<img src="/images/static.PNG"/>

final 로 정의 된 class 는 상속을 할 수가 없다. 