---
layout: post
title:  "nexus3"
author: "glqdlt"
comments : true
---


+ docker pull sonatype/nexus3

+ chown -R 200:200 ~~~~/nexus-data

+ docker run -d -p 18081:8081 -v ~~~~~/nexus-data:/nexus-data --name my-nexus sonatype/nexus3




Browse 에서 자세히 봐야할 것은 Type 이다.

+ hosted : 아카이빙하는 repo이다. 일반적으로 생각하는 우리의 모듈에 대한 아카이빙도 이쪽에 하는 것이며 jdbc 드라이버 빌드 된 3rd party 모듈들도 이쪽에 저장하게끔 하면 된다. (예: releases:hosted 는 우리의 릴리즈 모듈, maven-3rd:hosted 를 만들어서 jdbc 를 이쪽에 넣으면 된다.)

+ proxy : 캐싱 또는 mirror 이다. mvn.repository 를 mirrot 대상으로 두면 그쪽에서 당겨오는 dependencies 를 private maven repository 에서 저장해 두었다가, 추후에 요청시에 mvn.repository로 안 가고 최우선적으로 우리가 미리 캐싱해서 저장해놓은 private maven repository의 .m2 를 뒤진다. 

+ group : 위의 repo type들을 하나로 묶은 group 개념이다. deploy repo(maven에서는 distributeRepository 라고 부름)에만 직접적으로 release 나 snapshot 에만 기재해주면 되고, proxy 나 pull 당겨오는 것들 모두다 public으로 당겨오면 된다.


나는 아래의 추가적인 repo를 만들었따.

+ maven-3rd(hosted ) : jdbc 드라이브를 저장하기 위한 공간

+ maven-public : 기본적으로 있는 public에 , 위에 만든 maven-3rd 를 group 대상에 추가 했다.



+ ### ${user_home}/.m2/settings.xml 을 만든다.


        <?xml version="1.0" encoding="UTF-8"?>
        <settings xmlns="http://maven.apache.org/SETTINGS/1.1.0"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.1.0 http://maven.apache.org/xsd/settings-1.1.0.xsd http://maven.apache.org/SETTINGS/1.1.0 ">

            <servers>
                <server>
                    <id>snap</id>
                    <username>id</username>
                    <password>password1234</password>
                </server>
                <server>
                    <id>rel</id>
                    <username>id</username>
                    <password>password1234</password>
                </server>
                <server>
                    <id>public</id>
                    <username>id</username>
                    <password>password1234</password>
                </server>
            </servers>

            <mirrors>
                <mirror>
                    <id>public</id>
                    <name>public-group</name>
                    <url>http://127.0.0.0:18081/repository/maven-public/</url>
                    <mirrorOf>*</mirrorOf>
                </mirror>
            </mirrors>

        </settings>


+ ### pom.xml 에 아래를 추가 한다.

추가를 

        <profile> .. </profile>

안에서도 할 수 있다. 이 경우 profile 에 종속이 된다. 나 같은 경우엔 그냥 global 하게 적용 하는 편이다.

팀으로, snapshotRepository 와 repository 의 각각의 태그에 설정했다. 이렇게 해두면, version 명이 SNAPSHOT 으로 끝나면 알아서 snapshot repository 로 push 하게 해준다. 올ㅋ


        <distributionManagement>
            <snapshotRepository>
            <id>snap</id>
            <url>http://127.0.0.1:18081/repository/maven-snapshots/</url>
            </snapshotRepository>
            <repository>
            <id>rel</id>
            <url>http://127.0.0.1:18081/repository/maven-releases/</url>
            </repository>
        </distributionManagement>



여담으로 나는 nexus 설정에서 release는 update push를 못하게 막아놨다, snapshot은 update push 가 되어서 실수로 재 deploy 해도 update 되어서 아카이브가 deploy 된다, 반면 rel 은 400 에러와 함께 deploy 가 fail 한다. 이 경우 무조건 version 명을 하나 올려주어야 한다.

또한, 인증되지 않은 세션은 아얘 nexus에 접근도 못하게 설정할 수 있다.


        config(톱니모양) 아이콘 > security > anoymous > Allo anno~~~ access the server 의 체크를 해제.

