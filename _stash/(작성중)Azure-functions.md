
Azure 클라우드에서 서버리스 설계를 했을 때의 경험을 기록한다.





# Azure 서버리스 솔루션 비교

Azure 에는 용도에 맞는 서버리스 모델이 굉장히 많다. 개념 잡는 거야 서버리스 컴퓨팅에 대한 것만 이해하면 쉽게 할수있다, 문제는 유사한 이름이 많아서 이놈이 이놈인가? 저놈이 저놈인가 하면서 고생을 했다.

Azure 에서는 서버리스 컴퓨팅을 Azure Functions 라고 부르고, 여러가지 구현체들이 있다. 정리하면 아래와 같은데 이름이 비슷한것들이 참 많다.



- Azure Functions

    - Power Automate
    
        - 한국어로 PowerMate
    
    - Logic Apps 
    
        - 한국어로 논리 앱
    
    - Functions
    
        - 한국어로 함수 앱, 재밌는 건 공식문서에서는 Functions 라고 부르는 데, 골때리는게 모든 서버리스를 칭할때 Functions라고도 하고, 심지어 논리 앱을 설명할때에도 Functions 라고 번역이 되어있다. 이것 때문에 겁나 고생했다.
    
    - Webjobs
    
       - 한국어로 웹앱(내부에 기능이다, webjobs 라는 기능이 있다.)

