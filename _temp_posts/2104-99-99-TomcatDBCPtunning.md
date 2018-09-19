---
layout: post
title:  "톰캣 DBCP 튜닝"
author: "glqdlt"
---

회사에서 실시간 대규모 컨텐츠 수정하는 기능 개발을 할 때의 이야기이다. 엑셀에 약 1만 라인의 데이터를 기입하여 CMS를 통해 서버로 업로드 하면 시스템에서 해당 row를 읽어서 배열로 정렬하고 배열의 사이즈만큼 데이터베이스에 컨텐츠를 갱신하는 단순한(?) 로직의 개발이었다.

문제는 로직 상에 문제가 없고, Local 개발 환경에서는 1만 건 까지의 퍼포먼스가 나오는 상황인데

막상 운영 환경에 배포하면 1천개를 초과하면 로직이 실패하는 상황이 있었다.

해당 에러를 트레이싱 하던 도중에, 데이터베이스에 커넥션이 끊겨있는 것을 확인하게 되었고, 설정 상에 문제라고 판단되어 확인해보았다.

예전 퇴사자가 커넥션 폴의 설정을 아래와 같이 해놓은 것을 확인하게 되었다.

```java

datasource.properties

spring.jdbc.min.size=3
spring.jdbc.max.size=3
spring.datasource.removeAbandoned=true
spring.datasource.removeAbandonedTimeout=60


```

이 설정을 해석하면

DBCP 에 무조건 살려 놓을 최소한의 커넥션이 3개이고, 커넥션 폴의 최대 사이즈는 3개이다. 또한 커넥션의 라이프사이클을 관리하기 위해서 커넥션이 부족할 떄 강제로 커넥션의 타이암웃을 60초 동안만 살리겠다는 내용이다.

spring.datasource.removeAbandoned 이 설정이 조금 생소할 수 있는 데, 로직 상에서 DB Connection 을 획득하고 비지니스 처리 후에 Connection 을 꼭 DBCP 에 반환해야 한다. 그러나 개발자의 코드 실수나 모종의 이유로 반환이 되지 않을 경우가 있다. 이를 위해서 나온 설정이 'spring.datasource.removeAbandoned' 이다. 이 놈이 하는 역활은 커넥션을 spring.datasource.removeAbandonedTimeout 설정 시간에 회수하겠다(무조건은 아니라는 썰이 있다. 아마 DBCP 에 부하가 올 떄 회수하는 듯 하다. 나중에 참고해야할듯.) 이다. 

즉, 여러 관리자가 이용하는 CMS에 사용 되는 DB 커넥션은 3개 밖에 안되었고, 특정 관리자가 지연 시간이 큰 (1만개 이상의) 엑셀을 업로드 시에는 한 커넥션이 오랫동안 세션을 가지게 됨으로, DBCP 에서 여유 커넥션이 없어서 이 세션을 60초에 강제로 closing 해버리면서 발생한 문제였다.

기본적으로 이 설정을 하지 않으면 [공식레퍼런스](https://commons.apache.org/proper/commons-dbcp/configuration.html)의 default 설정으로 활성화 되는 데, default 보다 낮은 수치의 설정 때문에 문제가 되었던 것이다.

개인적인 뇌피셜이지만, 이러한 설정은 예전 퇴사자가 발코딩으로 인해서 운영 서버에 장애가 일어나 욕을 한무더기로 먹고는 DBCP 문제라 생각하고 이리 설정한 것으로 생각하고 있다.



해서 해결한 설정은 아래와 같다.

```java

datasource.properties

spring.jdbc.min.size=3
spring.jdbc.max.size=10
spring.datasource.removeAbandoned=true
spring.datasource.removeAbandonedTimeout=300


```

공식 default 에서의 DBCP 폴 사이즈인 커넥션 최대를 10개로 설정하고, 커넥션 세션의 유휴 타임아웃을 300초로 처리했다.
이렇게 한 후에는 문제 발생 없이 잘 운영되고 있다.