---
layout: post
title:  "Sharding Jdbc M/S 모델을 효율적으로"
author: "glqdlt"
---

스프링 시큐리티에서 기본 암호화 PasswordEncoder 구현체로 사용 되는 BCryptPasswordEncoder 알아보려 한다.

BCryptPasswordEncoder 는 BCrypt 단방향 알고리즘을 사용한다.

BCrypt 는 OpenBSD 에서도 사용하는 단방향 해싱 알고리즘의 끝판왕이다. Niels Provos와 David Mazieres 가 만들었다.

BCrypt 는 Bruce Schneier의 Blowfish 암호화 알고리즘을 기반으로 두고 있다. 

[BCrypt 공식문서](https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/crypto/bcrypt/BCrypt.html)를 찾아보면 블로우해시는 레인보우 테이블 공격을 막기 위해 n 번의 알고리즘을 라운딩(반복) 하게 된다. 

특별한 설정을 하지 않으면 라운드 기본 값으로는 10이고, 선택할수 있는 값은 최소 4에서 최대 31까지 라운딩할 수 있다. 이 라운드값은 ```BCryptPasswordEncoder(int strength) ``` 이니셜라이징할 때, 설정할 수 있다. 재밌는 건 파라미터 이름이 strength(강도) 이다, 즉 암호화를 얼마나 빡세할 지란 의미 =_=

문제는 31 최대값 까지 가까워질 수록 컴퓨터 연산을 엄청나게 먹기 때문에 잘 조정하는 것이 관건이다. 로그인 인증 한번 타는 데 시간이 1분 정도 잡아먹힌다면 문제가 있지 않겠는가

## 레퍼런스

- https://d2.naver.com/helloworld/318732

- https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/crypto/bcrypt/BCryptPasswordEncoder.html#BCryptPasswordEncoder-int-

- https://docs.spring.io/spring-security/site/docs/current/api/org/springframework/security/crypto/bcrypt/BCrypt.html

- https://www.usenix.org/legacy/publications/library/proceedings/usenix99/full_papers/provos/provos_html/node5.html