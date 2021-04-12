# OAuth2 와 OpenId

## OAuath2

OAuth2 는 HTTP 프로토콜이 무연결(stateless) 세션의 특징을 굉장히 잘 활용한 메카니즘을 띄고 있다. 무연결 세션에서 제3자 간의 신뢰성을 확보하기 위해 상태를 스냅샷하는 개념들이 많이 녹여있기 때문에, 어떠한 파라미터가 어떠한 용도로  쓰여지는 지를 잘 이해해야지 OAuth2 흐름을 인지할수 있다.



### Oauth2 의 흐름

|파라미터|내용|예시|
|---|---|---|
|client_id| 인증을 원하는 클라이언트 어플리케이션 식별자이다.|myApplication|
|redirect_url| 인증 성공 후에 유저를 통해서 리다이렉트 되어야 할 클라이언트의 리다이렉트 주소이다. 인증 공급자는 자신의 DB에 저장된 클라이언트의 redirect_url 과 같은지를 비교한다. 이는 보안을 위해서이다.|http://www.myapplication.com/home|
|state|클라이언트가 유저 로그인 과정을 기억하기 위한 파라미터, 난수이고 state는 클라이언트가 생성하고 인증 공급자는 인증 성공 후에 이 값을 그대로 되돌려준다. 일반적으로 유저가 어디 페이지에 접근하려 했었는지를 기억하는 용도로 사용한다. | Qwe2Awe123Qq|
|scope|클라이언트가 인증 공급자에게 사용자의 어떠한 기능을 사용하려한다, 또는 클라이언트가 이러한 권한이 있음을 나타낸다. 인증 공급자는 자신의 DB에 저장된 클라이언트의 scope 와 클라이언트가 이 파라미터를 통해 전달하는 scope 를 비교한다. |userDetailAccess, GameApiRequest, CalendarAccess|
|response_type| OAUTH2 인증 응답 방식을 서술한다. oauth2.0 기준 code 또는 token 을 지원한다. | code| 




### 인증 종류

#### 임시 코드 인증 (code)

가장 기본적이고 범용적으로 사용되는 인증 방식이다. 사용자가 로그인을 성공 한 후에 엑세스 토큰을 생성하기 않고, 엑세스 토큰을 얻기 위한 임시 코드를 클라이언트에 전달하여 클라이언트가 직접 인증 서버에게 엑세스 토큰을 발급받는 방식이다. 이 방식은 엑세스 토큰 자체가 제3자에게 절대 노출이 되지 않게 하기 위해서 인증 서버가 직접 인증 공급자에게 HTTP REQUEST 를 하기 위함이다.

 



#### 암시적 부여 인증 (token)

모바일 어플리케이션이나 웹 브라우저의 SPA 와 같은 서버 독립적으로 동작하는 경우에 이 흐름을 사용한다. 이 흐름의 특징은 임시 코드 인증 방식의 복잡함(3-legged oauth 라고 한다) 을 생략하고 바로 엑세스 토큰을 발급 받는 것을 의미한다. 이 흐름의 장점은 쉽다는 점이지만 단점으로 보안성에 문제를 야기한다.


암시적 부여 인증의 특징은 유저가 로그인이 성공하면 인증 공급주체에서 유저의 손에 엑세스 토큰을 쥐어주어서 전달시켜야 하기 때문에 로그인 성공후, 리다이렉트 처리 되는 과정에 토큰이 URL에서 노출이 된다.

기본적으로 3xx 와 같은 리다이렉션 상태는 http payload 부분을 생략하고 있기 때문에 GET 메소드의 특징처럼 URL 쿼리 파라미터로 토큰을 넘기게 되는 특징 떄문이다. 

일반적으로 JWT 데이터 타입으로 전달이 된다.  

  

## OpenId

Oauth2 가 인증의 전이를 의미하지만, 실제 인증에 쓰여지는 유저 정보에 대해서는 Oauth2 의 공급자의 계정 제공 리소스 서비스에 따라 모두 상이하다. 

