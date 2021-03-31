MSA 환경에서 보면 서비스 노드 별로 (조직 별로) DB를 할당 받기도 하는 데, 나의 경우 Mysql을 받아서 사용했었고 이에 따른 여러 서비스 경험담을 기록해보고자 한다.


## A버전에서 B버전으로 패치를 하는데, 컬럼명을 바꾸어야 하는 경우.

바꿀 컬럼명을 미리 만든다.원본이 id 이고 바꿀 이름이 identity 라면..  __identity 라는 컬럼을 미리 만든다. 이는 나중에 __ 로 시작한것이 신규 추가 된 것임을 인지하기 위함이다.

그리고 쿼리 상에서 셀프 조인을 한다. mysql은 셀프 테이블 조인이 안되기 때문에 서브쿼리로 임시 테이블과 조인하듯이 처리해야한다. 공짜니깐 그러려니 하자. 마지막에 where 절은 필요없어 보이지만 mysql 구문 해석기에 warning 으로 나오기 때문에 넣었다.

```
update table AS a JOIN (SELECT * FROM table) AS b  ON a.`pk` = b.pk SET a.__identity = b.id  WHERE a.`pk` = b.pk
```

마지막으로 최종확인 한 후에, __ 접두어가 붙은 컬럼의 컬럼명을 바꾼다 (__를 제거한다)

이후 서비스 패치 이후에 어느정도 모니터링 후, 과거 컬럼을 제거한다.

## 특정 select 결과를 update 하고 싶을 때

이 경우는 table 에 추가된 컬럼의 값이 다른 테이블의 결과일 때(즉 fk일때) update 치고싶은 상황에서 써먹었다.

사실 위의 자기자신의 테이블의 컬럼명을 바꿀 때와 상황이 같다.

```
UPDATE user_authorities AS a JOIN user_info AS b ON a.user_id = b.username SET a.user_no = b.`no` WHERE a.user_id = b.username
```



## select 결과를 insert

가장 많이 썻던 거다. 신규 테이블에 기본 데이터를 넣는 상황에서,  외부 테이블의 참조키를 삽입해야하는 경우이다.

```
INSERT INTO test_b (id, `varchar`) SELECT b.id,b.varchar FROM test_a AS b
```
