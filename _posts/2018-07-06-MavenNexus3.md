---
layout: post
title:  "nexus3"
author: "glqdlt"
comments : true
---

# 들어가며

산출물 버전 형상 관리도 중요하지만, 현재 가장 필요한 것으로 Dependency 관련하여 필요성이 있어서 구축되었습니다.

CMS의 경우 common-module 이나, 라이센스 정책에 의해 비공개 된 JDBC 드라이버를 (예를 들면 oracle, mssql) 사용 중에 있어서 이를 관리해야 함으로 dependency proxy 목적으로 운영할 예정입니다.

대부분 Nexus2 가 범용적으로 알려져 있지만, Nexus3에는 java archive 외에도 docker image나 npm 도 지원함으로 nexus3 를 구축하였습니다.



# 구축 설치

Docker image로 빠르게 구축할 수 있습니다. [Official Guide](https://hub.docker.com/r/sonatype/nexus3/)

    docker pull sonatype/nexus3

> 권한 그룹이 200인 것은 nexus-data 에서 200으로 사용하기 때문.

    chown -R 200:200 ~~~~/nexus-data

    docker run -d -p 18081:8081 -v ~~~~~/nexus-data:/nexus-data --name my-nexus sonatype/nexus3



# Type
레포지토리는 기본적으로 3개의 Type을 가집니다.

+ hosted : 아카이브 형상을 저장하는 Type (3rd-party 아카이브도 저장가능)

+ proxy : 외부 repository 에 저장되어 있는 dependency를 cache 하는 Type이라 보면 됩니다.

+ group : hosted, proxy를 비롯한 여러 type 의 repository를 하나의 그룹으로 묶음으로서 개발자가 편하게 하나의 url로만 접근하게 해주는 아주 좋은 Type입니다.



현재 구성된 repo 리스트업은 아래와 같습니다.

+ maven-3rd: jdbc 드라이버와 같은 라이센스 문제로 비공개 되어 개발자가 직접 관리해야하는 3rd 라이브러리를 저장하는 곳입니다. 개념적으로 구분하기 위해 직접 만든 repo 입니다. repository 홈페이지에서 직접 수동 upload 합니다.
+ maven-central : maven 공식 community 의 repository를 mirror 하는 cache 레포지토리입니다. 
+ maven-public : 실제 개발자가 많이 사용 할 repo-group 입니다. central,3rd,releases,snapshots 모두 그룹핑 되어서 public repository에서 view 할 수 있습니다. 자세한 얘기는 아래 셋팅 관련해서 설명하겠습니다.
+ maven-releases : 실제 버전 형상을 rel을 관리하는 repo.
+ maven-snapshots : 실제 버전 형상의 snapshot을 관리 하는 repo.
이 외에는 생략합니다.


# 접근 정책

기본적으로 미인증 된 계정은 repository에 접근할 수가 없게 구성할 수 있습니다. Admin 권한이 있는 사용자에게 요청하여 계정을 생성 받아야 정상적으로 사용가능합니다.


        config(톱니모양) 아이콘 > security > anoymous > Allo anno~~~ access the server 의 체크 해제.



# 소스 코드 레벨에서 Repository 설정(Maven 기준)



1. ### ${user_home}/.m2/settings.xml 생성.

기본적으로 maven 은  .m2/settings.xml 이 있으면, 해당 파일을 로드 합니다. 이 파일은 repository 관련 경로/계정 등의 환경 설정을 할 수 있습니다.

기본적으로 제가 사용하는 settings.xml 은 아래와 같습니다.

+ snap : snapshot의 준 말입니다. 아래에서 설명할 pom.xml 에서 snap으로 매칭 되는 repository 설정에 해당 id/pw 를 사용합니다.

+ rel : releases 의 준 말입니다. snap과 같은 개념.

+ public : 위 Type에서 설명 했듯, 그룹핑 된 repository 입니다. 내부적인 메카니즘은 정확히 모르지만 이 public으로만 repository 설정을 해두면 central proxy 나 deploy 를 모두 public으로 접근해서 nexus3 내부에서 알아서 분기 해야할 repo로 알아서 나눠줍니다.

+ mirros : mirror 에 대한 설명은 [official](https://maven.apache.org/guides/mini/guide-mirror-settings.html)을 찾아 봐주세요. 간단하게는 모든 dependency를 mirror 할 repository를 설정하는 것으로 이해하고 있습니다. 제 설정에는 public 으로 향하게 되어있는 데, 여기에 그룹핑 된 central proxy repository로 알아서 mirror 됩니다.


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

2. pom.xml 에 아래를 추가 

전 보통 snapshotRepository 와 repository 의 각각의 태그에 설정합니다. 이렇게 해두면, version 명이 SNAPSHOT 으로 끝나면 알아서 snapshot repository 로 push 할 수 있습니다.

좀 더 디테일하게, profile 별로 deploy 를 다르게 하고 싶다면

        <profile> .. </profile>

안에서도 선언 할 수 있습니다. 이 경우 당연히 해당 profile context에 종속이 됩니다. 

    <?xml version="1.0" encoding="UTF-8"?>
    <project ....>
        ...

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

          <repositories>
            <repository>
                <id>public</id>
                <url>http://127.0.0.1:18081/repository/maven-public/</url>
            </repository>
        </repositories>
        ...
    </project>
