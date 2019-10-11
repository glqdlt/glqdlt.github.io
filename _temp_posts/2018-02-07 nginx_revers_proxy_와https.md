---
layout: post
title:  "nginx"
author: "glqdlt"
---


리버스 프록시는 최근 클라우드 아키텍처에서 거의 기본이 되다 싶이 사용되고 있다. 자바 웹 개발 기준이지만 예전에는 apache 를 많이 사용했으나, 최근에는 nginx 를 많이 사용하고 있는 추세이다. 

역방향 프록시를 통해 얻을 수 있는 이점으로는 B-G-Deploy 라던지 header 조작 또는 url 라우팅, tls 보안(https) 등이 있다.

최근 추세는 LoadBalancer 라는 L4 LB 를 안 쓰고, L7 리버스 프록시 서버를 통해서 라우팅처리 등을 많이 쓰기도 한다. 대표적으로 gateway, edge 라는 키워드가 들어간 클라우드 솔루션들이 대표적이다. 참고로 우리는 ms 벤더의 azure 를 사용하고 azure 에서는 azure gateway 라는 것이 있다.

# revers proxy

리버스 프록시라 하면 역방향 프록시라는 의미이다. 왜 역방향일까? 최초에 프록시 기능이 사용된 것과 다르기 때문이다.

## forward proxy

일반(전통)적인 프록시를 포워드 프록시라고 한다. 

<img src="https://www.cloudflare.com/img/learning/cdn/glossary/reverse-proxy/forward-proxy-flow.svg"/>

출처 : [클라우드플레어](https://www.cloudflare.com/learning/cdn/glossary/reverse-proxy/)

정방향 프록시 서버는 내부 인트라넷 (nat)에서 외부의 서비스를 이용하는 아웃바운드 패킷 (http L7 계층)에 대한 핸들링을 위해 사용되어진다.

대표적으로 아래의 기능들을 사용한다.

- 특정 콘텐츠(url 등) 접근에 대한 접근 제어, 차단
- 인트라넷 내부 정보(내부 network 정보 등) 등을 감추기 위함
- 특별한 custom 헤더를 추가 삽입하기 위함
- 내부 감사, 감시를 위한 로그 처리를 위함

만약 당신의 회사에서 특정 웹 페이지에 접근할 때 정상적으로 처리가 되지 않거나, 리쿠르드(사람인 등)와 같은 취업 사이트를 몇 번 들락거렸더니 갑자기 팀장이 면담하자고 한다던지의 해프닝이 발생한다면.. 대부분 이 forward proxy 역활을 하는 무언가가 당신의 네트워크에 물려있다는 소리이다.

## reverse proxy

역방향 프록시는 정방향 프록시의 정반대의 흐름으로 처리가 된다. 역방향 프록시의 목적은 외부에서 내부를 감추기 위함이 목적이다 된다. 

즉, 정방향 프록시가 내부에서 밖으로 나가는 것에 대한 핸들링이라면 역방향 프록시는 외부에서 내부로 들어오는 경우의 핸들링이다.

<img src="https://www.cloudflare.com/img/learning/cdn/glossary/reverse-proxy/reverse-proxy-flow.svg"/>

역방향 프록시로 할 수 있는 건 아래와 같다. (위에서 서술하기도 했다)

- 로드 밸런싱

- 외부 공격 방어

- B_G_Deploy

- SSL 암호화

- 캐싱