---
layout: post
title:  "ORM 과 MicroORM"
author: "glqdlt"
---

# ORM VS MICROORM

재직 중인 사내에서 게임 컨텐츠 서비스 개발에 사용 되는 언어로 C# 그리고 Java, 2가지의 언어가 개발에 사용되고 있습니다. 어느 날 C# 엔지니어링을 하는 팀 동료분께서 이런 질문을 하셨습니다.

 '혹시 Micro ORM 이라고 들어봤어요?' 

Micro ORM ? 그게 뭘까. 처음 듣는 단어이기에 마케팅 단어 수준으로 생각을 했다. C# 에는 가장 유명한 persistence lib 으로 dapper 라는 king of micro ORM 이라는 녀석이 있다고 한다. 여기서 micro orm 이라는 단어가 나오다 보니, 이러한 질문을 하신 거였다.

대충 dapper 라는 녀석의 기능을 보아하니 mybatis 와 같은 sql mapper 로 보여졌다. mybatis 는 명확하게 orm 이 아니라 sql mapper 라고 자신을 소개하고 있다.[mybatis official introduction](http://www.mybatis.org/mybatis-3/)에는 'MyBatis is a first class persistence framework with support for custom SQL, stored procedures and advanced mappings.', 또한 [mybatis wiki](https://en.wikipedia.org/wiki/MyBatis) 를 보면 'Unlike ORM frameworks, MyBatis does not map Java objects to database tables but Java methods to SQL statements.' 라고 소개 되어진다. dapper 도 이와 다를 바 없어보이는 데 자신을 (micro) orm 이라고 소개하고 있다. 심지어 [dapper tutorial](https://dapper-tutorial.net/)을 보면, dapper는 Orm 입니까? 라고 물은 질문에 Yes And No 라고 본인들이 써놨다. 뭘까.. 이게 장난하는 것도 아니고 -_-;


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

## MICROORM

Micro ORM 은 가볍다.



이 아래 블로그가 아주 도움이 되었다.

[Micro ORM 의 문제점](https://yaplex.com/blog/micro-orm-vs-orm)