이게 어떠한 이야기냐면, Oauth2 인증을 제공하는 N사 K사 S사 가 있다고 하자. N사에서는 userName 에 부합하는 값을 실제 회원의 이름을 쓰고 있고, K사에서는 userName에 부합하는 값은 회원의 이메일을 쓰고 있다. 또한 S 사에는 userName 에 부합하는 필드를 제공하지 않는다 라고 생각을 해보자.

이런 경우 공급자 저마다의 스펙으로 제공이 되기 떄문에, Oauth2 사용자의 경우 일반적으로 원하는 유저 계정 정보에 대한 스펙이 표준화 되어 있지 않아서 개발에 어려움이 생기거나, 원하는 데이터를 챙길수가 없다. 이를 해소하기 위해 OpenId 라는 이름 하의 표준 스펙을 정의한 것이다.

결론적으로 OpenId는 Oauth2 기반 위에서, 유저 계정정보에 대한 데이터 필드 표준을 정의한 것일 뿐이다. 두 개를 다르게 보면 절대 안되고,  OpenId 가 Oauth2 의 확장 개념이라고 접근하는 것이 옳다.

### ID TOKEN

OpenID 가 Oauth2.0 에서 확장되는 부분이 이 부분이다. ID토큰은 JWT 를 기본 자료타입으로 사용하는 데, JWT 의 페이로드에 들어가야 하는 클레임을 표준 스펙으로 정의 해두었다.

https://openid.net/specs/openid-connect-core-1_0.html?_fsi=JxLS7CDE#IDToken

모든 사양은 위 레퍼런스에서 참고하면 되고, 아래는 필수에 해당하는 부분만 번역하였다.

|키|필수|설명|예시 값|
|---|---|---|---|
|iss|o|인증을 허가한 주체를 의미함.|https://www.myAuth.com|
|sub|o|인증주체에서 유저를 식별하는 ID 고유 값. |user1234|
|aud|o|토큰을 사용할 CLIENT 대상 식별값을 의미한다| myApplication|
|exp|o|토큰 만료 시각을 의미한다|2021-02-01T00:00:00|
|iat|o| 토큰이 발행된 시간 | 2021-01-01T00:00, UTC 시간이며 RFC3339|

```javascript
{
    "iss" : "https://www.myAuth.com",
    "sub" : "user1234",
    "aud" : "myApplication",
    "exp" : "1311281970",
    "iat" : "1311280969"
}
```

### Oauth2 에서 추가 된 인증 종류

#### 하이브리드 인증(id_token+code)

기존 Oauth2 의 인증 응답 방식(code 기반, 암시적 흐름 기반)에서 OpenID 는 추가적으로 하이브리드 인증이라는 것을 지원한다.

이게 무엇인가가 궁금했는데, 스펙에 정의 된 내용으로는 그냥 모든 응답 방식을 포함하는 것을 의미한다.
즉 단발성 토큰 발급과, 임시 코드가 같이 부여되는 방식이다.
response_type 파라미터는 "id_token+code" 라는 이름으로 정의가 되어있다. 임시코드를 의미하는 token이 아니라 id_token 인 것은 token 데이터타입이 jwt 이고, OpenId 의 정의된 클레임(키,벨류) 표준을 포함하겠다는 것을 의미한다. 


https://openid.net/specs/openid-connect-core-1_0.html?_fsi=JxLS7CDE#HybridFlowAuth

이 변태스러운 하이브리드 인증 방식은 필요하에 선택적으로 대응해라는 방식이다. 하이브리드 인증 방식에서 넘어오는 토큰은 암시적흐름의 토큰과 같은데, 리프레시 토큰 개념이 없다. 이 경우는 유저 경험성을 높이기 위해  3-legged oAuth 흐름을 생략하고 암시적 흐름으로 우선 토큰 발급을 진행하고, 같이 발급된 code 를 통해 리프레시 토큰을 별도로 발급받는 과정에 사용하는 시나리오를 생각해볼 수 있다. 


---



OAuth는 3rd party(외부 서비스)를 위한 범용적인 인증 표준입니다.

