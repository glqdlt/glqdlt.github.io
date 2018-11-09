---
layout: post
title:  "넷플릭스 Zuul"
author: "glqdlt"
---

# 들어가며

넷플릭스 Zuul 은 MSA 클라우드 상에서 모든 API에 접근하기 위한 진입점이 되는  게이트웨이의 성격을 가진 녀석이다. 서비스 전체 구성 안에서 로그인과 로깅과 같은 공통 관심사를 처리할 수 있는 필터링 부터, 특정 API 로 흐름을 이동시켜주는 라웉이 기능까지 가지고 있다.

- zuul 1 버전은 서블릿을 사용했었지만, zuul 2 부터 netty 를 사용하고 있다.


<img src="/images/tech/zuul.png"/>
<img src="/images/tech/zuul2.png"/>


netflex 에서 제공하는 모듈을 바로 활용하기에는 러닝 커브가 높다. 또한 자바 기반의 환경이 아닌 그루비 기반으로 필터를 작성해야하는 부분이 있어 조금 부담스러운 면이 있다.

## Zuul 과 Spring Cloud Netflex

이 때문에 스프링 클라우드에서 하위프로젝트 [spring cloud neflex](https://cloud.spring.io/spring-cloud-netflix/multi/multi__router_and_filter_zuul.html)
가 만들어졌다.

https://github.com/Netflix/zuul

https://spring.io/projects/spring-cloud-netflix

[Baeldung 가이드](https://www.baeldung.com/zuul-load-balancing)

[Baeldung ](https://www.baeldung.com/spring-rest-with-zuul-proxy)

https://spring.io/guides/gs/routing-and-filtering/


### zul 과 spring security

https://github.com/shuaicj/zuul-auth-example

https://www.baeldung.com/spring-cloud-securing-services


### sample

모든 소스는 [github repository](https://github.com/glqdlt/zuul-edge-service.git) 에 올려 두었다.

```xml
zuul.routes.game1.url=http://localhost:9090
zuul.routes.game1.path=/nmp/**
zuul.add-proxy-headers=true
server.port=8080
```

.url 과 .path 의 차이는 아래와 같다.

- .url 만 선언할 경우에 route_name 인 game1이 자동적으로 url path가 된다

> http://localhost:8080/game1/....

- 위 설정처럼 .url 과 .path 를 설정할 경우 url 엔드포인트는 아래와 같다.

> http://localhost:8080/nmp/...

```java

@EnableZuulProxy
@SpringBootApplication
public class ZuulEdgeApplication {

    @Bean
    public SimpleZullFilter simpleZullFilter(){
        return new SimpleZullFilter();
    }

    public static void main(String[] args) {
        SpringApplication.run(ZuulEdgeApplication.class, args);
    }
}

```

아래는 필터이다.
필터는 4가지의 type이 있다.

- pre

- post


```java

@Slf4j
public class SimpleZullFilter extends ZuulFilter {
    @Override
    public String filterType() {
        return "pre";
    }

    @Override
    public int filterOrder() {
        return 1;
    }

    @Override
    public boolean shouldFilter() {
        return true;
    }

    @Override
    public Object run() throws ZuulException {

        RequestContext requestContext = RequestContext.getCurrentContext();
        HttpServletRequest request = requestContext.getRequest();

        log.info("request to ==> {}",request.getRequestURL());

        return null;
    }
}


```
내가 원하는 것은  reverse proxy 인데, zuul을 활용하면 이를 쉽게 처리할 수 있어 보인다. 야호


## Ribbon

음.

찾아보다 Ribbon 이란 게 그런걸 하는 거 같아서 살펴보았다.

Ribbon 은 로드밸랜서의 역활을 하는 녀석이다.



https://spring.io/guides/gs/client-side-load-balancing/

예제를 살펴보면 흥미로운게 나온다.

아래 설정과
```yml
say-hello:
  ribbon:
    eureka:
      enabled: false
    listOfServers: localhost:8090,localhost:9092,localhost:9999
    ServerListRefreshInterval: 15000
```

```java
@SpringBootApplication
@RestController
@RibbonClient(name = "say-hello", configuration = SayHelloConfiguration.class)
public class UserApplication {

  @LoadBalanced
  @Bean
  RestTemplate restTemplate(){
    return new RestTemplate();
  }

  @Autowired
  RestTemplate restTemplate;

  @RequestMapping("/hi")
  public String hi(@RequestParam(value="name", defaultValue="Artaban") String name) {
    String greeting = this.restTemplate.getForObject("http://say-hello/greeting", String.class);
    return String.format("%s, %s!", greeting, name);
  }

  public static void main(String[] args) {
    SpringApplication.run(UserApplication.class, args);
  }
}
```

```java
public class SayHelloConfiguration {

  @Autowired
  IClientConfig ribbonClientConfig;

  @Bean
  public IPing ribbonPing(IClientConfig config) {
    return new PingUrl();
  }

  @Bean
  public IRule ribbonRule(IClientConfig config) {
    return new AvailabilityFilteringRule();
  }

}
```

이 코드를 보면, RestClient Service 에 Ribbon 을 통해서 로드밸런스를 적용할 URL 을 service ID 로 등록하고, n개 이상의 resource server 에 ping pong 을 통해 부하가 덜 한 쪽으로 돌려주는 역활을 하는 것 같다.

와우 스바라시.

어쨋든 내가 기대한 것은 Ribbon 이 아님.

남은 것은 Eureka 인데, 이 녀석은 뭘 하는 지 궁금해졌다.


https://dzone.com/articles/spring-cloud-netflix-load-balancer-with-ribbonfeig

https://supawer0728.github.io/2018/03/11/Spring-Cloud-Ribbon%EA%B3%BC-Eureka/

## Eureka


유레카는 아래 블로그에 잘 정리되어 있다. 나중에 읽어봐야겠다

http://kerberosj.tistory.com/226
