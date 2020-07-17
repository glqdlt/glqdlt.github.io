

리액티브 프로그래밍과 이벤트 DRIVEN

스프링 프레임워크의 EventPublisher 로 EDD 를 흉내내보려 했다.

어느 정도 가능은 하지만, 단일 이벤트에 대해서만 구독이 가능하기 때문에 답답한 감이 있다.

그래도 super type을 같이 구독해서, subType 별로 분기를 태운다던지로, 얼추 흉내는 가능하다.

```
  
    @Override
    public void onApplicationEvent(NumberEventResult event) {
        logger.info("number : {}", event.getCount());
        if(event instanceof ExtendNumberEventResult){
            logger.info("special consume..");
        }else{
            logger.info("default consume..");
        }
    }

```

다만 이 경우는 관심사를 위해서 전혀 상관없는 객체를 연결(상속) 해야하는 골때리는 상황이 발생하기에 비추.

같은 어그리게잇의 특정 이벤트를 처리하는 하위 컴포넌트들을 하나의 패키지(이를 바운더리 컨텍스트로 본다)에 놓고 할수도 있는데  클래스 파일이 매우 많아질 소재가 있기 때문에 이 경우 관리도 어려워진다.
