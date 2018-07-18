---
layout: post
title:  "SpringBoot를dependency로사용하기"
author: "glqdlt"
---

공통 된 데이터베이스를 바라보는 프로젝트 2개가 있다.
똑같은 DTO 와 VO 그리고 예외메세지 persistence layer로 동일하게 만들어질 예정이다.
귀찮게 똑같은 일을 두번 반복하지 말고, 
이를 하나의 모듈 패키지로 따로 구성해서 의존관계를 설정해놓으면 되지 않을까 하는 아이디어로 시작됬다.

간단하게 persistence package 들을 뚝딱 덜어내고, spring boot module 을 하나 구성했다.
이 module package의 모든 의존성의 스코프는 provided로 걸어놨다. 에러도 없고, 빌드 그리고 팀 nexus에 deploy도 잘 되었다.
그런데 이상한 점이 생겼다.
프로젝트 내에 multi module project 형태로 구성한 경우에는 정상적으로 부모 모듈이 이 persistence 모듈을 pull 해서 실행한다.
문제는 물리적으로 분리 된 다른 프로젝트에서 이 module 을 의존성을 가질 경우
이 모듈의 패키지 경로를 불러오지 못하는 문제가 있더라.
external dependency 를 뒤져보면 해당 모듈의 아티팩트는 제대로 pull 받아있는 것을 확인했다.
intellij ide 상에서도 의존 모듈의 클래스를 제대로 인식한다.
문제는 해당 클래스의 패키지를 못 따라가서 이 클래스를 찾을 수 없다는 유체이탈 화법같은 이상한 상황이 연출된다.

해서 해당 모듈이 잘못 build 되었는가, 아티팩트를 까보았더니..
패키지 구성이 일반 jar와는 사뭇 다른 걸 확인했다.

일반적으로 아티팩트는 이렇게 구성이 될텐데
/com/glqdlt/ ~~~

부트의 경우 아래 boot-inf 라는 패키지가 클래스 패키지를 warpping 해놓은 것이 아닌가.

boot-inf/com/glqdlt/ ~~~


혹시 이거 때문에 문제가 생기지 않았나 하고 검색을 해보았더니..
https://stackoverflow.com/questions/45479060/spring-boot-package-does-not-exist-error

https://docs.spring.io/spring-boot/docs/1.5.6.RELEASE/reference/htmlsingle/#howto-create-an-additional-executable-jar


얼추 내가 원하던 정보를 얻게 되었다.

Like a war file, a Spring Boot application is not intended to be used as a dependency. If your application contains classes that you want to share with other projects, the recommended approach is to move that code into a separate module. The separate module can then be depended upon by your application and other projects.

기본적으로 부트 어플리케이션의 프로젝트를 구성할 때에 이를 다른 프로젝트와 공유(의존관계)하려는 성격의 프로젝트라면 별도의 모듈로 옮기는 것이 좋다.

If you cannot rearrange your code as recommended above, Spring Boot’s Maven and Gradle plugins must be configured to produce a separate artifact that is suitable for use as a dependency. The executable archive cannot be used as a dependency as the executable jar format packages application classes in BOOT-INF/classes. This means that they cannot be found when the executable jar is used as a dependency.

위에서 권장한 방법대로 하지 못한다면, maven과 gradle 플러그인에서 사용할 수 있는 별도의 형태로 설정해주어야 한다. 부트 어플리케이션의 실행가능한 형태는 BOOT-INF/classes.. 안에 있는 클래스를 다른 곳에서 종속성으로 찾지 못합니다.


즉, 내가 생각했던 데로 저 놈의 BOOT-INF/.. 형태가 내가 원하던 솔루션을 방해하던 녀석이었다. 이를 해결하려면

maven의 boot build plugin에 아래 설정을 해준다.

        <build> 
            < 
                plugin> 
                    <groupId> org.springframework.boot </ groupId> 
                    <artifactId> spring-boot-maven-plugin </ artifactId> 
                    <configuration> 
                        <classifier> exec </ classifier> 
                    </ configuration> 
                </ plugin> 
            </ plugins> 
        </ build>


Gradle 의 경우 아래와 같다.

        bootRepackage { 
            classifier = 'exec' 
        }

끄읕