[레퍼런스 문서](https://docs.microsoft.com/ko-kr/azure/azure-functions/functions-compare-logic-apps-ms-flow-webjobs)


# 자바 기반의 구성 방법

아래는 

## 함수앱

함수앱은 VSCode, IntelliJ 로 할 경우에 쉽게 프로비저닝 할수있다.

Azure 포탈에서는 VS Code 와 Maven 셋업에 관한 내용으로 소개가 된다. 시키는 데로 하면 되는데, 약간의 버그(2020년 05월 기준)가 있다.

버그는 Azure 클라우드 위치(리전)가 한국인이라면 Korea Central 에 일반적으로 위치할 것인데, 이 클라우드 리전정보를 Maven 에 기입하면 중간에 공백문자 때문에 이슈가 발생한다.

이에 대해서는 필자가 버그 트러블슈팅을 할것이나, 현재로서는 꼼수를 써야한다. 이에 대한 가이드는 아래 프로젝트 셋업 에서 설명하겠다. 

가이드는 함수앱 리소스 자체를 새로이 구축하는 것부터 시작한다. 자세히 내부를 살펴보지는 않았는데, Maven 설정에 기존 함수앱이 있는지에 대한 설정이 없다면 신규로 생성하는 것으로 생각된다.

참고로 Maven은 자바 프로젝트 빌드를 위한 용도일 뿐, Azure 관련 된 모든것은 node js 기반의 툴에 의해 실행된다.

가이드에도 아래 캡처처럼 azure-functions-core-tools 라는 것을 생성해라고 한다.

![](.Azure-functions_images/1dd42bdb.png)
 

실제로 Maven 플러그인에 버그가 있어서 디버깅하면서 이를 알게 되었는데, 단순히 azure-functions-core-tools 를 Maven 이 하위 프로세스로 실행하는 정도의 수준이다.

각 언어에 맞는 걸 만들기에는 시간이 모잘랐는지 Maven으로 wrapping 한 수준이란 셈. 

### 메이븐으로 프로젝트 수동 구성

앞서 말한 것처럼 NodeJs 는 필수이다.

0. Node Js 설치

1. npm install -g azure-functions-core-tools 를 입력하여 자바스크립트 기반 툴을 설치한다.

> npm install -g azure-functions-core-tools

2. 프로젝트를 구성할 폴더로 가서 터미널을 열고 아래 명령을 입력해서 Azure 인증 토큰을 획득해야한다. 

> az login

이를 입력하여 아래처럼 로그인 화면이 브라우저에 나올것이다. 나는 멀티 유저 로그인 세션을 이전에 했기 때문에 단순히 선택할수 있는 창이 나온다.

![](.Azure-functions_images/a787af4c.png)

적절한 계정이라면 아래처럼 로그인에 성공했다는 화면이 출력된다.

![](.Azure-functions_images/f5c84a15.png)

이제 메이븐 프로젝트를 초기화해야한다. 가이드를 참고하자.

![](.Azure-functions_images/9ab8d435.png)

아래 내용을 터미널에서 실행시킨다.

> mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName=${1번} -DappRegion=Korea Central -DresourceGroup={2번} -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.${functionAppName} -DinteractiveMode=false

특별하게 한글로 1번, 2번이라고 적은 부분은 아래 캡처와 매핑하면 이해하기 쉬울 것이다.

![](.Azure-functions_images/e758f673.png)

- 1번 : 함수앱 리소스 이름

- 2번 : 함수앱 리소스 그룹

자 여기를 주목해야한다. 저 커맨드를 입력하더라도 버그가 일어날 것이다.

![](.Azure-functions_images/11c9584d.png)

왜냐면 ```-DappRegion=Korea Central``` 이 구문 떄문이다.

위에서 잠깐 언급했지만 Korea Central 에서 띄어 쓰기가 있기 때문에 이슈가 있다. 그래서 임시방편으로 Korea-Central 로 기업 하면 좋다.

만약에 리소스 이름이 myFunctionApp 이고 리소스 그룹이 my-resource-group 이라면 최종적으로는 아래처럼 입력하면 프로젝트 셋업이 된다.

> mvn archetype:generate -DarchetypeGroupId=com.microsoft.azure -DarchetypeArtifactId=azure-functions-archetype -DappName=myFunctionApp -DappRegion=Korea-Central -DresourceGroup=my-resource-group -DgroupId=com.{functionAppName}.group -DartifactId={functionAppName}-functions -Dpackage=com.${functionAppName} -DinteractiveMode=false

![](.Azure-functions_images/6a24967f.png)

구성이 완료되었다 생각되지만 아직 단계가 남았다.

아까 Korea Central 과 같은 이슈처리와 pom.xml 에 기존 함수앱 리소스 정보를 기재해야한다. 

아래 한글로 된 부분을 한글 내용에 맞게 수정을 한다.

```
<?xml version="1.0" encoding="UTF-8" ?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.{functionAppName}.group</groupId>
    <artifactId>{functionAppName}-functions</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <name>Azure Java Functions</name>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <java.version>1.8</java.version>
        <azure.functions.maven.plugin.version>1.11.0</azure.functions.maven.plugin.version>
        <azure.functions.java.library.version>1.4.2</azure.functions.java.library.version>
        <functionAppName>함수앱 리소스명을 적는다.</functionAppName>
    </properties>

    <dependencies>
        <dependency>
            <groupId>com.microsoft.azure.functions</groupId>
            <artifactId>azure-functions-java-library</artifactId>
            <version>${azure.functions.java.library.version}</version>
        </dependency>

        <!-- Test -->
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.4.2</version>
            <scope>test</scope>
        </dependency>

        <dependency>
            <groupId>org.mockito</groupId>
            <artifactId>mockito-core</artifactId>
            <version>2.23.4</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.8.1</version>
                <configuration>
                    <source>${java.version}</source>
                    <target>${java.version}</target>
                    <encoding>${project.build.sourceEncoding}</encoding>
                </configuration>
            </plugin>
            <plugin>
                <groupId>com.microsoft.azure</groupId>
                <artifactId>azure-functions-maven-plugin</artifactId>
                <version>${azure.functions.maven.plugin.version}</version>
                <configuration>
                    <!-- function app name -->
                    <appName>${functionAppName}</appName>
                    <!-- function app resource group -->
                    <resourceGroup>22</resourceGroup>
                    <!-- function app service plan name -->
                    <appServicePlanName>java-functions-app-service-plan</appServicePlanName>
                    <!-- function app region-->
                    <!-- refers https://github.com/microsoft/azure-maven-plugins/wiki/Azure-Functions:-Configuration-Details#supported-regions for all valid values -->
                    <region>이 부분 수정을 해야한다 (원래는 Korea-Central 일것이다, Korea Central 띄어쓰기로 입력한다.)</region>
                   
                    <!-- function pricingTier, default to be consumption if not specified -->
                    <!-- refers https://github.com/microsoft/azure-maven-plugins/wiki/Azure-Functions:-Configuration-Details#supported-pricing-tiers for all valid values -->
                    <!-- <pricingTier></pricingTier> -->
                    <!-- Whether to disable application insights, default is false -->
                    <!-- refers https://github.com/microsoft/azure-maven-plugins/wiki/Azure-Functions:-Configuration-Details for all valid configurations for application insights-->
                    <!-- <disableAppInsights></disableAppInsights> -->
                    <runtime>
                        <!-- runtime os, could be windows, linux or docker-->
                        <os>리소스앱의 플랫폼(Window Or Linux)을 기재한다.</os>
                        <javaVersion>8</javaVersion>
                    </runtime>
                    <appSettings>
                        <property>
                            <name>FUNCTIONS_EXTENSION_VERSION</name>
                            <value>~3</value>
                        </property>
                    </appSettings>
                </configuration>
                <executions>
                    <execution>
                        <id>package-functions</id>
                        <goals>
                            <goal>package</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
            <!--Remove obj folder generated by .NET SDK in maven clean-->
            <plugin>
                <artifactId>maven-clean-plugin</artifactId>
                <version>3.1.0</version>
                <configuration>
                    <filesets>
                        <fileset>
                            <directory>obj</directory>
                        </fileset>
                    </filesets>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>

```

pom.xml 설정이 끝났으면 빌드를 실행해본다. 아마 패키지 명이나 여러가지 다듬을 부분이 있어서 에러가 날수 있다.

이는 직접 수정하길 바란다.

> mvn clean package

빌드가 성공하면 아래 Maven 플러그인을 실행해서 함수앱을 로컬에서 실행시켜볼수있다.

> mvn azure-functions:run

문제 없이 잘 동작하면 이를 배포해야한다.

아래 커맨드로 배포를 한다.

> mvn azure-functions:deploy

성공한다면 터미널에 아래와 같은 성공 메세지가 출력 될것이다.

![](.Azure-functions_images/2b1af881.png)



## 로직앱




# 레퍼런스

- https://docs.microsoft.com/ko-kr/azure/azure-functions/functions-compare-logic-apps-ms-flow-webjobs