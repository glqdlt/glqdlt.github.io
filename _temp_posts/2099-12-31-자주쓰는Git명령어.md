---
layout: post
title:  "자주쓰는 Git 명령어 모음"
author: "glqdlt"
---

자주 쓰는 Git 명령어를 정리합니다.


## config

+ user이름 확인
    ```
    git config user.name
    ```

+ user이름 설정
    ```
    git config user.name=jhun
    ```

+ user메일 확인

    ```
    git config user.email
    ```

+ user메일 설정

    ```
    git config user.email=dlfdnd0725@gmail.com
    ```

+ gui 편집기 사용하고 싶을 때

    ```
    git config --global core.editor notepad
    ```

## commit

+ git stage 올리기

    ```
    git stage ./${filename}
    ```

+ git commit 

    ```
    git commit 버그수정
    ```

> core.eidotr 설정을 했다면 GUI 편집창이 뜰 것이다.

+ git 커밋 트리 수정하고 싶을 때

    ```
    git rebase -i
    ```

+ 지금까지 한 작업 내역들을 트랙킹하고자 할 때

    ```
    git reflog
    ```


## release

+ git tagging

    ```
    git tag ${tag_version}
    ```

+ 만든 tag들을 보고 싶을 때

    ```
    git tag
    ```


## remote

+ git remote branch deleted update

    ```
    git fetch -p ${remote_name}
    git fetch --prune ${remote_name}
    ```

    또는

    ```
    git remote update --prune
    ```

