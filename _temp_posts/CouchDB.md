---
layout: post
title:  "CouchDB & PouchDB"
author: "glqdlt"
---

카우치베이스와 헷갈려 하면 안된다. 

카우치 디비와 카우치베이스는 [다른 존재](https://www.couchbase.com/couchbase-vs-couchdb)다.

[CouchDB](http://couchdb.apache.org/)에서 영감을 얻은 client 용 [PouchDB](https://pouchdb.com/) 가 있다.

내가 원하는 목적은 카우치디비 와 파우치디비를 연동해서

네트워크가 단절 된 환경에서도 서비스의 일부분을 사용하게 하고 싶었다.

문제는

카우치디비 <--> 파우치디비, direct session 이 아니라

카우치디비 <--> WAS <--> 파우치디비, 와 같은 3-tier 서비스 구성에서 인증과 보안 그리고 메타데이터(데이터 동기화를 위한) 관리가 되는가가 궁금했다.