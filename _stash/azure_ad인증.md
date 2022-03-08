ADAL4J 는 v1.0 엔드포인트를 사용한다.

MSAL4j 는 v2.0 이다.

ADAL4J 는 유지보수만 하고 있고, 신규 기능이 추가되지 않는다.

아래는 2022년 3월 기준 최신 라이브러리 버전이다.

<dependency>
    <groupId>com.microsoft.azure</groupId>
    <artifactId>msal4j</artifactId>
    <version>1.11.2</version>
</dependency>

<dependency>
    <groupId>com.microsoft.azure</groupId>
    <artifactId>adal4j</artifactId>
    <version>1.6.3</version>
</dependency>



MSAL4J 에는 신규 기능이 추가되고 있고, AzureAD b2c 와 같은 서비스도 처리할수있다

업데이트를 해야하는 이유는 ADAL4J의 github 에 가이드되어있다.
(https://github.com/AzureAD/azure-activedirectory-library-for-java)


MSAL4J is the new authentication library to be used with the Microsoft identity platform.

Building on top of ADAL, MSAL works with both the Open ID Connect certified Azure AD V2 endpoint and the new social identity solution from Microsoft, Azure AD B2C.

ADAL4J is in maintenance mode and no new features will be added going forward except for security fixes. All our ongoing efforts will be focused on improving MSAL4J.

마이그레이션 방법에 대한 가이드는 MSAL4J github 에 가이드되어있다

https://github.com/AzureAD/azure-activedirectory-library-for-java

인증 메카니즘에서 꽤 큰 차이가 있다. ADAl4J는 개발자가 직접 새로고침 토큰을 직접 제어가 가능했지만 MSAL4J 에서는 이것이 막혔다. 

MSAL4J does not expose refresh tokens for security reasons. Instead, MSAL handles refreshing tokens for you.



## 

가이드를 보면 인증에서 부여할 리소스를 입력하는 곳에 

https://management.core.windows.net

라는 url 을 입력해야하는 경우가 종종 보인다. 

이게 뭔가 해서 찾아봤는데, azure 리소스를 전체적으로 관리하는 매니지먼트 시스템의 url (Azure Resource Manager)이다. 기본적으로 존재하고 있다.

나는 특정 리소스 명을 (예:myblobstorage) 기입하는 거라 생각했는데, 그것이 아니고 service principal 에서 만들때 부여할 리소스 대상 선택하는 부분이 있다. 

이 url 을 참조(https://docs.microsoft.com/en-us/rest/api/servicebus/get-azure-active-directory-token#use-postman-to-get-the-azure-ad-token) 하면 어떻게 service principal 을 등록하는 지 나온다.

별도로 리소스를 지정하지 않고 등록하면, 이 Azure Resource Manager 리소스를 사용한다는 식으로 인증 부여가 된다. 이를 default 라는 식으로 부르는데, ROOT 라고 보면 될것이다.


Azure Resource Manager

https://docs.microsoft.com/ko-kr/azure/azure-resource-manager/management/overview

https://docs.microsoft.com/ko-kr/azure/databricks/dev-tools/api/latest/aad/app-aad-token

