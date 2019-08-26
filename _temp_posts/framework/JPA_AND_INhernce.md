
JPA 에서 상속 모델의 구현은 참 난해하다.

김영한님의 JPA 책에서도 그렇고, [Baeldung 가이드](https://www.baeldung.com/hibernate-inheritance) 에서도 똑같은 데.. 엔티티 클래스에 대한 정의에 대한 내용만 있을 뿐 실제 이를 활용하는 Repository(또는 DB기준 한정적인 의미인 DAO) 기준으로의 내용은 없다.

위의 가이드의 경우에 슈퍼테이블의 PK를 하위 테이블에도 PK 로 JOIN 하는 식별 관계 방법을 얘기하는 데, 굳이 저렇게 하지 않고 비식별관계(부모의 키를 자식에서 PK로 사용하지 않는 것) 으로 처리할 수 있을까를 고민해봤다. 기본적으로 상속 관계의 매핑은 @ID 를 하나만 있어야한다고 강제화하기 때문에 불가능하다.
아래 에러 메세지를 주구장창 볼 것이다.

```

org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'localContainerEntityManagerFactoryBean' defined in class path resource [com/glqdlt/ ....]: Invocation of init method failed; nested exception is java.lang.ClassCastException: org.hibernate.mapping.JoinedSubclass cannot be cast to org.hibernate.mapping.RootClass
```

이 경우 상속으로 처리할 것이 아니라, 필드에 집약 처리 즉 관계 매핑으로 처리해야 한다. 집약 관계로 처리한 것은 아래 뽀너스에서 실제 코드를 다루면서 이야기 하겠다.

우선 실무 기준으로 있엇던 일을 얘기하면, 게임 포털 쿠폰과 프로모션을 설계할 때의 일화이다.

쿠폰의 스케줄과 이름 사용 스케줄링 등의 메타 테이블이 되는 테이블이 있고, 이를 참조하는 단일 쿠폰 테이블과 복수 쿠폰 테이블이 있다.

erd 로 표현하면 아래와 같다.

<img src="/images/couponerd.png"/>

여기서 단일 쿠폰이란 쿠폰 시리얼코드는 하나이지만 쿠폰 사용을 여러명이서(무제한 이거나 또는 유효 횟수 제한을 두거나) 사용할 수 있는 쿠폰을 의미한다. 

복수 쿠폰이란 실제로 우리 일상생활에서 흔히 보이는 쿠폰을 의미한다. 각 쿠폰은 고유의 시리얼 번호가 있고, 단 하나의 쿠폰은 단 한명만 사용할 수 있다.


아래는 실제 클래스 소스들 중 확장(상속) 관계를 정의한 소스 일부이다.

```java

@Entity
@Table(name = "coupon")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "type", discriminatorType = DiscriminatorType.INTEGER)
public class Coupon {
    ...
}

@Entity
@Table(name = "single_coupon")
@DiscriminatorValue("0")
public class SingleCoupon extends Coupon implements CouponSerial {
    ...
}

@Entity
@Table(name = "multiple_coupon")
@DiscriminatorValue("1")
public class MultipleCoupon extends Coupon implements CouponSerial {
    ...
}

public interface CouponSerial {

    String getSerialCode();

    void setSerialCode(String serialCode);

}

```

클래스 자체는 별 특징없는 일반적인 확장 구성이다. 


여기서 우리가 고민해보아야할 것은 쿠폰이 단일 쿠폰과 복수 쿠폰으로 물리적으로 데이터 자체는 나누어져 있지만, 사용자 관점에서 조회 시에 모든 쿠폰을 논리적으로 하나의 테이블에 있다고 가정하고 조회를 해보고 싶을 경우가 있다.

위처럼 외래키 관계매핑이 아닌 상속 관계일 경우에 기본적으로 JPA 의 CRUDRepository 를 상속해서 만들어지는 SimpleRepository의 경우에는 이는 불가능하다. 이럴 경우 아래의 솔루션을 생각해볼 수 있다.

1. 슈퍼 타입의 레포지토리, 서프 타입들의 레포지토리를 조회 시에 서비스 로직 상에서 데이터를 스트림 join fork 해서 처리한다.

2. 데이터베이스에 모든 쿠폰을 엮은 ViewTable 을 만든다.

3. 조회 시에 쿼리를 직접 JOIN 해서 조회한다.

첫번째 방안은 Pageable 처리가 아니라면 구현해볼 법 하다. 하지만 정공 법은 아니고, 연산 과정도 매끄럽지가 않다.

두번째 방안은 사용 데이터베이스에 의존적이 됨으로 ORM 의 순수 컨셉과는 거리가 먼 방법이다.

세번째 방법이 정답인데, 이를 어떻게 구현할것인가가 관건이다.

세번째를 구현하는 방법은 여러가지가 있다. entitymanager 에서 criteria builder 를 통해 직접 JPQL 을 만드는 방법이나 이를 한번 매핑한 queryDSL 라이브러리를 사용해보는 방법도 있다. 또는 @Query 어노테이션을 통해서 JPQL 을 사용하거나, Native Query 를 사용해 볼 수도 있다.

하지만 이렇게 되면 Read 용 Repository 따로, Create Update Delete 가 포함된 Repository 가 따로 구현 되어서 사용해야될 것 같다.. 뭔가 깔끔한 방법이 없을까? 

관련해서 찾아보면 @NoRepositoryBean 어노테이션 관련 키워드가 나온다. 이 녀석은 뭘까?

[Baeldung](https://www.baeldung.com/spring-data-jpa-method-in-all-repositories) 의 가이드를 보면 이 녀석은 우리가 일반적으로 사용하는 SimpleJpaRepository 를 확장시켜서 특별한 메소드를 추가하고 싶을 때 사용하는 녀석임을 알 수가 있다.

이 녀석을 엮어서 3번째 방법을 생각해보면 CouponRepository 에 findAllCoupons 라는 메소드를 정의해서 이를 구현시켜서 사용할수도 있다. 이렇게 되면 기본 SimpleJpaRepository 가 만들어주는 Coupon 엔티티에 대한 CRUD 외에도 findAllCoupons() 메소드를 통해 하위 타입의 테이블이 Join 된 검색 쿼리를 사용할 수 있게 된다.



## 뽀너스

아까 위에서 비식별관계 일 때에는 상속관계를 사용하지 못한다고 했었다. 이 말에 대해 궁금한 사람들이 많을 것이다. 이는 무엇인지 실제 소스를 보면 이해하기 쉬울 것이다.

```java
public class Coupon {
    private Integer couponId;
    private Integer gameId;
    private String name;
    private Date since;
    private Date until;
    private boolean enable;

    ... getter/setter
}

@Entity(name = "coupon")
@Table(name = "coupon")
public class CouponEntity extends Coupon {
    private Integer couponId;
    private Integer gameId;
    private String name;
    private Date since;
    private Date until;
    private boolean enable;

    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Integer getCouponId() {
        return couponId;
    }
    ....
}

public interface CouponRepo extends Repository<CouponEntity, Integer> {
}

@Entity(name = "multiple_coupon")
@Table(name = "multiple_coupon")
public class MultipleCoupon extends Coupon implements CouponSerial {
    private CouponEntity coupon;
    private Boolean used;
    private String serialCode;
    private Long serialId;

    @ManyToOne
    @JoinColumn(columnDefinition = "coupon_id")
    public CouponEntity getCoupon() {
        return coupon;
    }
    ...
}

```

위 코드를 보면 알겠지만 기존 상속 매핑에서 Coupon 클래스는 슈퍼 타입이었으나 집약 관계가 되면서 Coupon 클래스는 단순히 메타 데이터가 되는 (어떻게 보면 @MapperdSuperClass 개념이라고 보면 된다.) 형태가 되어 버렸다.

실제로 상속(확장) 을 통한 엔티티 관계 설정 시에는 식별 관계가 되어야 하는 등, 제약 사항이 너무나 많다. 그래서 나 같은 경우는 위 예시처럼 Coupon 이라는 메타 클래스를 만들고, 이를 확장하는 엔티티와 UI Form  에서 사용되어 매핑 될 CouponForm 이라는 확장 클래스를 만들어서 사용을 주로 한다. CouponForm 에는 @ID 에 매핑이 되는 필드도 필요 없으며, Regex 처리를 위한 어노테이션을 주렁주렁 달아도 문제없기 때문에 많이 사용하고 있다. 이 외에도 비식별관계로 설정시에도 용이하고, 객체 지향적으로 처리할 수 있다. 물론 단 옆 자리의 JINA 님이 가장 극혐하는 소스코드와 파일 갯수가 많아 지거나 처럼 컨트롤러에서 엔티티를 바로 매핑해서 CRUD 하려는 자가 있다면 많은 눈초리를 받을 것이다.