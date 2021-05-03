
# Spring 프레임워크의 UriComponents 의 버그

아래 코드와 같이 Path가 아닌 경우도 Path 필드에 할당이 된다.

뭐 port 에 이미 잘못된 구분이 들어가는 것이 문제이기는 하겠지만..

path 는 "" 이거나 null 되어야 한다.

https://github.com/spring-projects/spring-framework/blob/main/spring-web/src/main/java/org/springframework/web/util/UriComponentsBuilder.java

```
     @Test
    void name() {
        String uri = "https://www.naver.com:*";
        UriComponents aaa = UriComponentsBuilder.fromUriString(uri)
                .build();
        Assert.assertEquals("*", aaa.getPath());
    }
```


스킴의 정규표현식도 조금 아리송하다. RFC 에는 영문+숫자+[+-.] 많을 지원한다고 한다.

https://tools.ietf.org/html/rfc3986#section-3.1

주석을 보면 RFC 에 있는 정규표현식을 그대로 가져온 것으로 보여진다.

https://tools.ietf.org/html/rfc3986#appendix-B

살짝 변경한 부분이 있는데, authority 파트를 조금 변형한 것으로 보인다. RFC 예제에는 ID/PW 기반의 인증이 없기 때문


문제가 있는 코드는 아래와 같다.

```java
public static UriComponentsBuilder fromUriString(String uri) {
		Assert.notNull(uri, "URI must not be null");
		Matcher matcher = URI_PATTERN.matcher(uri);
		if (matcher.matches()) {
			UriComponentsBuilder builder = new UriComponentsBuilder();
			String scheme = matcher.group(2);
			String userInfo = matcher.group(5);
			String host = matcher.group(6);
			String port = matcher.group(8);
			String path = matcher.group(9);
			String query = matcher.group(11);
			String fragment = matcher.group(13);
			boolean opaque = false;
			if (StringUtils.hasLength(scheme)) {
				String rest = uri.substring(scheme.length());
				if (!rest.startsWith(":/")) {
					opaque = true;
				}
			}
			builder.scheme(scheme);
			if (opaque) {
				String ssp = uri.substring(scheme.length() + 1);
				if (StringUtils.hasLength(fragment)) {
					ssp = ssp.substring(0, ssp.length() - (fragment.length() + 1));
				}
				builder.schemeSpecificPart(ssp);
			}
			else {
				if (StringUtils.hasLength(scheme) && scheme.startsWith("http") && !StringUtils.hasLength(host)) {
					throw new IllegalArgumentException("[" + uri + "] is not a valid HTTP URL");
				}
				builder.userInfo(userInfo);
				builder.host(host);
				if (StringUtils.hasLength(port)) {
					builder.port(port);
				}
				builder.path(path);
				builder.query(query);
			}
			if (StringUtils.hasText(fragment)) {
				builder.fragment(fragment);
			}
			return builder;
		}
		else {
			throw new IllegalArgumentException("[" + uri + "] is not a valid URI");
		}
	}


```

문제는 2가지 케이스이다.

- port 부분에 들어갈 부분에 숫자가 아닌 다른 문자가 들어가면, port 의 문자는 path에 할당된다. 소스 코드를 보면 정규식 그룹 캡처링으로 처리를 하는 데, PORT 파트가 매칭이 안되면서 해당 문자 구문이 PATH 파트에 어떠한 문자열이라는 패턴에 매칭이 되어서 들어가버린다.

- host 부분도 마찬가지이다. 스킴이 없는 경우 HOST_PATTERN 에 호스트로 넘어가는 데, HOST_IPV4_PATTERN 패턴이 굉장히 저질이다. 어쨋든 이 저질 코드 때문에 역시 이부분에도 캡처링이 되지 않게 된다. 역시나 path 부분의 어떠한 문자열에 매칭이 되는 것 때문에 호스트에 들어갈 도메인주소가 PATH에 들어오게 된다.