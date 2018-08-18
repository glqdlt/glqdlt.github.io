---
layout: post
title:  "OracleJDK VS OpenJDK"
author: "glqdlt"
---

# 들어가며

현재 팀 내에서 Python2.x 업데이트 지원 문제로 Python3.x 대의 마이그레이션에 대한 검토를 진행하고 있다.

나 같은 경우에는 자바 플랫폼의 웹 개발자이다 보니 먼 나라 이야기처럼 보이지만, 최근 Oracle의 강경한 정책 변화가 있었던지라 (그간 바빠서 잊고 있었던) 앞으로 자바에 대한 로드맵을 어떻게 따라가야 하나 하는 고민이 조금 있었다.


# 애증의 OracleJDK

기본적으로 한국에서의 자바 프로그래머에겐 윈도우 환경에 OracleJDK install를 설치해서 시작하는 것이 뭐랄까, Hello World와 같은 느낌이었다.

나 역시도 OracleJDK를 설치해서 시작하는 강의를 들었었고, 사회에서의 시작도 OracleJDK로 접했었다. 대부분의 대한민국 SI 환경에서는 Oracle JDK 와 Oracle DB를 접하다 보니 Oracle 이란 단어에 많이 친근들 할거란 생각이다. (...)


# OracleSE 는 무료인가?


이에 대한 것은 [토비님의 자바는 무료인가?]()에 양질의 정보를 얻을 수 있었다.

+ 현재까지의 자바SE는 무료가 맞다.

+ 자바SE 말고 자바 SE Support(SE Subscription & with tool) 가 유료이다.

+ 다만 임베디드 디바이스나 클라이언트 형 자바(브라우징 등)에 사용 되는 자바는 유료이다.

+ Oracle의 입장은 언제나 비슷했는 데(돈을 내놔라), 최근에 힙 한 이유는 클라우드 기반의 가변형 서버 플랫폼 등이 유행함에 따라 서버 n당 라이센스가 들쑥날쑥 해지다보니 Oracle이 강경하게 나오게 된 것이다.

