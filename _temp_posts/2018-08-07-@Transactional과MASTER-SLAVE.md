---
layout: post
title:  "@Transactional과 MASTER SLAVE 모델"
author: "glqdlt"
---

# 

서비스 회사에 있어보니 예전 SI 기반의 회사 때 보다 MASTER SLAVE 모델에 대해서 심도있는 경험을 하게 되었다.

Master 와 Slave를 두는 것은 실제 서비스 환경에서 DB에 부하를 많이 주는  작업은 Read 작업이 많기 때문에, Update 가 일어나는 것은 Master에 두고 Readable 위주의 작업은 Slave에서 행해서 부하를 분산시키는 것이다.

단, Master / Slave의 Replication은 시차가 일어나는 것이기 때문에, 상황에 따라서 Master에서 Read 해야하는 경우도 있다. 

이렇게 여러가지 생각해야할 것이 많다 보니 'select는 전부 slave로 때리면 되는거 아님?' 이란 얄팍한 생각을 하면 안 된다.


## Master 와 SLAVE 의 처리

이 포스트를 작성하기 전에 (즉, 심도있는 학습이 준비 되지 않았을 때) 해결했던 방안은 아래와 같다.

1. entitymanager 를 Master /Slave 총 2개 만든다.

2. 각 entitymanager를 사용하는 Master / SLAVE repository 를 2개 만든다.

3. 실제 작업을 수행하는 서비스에서 Master / SLAVE 분기에 따라 각기 다른 repository를 호출해서 Master 와 SLAVE 작업을 처리한다.

무식하게 해결 했다. 변명을 하자면 이런 경우를 처음 접했고, 반영했던 어플리케이션이 굉장히 오래된 레거시 앱 (거기다가 ORM과 xml mapper가 공존하는 정체성 없는 구조를 가지고 있었다) 이었기 때문에 깔끔한 방법에 대해 쉽게 떠오르지 못했기 때문이었다.

시간이 흘러 코드는 잘 동작하고 있었지만, 반복되는 Master / Slave의 똑같은 파일이 생성되고 복,붙 되는 DRY 원칙에 위배되는 행위에 리팩토링을 시행할 때가 왔다는 생각이 들었다.


## @Transactional

```@Transactional``` 은 스프링 프레임워크에서 제공하는 트랜잭션 단위를 묶어주는 어노테이션이다. 




```java
@Transactional(readOnly = true)
public User findBySeq(Long seq) {
    ...
}

@Transactional(readOnly = false)
public User findBySeq(Long seq) {
    ...
}
```





# 레퍼런스

[http://jo.centis1504.net/?p=721](http://jo.centis1504.net/?p=721)


[http://egloos.zum.com/kwon37xi/v/5364167](http://egloos.zum.com/kwon37xi/v/5364167)

https://stackoverflow.com/questions/1614139/spring-transactional-read-only-propagation

