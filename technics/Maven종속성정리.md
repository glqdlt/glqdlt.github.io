---
layout: post
title:  "Maven 종속성 정리"
author: "glqdlt"
---

조금 여유가 생겨서 레거시 프로젝트를 들여다 보고 있었습니다.
WAS 로그를 찬찬히 살펴보던 중에.. 뭔가 이상한 warnning 로그가 찍혀있던 걸 확인하고 이에 대한 트러블슈팅을 진행해봤습니다.

# Maven 과 Maven Tree

프로젝트 관리 툴을 사용하다 보면, 의도치 않게 중복된 dependency 들을 선언하게 되거나 사용하게 되는 실수를 범하거나, 조직 내부에서 타인이 만든 모듈을 참조하거나, 외부 라이브러르의 사용에서 충돌이 일어나는 경우가 많습니다.

이런 경우를 대비해서 대부분의 프로젝트 관리 툴에서는 '종속성 충돌 회피' 개념을 가지고 있고, 개발자가 직접 종속성을 컨트롤할 수 있는 방안을 마련해왔습니다.

우선 위에서 말했던 저의 상황은 아래와 같습니다.

```
Connected to server
[2019-01-10 07:02:31,471] Artifact mpoker:war exploded: Artifact is being deployed, please wait...
1월 10, 2019 7:02:31 오후 org.apache.catalina.loader.WebappClassLoader validateJarFile
정보: validateJarFile(C:\Users\1111\some-_-a..webapp..\WEB-INF\lib\jsp-api-2.1.jar) - jar not loaded. See Servlet Spec 3.0, section 10.7.2. Offending class: javax/el/Expression.class
1월 10, 2019 7:02:31 오후 org.apache.catalina.loader.WebappClassLoader validateJarFile
정보: validateJarFile(C:\Users\1111\some-_-a..webapp..\WEB-INF\lib\servlet-api-2.5.jar) - jar not loaded. See Servlet Spec 3.0, section 10.7.2. Offending class: javax/servlet/Servlet.class
1월 10, 2019 7:02:35 오후 org.apache.catalina.startup.TldConfig execute
정보: At least one JAR was scanned for TLDs yet contained no TLDs. Enable debug logging for this logger for a complete list of JARs that were scanned but no TLDs were found in them. Skipping unneeded JARs during scanning can improve startup time and JSP compilation time.
SLF4J: Class path contains multiple SLF4J bindings.
SLF4J: Found binding in [jar:file:/C:/Users/1111some-_-a..webapp../WEB-INF/lib/log4j-slf4j-impl-2.9.0.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: Found binding in [jar:file:/C:/Users/1111some-_-a..webapp../WEB-INF/lib/slf4j-log4j12-1.7.10.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: See http://www.slf4j.org/codes.html#multiple_bindings for an explanation.
SLF4J: Actual binding is of type [org.apache.logging.slf4j.Log4jLoggerFactory]
2019-01-10 19:02:36,232 RMI TCP Connection(3)-127.0.0.1 WARN Unable to instantiate org.fusesource.jansi.WindowsAnsiOutputStream
```


로그를 자세히 살펴 보면.. 서블릿 관련 종속성에서 버전이 3.x 와 2.x 가 간의 충돌이 일어났는 지, 서블릿 2.x 대 버전을 로드 하지 않았다는 의미의 로그가 있습니다.
또한 추가적으로 log4j 관련해서도 충돌이 있다고 경고가 껴는 걸 볼 수 있습니다.

이놈들이 어디서 굴러왔는지는 모르겠지만 (커밋 로그를 뒤져보면 알겠지만 -_-a) 계속 가만 놔두기에는 구린내가 나기에 해결해야합니다.

### Maven Tree

종속성의 충돌을 찾는 방법 중에 가장 좋은 것은 Maven 의 종속성 트리를 찍어 보는 것입니다.
터미널에서 아래 종속성 트리 커맨드를 입력 하면 트리 구조로 쉽게 파악할 수 있습니다.

```
mvn dependency:tree
```


