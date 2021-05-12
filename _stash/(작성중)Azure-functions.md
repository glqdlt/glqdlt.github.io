
Azure 클라우드에서 서버리스 설계를 했을 때의 경험을 기록한다.





# Azure 서버리스 솔루션 비교

Azure 에는 용도에 맞는 서버리스 모델이 굉장히 많다. 개념 잡는 거야 서버리스 컴퓨팅에 대한 것만 이해하면 쉽게 할수있다, 문제는 유사한 이름이 많아서 이놈이 이놈인가? 저놈이 저놈인가 하면서 고생을 했다.

Azure 에서는 서버리스 컴퓨팅을 Azure Functions 라고 부르고, 여러가지 구현체들이 있다. 정리하면 아래와 같은데 이름이 비슷한것들이 참 많다.



- Azure Functions

|영문|국문|용도|
|---|---|---|
|Power Authomate|PowerMate||
|Logic Apps|논리 앱| |
|Functions| 함수 앱| 한국어 번역에서 서버리스를 칭할때 Functions 와 이 함수 앱을 칭할때도 Functions 라 한다.|
|Webjobs|웹앱_일감| 웹앱(웹서비스) 안의 내부 기능이다.| 


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

## Trigger

트리거는 DB 트리거와 같은 맥락이다. 어떠한 행위를 조건으로 함수앱이 IDEL 에서 런타임으로 바뀌게 된다.

여기서 조건에 해당하는 것이 트리거이다.

특정 Http Request 에 부합하면 동작하거나, Cron 주기로 런타임되거나, 메세지큐에 메세지를 받거나 큐가 삽입되면 꺠어날수 있다. 

특정 트리거는 Azure스토리지 계정이라는 것이 필요하다. 이 스토리지 계정은 Azure Blob 이나 메세지 큐에 접근하는 용도로 사용이 된다.

필자가 경험한 것은 HttpTrigger 빼고는 다 필요했다.

여기서 많은 삽질을 했는데, 자사에서 스토리지 계정에서 메세지큐에 접근하도록 못해서 이슈가 있었다.

### HttpTrigger

Http Request 에 반응하는 트리거이다. 일반적으로 원격 업무를 처리시킬 때 사용된다.

예를 들면 작업이 오래 걸리기 때문에 웹앱 백그라운드에서 별도의 스레드에서 작업이 처리 되는 개념에 딱 쓰기 좋다.

필자는 CMS 와 같은 업무 툴에서 게임 로그의 여러가지 정보를 집계하고 이를 엑셀로 뱉어주는 기능이 있었는데,
 
여기에 사용했다.

기존에는 CMS 웹페이지에서 기능 사용 Request 시점부터 집계하고 엑셀을 만드는 파이프라인으로, 1차원적이고 직관적인 방법을 사용했는데

게임의 유저풀이 늘면서 DB 부하가 커지는 이슈가 생겼기에 이를 해결해야했다.

변경한 것은 웹페이지에서 기능 사용 Request가 발생하면 기능 접수 개념으로 바로 Response 해버리고, 별도의 스레드에서 집계하고 엑셀로 만드는 작업을 처리 시켰다.

유저 입장에서는 엑셀을 원했으나, 나중에 언젠간 만들어질 엑셀을 찾아갈떄 제출해야하는 토큰을 얻게 되고

언젠가 완료될 시점에 이 토큰을 들고 엑셀로 변환하는 기능에 요청을 해야 한다. 보통은 엑셀이 완성되면 이메일로 전달해주거나

웹소켓으로 이벤트를 알려주는 기능을 생각할수 있다. 필자의 조직에는 여러가지 문제로 이러한 기능까진 만들지 않았다.

여기서 별도의 스레드가 하던 일을 함수앱 HttpTrigger 에게 위임을 시켰다. 기존에는 같은 몸뚱이에서 했기에 개발이 쉬웠을 수 있지만

스케일 아웃과 같은 리소스 부하를 줄이기 위한 행위에서는 문제가 있을수 있기 때문이다.

함수앱은 자체적으로 오토 스케일 아웃을 하고 IDLE 상태에서는 비용이 최소한으로 발생되기 때문에 좋은 접근이라 생각했다.

간단한 코드는 아래와 같다.

```java
public class MyHttpTrigger {//

    @FunctionName("MyHttpTrigger2") // 클래스 이름도 메소드 이름이 아닌, 이 어노테이션의 이름으로 함수앱의 함수가 생성이 된다.
    public HttpResponseMessage run(
            @HttpTrigger(
                    name = "req",
                    methods = {HttpMethod.GET, HttpMethod.POST},
                    authLevel = AuthorizationLevel.ANONYMOUS)
                    HttpRequestMessage<Optional<String>> request,
            final ExecutionContext context) {
        context.getLogger().info("Java HTTP trigger processed a request."); // 기본적으로 어플리케이션의 로그는 이 context 에 의해 관리가 되는데, AppInsight 에 로그가 쌓이게 된다.

        // Parse query parameter
        final String query = request.getQueryParameters().get("name");
        final String name = request.getBody().orElse(query);

        if (name == null) {
            return request.createResponseBuilder(HttpStatus.BAD_REQUEST).body("Please pass a name on the query string or in the request body").build();
        } else {
            return request.createResponseBuilder(HttpStatus.OK).body(name).build();
        }
    }
}
```

### TimerTrigger

크론 트리거로 이름을 바꾸어서 생각해도 좋다. Cron 문법으로 스케줄링 돌면서 만족하는 시간이 되면 IDEL에서 깨어나 일을 하는 녀석이다.

아래 코드를 보면 이해되지만 어노테이션에 schedule 속성에 크론식을 기입하면 된다.

```java
public class AA{
@FunctionName("SimpleCronTrigger")
    public void SimpleCronTrigger2(
            @TimerTrigger(name = "SimpleCronTrigger", schedule = "0 */10 * * * *") String timerInfo,
            ExecutionContext context
    ) {
        context.getLogger().info("Timer is triggered: " + timerInfo);
    }
}
```

### ServiceBusTrigger

KafkaTrigger 라던지 여러가지 트리거들이 존재한다.

필자의 조직은 Azure 서비스버스를 메세지 큐로 사용중에 있다. 참고로 서비스버스는 엔터프라이즈 고가용성 메세지 큐인데 사용해본 느낌으로는 RabbitMQ 와 거의 동일하다고 생각을 하고 있다.

서비스 버스 트리거는 [공식 문서](https://docs.microsoft.com/ko-kr/azure/azure-functions/functions-bindings-service-bus-trigger?tabs=csharp) 에 가이드가 잘되어 있다.



## 로직앱




# 레퍼런스

- https://docs.microsoft.com/ko-kr/azure/azure-functions/functions-compare-logic-apps-ms-flow-webjobs