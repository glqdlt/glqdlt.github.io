---
layout: post
title:  "스프링과 Validation"
author: "glqdlt"
---

# 들어가며

웹 개발자에게 빠질 수 없는 것이 Validation 체크이다. 화면 개발에서도 접하게 되고, 실제 비지니스 로직에 근접 했을 때에도 검증을 하게 된다.

# 본문

기본적으로 자바에서는 [JSR(Java Spec Request)380](https://beanvalidation.org/2.0/spec/)에 정의 된 내용을 바탕으로 Java bean 의 유효성 검사를 수행할 수 있다.

JSR 380 스펙(Java Spec Request 스펙 이란 말이 되지만 -_-;;) 에서는 @NotNull, @Min 과 같은 어노테이션 기반의 Validation Pattern 을 객체의 필드에 선언함으로써 쉽게 관리할 수 있게 정의를 하고 있다.

JSR 380 의 스펙을 반영한 인터페이스는 validation-api 가 있고, 이의 구현체로는 대표적으로 Hibernate Validator 가 있다.

# 실습

이 내용의 레퍼런스는 [Baeldung 가이드](https://www.baeldung.com/javax-validation) 를 기본으로 한다.

Maven Dependency 로 아래 lib 들을 선언 해준다.

Pom.xml
```xml

<dependency>
    <groupId>javax.validation</groupId>
    <artifactId>validation-api</artifactId>
    <version>2.0.0.Final</version>
</dependency>

<dependency>
    <groupId>org.hibernate.validator</groupId>
    <artifactId>hibernate-validator</artifactId>
    <version>6.0.2.Final</version>
</dependency>
<dependency>
    <groupId>org.hibernate.validator</groupId>
    <artifactId>hibernate-validator-annotation-processor</artifactId>
    <version>6.0.2.Final</version>
</dependency>

```

나의 경우는 서비스로 넘기기 전에 컨트롤러단에서 검증을 수행하고 있다.

컨트롤러에서는 검사를 할 파라미터 객체에 @Valid 를 선언해주고, 메소드에 BindingResult 가 들어올 수 있도록 선언해준다.

@Valid 선언이 빠졌다면 Validate 대상으로 인식하지 못하게 된다. 또한 BindingResult 가 넘어오지 않는다면, 에러 유무에 따른 핸들링을 로직 상에서 처리할 수가 없다.

기본적으로 Validate 정의는 파라미터 객체 안에서 작성이 되고, BindingResult 를 통해 검증 결과를 얻어올 수 있다. 이 BindingResult 를 통해 에러를 thorwing 해서 ControllerAdvisor 나 직접 에러 결과를 클라이언트에 전달 시켜줄 수 있다.

```java
@PostMapping(value = "/gameConfig/update")
public void updateEventConfig(@Valid ConfigForm form, BindingResult bindingResult) {
    ....
      try {
            if (bindingResult.hasErrors()) {
                // 아래 FieldError 안에는 Form 안의 필드에 정의 된 내용들을 가져올 수 있다.
                   for (FieldError err : bindingResult.getFieldErrors()) {
                    //    정의 된 에러 메세지를 가져올 수 있다.
                       String message = err.getDefaultMessage();
                       ...
                   }
                    throw new WrongFormException("입력 데이터를 확인 해주세요.");
                }
            }

            ... 
             } catch (WrongFormException e) {
            return new ResponseEntity<>(new ErrorDataTableObject(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    ....
}
```

Valid 대상인 Form 은 자신의 필드에 정규식 패턴을 등록할 수가 있다.
```java

public class ConfigForm {
private Integer seq;
@Pattern(regexp = "^[A-Za-z0-9가-힣]*$", message = "쿠폰이름의 서식을 확인해주세요.")
@NotBlank(message = "쿠폰 이름을 확인해주세요.")
private String couponName;
@NotNull(message = "지급 시작일을 확인해주세요.")
@DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
private Date startDate;
@NotNull(message = "지급 종료일을 확인해주세요.")
@DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
private Date endDate;
@NotNull(message = "보상 종류를 확인해주세요.")
private EventCouponRewardType rewardType;
@NotNull(message = "보상 값을 확인해주세요.")
@NumberFormat
private Long rewardValue;
@NotNull(message = "기간을 확인해주세요.")
@NumberFormat
private Integer period;
@NotBlank(message = "보상 메세지를 확인해주세요.")
private String giftBagMessage;
@NotNull(message = "최대 지급 횟수를 확인해주세요.")
@NumberFormat
private Integer countMaximum;
@NotNull(message = "디바이스 제한을 확인해주세요.")
private boolean deviceLimit;
@NotNull(message = "지급 여부를 확인해주세요.")
private boolean issueStatus;
@NotNull(message = "프로모션 여부를 확인해주세요.")
private boolean promotionStatus;
@Pattern(regexp = "^[A-Za-z0-9]*$", message = "프로모션의 서식을 확인해주세요.")
private String promotionId;
@NotNull
private CouponFormType formOption;
```