외부 사이트와 인증기반의 데이터를 연동할 때 ID, Password를 넘기는 방법은 매우 위험합니다. ID, Password는 그 사용자의 모든 권한을 얻는 것이기 때문에 ID 도용 위험이 큽니다. 그래서 ID, Password를 사용자 임시 인증을 위한 Token을 제공하는 방식을 사용합니다. 그러나 이 방법이 각 서비스마다 제각각이어서 개발자들은 인증 연동을 각 서비스별로 따로 해야 했습니다. 그러다 보니 표준적인 방법이 필요했고, 그 표준 방법이 OAuth입니다.

- 출처: https://developers.daum.net/services/apis/docs/oauth2_0/intro
IT 기업에서 open API는 중요해지면서 어떠한 방식으로 API를 구성하고 데이터를 주고받을 것인지에 대해서도 논쟁이 많았다. SOAP & XML 과 REST & JSON의 논쟁 끝에 최근에 생기는 여러 API들은 REST & JSON의 기반으로 서비스를 제공하고 있으며 인증방식으로는 OAuth2.0을 사용하고 있다.

인증이란 REST API를 호출한 클라이언트가 적절한 사용자 인가를 판단해주는 것이다. 즉, API를 아무에게나 사용하도록 하는 것이 아니라 API를 호출할 수 있는 권한을 주고 클라이언트가 API를 호출할 때 권한이 있는지를 확인하는 것이 인증이다.

OAuth 용어

인증(Authentication)

- 시스템 접근 시, 등록된 사용자인지 확인하는 것
- 로그인
인가(Authorization)

- 문서 읽기나 이메일 계정에 접근하는 등의 일부 행위를 수행할 권리를 가진 사용자를 검증하는 과정
- 주로 권한을 검증하기 전에 사용자 인증을 요구함
- 권한에 따라 사용 가능한 기능이 제한됨
- 사용자 등급 (일반/관리자/슈퍼유저 등..)
권한 위임

- 본인을 대신하여 다른 사람이나 애플리케이션에 권한을 부여
- OAuth에서 사용자는 본인 대신 액션을 수행하도록 애플리케이션에게 접근을 허가하고, 애플리케이션을 허가받은 액션만 수행
역할

- 자원 서버 (Resource Server): OAuth가 보호하는 사용자 소유의 자원을 호스팅하는 서버. 일반적으로 사진, 비디오, 주소록 같은 데이터를 보유하고 보호하는 API 제공 업체
- 자원 소유자 (Resource Owner): 일반적으로 애플리케이션의 사용자. 
- 클라이언트 (Client): 3rd 파티 애플리케이션
- 인증 서버 (Authorization Server): 자원 서버에서 보호되는 자원에 접근하기 위해 자원 소유자에게 동의를 얻고 클라이언트에 액세스 토큰을 발행. (API 서버와 같을 수도 있음)
다양한 인증 방식 (Grant Types)

client는 기본적으로 Confidential Client와 Public Client로 나뉜다.

- Confidential Client: 웹 서버가 API를 호출하는 경우 등과 같이 client 증명서(client_secret)를 안전하게 보관할 수 있는 Client를 의미한다. 
- Public Client: 브라우저 기반 애플리케이션이나 모바일 애플리케이션 같이 client 증명서를 안전하게 보관할 수 없는 Client를 의미하는데 이런 경우, redirect_uri를 통해서 client를 인증한다

Confidential Client
Public Client 
 3-legged oAuth
Authorization code 
Implicit 
 2-legged oAuth
Resource Owner Password Credentials 
Client Credentials 
Oauth2.0이 지원하는 인증방식은 client 종류와 시나리오에 따라 아래 4가지의 종류가 있다. 하지만 실제 open API에서는 Authorization Code Grant와 Implicit Grant를 제외하고는 3-legged Oauth가 아니기 때문에 많이 사용되지 않는다.

