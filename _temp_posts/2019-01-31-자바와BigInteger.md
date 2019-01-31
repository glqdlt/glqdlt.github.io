---
layout: post
title:  "자바와 BigInteger"
author: "glqdlt"
---

이 아티클을 보는 사람들 중에, 조 단위의 금전을 가지고 있는 이들이 몇이나 있을까 싶다.
세상 앞일은 모른다지만 나는 1조 근처라도 만저볼까 싶기도 한데,
현재 회사에서는 카지노 갬블류 게임을 다루고 있다. 갬블류 게임에서는 한 게임당 몇 만원이아니라 몇 백만원 부터 수 억~ 수 조 단위로 게임 머니가 왔다 갔다 하는 게 일반적이다.
이런 큰 규모의 정수를 다룰 일이 거의 없었다 보니, 처음 입사했을 때에는 제법 낯설어서 고생을 했었다.

# 자바에서의 정수

자바에서는 정수형을 다루는 게 다른 언어에 비해 제약이 많다.
예를 들어 아래 코드를 통해서 자바의 원시형 타입의 최대 허용하는 정수 최대치를 얻을 수 있다.

```java
...
  @Test
    public void maxValues() throws Exception {
        int maxInt = Integer.MAX_VALUE;
        long maxLong = Long.MAX_VALUE;
        Assert.assertEquals(2147483647, maxInt);
        Assert.assertEquals(9223372036854775807L, maxLong);
    }
...

```
코드에서 바로 읽히듯이 int 형은 약 20억 까지의 정수를 담을 수 있고, long 형은 약 900만 경의 숫자를 다룰 수 있다.

사실 카지노 게임에서 한 게임에서 얻는 게임머니를 900만 경을 넘기는 경우는 드믈다. (자세히는 알지 못하지만, 갬블류 관련 법규에도 한 게임당 걸거나 얻을 수 있는 게임머니에 제약이 있는 것으로 안다.) 그렇지만 만약의 만약의 상황에 유저의 지갑이 900만 경을 넘길 수 있을 수는 있다. 이것이 합법적으로 얻게 되었다면 유저는 큰 기쁨과 쾌감을 느낄 텐데, 이에 대한 대비가 되어 있지 않아 제대로 처리되지 않는다면 900만 게임머니를 가질 정도로 애착이 있는 골수 유저 한명을 잃어버릴 가능성이 크다.

# BigInteger

자바에서는 long 의 대략 900만경 의 값보다 더 많은 아니 무수한 값을 가질 수 있는 BigInteger 라는 정수형 객체가 있다. 이 객체를 통해서 처리할 수 있다.

```java

public class BigIntegerTest {

    private String FIXTURE = "123123123123123123123123213123";
    private String FIXTURE2 = "12312312312312312312312321312312313";

    @Test
    public void maxValues() throws Exception {
        int maxInt = Integer.MAX_VALUE;
        long maxLong = Long.MAX_VALUE;
        Assert.assertEquals(2147483647, maxInt);
        Assert.assertEquals(9223372036854775807L, maxLong);
    }

    @Test
    public void parseStringToBigInteger() throws Exception {
        BigInteger ee = new BigInteger(FIXTURE);
        Assert.assertEquals(1, ee.compareTo(BigInteger.valueOf(Long.MAX_VALUE)));
    }

    @Test
    public void bigIntegerAdd() throws Exception {
        BigInteger long1 = new BigInteger(FIXTURE);
        BigInteger long2 = new BigInteger(FIXTURE2);
        BigInteger added = long1.add(long2);
        BigInteger multiplied = long1.multiply(long2);
        Assert.assertEquals(0, multiplied.compareTo(new BigInteger("1515930344759173588002419047460360445030616201788182957436083499")));
        Assert.assertEquals(0, added.compareTo(new BigInteger("12312435435435435435435444435525436")));
    }

    @Test
    public void compareTo() throws Exception {
        BigInteger long1 = BigInteger.valueOf(Long.MAX_VALUE);
        BigInteger long2 = BigInteger.valueOf(Long.MAX_VALUE);
        BigInteger long3 = BigInteger.valueOf(Long.MAX_VALUE - 1);
        int ee = long1.compareTo(long2);
        int e2 = long1.compareTo(long3);
        int e3 = long3.compareTo(long1);
        Assert.assertEquals(0, ee);
        Assert.assertEquals(1, e2);
        Assert.assertEquals(-1, e3);
    }
}

```

이 BigInteger 에는 재밌는 부분이, ```BigInteger.valueOf(Long val)``` valueOf 객체 생성 static 메소드를 통해 만들거나, ```new BigInteger(String value)``` 객체 생성자를 호출해서 BigInteger 객체를 만들 수 있는 데, 아이러니하게 왜 valueOf 에서 Long 형만 지원하는 지를 생각해볼 수 있는 데, 아마 valueOf static 메소드는 대부분 객체 캐싱 기능을 담고 있어서 이미 만들어진 객체가 있다면 해당 객체를 반환해주는 기능을 통해 비효율적인 객체생성을 막고자 한다. 무한한 정수를 다루게 되면 이 캐싱이 무거워지다보니, 900만 경의 제한 기준치가 있는 long 원시형만 valueOf 에서 다루어지는 것으로 생각을 해본다.