여기까지만 봐서는 평범한 개발자 입장에서는 큰 문제가 없어 보이는 데, 요즘 [뒤숭숭한(Okky의 유저님이 직접 문의)](https://okky.kr/article/482664) 내용을 보면 이유를 알 수 있다. [(Azul의 oracle 정책 변환에 대한 입장글)](https://www.azul.com/products/zulu-and-zulu-enterprise/zulu-enterprise-java-support-options/)

+ 2019년 01월부터 배포되는 Java SE 8 공개용 업데이트(보안 패치 포함)도 이제 자바 SE Support 라이센스가 있어야지 사용(업데이트) 할 수 있다.

+ 문제는 다른 대안의 Java 로드맵이 여러가지 이유로 각 릴리즈 메이저 버전의 LTS를 6개월 동안 만 관리를 한다. 

+ 2019년 01월에 종료 되는 Oracle JDK8 버전을 마지막으로 기존 SE를 무료로 쓰던 사용자는 OpenJDK11 LTS 버전을 쓸 수 밖에 없게 된다.(기존 Jdk8,9,10 은 LTS가 끝났기 때문) 

+ 2018년 말 ~ 2019년 01월 간에 OracleSDK8 --> OpenJDK 11을 마이그레이션 하면서 생겨날 레거시시스템들 간의 충돌에 대해 관리자가 부담을 안을 수 있다. 또한 LTS 기간이 6개월 단위로 짧음으로 단순 보안패치가 아닌 정기적으로 6개월마다 메이저 버전 업이 됨에 따른 서드 파티 충돌 여부 및 성능 이슈를 점검해야한다.

<img src="https://i.stack.imgur.com/mmVJs.png">

+ LTS 릴리즈가 빨리지니, LTS가 끝난 과거 버전에 대해서 support 를 받고 싶으면 Zulu Enterprise 나 Oracle SE Supported 를 받아야 한다.

+ 애초에 이런 거 신경 안 쓰고(VM튜닝이나 보안 패치 등) 써왔던 영세한 회사라면 그냥 OpenJDK나 Zulu를 쓰던지, 과거 버전의 Oracle Se를 계속 쓰면 된다. (...)


심심에서 Oracle의 유료 지원 서비스에서 뭘 지원하는가를 [찾아](http://www.oracle.com/technetwork/java/javaseproducts/overview/java-advanced-overview-1592685.html)보았다.

OpenJDK 의 bin에 보면 위에서 제공하는 tool들이 없는 것을 볼수 있었다. 

아래는 이번 포스팅을 쓰면서 공부한 내용들.

# OpenJDK

OpenJDK는 뭐랄까 사용하기가 여간 까다로운 놈이다. [official](http://openjdk.java.net/install/)만 보아도 openjdk는 소스코드만 배포하고 있는 형태이니, 이걸 쓰라는건가 싶기도 한데, 그나마 리눅스에는 관대한 지 리눅스 관련 패키지는 직접 배포하고 있어서 사용을 간간히 하는 사람들이 있는 듯.

윈도우 환경에서는 [ojdkbuild](https://github.com/ojdkbuild/ojdkbuild) 오픈 프로젝트나, [zulu](https://www.azul.com/downloads/zulu/) 클라이언트 .msi 를 받아서 설치하는 식으로 해결할 수 있다.

# Zulu

zulu는 azul에서 만든 jdk 이다. 기본 base를 openjdk 를 하고 있고(날먹), 다양한 플랫폼(window,mac,linux) 등에 쉽게 사용 될 openjdk builder를 제작하고 QA까지 마쳐서 배포해주는 형태라고 한다. 기본적으로 zulu는 opensource 로 운영되고, free 이지만, 상업적 용도의 지원이나 서버용 엔터프라이즈 tool들이 포함된 zing 이 있다.

zulu 같은 경우엔 그냥 openjdk를 어디서나 쉽게 쓰게 해주는 wrapping 느낌으로 받아들이면 될 것 같다. 참고로 zulu 입장에서는 openjdk 가 완벽한 자바 스펙을 구현한 [TCK](http://openjdk.java.net/groups/conformance/JckAccess/jck-access.html).[TCK WIki](https://en.wikipedia.org/wiki/Technology_Compatibility_Kit) 이다 보니, 해당 워런티를 오라클에 지불 해야한다고 한다... 흠좀무

# HotSPOT

OpenJDk의 설명이나, Zulu 의 소개글을 보면 HotSPOT이 많이 나온다. 예전 OracleJDK를 설치해서 사용할 때에도 ```java -version``` 명령을 찎어보면 HotSPOT VM 뭐시기뭐시기로 나오던 것이 기억이 나는 데, 도대체 HotSPOT이란 무엇일까?

[자바 가상 머신 위키](https://ko.wikipedia.org/wiki/%EC%9E%90%EB%B0%94_%EA%B0%80%EC%83%81_%EB%A8%B8%EC%8B%A0)를 보면 아래와같은 설명을 볼 수 있다.

>핫스팟 가상 머신(영어: HotSpot Virtual Machine)같은 고성능 가상 머신 구현

달랑 이 문장가지고는 뭔 소리인지는 모르겠다. 일단 JVM은 고슬링이 제안한 스펙이고, 핫스팟은 이를 잘 구현한 구현체란 이야기인가?


좀 더 쉬운 설명을 찾고자 구글링을 하던 도중 괜찮은 [stackoverflow 글](https://stackoverflow.com/questions/16568253/difference-between-jvm-and-hotspot)을 보게 되었다.

> HotSpot is an an implementation of the JVM concept. It was originally developed by Sun and now it is owned by Oracle. There are other implementations of the JVM specification, like JRockit, IBM J9, among many others.

위 답변에도 나오듯 HotSpot은 JVM을 구현한 구현체라는 의미로 보면 되는 것이었다. 기존에 Sun에서 개발했었는 데, 현재는 Oracle이 이에 대한 소유권을 가지고 있다고 한다.

다른 구현체들로는 JRockit, IBM J9 와 같은 다른 벤더들의 [구현체들](https://en.wikipedia.org/wiki/List_of_Java_virtual_machines#Free_and_open_source_implementations)이 있다고 하는 데, 리스트를 보니 생각보다 많다. 흠좀무.

여기서 재밌는 것은 위키에서 Hotspot에 대한 설명이 압권이다.

>the primary reference Java VM implementation. Used by both Oracle Java and OpenJDK.

(primary reference ..란다. WOW)

그리고 OpenJDK 를 Oracle에서 후원하고 개발에도 참여하고 있다 보니, OpenJDK도 HotSPOT VM을 사용하고 있는 걸 알 수 있다.

결국 OpenJDK를 wrapping 한 Zulu 역시 HotSPOT을 사용하게 되다 보니, OracleJDK에서 OpenJDK나 Zulu를 쓰더라도 유료 지원 서비스의 디테일한 차이나 update 릴리즈 속도 외의 차이는 없다고 볼 수 있다.

# OpenJDK의 흑역사

그런데 왜 OpenJDK를 사람들이 꺼려했을까? 단순히 사용하기 불편해서 였을까?
자세한 것은 [네이버 테크 블로그](https://d2.naver.com/helloworld/1219)에서 알수 있었다.

자바에서 Java SE는 표준 스펙인 JSR를 토대로 정의 된 것을 뜻한다. 정의 된 Java SE는 그를 구현하는 벤더들에 의해 개발되고 JKT 인증으로 '너 잘만들었음ㅋ' 라고 도장을 찍어준다. 문제는 Java의 7버전이라 보는 JDK7은 이 SE가 확정되기 전에 개발이 되었다고 한다[(OpenJDK 위키)](https://ko.wikipedia.org/wiki/OpenJDK). 

표준 스펙이 완성되기 전에 개발이 되었다는 이야기인데, 이 JDK7의 모체가 되는 것이 openjdk6 였다. 그러니깐 openjdk6를 베타 개발을 하고 java se 7이 만들어지기 전에 JDK7을 만든 것이다. 뭐랄까 김을 안에 넣고 밥을 겉에 싼 밥김 같은 느낌이다.

이런 흑역사 때문에 OpenJDK6 는 많은 문제가 있었다고 한다. 특히 OS과의 IO 관련 native 기능 쪽에 문제가 많았다고 한다.







# 레퍼런스

https://d2.naver.com/helloworld/1219


http://www.holaxprogramming.com/2014/09/24/java-open-jdk/

https://www.reddit.com/r/java/comments/8jvv8e/what_would_be_the_reasons_to_use_the_zulu_build/

https://stackoverflow.com/questions/25936712/what-is-the-difference-between-oracle-jdk-8-and-open-jdk-8


https://www.reddit.com/r/java/comments/6g86p9/openjdk_vs_oraclejdk_which_are_you_using/

https://www.quora.com/What-is-it-like-to-use-Azul-Systems-Zulu-JVM


https://okky.kr/article/482664

http://jsonobject.tistory.com/395


https://stackoverflow.com/questions/22358071/differences-between-oracle-jdk-and-openjdk

http://offbyone.tistory.com/288