(인증 방식에 따른 호출 방법 예시(Django-oauth-toolkit 사용): http://hyunalee.tistory.com/8)

1. Authorization Code

used with server-side Applications. 3-legged oAuth. 

웹 서버에서 API를 호출하는 등의 시나리오에서 Confidential Client가 사용하는 방식.

server side 코드가 필요한 인증 방식. 인증 과정에서 client_secret이 필요.

로그인시에 페이지 URL에 response_type=code라고 넘긴다.

바로 엑세스 토큰을 받는 것이 아닌,  server side 코드를 통해 엑세스 토큰을 변환한다는 점을 착안해,  3-legged OAuth 라는 이름으로도 불린다.

2. Implicit

used with Mobile Apps or Web Applications (applications that run on the user's device). 3-legged oAuth

(token과 scope에 대한 스펙 등은 다르지만) oAuth1.0a와 가장 비슷한 인증 방식. Public Client가 사용하는 방식.

Client 증명서를 사용할 필요가 없으며 실제로 oAuth2.0에서 가장 많이 사용되는 방식.

로그인시에 페이지 URL에 response_type=token라고 넘김.

다른 말로는 암시적 흐름이라고도 한다.

3. Resource Owner Password Credentials

used with trusted Applications, such as those owned by the service itself. 2-legged oAuth

Client에 아이디/패스워드를 저장해 놓고 아이디/패스워드로 직접 access token을 받아오는 방식.

신뢰할 수 없는 Client일 경우에는 위험성이 높기때문에, API 공식 애플리케이션이나 믿을 수 있는 Client에 한해서만 사용.

로그인시에 API에 POST로 grant_type=password라고 넘김.

4. Client Credentials

used with Applications API access. 2-legged oAuth

Confidential Client일 때 id와 secret을 가지고 인증하는 방식.

로그인시에 API에 POST로 grant_type=client_credentials라고 넘기.

Extension.

oAuth2.0은 추가적인 인증방식을 적용할 수 있는 길을 열어놓았으나 메인 에디터인 Eran Hammer는 이러한 과도한 확장성을 매우 싫어했다고 한다.

어떤 Grant Type을 사용해야 할까

grant란 access token을 얻기위한 방식이다. grant는 client 타입에 의해 결정된다.[각주:1]


1st party or 3rd party client

1st party client: 사용자의 인증서를 다루기에 안전한 경우. (예, Spotify's iPhone app is owned and developed by Spotify so therefore they implicitly trust it.)

3rd party client: 신뢰할 수 없는 client.
다양한 토큰 지원(Access token)

OAuth 2.0은 기본적으로 Bearer 토큰, 즉 암호화하지 않은 그냥 토큰을 주고받는 것으로 인증을 한다. 기본적으로 HTTPS 를 사용하기 때문에 토큰을 안전하게 주고받는 것은 HTTPS의 암호화에 의존한다. 또한 복잡한 signature 등을 생성할 필요가 없기 때문에 curl이 API를 호출 할 때 간단하게 Header 에 아래와 같이 한 줄을 같이 보내므로서 API를 테스트해볼 수 있다.
Authorization: Bearer
또한 OAuth 2.0은 MAC 토큰과 SAML 형식의 토큰을 지원할 수 있지만 현재 MAC 토큰 스펙은 업데이트 되지 않아 기한 만료된 상태이고 SAML 토큰 형식도 아직은 활발하게 수정중이기 때문에 사용할 수 없는 상태이다. 정리하자면, OAuth 2.0은 다양한 토큰 타입을 지원한지만 실질적으로는 Bearer 토큰 타입만 지원한다.

Refresh token

클라이언트가 같은 access token을 오래 사용하면 결국은 해킹에 노출될 위험이 높아진다. 그래서 OAuth 2.0에서는 refresh token 이라는 개념을 도입했다. 즉, 인증 토큰(access token)의 만료기간을 가능한 짧게 하고 만료가 되면 refresh token으로 access token을 새로 갱신하는 방법이다. 이 방법은 개발자들 사이에서는 논란이 있는데, 토큰의 상태를 관리해야 해서 개발이 복잡해 질 뿐만 아니라 토큰이 만료되면 다시 로그인 하도록 하는 것이 보안 면에서도 안전하다는 의견이 있기 때문이다.

API 권한 제어 (scope)

OAuth 2.0은 써드파티 어플리케이션의 권한을 설정하기 위한 기능이다. scope의 이름이 스펙에 정의되어있지는 않으며 여러 개의 권한을 요청할 때에는 콤마등을 사용해서 로그인 시에 scope를 넘겨주게 된다.
http://example.com/oauth?….&scope=read_article,update_profile
1. https://alexbilbie.com/guide-to-oauth-2-grants/ [본문으로]
'REST API' 카테고리의 다른 글

