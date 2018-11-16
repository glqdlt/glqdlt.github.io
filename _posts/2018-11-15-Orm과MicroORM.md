---
layout: post
title:  "ORM 과 MicroORM"
author: "glqdlt"
---

# ORM 과 MicroORM

재직 중인 사내에서 게임 컨텐츠 서비스 개발에 사용 되는 언어로 C# 그리고 Java, 2가지의 언어가 개발에 사용되고 있습니다. 어느 날 C# 엔지니어링을 하는 팀 동료분께서 이런 질문을 하셨습니다.

 '혹시 Micro ORM 이라고 들어봤어요?' 

Micro ORM ? 그게 뭘까. 처음 듣는 단어이기에 마케팅 단어 수준으로 생각을 했다. C# 에는 가장 유명한 persistence lib 으로 dapper 라는 king of micro ORM 이라는 녀석이 있다고 한다. 여기서 micro orm 이라는 단어가 나오다 보니, 이러한 질문을 하신 거였다.

대충 [dapper](https://dapper-tutorial.net/) 라는 녀석의 기능을 보아하니 mybatis 와 같은 sql mapper 로 보여졌다. mybatis 는 명확하게 orm 이 아니라 sql mapper 라고 자신을 소개하고 있다.[mybatis official introduction](http://www.mybatis.org/mybatis-3/)에는 'MyBatis is a first class persistence framework with support for custom SQL, stored procedures and advanced mappings.', 또한 [mybatis wiki](https://en.wikipedia.org/wiki/MyBatis) 를 보면 'Unlike ORM frameworks, MyBatis does not map Java objects to database tables but Java methods to SQL statements.' 라고 소개 되어진다. dapper 도 이와 다를 바 없어보이는 데 자신을 (micro) orm 이라고 소개하고 있다. 심지어 [dapper tutorial](https://dapper-tutorial.net/)을 보면, dapper는 Orm 입니까? 라고 물은 질문에 Yes And No 라고 본인들이 써놨다. 뭘까.. 이게 장난하는 것도 아니고 -_-;


## ORM

우선 Micro ORM 을 논하기 전에, ORM 의 정의부터 명확하게 짚고 가야한다고 생각한다.

ORM 은 추상화 개념이다. domain object 를 쉽게 persistence layer 에서 처리하고자 하는 갈망으로 만들어진 개념이다. mybatis나 jdbc 를 직접 사용하는 경우를 예로 들어보자, 단순하던 복잡하던 데이터베이스에 query 를 수행해야는 로직을 보면, 이미 잘 구조화 된 domain object 를 만들어놓고, 사용하다가 정작 영속성 계층(DB)에 저장하려고 보면, 스키마 구조에 맞는 object 로 치환하는 로직을 짜게 되는 모습을 흔히 볼 수 있다.

orm 의 시작은 domain object 를 다른 object로 부가적인 작업을 통해 치환하지 않고, 데이터베이스(영속성 레이어)에 바로 사용할 수 있도록 하는 것을 목표로 시작 되었다. 최근에는 기존 RDBMS 기반에서 개념을 좀 더 확장해서 어떠한 영속성 계층(nosql, infra, file 등)에 대응하겠다는 개념(repository)으로 발전했다. 이에 대한 이야기는 아래 repository의 확장 인터페이스에 대한 이야기에서 다루겠다.

여담이지만 많은 자바 개발자들이 sql mapper 의 DAO(Data Accese Object) 라는 개념에 많이 익숙해서인지, JPA 에서 마주치는 repository 라는 개념이 ORM에서 쓰이는 DAO 의 대체 개념으로 인식하는 경우가 있다. repository 는 DAO 를 포함하는 더 상위 계층이다. DAO VS Repository 라는 말 자체가 모순이라는 의미로, DAO < Repository 로 접근해야한다.

repository 는 어떠한 영속성 계층(persistence layer)이 오더라도 CRUD 에 해당하는 기능을 수행할 수 있게 미리 구성해놓은 인터페이스이다. 인터페이스이지만 선언만 해도 동작하는 이유는 spring-data-jpa의 default 는 hibernate 를 구현체로 사용하기 때문이다.
repository 를 상속 받는 확장 된 인터페이스들은 아래와 같다.

- repository

    - crudrepository

        - PagingAndSortingRepository

            - jparepository

            - MongoRepository (spring-data-jpa 2.x 부터)

            - ....

        





ORM 의 구현체들은 무겁다는 인상이 많다.[https://dzone.com/articles/best-java-orm-frameworks-for-postgresql](https://dzone.com/articles/best-java-orm-frameworks-for-postgresql)
https://dapper-tutorial.net/ko/knowledge-base/6494938/

https://github.com/FransBouma/Massive
https://gunnarpeipman.com/tools/micro-orm/
https://dapper-tutorial.net/dapper

https://dapper-tutorial.net/

20년 전통의 hibernate 는 orm 을 이렇게 [정의](http://hibernate.org/orm/what-is-an-orm/) 하고 있다.

## MicromORM (Sql Mapper)

Micro ORM 은 가벼운 ORM 이라는 의미를 가진다. dapper 를 써보지 못했기에 말을 아낄 필요는 있지만, 어디까지나 알아보았을 때 SQL Mapper 와 큰 차이가 없다는 인상이기에 mybatis 를 기준으로 설명하겠다.

Micro ORM 에 대해서는 개인적으로 아래의 이유로 경량(Micro) ORM이라고 칭한 것으로 생각한다.

- 단일 테이블에 대한 매핑 처리에 적합

    Hibernate 를 예로 들면, object 간의 모든 관계 구조를 db에 mapping 시켜주는 반면, micro orm 은 이러한 기능까지 지원하지 않고, 단일 테이블에 매핑되는 단일 개체에만 동작하게 되어있다.

    위에 대한 얘기는 아래 Orm의 코드로 설명하겠다.

    Item 클래스
    ```java
    
    @Entity
    @Data
    public class Item {

        @Id
        @Column(name = "Seq")
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private BigInteger seq;

        @Column(name = "Uid")
        private BigInteger uid;

        ....

        // GoodList 와의 관계 설정
        @ManyToOne
        @JoinColumn(name = "ItemCode")
        public GoodsList product;

        ...

    }

    ```

    GoodList 클래스
    ```java
    
    @Entity
    @Data
    public class GoodsList {

        @Id
        @Column(name = "ItemCode")
        private int itemCode;

        @Column(name = "PriceType")
        private int priceType;

        @Column(name = "Price")
        private int price;

        ...

        // GoodsList 는 다른 GoodsRewardList 라는 객체와도 관계가 설정되어 있다.
        @OneToMany(mappedBy = "good", fetch = FetchType.EAGER)
        private List<GoodsRewardList> rewards;

        ...

    }

    ```

    ORM 에서는 domain object 의 필드에 선언 된 다른 object 에 대한 관계 까지도 persistence 에 맵핑 해준다.(또한 상속 관계도 처리해준다.) 이 말은 Item 만을 조회하더라도 Item과 연결 된 GoodList Object도 자연스레 데이터가 연결되어 쉽게 처리가 가능해진다. 더군다나 GoodsRewardList는 GoodList 와 관계를 맺고 있기에, 이에 대한 조회도 쉽게 처리할 수 있다. 이 부분이 단일 테이블 위주의 맵핑을 지원하는 Micro ORM과 궁극적으로 차이가 나는 부분 중 하나이다. 
    
    객체 간의 관계를 미리 선언하는 작업이 오히려 불편하다고 말하는 의견이 간혹 있다.  이런 의견에 대한 대답으로 개인적으로는 애초에 Domain object 에서 관계 설정을 이미 해놓은 것을 DB에 넣기 위해 치환하는 부수 작업 자체가 더 모순적이다. 
    
    DB는 영속성을 담당하는 것일 뿐, domain 과 관련 된 비지니스 로직은 어플리케이션에서 자연스레 담당한다. 이런 역활과 책임이 이미 잡혀있는 상황에서 OOP 스럽게 object 간의 구조를 잘 짜놓고는 DB에 넣기 위해서나 프레젠테이션 계층에 표현하기 위한 value object 를 만든다던지 하는 부가적인 작업을 하는 것은 객체지향 사항에 이미 위배하는 행위이다.

    그렇다고 SQL Mapper 나 Micro ORM 이 위와 같은 객체 관계의 자연스러운 구조 표현이 불가능하냐고 물어보면 그것은 아니다. 다만, 자연스럽고 물흐르듯한 코드를 작성하기 어렵다. [mybatis의 one to many](http://lyb1495.tistory.com/110),[mybatis의 상속](http://develop.sunshiny.co.kr/12), [dapper의 공식 one to many](https://dotnetfiddle.net/DPiy2b) ORM은 이 기능을 내부에서 처리해주기 때문에 개발자에겐 굉장히 편하게 코드를 작성할 수 있다.

- 캐싱과 같은 고급 기능 역시 지원하지 않는다.

- 테스트를 위한 목킹(Mock) 처리를 하는 것이 수월하지 않다.

    


이 아래 블로그가 아주 도움이 되었다.

[Micro ORM 의 문제점](https://yaplex.com/blog/micro-orm-vs-orm)