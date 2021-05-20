깃허브에 보면 ReadMe.md 에 여러가지 멋진 벳지가 달려있는게 궁금했다.

예를 들면 [스프링 프레임워크](https://github.com/spring-projects/spring-framework)의 경우 아래처럼 빌드가 통과되었는지에 대한 벳지가 있다.

 ![](.github_badges_images/322958f5.png)


나도 저런 벳지들이 주렁주렁 달린 오픈소스 프로젝트를 해보고싶단 생각이 들었다.

자주 쓰는 벳지 태그에 대해 알아보고자 한다.

케빈님이 주도하는 [j8plus](https://github.com/Kevin-Lee/j8plus) 를 보면 많은 벳지들이 있다.



![](.github_badges_images/167386ac.png)

이를 기준으로 알아보려 한다.

# What is github badge?

깃허브 벳지는 ShieldsIO(https://github.com/badges/shields) 에 의해 유행이 시작된 것으로 확인 된다.

image 사이즈를 실제 화면에서 테스트하기 위해 제공되던 서비스가 있었는데, URL PATH에 특정 width와 height 를 기입하면 이에 맞는 이미지를 응답해주는 서비스였다.

마찬가지로 ShiledIO 도 이와 같은 구문이다.


```
![Generic badge](https://img.shields.io/badge/{front text}-{rear text}-{color}.svg)
```

마크다운 ReadMe.md 에 아래 구문을 기입하면 아래와 같은 벳지가 웹페이지에 노출이 된다.

```
![Generic badge](https://img.shields.io/badge/version-1.1.1-green.svg)
```
![](.github_badges_images/315d5486.png)


## 서비스에서 제공하는 벳지들

유행에 힘입어 아얘 서비스에서 제공해주는 벳지도 있다. ShieldIO 의 경우 사실상 정적인 리소스이기 때문에 어떠한 작업을 하고 벳지 URL을 계속 갱신해주어야 한다.

이를 자동으로 할수있도록 여러 서비스에서 벳지 기능을 제공하기도 한다.


### Travis badge


### Build badge

Github 에서도 동적인 벳지를 제공한다.

```
[![Build Status](https://github.com/프로젝트주소/badge.svg)](https://github.com/프로젝트주소/actions?workflow=Build)
```

### Release badge

### Coverage badge


[Coverage](https://coveralls.io/) 는 테스트 커버리지를 측정해주는 서비스이다. travis ci 처럼 github 통합이 잘되어서 유명세를 탔다.

아웃사이더님의 소개가 참고가 많이 되었따.

https://blog.outsider.ne.kr/954

```
[![Coverage Status](https://coveralls.io/repos/프로젝트경로/badge.svg)](https://coveralls.io/r/프로젝트경로)
```

### Maven Central badge

구문 분석 
```
[![Maven Central](https://maven-badges.herokuapp.com/maven-central/프로젝트명/badge.svg)](https://search.maven.org/메이븐central아티팩트경로)
```

공식 레퍼런스는 https://github.com/jirutka/maven-badges 에서 참고할수 있다.


### 기타 다양한 벳지


아래 블로그에 정리가 된게 많다.

https://www.lesstif.com/gitbook/github-project-status-badge-54952153.html