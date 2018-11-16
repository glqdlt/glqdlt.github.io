---
layout: post
title:  "ORM 과 MicroORM"
author: "glqdlt"
---

# ORM VS MICROORM


## ORM

ORM 은 추상화 개념이다. domain object 를 쉽게 persistence layer 에서 처리하고자 하는 갈망으로 만들어진 개념이다. 단순하게 데이터베이스에 query 를 수행할 때, domain object 를 데이터베이스 스키마에 맞는 object 로 치환해서 수행하는 경우가 많다. 

orm 의 시작은 domain object 를 다른 object로 부가적인 작업을 통해 치환하지 않고, 데이터베이스(영속성 레이어)에 바로 사용할 수 있도록 하는 것을 목표로 시작 되었다. 최근에는 기존 RDBMS 기반에서 개념을 좀 더 확장해서 어떠한 영속성 계층(nosql, infra, file 등)에 대응하겠다는 개념(repository)으로 발전했다. 

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

King of Micro ORM 이라 불리우는 Dapper 를 보면, Orm 입니까? 라고 물은 질문에 Yes And No 라고 [대답](https://dapper-tutorial.net/)했다. 그 만큼 Micro Orm은 개념이 아리송한 존재.

이 아래 블로그가 아주 도움이 되었다.

[Micro ORM 의 문제점](https://yaplex.com/blog/micro-orm-vs-orm)