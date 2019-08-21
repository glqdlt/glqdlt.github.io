---
layout: post
title:  "maven nexus"
author: "glqdlt"
---

maven nexus 는 자바 아티팩트를 저장하고 관리할 수 있는 솔루션이다. 대부분 maven install 할 때 일어나는 외부에서 라이브러리를 다운받아오느 ㄴ것이 maven central repository 에서 받아오는 것이다.

private maven nexus 구축에 대해서는 다른 포스팅에 작성해놓은ㄴ 게 있으니 해당 참고 

central repository 에 업로드 하는 과정은 아래에 기록했다.


central 업로드시의 약관 https://central.sonatype.org/pages/requirements.html

central.sonatype.orgcentral.sonatype.org
Requirements
Consuming from and publishing to the Central Repository made easy.
https://central.sonatype.org/pages/ossrh-guide.html

central.sonatype.orgcentral.sonatype.org
OSSRH Guide
Consuming from and publishing to the Central Repository made easy.
https://blog.geun.kr/83

Geun`s PageGeun`s Page
Maven Central에 Library Upload하기!!
1. 개요 - 개인 라이브러리를 메이븐 중앙 저장소에 올려, 다른 사람들과 손쉽게 공유할 수 있도록 한다. - https://bintray.com 와 같은 대행 서비스가 있다. - 저장소 관리 솔루션인 sonatype nexus 사에서 제공..
Feb 21st, 2017
(8 kB)
https://img1.daumcdn.net/thumb/R800x0/?scode=mtistory2&fname=https%3A%2F%2Ft1.daumcdn.net%2Fcfile%2Ftistory%2F232FDF4058AC44210E
개념은 이러하다 central repository 에 올리는 절차가 확장성이 없다고 한다.  https://maven.apache.org/repository/guide-central-repository-upload.html 참고
그래서 sonatype 의 OSSRH  서비스를 이용하면 편리하게 할수있는 데, 원리는 sonatype 의 maven nexus 에 distribute 해주면, 여기 업로드 된 아티팩트가central repository 에 미러링 되면서 업로드 되는 방식이다.
필요한 사항은 sonatype nexus 에 나의 group ID 에 해당하는 고유 repository path 를 할당받아야 함으로, sonaType jira 에 해당 path 를 생성해달라고 등록 티켓을 요청해야한다.