
스프링 웹 프레임워크는 어떻게 동작하는지에 대한 기본 서술.

자바 EE에서 웹의 흐름은 아래와 같다. 

### 요청 
사용자 URL 접근 --> 웹 어플리케이션 서버 --> 서블릿 컨테이너 --> 서블릿 --> 내부 로직

### 응답
내부 로직 --> 서블릿 --> 서블릿 컨텐이너 --> 웹 어플리케이션 서버 --> 사용자 처리 결과

여기에 스프링 프레임워크는 일종의 기생충과 같다.



### 요청 
사용자 URL 접근 --> 웹 어플리케이션 서버 --> 서블릿 컨테이너 --> 서블릿 --> 내부 로직 ( 스프링 웹 컨테이너 --> 스프링 빈 --> 내부 로직 )

### 응답
내부 로직 ( 스프링 웹 컨테이너 --> 스프링 빈 --> 내부 로직 ) --> 서블릿 --> 서블릿 컨텐이너 --> 웹 어플리케이션 서버 --> 사용자 처리 결과


즉, WAS 안의 또 다른 WAS 처럼 구조가 짜여있다.

뭐랄까 회사 조직도로 보면, 사장입장에서 부서들이 있는 데, 부서 안에는 또 팀이 있고, 팀 안에는 파트가 있다.

사장 입장에서 'ㅁㅁ일을 해줘' 라고 얘기하면, 부서에서 처리되는 줄 알지만, 실상 파트까지 내려가게 될 것이다.

이런 구조는 업무 유연성을 위해서 있는 개념이다. 테크니컬 용어로는 느슨한 연결이라고 하지

조금 더 이를 JAVA EE 와 스프링 프레임워크 용어로 설명하면 아래와 같다.

<img src="https://www.baeldung.com/wp-content/uploads/2016/08/SpringMVC.png">

사용자 URL 접근 --> WAS --> Servlet Container(Application Context, Servlet Context) --> Servlet ( Dispatch Servlet --> HandlerMapping --> Controller --> Service --> Component --> Service --> Controller --> ViewName --> Dispatch Servlet --> ViewResolver --> View )

Application Context 는 전역에서 구동되는 공유 메모리 경계이고,

Servlet Context 는 해당 서블릿 내부에서만 존재하는 메모리 경계이다.

Servlet Context에서 Application Context 는 접근되지만, 반대로는 안된다.

보통 Application Context는 로깅, 모니터링 유틸 같은 공통 모듈이 자리잡을 수 있다.

서블릿 컨텍스트는 원룸으로 생각하면 된다. WAS 라는 거대한 건물에 방을 나누어서 세를 내놓는거다.

HandlerMapping 은 URL 요청에 대한 제어를 담당한다. 그 이후에 컨트롤러로 가는데, 보통 컨트롤러가 처리하면 되지 않나 싶을수 있다.

HandlerMapping  과 Controller 를 분리하는 것은 URL 이라는 개념으로 접근하면 '/hello/world' 라는 ENDPOINT PATH 는 단 하나처럼 보이지만,

(GET) '/hello/world' , (POST) '/hello/world' 로 올 때나, '/hello/world?supportBean=simpleSpringBean' 과 같은 어떠한 파라미터에 따라 처리하는 주체가 달라질 경우에 대한 처리를

컨트롤러에 위해서 이다.

지금까지만 해도 컨트롤러 없이 핸들러 매핑으로만 설계 된다면, '/hello/world' 라는 문자열에 대한 처리를 하는 핸들러 매핑만 복붙처럼 3개가 나온다. 뭔가 이상하지 않은가?

즉 특정 URL 요청에 대한 책임만 핸들러 매핑에게 위임하고, 세부 로직이나 세부적인 문제는 핸들러매핑이 컨트롤러에게 위임하는 개념이다.

본부장 -> 실장 -> 팀장 이런느낌이랄까?


스프링 2.5까지는 위에 Controller 를 직접 구현해서 HandlerMapping 에 지정을 해주어야 했다. 

다만 이후 버전에서는 어노테이션 기반으로 유연하게 작성하기가 쉬워지게 되었다, 어노테이션이 선언되면 HandlerMapping 에 각 매처들을 다 등록을 시켜준다.

이 경우 소스에 사실상 하드코딩 기반이다 보니 되려 불편한 경우가 생긴다. 예를 들면 공통 모듈 생성하는 식으로 처리할 때나

동적으로 handlerMapping 을 조작하고 싶거나 할때의 예이다.




https://www.baeldung.com/spring-handler-mappings


위 예시를 참고해서 스프링에서 제공하는 기본 구현체로 샘플을 만들어보았다.

```
@EnableWebMvc
@Configuration
public class SomeConfiguration {

    /**
     * url 패턴에 반응하는 단순한 핸들러 매핑을 빈으로 등록한다.
     * 핸들러매핑 빈 타입은 스프링에서 DispatchServlet 이 동작할 때, for 문을 돌며 적당한 핸들러에게 요청이갈수 있도록 처리 된다.
     * <p>
     * 아래 예시에서는 /hello/World 라는 endpoint 로 요청 오면 simpleMyController 라는 이름의 컨트롤러 빈에게 처리 되도록 한다.
     * simpleMyController 는 Controller 를 구현해야 한다. 만약 구현하지 않은 일반 객체라면, ModelAndView 가 반환되지 않기 때문에 우리가 흔히 생각하는 브라우저 에 결과가 노출되지 않는다.
     * 결국 The DispatcherServlet configuration needs to include a HandlerAdapter that supports this handler 라는 에러와 함께 처리를 하지 못한다.
     *
     * @return
     */
    @Bean
    public SimpleUrlHandlerMapping simpleUrlHandlerMapping() {
        SimpleUrlHandlerMapping simpleUrlHandlerMapping = new SimpleUrlHandlerMapping();
        Map<String, Object> urlMap = new HashMap<>();
        urlMap.put("/viewName/*", simpleMyController());
        urlMap.put("/null/*", simpleClass());
        simpleUrlHandlerMapping.setUrlMap(urlMap);
        return simpleUrlHandlerMapping;
    }

    @Bean
    public SimpleViewController simpleMyController() {
        return new SimpleViewController();
    }

    @Bean
    public SimpleClass simpleClass() {
        return new SimpleClass();
    }

    public static class SimpleClass {
        public String hi() {
            return "hi";
        }
    }

    public static class SimpleViewController extends AbstractUrlViewController {

        @Override
        protected String getViewNameForRequest(HttpServletRequest request) {
            String zz = request.getRequestURI();
            if (zz.endsWith("/login")) {
                return getLoginViewName();
            } else {
                return getHelloViewName();
            }
        }

        public String getHelloViewName() {
            return "hello";
        }

        public String getLoginViewName() {
            return "login";
        }
    }

}

```