```
[INFO]
[INFO] --- maven-dependency-plugin:2.8:tree (default-cli) @ mpoker ---
[INFO] com.fourones.cms:mpoker:war:2.4.1
[INFO] +- com.zaxxer:HikariCP:jar:3.1.0:compile
[INFO] +- org.springframework.boot:spring-boot-starter-test:jar:1.5.15.RELEASE:test
[INFO] |  +- org.springframework.boot:spring-boot-test:jar:1.5.15.RELEASE:test
[INFO] |  |  \- org.springframework.boot:spring-boot:jar:1.5.15.RELEASE:test
[INFO] |  +- org.springframework.boot:spring-boot-test-autoconfigure:jar:1.5.15.RELEASE:test
[INFO] |  |  \- org.springframework.boot:spring-boot-autoconfigure:jar:1.5.15.RELEASE:test
[INFO] |  +- com.jayway.jsonpath:json-path:jar:2.2.0:test
[INFO] |  |  \- net.minidev:json-smart:jar:2.2.1:test
[INFO] |  |     \- net.minidev:accessors-smart:jar:1.1:test
[INFO] |  |        \- org.ow2.asm:asm:jar:5.0.3:test
[INFO] |  +- org.assertj:assertj-core:jar:2.6.0:test
[INFO] |  +- org.mockito:mockito-core:jar:1.10.19:test
[INFO] |  |  \- org.objenesis:objenesis:jar:2.1:test
[INFO] |  +- org.hamcrest:hamcrest-core:jar:1.3:test
[INFO] |  +- org.hamcrest:hamcrest-library:jar:1.3:test
[INFO] |  +- org.skyscreamer:jsonassert:jar:1.4.0:test
[INFO] |  |  \- com.vaadin.external.google:android-json:jar:0.0.20131108.vaadin1:test
[INFO] |  +- org.springframework:spring-core:jar:4.3.18.RELEASE:compile
[INFO] |  \- org.springframework:spring-test:jar:4.3.18.RELEASE:test
[INFO] +- com.h2database:h2:jar:1.4.197:test
[INFO] +- javax.validation:validation-api:jar:1.1.0.Final:compile
[INFO] +- com.fourones.nmp.promotion:thanks-given-persist:jar:0.0.3-SNAPSHOT:compile
[INFO] +- net.netmarble.promotion:event-coupon-persistence:jar:0.0.10-SNAPSHOT:compile
[INFO] +- io.springfox:springfox-swagger2:jar:2.4.0:compile
[INFO] |  +- io.swagger:swagger-annotations:jar:1.5.6:compile
[INFO] |  +- io.swagger:swagger-models:jar:1.5.6:compile
[INFO] |  +- io.springfox:springfox-spi:jar:2.4.0:compile
[INFO] |  |  \- io.springfox:springfox-core:jar:2.4.0:compile
[INFO] |  +- io.springfox:springfox-schema:jar:2.4.0:compile
[INFO] |  +- io.springfox:springfox-swagger-common:jar:2.4.0:compile
[INFO] |  +- io.springfox:springfox-spring-web:jar:2.4.0:compile
[INFO] |  +- com.fasterxml:classmate:jar:1.3.1:compile
[INFO] |  +- org.springframework.plugin:spring-plugin-core:jar:1.2.0.RELEASE:compile
[INFO] |  \- org.springframework.plugin:spring-plugin-metadata:jar:1.2.0.RELEASE:compile
[INFO] +- io.springfox:springfox-swagger-ui:jar:2.4.0:compile
[INFO] +- org.springframework:spring-context:jar:4.3.4.RELEASE:compile
[INFO] |  +- org.springframework:spring-aop:jar:4.3.4.RELEASE:compile
[INFO] |  +- org.springframework:spring-beans:jar:4.3.4.RELEASE:compile
[INFO] |  \- org.springframework:spring-expression:jar:4.3.4.RELEASE:compile
[INFO] +- org.springframework:spring-context-support:jar:4.3.4.RELEASE:compile
[INFO] +- org.springframework:spring-webmvc:jar:4.3.4.RELEASE:compile
[INFO] |  \- org.springframework:spring-web:jar:4.3.4.RELEASE:compile
[INFO] +- commons-lang:commons-lang:jar:2.3:compile
[INFO] +- org.slf4j:slf4j-api:jar:1.7.25:compile
[INFO] +- org.apache.logging.log4j:log4j-api:jar:2.9.0:compile
[INFO] +- org.apache.logging.log4j:log4j-core:jar:2.9.0:compile
[INFO] +- org.apache.logging.log4j:log4j-slf4j-impl:jar:2.9.0:compile
[INFO] +- javax.inject:javax.inject:jar:1:compile
[INFO] +- javax.servlet:javax.servlet-api:jar:3.1.0:provided
[INFO] +- org.freemarker:freemarker:jar:2.3.23:compile
[INFO] +- org.apache.tomcat:tomcat-jdbc:jar:7.0.30:compile
[INFO] |  \- org.apache.tomcat:tomcat-juli:jar:7.0.30:compile
[INFO] +- org.springframework:spring-jdbc:jar:4.3.18.RELEASE:compile
[INFO] +- mysql:mysql-connector-java:jar:5.1.6:compile
[INFO] +- com.microsoft.sqlserver:sqljdbc4:jar:4.0:compile
[INFO] +- org.springframework:spring-orm:jar:4.3.4.RELEASE:compile
[INFO] +- org.mybatis:mybatis-spring:jar:1.2.4:compile
[INFO] +- org.mybatis:mybatis:jar:3.1.0:compile
[INFO] +- org.apache.phoenix:phoenix-queryserver-client:jar:4.14.0-HBase-1.1:compile
[INFO] |  +- org.apache.calcite.avatica:avatica-core:jar:1.10.0:compile
[INFO] |  |  +- org.apache.calcite.avatica:avatica-metrics:jar:1.10.0:compile
[INFO] |  |  \- com.google.protobuf:protobuf-java:jar:3.1.0:compile
[INFO] |  +- sqlline:sqlline:jar:1.2.0:compile
[INFO] |  |  \- jline:jline:jar:2.10:compile
[INFO] |  \- org.apache.hadoop:hadoop-common:jar:2.7.1:compile
[INFO] |     +- org.apache.hadoop:hadoop-annotations:jar:2.7.1:compile
[INFO] |     |  \- jdk.tools:jdk.tools:jar:1.8:system
[INFO] |     +- commons-cli:commons-cli:jar:1.2:compile
[INFO] |     +- org.apache.commons:commons-math3:jar:3.1.1:compile
[INFO] |     +- xmlenc:xmlenc:jar:0.52:compile
[INFO] |     +- commons-httpclient:commons-httpclient:jar:3.1:compile
[INFO] |     +- commons-net:commons-net:jar:3.1:compile
[INFO] |     +- commons-collections:commons-collections:jar:3.2.1:compile
[INFO] |     +- javax.servlet:servlet-api:jar:2.5:compile
[INFO] |     +- org.mortbay.jetty:jetty:jar:6.1.26:compile
[INFO] |     +- org.mortbay.jetty:jetty-util:jar:6.1.26:compile
[INFO] |     +- javax.servlet.jsp:jsp-api:jar:2.1:runtime
[INFO] |     +- com.sun.jersey:jersey-core:jar:1.9:compile
[INFO] |     +- com.sun.jersey:jersey-json:jar:1.9:compile
[INFO] |     |  +- org.codehaus.jettison:jettison:jar:1.1:compile
[INFO] |     |  +- com.sun.xml.bind:jaxb-impl:jar:2.2.3-1:compile
[INFO] |     |  |  \- javax.xml.bind:jaxb-api:jar:2.2.2:compile
[INFO] |     |  |     +- javax.xml.stream:stax-api:jar:1.0-2:compile
[INFO] |     |  |     \- javax.activation:activation:jar:1.1:compile
[INFO] |     |  +- org.codehaus.jackson:jackson-jaxrs:jar:1.8.3:compile
[INFO] |     |  \- org.codehaus.jackson:jackson-xc:jar:1.8.3:compile
[INFO] |     +- com.sun.jersey:jersey-server:jar:1.9:compile
[INFO] |     |  \- asm:asm:jar:3.1:compile
[INFO] |     +- log4j:log4j:jar:1.2.17:compile
[INFO] |     +- net.java.dev.jets3t:jets3t:jar:0.9.0:compile
[INFO] |     |  \- com.jamesmurty.utils:java-xmlbuilder:jar:0.4:compile
[INFO] |     +- commons-configuration:commons-configuration:jar:1.6:compile
[INFO] |     |  +- commons-digester:commons-digester:jar:1.8:compile
[INFO] |     |  |  \- commons-beanutils:commons-beanutils:jar:1.7.0:compile
[INFO] |     |  \- commons-beanutils:commons-beanutils-core:jar:1.8.0:compile
[INFO] |     +- org.slf4j:slf4j-log4j12:jar:1.7.10:compile
[INFO] |     +- org.codehaus.jackson:jackson-core-asl:jar:1.9.13:compile
[INFO] |     +- org.codehaus.jackson:jackson-mapper-asl:jar:1.9.13:compile
[INFO] |     +- org.apache.avro:avro:jar:1.7.4:compile
[INFO] |     |  \- com.thoughtworks.paranamer:paranamer:jar:2.3:compile
[INFO] |     +- org.apache.hadoop:hadoop-auth:jar:2.7.1:compile
[INFO] |     |  +- org.apache.directory.server:apacheds-kerberos-codec:jar:2.0.0-M15:compile
[INFO] |     |  |  +- org.apache.directory.server:apacheds-i18n:jar:2.0.0-M15:compile
[INFO] |     |  |  +- org.apache.directory.api:api-asn1-api:jar:1.0.0-M20:compile
[INFO] |     |  |  \- org.apache.directory.api:api-util:jar:1.0.0-M20:compile
[INFO] |     |  \- org.apache.curator:curator-framework:jar:2.7.1:compile
[INFO] |     +- com.jcraft:jsch:jar:0.1.42:compile
[INFO] |     +- org.apache.curator:curator-client:jar:2.7.1:compile
[INFO] |     +- org.apache.curator:curator-recipes:jar:2.7.1:compile
[INFO] |     +- org.apache.htrace:htrace-core:jar:3.1.0-incubating:compile
[INFO] |     +- org.apache.zookeeper:zookeeper:jar:3.4.6:compile
[INFO] |     |  \- io.netty:netty:jar:3.7.0.Final:compile
[INFO] |     \- org.apache.commons:commons-compress:jar:1.4.1:compile
[INFO] |        \- org.tukaani:xz:jar:1.0:compile
[INFO] +- org.springframework.data:spring-data-jpa:jar:1.11.0.RELEASE:compile
[INFO] |  +- org.springframework.data:spring-data-commons:jar:1.13.0.RELEASE:compile
[INFO] |  \- org.slf4j:jcl-over-slf4j:jar:1.7.22:runtime
[INFO] +- org.springframework:spring-tx:jar:4.3.4.RELEASE:compile
[INFO] +- org.hibernate:hibernate-core:jar:4.3.11.Final:compile
[INFO] |  +- org.jboss.logging:jboss-logging:jar:3.1.3.GA:compile
[INFO] |  +- org.jboss.logging:jboss-logging-annotations:jar:1.2.0.Beta1:compile
[INFO] |  +- org.jboss.spec.javax.transaction:jboss-transaction-api_1.2_spec:jar:1.0.0.Final:compile
[INFO] |  +- dom4j:dom4j:jar:1.6.1:compile
[INFO] |  |  \- xml-apis:xml-apis:jar:1.0.b2:compile
[INFO] |  +- org.hibernate.common:hibernate-commons-annotations:jar:4.0.5.Final:compile
[INFO] |  +- org.hibernate.javax.persistence:hibernate-jpa-2.1-api:jar:1.0.0.Final:compile
[INFO] |  +- org.javassist:javassist:jar:3.18.1-GA:compile
[INFO] |  +- antlr:antlr:jar:2.7.7:compile
[INFO] |  \- org.jboss:jandex:jar:1.1.0.Final:compile
[INFO] +- org.apache.maven:maven-model:jar:3.3.9:compile
[INFO] |  +- org.codehaus.plexus:plexus-utils:jar:3.0.22:compile
[INFO] |  \- org.apache.commons:commons-lang3:jar:3.4:compile
[INFO] +- org.hibernate:hibernate-entitymanager:jar:4.3.11.Final:compile
[INFO] +- org.hibernate:hibernate-validator:jar:5.3.6.Final:compile
[INFO] +- com.fasterxml.jackson.core:jackson-databind:jar:2.8.9:compile
[INFO] |  \- com.fasterxml.jackson.core:jackson-core:jar:2.8.9:compile
[INFO] +- com.fasterxml.jackson.core:jackson-annotations:jar:2.8.9:compile
[INFO] +- com.fasterxml.jackson.dataformat:jackson-dataformat-csv:jar:2.8.8:compile
[INFO] +- com.fasterxml.jackson.dataformat:jackson-dataformat-yaml:jar:2.9.0:compile
[INFO] |  \- org.yaml:snakeyaml:jar:1.17:compile
[INFO] +- commons-fileupload:commons-fileupload:jar:1.2.2:compile
[INFO] +- commons-io:commons-io:jar:1.4:compile
[INFO] +- org.apache.poi:poi:jar:3.13:compile
[INFO] |  \- commons-codec:commons-codec:jar:1.9:compile
[INFO] +- org.apache.poi:poi-ooxml:jar:3.13:compile
[INFO] |  \- org.apache.poi:poi-ooxml-schemas:jar:3.13:compile
[INFO] |     \- org.apache.xmlbeans:xmlbeans:jar:2.6.0:compile
[INFO] |        \- stax:stax-api:jar:1.0.1:compile
[INFO] +- org.aspectj:aspectjrt:jar:1.6.10:compile
[INFO] +- org.aspectj:aspectjweaver:jar:1.6.10:compile
[INFO] +- org.aspectj:aspectjtools:jar:1.6.10:compile
[INFO] +- cglib:cglib-nodep:jar:3.2.2:compile
[INFO] +- org.apache.httpcomponents:httpclient:jar:4.3.6:compile
[INFO] |  +- org.apache.httpcomponents:httpcore:jar:4.3.3:compile
[INFO] |  \- commons-logging:commons-logging:jar:1.1.3:compile
[INFO] +- com.google.code.gson:gson:jar:2.2.4:compile
[INFO] +- com.fourones.webteam.webjar:datatable-editor:jar:1.0:compile
[INFO] +- com.googlecode.json-simple:json-simple:jar:1.1:compile
[INFO] +- org.springframework.security:spring-security-core:jar:4.2.0.RELEASE:compile
[INFO] |  \- aopalliance:aopalliance:jar:1.0:compile
[INFO] +- org.springframework.security:spring-security-web:jar:4.2.0.RELEASE:compile
[INFO] +- org.springframework.security:spring-security-config:jar:4.2.0.RELEASE:compile
[INFO] +- org.springframework.security:spring-security-taglibs:jar:4.2.0.RELEASE:compile
[INFO] |  \- org.springframework.security:spring-security-acl:jar:4.2.0.RELEASE:compile
[INFO] +- org.projectlombok:lombok:jar:1.16.10:compile
[INFO] +- joda-time:joda-time:jar:2.9.9:compile
[INFO] +- com.google.guava:guava:jar:22.0:compile
[INFO] |  +- com.google.code.findbugs:jsr305:jar:1.3.9:compile
[INFO] |  +- com.google.errorprone:error_prone_annotations:jar:2.0.18:compile
[INFO] |  +- com.google.j2objc:j2objc-annotations:jar:1.1:compile
[INFO] |  \- org.codehaus.mojo:animal-sniffer-annotations:jar:1.14:compile
[INFO] +- com.glqdlt.utill:simple-poi-reader:jar:2.1.3:compile
[INFO] +- junit:junit:jar:4.12:test
[INFO] \- com.fourones.common:sso-client:jar:1.0.3:compile
[INFO]    \- org.springframework.security.oauth:spring-security-oauth2:jar:2.0.14.RELEASE:compile
```

