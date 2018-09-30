---
layout: post
title:  "@Transactional과 MASTER SLAVE 모델"
author: "glqdlt"
---

# 들어가며

게임 회사에서 근무 하게 되면서, 지금까지의 경험 과는 다른 게임 서비스 운영에서의 접할 만한 여러가지 운영 관점의 경험을 맛보고 있다. 아직까지 크게 심도 있는 듯한 차이의 업무는 많이 못 해보았지만, 어느 정도 이러 이러한 일들이 발생할 것이다 라는 윤곽이 보이는 부분은 있어서 매사 업무를 하는 데에 기대 반 걱정 반으로 보내고 있다. -_-;

최근에는 이 윤곽들 중의 하나 인 Master Slave 구조의 replication (mirroring) 데이터베이스 구성과 이에 따른 웹 어플리케이션 구조와 로직의 전체를 리팩토링 업무를 리드하게 되었는 데, 이 과정에서 그간 배워왔던 지식을 동원하고 자문을 구해가며 갚진 경험을 진행하게 되어 이를 공유해보고자 한다.


# Mysql Master Slave 구조

Replication Database 구성은 데이터베이스에서 가장 빈번한 작업이 일어나는 Select 쿼리에 대한 부하를 분산시켜서 서비스 운영의 부하를 줄이고 퍼포먼스를 끌어내고자 하는 작업이다. Replication 란 단어의 뜻인 '복제' 처럼, 주 데이터베이스인 'Master' 가 있고, 이를 복제하는 'Slave' 데이터베이스가 있다.

Mysql 을 기준으로 설명하는 M/S 의 구성은 기본적으로 Master Database에서 일어날 모든 I/O 이벤트 들이 저장되는 'bin log' 파일을 Slave가 주기적으로 감시하면서 Master 에서 일어나는 이벤트 들을 자신의 'relay bin log' 로 복사해가서 작업하는 구조이다.

예를 들어 Master 에서 1. Create table 구문으로 어떠한 table을 만들고 2. 만들어진 table 에 초기 데이터 레코드 10개를 insert 하는 이벤트가 있다고 가정하자, Master 의 bin log 파일에는 위 1. create table, 2. insert values.. 와 같은 이벤트 구문이 순서대로 저장이 된다. 이를 주기적으로 감시하던 Slave 에서는 똑같이 자신의 relay bin log 에 1. create table, 2. insert values... 를 저장하고 수행하게 하여 Master 의 I/O 작업을 따라한다.

마치 카피 닌자 처럼 말이다. -_-

이 모델을 서비스에 적용하게 된다면 시나리오는 아래와 같아 진다. 

'Master' 에는 Create, Update, Delete 와 같은 비싼 I/O 작업이 일어나는 Query 만 접근하고, 실질적인 서비스의 select 구문은 'Slave' 에만 작업을 진행하게 한다.

Master 의 작업을 Slave 가 감시하고 복제해가는 구조이다 보니, 밀리나노세컨드 정도의 Master 와 Slave 간의 데이터 차이가 있을 수 있다고 한다. 이 부분이 궁금해서 여러가지 단순한 실험을 해봤는 데, Master 와 Slave 간의 데이터 차이를 느껴볼 만한 것을 맛 보지 못해서 아직까지는 못 보았다. (알고 계신분이 있다면 공유주시면 감사드린다.)

그렇다고 단순히 모든 Slect 는 Slave 에 하자 라고 하기에는 찜찜하다 보니 Master에서 꼭 조회 해야 할 만한 실시간 데이터는 Master 를 보도록 하고 있다. 예를 들면 서비스 운영 환경 데이터를 조작하는 작업 등을 말이다.

# Mysql Master Slave 구성



# 어플리케이션에서의 처리

단순하게 생각하면 Master와 Slave를 바라 볼 datasource 를 소스 상에서 바꿔주면 되는 문제이다. 문제는 약 3년이 넘게 운영 되어 온 소스를 일일히 손으로 다 쳐야하는 것을 상상해 볼 수 있는 데, 이를 할 체력도 없거니와 설사 성공하더라도 추후에 변경사항이 발생할 경우에는 또 두번 다시 하기 싫을 노가다를 해야 한다. -_-;
이렇다 보니 조금 더 욕심 내서 어떻게 객체지향적으로 처리해서 내 손을 편하게 할 것인가? 의 고민이 발생하게 된다. 

하지만 언제나 그렇듯 이상은 저 멀리 현실은 발 등에 불이 떨어지는 상황을 자주 접하게 된다. 몇 시간 안에 지식 밖의 문제를 쉽게 해결했다면 그것은 고민이 아니었을 것이고 나는 외국에 있을 인재 였을 것이다. -_-a..

어찌 됬건 현실은 M/S 구조가 서비스에 빠르게 적용되어야 했기 때문에 1. 유저가 가장 많이 접하는 로직 이거나 2. 무거운 스키마에 접근하는 로직 위주로 선별해서 단순하고 무식한 방법으로 작업을 진행하기로 했다.

이 무식한 방법이라 함은 어플리케이션의 구조가 화면/서비스/영속성 tier(계층)이 구분되어 있는 구조에서나 할 수 있는 방법으로, 서비스 단에서 Master, Slave Repository 를 상황에 맞게 호출하게 하는 것이다. 다행스럽게도 소스가 나름 구조적으로 계층을 이루고 있었기에 기존 Datasource 외에 Slave Datasource를 추가적으로 만들고, 서비스에서 호출 하던 기존 Master Repository(또는 DAO) 를 Slave 로 바라보도록 수정하는 식으로 처리 했다.


