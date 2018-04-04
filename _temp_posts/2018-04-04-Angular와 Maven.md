---
layout: post
title:  "Angular 와 Maven"
author: "glqdlt"
---


Maven의 Multiple Modules Project에 관한 것은 [이곳](https://maven.apache.org/guides/mini/guide-multiple-modules.html)에서 공식 가이드를 참조해 주시기를 바랍니다.

전체적인 Project Structure 는 아래와 같습니다.
클라이언트는 



angular cli의 자세한 명령은 [이곳](https://github.com/angular/angular-cli/wiki)을 확인하여 주세요.


~/ex-angular/.angular-cli.json 을 보면

"outDir" :" .. "
라는 항목이 보입니다. 이곳이 angualr-cli에서 빌드한 결과물을 배포(dist)하는 경로입니다.
이를 Spring Boot의 resource 경로로 향하게 한다면 원하는 목적을 달성할 수 있습니다.

angular-cli.json 에서 outDir 속성을 아래처럼 기입하여 줍니다.

<code>"outDir" : "../ex-boot/src/main/resources/static/"</code>

이제 빌드를 해보고, 원하는 결과가 나오는 지 확인해봅니다.

    > ng build --prod

빌드가 성공 되고, ex-boot모듈의 src/main/resources/static/ 를 확인해 보면, 아래와 같이 distribute 된 것을 확인할 수가 있습니다.






[frontend-maven-plugin](https://github.com/eirslett/frontend-maven-plugin) 이라는 멋진 Maven Plugin이 있습니다. 이를 활용하겠습니다.

간단하게 ex-angular 모듈에 dummy 로 사용할 pom.xml 을 작성합니다, 또한 부모 Pom에 대한 정보를 기입 하여 Project에 종속 시킵니다.


    <artifactId>ex-angular</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>ex-angular</name>
    <description>Simple Angular</description>


    <parent>
        <groupId>com.glqdlt</groupId>
        <artifactId>ex-multi-angular-with-boot</artifactId>
        <version>1.0-SNAPSHOT</version>
    </parent>