찾아보니 범인은 phoenix jdbc (org.apache.phoenix:phoenix-queryserver-client) 요녀석으로.. 
안에서 참조되는 dependency 에서 충돌이 일어나고 있었습니다.

( jackson 관련해서도 이미 충돌이 일어나고 있는 것은 비밀 -_-; )

## Maven Dependency Exclusion

Maven 에서는 특정 Dependency 에서 제외 할 아티팩트를 정의 할 수 있습니다.

아래처럼 종속성을 제거 하는 exclusion 엘리먼트를 선언합니다.

```xml
<dependency>
    <groupId>org.apache.phoenix</groupId>
    <artifactId>phoenix-queryserver-client</artifactId>
    <version>4.14.0-HBase-1.1</version>
    <exclusions>
        <exclusion>
            <groupId>javax.servlet</groupId>
            <artifactId>servlet-api</artifactId>
        </exclusion>
        <exclusion>
            <groupId>javax.servlet.jsp</groupId>
            <artifactId>jsp-api</artifactId>
        </exclusion>
        <exclusion>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-log4j12</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```


```
[INFO]
[INFO] --- maven-dependency-plugin:2.8:tree (default-cli) @ mpoker ---
[INFO] com.fourones.cms:mpoker:war:2.4.1
[INFO] +- com.zaxxer:HikariCP:jar:3.1.0:compile
[INFO] +- org.springframework.boot:spring-boot-starter-test:jar:1.5.15.RELEASE:test
[INFO] |  +- org.springframework.boot:spring-boot-test:jar:1.5.15.RELEASE:test
[INFO] |  |  \- org.springframework.boot:spring-boot:jar:1.5.15.RELEASE:test
[INFO] |  +- org.springframework.boot:spring-boot-test-autoconfigure:jar:1.5.15.RELEASE:test
[INFO] |  |  \- org.springframework.boot:spring-boot-autoconfigure:jar:1.5.15.RELEASE:test
[INFO] |  +- com.jayway.jsonpath:json-path:jar:2.2.0:test
[INFO] |  |  \- net.minidev:json-smart:jar:2.2.1:test
[INFO] |  |     \- net.minidev:accessors-smart:jar:1.1:test
[INFO] |  |        \- org.ow2.asm:asm:jar:5.0.3:test
[INFO] |  +- org.assertj:assertj-core:jar:2.6.0:test
[INFO] |  +- org.mockito:mockito-core:jar:1.10.19:test
[INFO] |  |  \- org.objenesis:objenesis:jar:2.1:test
[INFO] |  +- org.hamcrest:hamcrest-core:jar:1.3:test
[INFO] |  +- org.hamcrest:hamcrest-library:jar:1.3:test
[INFO] |  +- org.skyscreamer:jsonassert:jar:1.4.0:test
[INFO] |  |  \- com.vaadin.external.google:android-json:jar:0.0.20131108.vaadin1:test
[INFO] |  +- org.springframework:spring-core:jar:4.3.18.RELEASE:compile
[INFO] |  \- org.springframework:spring-test:jar:4.3.18.RELEASE:test
[INFO] +- com.h2database:h2:jar:1.4.197:test
[INFO] +- javax.validation:validation-api:jar:1.1.0.Final:compile
[INFO] +- com.fourones.nmp.promotion:thanks-given-persist:jar:0.0.3-SNAPSHOT:compile
[INFO] +- net.netmarble.promotion:event-coupon-persistence:jar:0.0.10-SNAPSHOT:compile
[INFO] +- io.springfox:springfox-swagger2:jar:2.4.0:compile
[INFO] |  +- io.swagger:swagger-annotations:jar:1.5.6:compile
[INFO] |  +- io.swagger:swagger-models:jar:1.5.6:compile
[INFO] |  +- io.springfox:springfox-spi:jar:2.4.0:compile
[INFO] |  |  \- io.springfox:springfox-core:jar:2.4.0:compile
[INFO] |  +- io.springfox:springfox-schema:jar:2.4.0:compile
[INFO] |  +- io.springfox:springfox-swagger-common:jar:2.4.0:compile
[INFO] |  +- io.springfox:springfox-spring-web:jar:2.4.0:compile
[INFO] |  +- com.fasterxml:classmate:jar:1.3.1:compile
[INFO] |  +- org.springframework.plugin:spring-plugin-core:jar:1.2.0.RELEASE:compile
[INFO] |  \- org.springframework.plugin:spring-plugin-metadata:jar:1.2.0.RELEASE:compile
[INFO] +- io.springfox:springfox-swagger-ui:jar:2.4.0:compile
[INFO] +- org.springframework:spring-context:jar:4.3.4.RELEASE:compile
[INFO] |  +- org.springframework:spring-aop:jar:4.3.4.RELEASE:compile
[INFO] |  +- org.springframework:spring-beans:jar:4.3.4.RELEASE:compile
[INFO] |  \- org.springframework:spring-expression:jar:4.3.4.RELEASE:compile
[INFO] +- org.springframework:spring-context-support:jar:4.3.4.RELEASE:compile
[INFO] +- org.springframework:spring-webmvc:jar:4.3.4.RELEASE:compile
[INFO] |  \- org.springframework:spring-web:jar:4.3.4.RELEASE:compile
[INFO] +- commons-lang:commons-lang:jar:2.3:compile
[INFO] +- org.slf4j:slf4j-api:jar:1.7.25:compile
[INFO] +- org.apache.logging.log4j:log4j-api:jar:2.9.0:compile
[INFO] +- org.apache.logging.log4j:log4j-core:jar:2.9.0:compile
[INFO] +- org.apache.logging.log4j:log4j-slf4j-impl:jar:2.9.0:compile
[INFO] +- javax.inject:javax.inject:jar:1:compile
[INFO] +- javax.servlet:javax.servlet-api:jar:3.1.0:provided
[INFO] +- org.freemarker:freemarker:jar:2.3.23:compile
[INFO] +- org.apache.tomcat:tomcat-jdbc:jar:7.0.30:compile
[INFO] |  \- org.apache.tomcat:tomcat-juli:jar:7.0.30:compile
[INFO] +- org.springframework:spring-jdbc:jar:4.3.18.RELEASE:compile
[INFO] +- mysql:mysql-connector-java:jar:5.1.6:compile
[INFO] +- com.microsoft.sqlserver:sqljdbc4:jar:4.0:compile
[INFO] +- org.springframework:spring-orm:jar:4.3.4.RELEASE:compile
[INFO] +- org.mybatis:mybatis-spring:jar:1.2.4:compile
[INFO] +- org.mybatis:mybatis:jar:3.1.0:compile
[INFO] +- org.apache.phoenix:phoenix-queryserver-client:jar:4.14.0-HBase-1.1:compile
[INFO] |  +- org.apache.calcite.avatica:avatica-core:jar:1.10.0:compile
[INFO] |  |  +- org.apache.calcite.avatica:avatica-metrics:jar:1.10.0:compile
[INFO] |  |  \- com.google.protobuf:protobuf-java:jar:3.1.0:compile
[INFO] |  +- sqlline:sqlline:jar:1.2.0:compile
[INFO] |  |  \- jline:jline:jar:2.10:compile
[INFO] |  \- org.apache.hadoop:hadoop-common:jar:2.7.1:compile
[INFO] |     +- org.apache.hadoop:hadoop-annotations:jar:2.7.1:compile
[INFO] |     |  \- jdk.tools:jdk.tools:jar:1.8:system
[INFO] |     +- commons-cli:commons-cli:jar:1.2:compile
[INFO] |     +- org.apache.commons:commons-math3:jar:3.1.1:compile
[INFO] |     +- xmlenc:xmlenc:jar:0.52:compile
[INFO] |     +- commons-httpclient:commons-httpclient:jar:3.1:compile
[INFO] |     +- commons-net:commons-net:jar:3.1:compile
[INFO] |     +- commons-collections:commons-collections:jar:3.2.1:compile
[INFO] |     +- org.mortbay.jetty:jetty:jar:6.1.26:compile
[INFO] |     +- org.mortbay.jetty:jetty-util:jar:6.1.26:compile
[INFO] |     +- com.sun.jersey:jersey-core:jar:1.9:compile
[INFO] |     +- com.sun.jersey:jersey-json:jar:1.9:compile
[INFO] |     |  +- org.codehaus.jettison:jettison:jar:1.1:compile
[INFO] |     |  +- com.sun.xml.bind:jaxb-impl:jar:2.2.3-1:compile
[INFO] |     |  |  \- javax.xml.bind:jaxb-api:jar:2.2.2:compile
[INFO] |     |  |     +- javax.xml.stream:stax-api:jar:1.0-2:compile
[INFO] |     |  |     \- javax.activation:activation:jar:1.1:compile
[INFO] |     |  +- org.codehaus.jackson:jackson-jaxrs:jar:1.8.3:compile
[INFO] |     |  \- org.codehaus.jackson:jackson-xc:jar:1.8.3:compile
[INFO] |     +- com.sun.jersey:jersey-server:jar:1.9:compile
[INFO] |     |  \- asm:asm:jar:3.1:compile
[INFO] |     +- log4j:log4j:jar:1.2.17:compile
[INFO] |     +- net.java.dev.jets3t:jets3t:jar:0.9.0:compile
[INFO] |     |  \- com.jamesmurty.utils:java-xmlbuilder:jar:0.4:compile
[INFO] |     +- commons-configuration:commons-configuration:jar:1.6:compile
[INFO] |     |  +- commons-digester:commons-digester:jar:1.8:compile
[INFO] |     |  |  \- commons-beanutils:commons-beanutils:jar:1.7.0:compile
[INFO] |     |  \- commons-beanutils:commons-beanutils-core:jar:1.8.0:compile
[INFO] |     +- org.codehaus.jackson:jackson-core-asl:jar:1.9.13:compile
[INFO] |     +- org.codehaus.jackson:jackson-mapper-asl:jar:1.9.13:compile
[INFO] |     +- org.apache.avro:avro:jar:1.7.4:compile
[INFO] |     |  \- com.thoughtworks.paranamer:paranamer:jar:2.3:compile
[INFO] |     +- org.apache.hadoop:hadoop-auth:jar:2.7.1:compile
[INFO] |     |  +- org.apache.directory.server:apacheds-kerberos-codec:jar:2.0.0-M15:compile
[INFO] |     |  |  +- org.apache.directory.server:apacheds-i18n:jar:2.0.0-M15:compile
[INFO] |     |  |  +- org.apache.directory.api:api-asn1-api:jar:1.0.0-M20:compile
[INFO] |     |  |  \- org.apache.directory.api:api-util:jar:1.0.0-M20:compile
[INFO] |     |  \- org.apache.curator:curator-framework:jar:2.7.1:compile
[INFO] |     +- com.jcraft:jsch:jar:0.1.42:compile
[INFO] |     +- org.apache.curator:curator-client:jar:2.7.1:compile
[INFO] |     +- org.apache.curator:curator-recipes:jar:2.7.1:compile
[INFO] |     +- org.apache.htrace:htrace-core:jar:3.1.0-incubating:compile
[INFO] |     +- org.apache.zookeeper:zookeeper:jar:3.4.6:compile
[INFO] |     |  \- io.netty:netty:jar:3.7.0.Final:compile
[INFO] |     \- org.apache.commons:commons-compress:jar:1.4.1:compile
[INFO] |        \- org.tukaani:xz:jar:1.0:compile
[INFO] +- org.springframework.data:spring-data-jpa:jar:1.11.0.RELEASE:compile
[INFO] |  +- org.springframework.data:spring-data-commons:jar:1.13.0.RELEASE:compile
[INFO] |  \- org.slf4j:jcl-over-slf4j:jar:1.7.22:runtime
[INFO] +- org.springframework:spring-tx:jar:4.3.4.RELEASE:compile
[INFO] +- org.hibernate:hibernate-core:jar:4.3.11.Final:compile
[INFO] |  +- org.jboss.logging:jboss-logging:jar:3.1.3.GA:compile
[INFO] |  +- org.jboss.logging:jboss-logging-annotations:jar:1.2.0.Beta1:compile
[INFO] |  +- org.jboss.spec.javax.transaction:jboss-transaction-api_1.2_spec:jar:1.0.0.Final:compile
[INFO] |  +- dom4j:dom4j:jar:1.6.1:compile
[INFO] |  |  \- xml-apis:xml-apis:jar:1.0.b2:compile
[INFO] |  +- org.hibernate.common:hibernate-commons-annotations:jar:4.0.5.Final:compile
[INFO] |  +- org.hibernate.javax.persistence:hibernate-jpa-2.1-api:jar:1.0.0.Final:compile
[INFO] |  +- org.javassist:javassist:jar:3.18.1-GA:compile
[INFO] |  +- antlr:antlr:jar:2.7.7:compile
[INFO] |  \- org.jboss:jandex:jar:1.1.0.Final:compile
[INFO] +- org.apache.maven:maven-model:jar:3.3.9:compile
[INFO] |  +- org.codehaus.plexus:plexus-utils:jar:3.0.22:compile
[INFO] |  \- org.apache.commons:commons-lang3:jar:3.4:compile
[INFO] +- org.hibernate:hibernate-entitymanager:jar:4.3.11.Final:compile
[INFO] +- org.hibernate:hibernate-validator:jar:5.3.6.Final:compile
[INFO] +- com.fasterxml.jackson.core:jackson-databind:jar:2.8.9:compile
[INFO] |  \- com.fasterxml.jackson.core:jackson-core:jar:2.8.9:compile
[INFO] +- com.fasterxml.jackson.core:jackson-annotations:jar:2.8.9:compile
[INFO] +- com.fasterxml.jackson.dataformat:jackson-dataformat-csv:jar:2.8.8:compile
[INFO] +- com.fasterxml.jackson.dataformat:jackson-dataformat-yaml:jar:2.9.0:compile
[INFO] |  \- org.yaml:snakeyaml:jar:1.17:compile
[INFO] +- commons-fileupload:commons-fileupload:jar:1.2.2:compile
[INFO] +- commons-io:commons-io:jar:1.4:compile
[INFO] +- org.apache.poi:poi:jar:3.13:compile
[INFO] |  \- commons-codec:commons-codec:jar:1.9:compile
[INFO] +- org.apache.poi:poi-ooxml:jar:3.13:compile
[INFO] |  \- org.apache.poi:poi-ooxml-schemas:jar:3.13:compile
[INFO] |     \- org.apache.xmlbeans:xmlbeans:jar:2.6.0:compile
[INFO] |        \- stax:stax-api:jar:1.0.1:compile
[INFO] +- org.aspectj:aspectjrt:jar:1.6.10:compile
[INFO] +- org.aspectj:aspectjweaver:jar:1.6.10:compile
[INFO] +- org.aspectj:aspectjtools:jar:1.6.10:compile
[INFO] +- cglib:cglib-nodep:jar:3.2.2:compile
[INFO] +- org.apache.httpcomponents:httpclient:jar:4.3.6:compile
[INFO] |  +- org.apache.httpcomponents:httpcore:jar:4.3.3:compile
[INFO] |  \- commons-logging:commons-logging:jar:1.1.3:compile
[INFO] +- com.google.code.gson:gson:jar:2.2.4:compile
[INFO] +- com.fourones.webteam.webjar:datatable-editor:jar:1.0:compile
[INFO] +- com.googlecode.json-simple:json-simple:jar:1.1:compile
[INFO] +- org.springframework.security:spring-security-core:jar:4.2.0.RELEASE:compile
[INFO] |  \- aopalliance:aopalliance:jar:1.0:compile
[INFO] +- org.springframework.security:spring-security-web:jar:4.2.0.RELEASE:compile
[INFO] +- org.springframework.security:spring-security-config:jar:4.2.0.RELEASE:compile
[INFO] +- org.springframework.security:spring-security-taglibs:jar:4.2.0.RELEASE:compile
[INFO] |  \- org.springframework.security:spring-security-acl:jar:4.2.0.RELEASE:compile
[INFO] +- org.projectlombok:lombok:jar:1.16.10:compile
[INFO] +- joda-time:joda-time:jar:2.9.9:compile
[INFO] +- com.google.guava:guava:jar:22.0:compile
[INFO] |  +- com.google.code.findbugs:jsr305:jar:1.3.9:compile
[INFO] |  +- com.google.errorprone:error_prone_annotations:jar:2.0.18:compile
[INFO] |  +- com.google.j2objc:j2objc-annotations:jar:1.1:compile
[INFO] |  \- org.codehaus.mojo:animal-sniffer-annotations:jar:1.14:compile
[INFO] +- com.glqdlt.utill:simple-poi-reader:jar:2.1.3:compile
[INFO] +- junit:junit:jar:4.12:test
[INFO] \- com.fourones.common:sso-client:jar:1.0.3:compile
[INFO]    \- org.springframework.security.oauth:spring-security-oauth2:jar:2.0.14.RELEASE:compile
[INFO] ------------------------------------------------------------------------
```