## Master 와 SLAVE 의 처리

1. entitymanager 를 Master /Slave 총 2개 만든다.

2. 각 entitymanager를 사용하는 Master / SLAVE repository 를 2개 만든다.

3. 실제 작업을 수행하는 서비스에서 Master / SLAVE를 로직에 따라 각기 다른 repository를 호출해서 Master 와 SLAVE 작업을 처리한다.


## 시간이 흘러서..

반영 된 소스는 몇 주동안 무리 없이 안정적으로 동작했다. 그도 그럴 것이 손만 피곤하지 크게 부담 스러운 작업을 한 것이 아니기 때문이다. 그렇다고 계속도록 비슷한 작업을 해야 할지도 모른다고 생각하면 끔찍하기에 다른 방법이 없을까 하는 생각을 했었다.

그러던 와중에 나와 비슷한 생각을 하셨고, 이를 적절하게 처리한 
[블로그](http://egloos.zum.com/kwon37xi/v/5364167)를 보게 되었다.

이 블로그에서는 replication 을 어플리케이션에서 처리할 다양한 관점에서의 문제 해결 전략을 얘기 하고 있다. 4가지의 작업을 기술하셨는 데, 여기서 설명하는 것은 실질적으로는 3가지이다.

1. 무식하게 slave source를 추가로 만든다. (내가 했던 방법)
2. Mysql JDBC Driver 에서 제공하는 replication 설정을 통해 소스 단에서의 작업이 아닌 설정 에서 처리 한다.
3. 프레임워크의 proxy 를 이용해 실제 쿼리가 수행되는 시점에 datasource 를 바꿔치기 한다.


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


# 문제는 프로시저, Read Only에서의 프로시저 호출의 문제점.

모든 것이 순조롭게 흘러가다가, 마지막에 단순 Select 만을 호출하는 프로시저에서 문제가 발생했다.

## 여기서 프로시저란?

Stored Procedure 라 불리우는 프로시저는 Database 에서 직접적으로 사용하고 관리 되는 Custom Function 이라고 보면 된다. 

우리 회사도 그렇고 다른 곳에 자문을 구하고자 알아보면서 느낀 것이 C, C++ 과 같은 레거시 랭기지를 다루는 서버 엔지니어들이 이 프로시저에 많이들 익숙한 것 같다. 나의 경우엔 프레임워크 환경에서의 작업이 익숙한 사람들로서는 이 프로시저 라는 개념이 낯설었다. 

처음 이 녀석의 모습을 보고는 예전 코딩 테스트 사이트에서 선택 언어에서 SQL 이 있길래 SQL로 어떻게 로직을 짠다는 말인가? 라는 의문을 한 적이 있었는 데, 그때의 질문이 이 놈을 알게되면서 해소되었다.

## Error Trace

[문제의 Mybatis 에러](#.img)

이 에러의 구문은 설정 문제도 아니고, 명확하게 'Read-Only Connection 에서는 프로시저를 절대 호출할 수 없다'는 내용이다.

[Mysql Official Referece](https://dev.mysql.com/doc/refman/5.7/en/innodb-performance-ro-txn.html) 를 보고 어느정도 실마리를 찾게 되었다. 이 래퍼런스에서 알 수 있는 내용은 '왜 Read Only 커넥션이 존재하는가?' 에 대한 내용인데, 그 이유는 아래와 같다.

> 8.5.3 Optimizing InnoDB Read-Only Transactions

>InnoDB can avoid the overhead associated with setting up the transaction ID (TRX_ID field) for transactions that are known to be read-only. A transaction ID is only needed for a transaction that might perform write operations or locking reads such as SELECT ... FOR UPDATE. Eliminating unnecessary transaction IDs reduces the size of internal data structures that are consulted each time a query or data change statement constructs a read view.

읽기 전용의 커넥션은 일반 커넥션에 비해 가볍다는 내용으로 볼 수가 있다. 이 내용에 따르면 일반적인 트랜잭션에서는 Update 와 같은 트랜잭션에 대한 사전 작업을 진행하는 것으로 보여지는 데, 읽기 전용에서는 그 비용을 사용하지 않기 때문에 가볍게 사용할 수 있는 Read Only 라는 설정이 있다는 것으로 생각하고 있다.

Stored Procedure 는 select 외에도 Query 내에서 트랜잭션이 걸릴 만한 Update 등의 작업을 진행할 수 있기 때문에 Mybatis 에서 Read Only 커넥션에서의 Procedure 호출을 피하려고 에러를 발생하는 것으로 정리가 된다.


# 이 문제를 어떻게 해야할까?

여러가지 방법에 대해 고민을 했다. 

1. 프로시저를 호출하는 mapper 들만 아얘 다른 dataSource 를 직접적으로 바라보게 해서 처리를 한다. 이렇게 하면 DRY 법칙에 위배되는 파일 복,붙 작업이 발생하게 된다.

2. AOP 로 프로시저를 사용하는 mapper의 작업만 datasource 를 바꿔치게 한다. 특수한 어노테이션을 추가한다던가, 메소드의 이름을 통일화 해야한다. 그러기에는 공통된 포맷도 없고 소스의 양이 많아서 1번과 비슷한 양의 작업 수준이 될 수가 있다.

3. replication datasource 에서 readonly 외의 분기를 추가한다. 이 경우엔 어떠한 상황이 프로시저를 CALL 하는 내용인지를 알려야 하는 조건이 필요해진다.

# 레퍼런스