살펴 보면, 기존 서블릿과 log4j 관련 된 종속성이 깨끗해진 것을 알 수가 있으며, 아래처럼 WAS 의 로그에서도 경고 메세지가 사라진 것을 확인할 수 있습니다.

```
정보: Starting ProtocolHandler ["http-apr-8080"]
1월 10, 2019 2:04:19 오후 org.apache.coyote.AbstractProtocol start
정보: Starting ProtocolHandler ["ajp-apr-8009"]
1월 10, 2019 2:04:19 오후 org.apache.catalina.startup.Catalina start
정보: Server startup in 51 ms
Connected to server
[2019-01-10 02:04:19,797] Artifact mpoker:war exploded: Artifact is being deployed, please wait...
1월 10, 2019 2:04:24 오후 org.apache.catalina.startup.TldConfig execute
정보: At least one JAR was scanned for TLDs yet contained no TLDs. Enable debug logging for this logger for a complete list of JARs that were scanned but no TLDs were found in them. Skipping unneeded JARs during scanning can improve startup time and JSP compilation time.
2019-01-10 14:04:24,984 RMI TCP Connection(3)-127.0.0.1 WARN Unable to instantiate org.fusesource.jansi.WindowsAnsiOutputStream
2019-01-10 14:04:25.018 [RMI TCP Connection(3)-127.0.0.1] [INFO] o.s.w.c.ContextLoader - Root WebApplicationContext: initialization started
2019-01-10 14:04:25.080 [RMI TCP Connection(3)-127.0.0.1] [INFO] o.s.c.s.AbstractApplicationContext - Refreshing Root WebApplicationContext: startup date [Thu Jan 10 14:04:25 KST 2019]; root of context hierarchy
2019-01-10 14:04:25.128 [RMI TCP Connection(3)-127.0.0.1] [INFO] o.s.b.f.x.XmlBeanDefinitionReader - Loading XML bean definitions from ServletContext resource [/WEB-INF/spring/root-context.xml]
2019-01-10 14:04:25.209 [RMI TCP Connection(3)-127.0.0.1] [INFO] o.s
```

사이드 이펙트에 대한 우려가 있을 수도 있는 데, 그간 모르고들 사용해온 것으로 보아서는 문제가 발생하지 않을 것으로 생각합니다.

위에서도 설명했지만,어차피 Maven 에서는 중복 종속성에 대해서 Root 트리에 가까운 순서로 우선 적용하기 때문에.. 명시적으로 선언한 디펜던시들을 그대로 사용이 되어왔을 때문이지요. =_=



