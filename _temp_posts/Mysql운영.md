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

---


[2018-11-11-커버링인덱스.md](2018-11-11-커버링인덱스.md)

---

mysql 은 아래 쿼리를 통해 인덱스 정보를 알 수 있다. 

```
SELECT * FROM information_schema.`COLUMNS` AS c join information_schema.KEY_COLUMN_USAGE AS k  on k.COLUMN_NAME = c.COLUMN_NAME
```

단일 인덱스, 복합인덱스를 구분해야하는 경우가 필요할 수도 있다. 만약 복합인덱스라면 CONSTRAINT_NAME (index이름) 을 group by 로 집계하여 2개 이상인지를 체크하면 가능하다.

```
SELECT k.CONSTRAINT_NAME, COUNT(*) FROM  information_schema.KEY_COLUMN_USAGE AS k 

WHERE k.TABLE_SCHEMA = 'db_1' AND k.TABLE_NAME = 'table_1'

GROUP BY k.CONSTRAINT_NAME
```


mysql 은 아래 쿼리를 통해 INNODB에서 생성된 인덱스를 확인할 수 있다.

```
SELECT * FROM information_schema.INNODB_TABLES AS t JOIN information_schema.INNODB_INDEXES AS s ON s.TABLE_ID = t.TABLE_ID
```



---

---
layout: post
title:  "뭐 같은 sql 서버"
author: "glqdlt"
---

nvarchar 와 nchar 같은 형태는 처음 보았다.

자세한 것은 MS 공식문서를 보면 알수 있다. (https://docs.microsoft.com/ko-kr/sql/t-sql/data-types/nchar-and-nvarchar-transact-sql?view=sql-server-ver15
)

앞의 prefix 가 n은 national 이란 의미이고, 유니코드를 간접적으로 의미한다.

national 이 붙는 자료형을 썻을 때의 이점은 유니코드 문자를 저장할 길이 수를 가늠하기 쉽다는 점이다.

non national은 아스키 문자열 기반이기 때문에,  

national 이 붙은 키워드는 non-national 에 비해 같은 사이즈일 경우의 스토리지 용량 2배 가까이 크다.

아래의 상황표를 보면 이해하기 쉽다.

|example|type|byte|column size|
|---|---|---|---|
|hello|non-national|5|5|
|hello|national|10|5|
|안녕하세요|non-national|10|10|
|안녕하세요|national|10|5|

national 은 모든 글자를 유니코드로 저장하기 때문에 각 글자마다 2byte 를 먹는다. (다만 확장 유니코드 체계 65000 번 이후의 유니코드는 조합글자이기 때문에 4byte씩 먹는다)
다만, 컬럼 사이즈는 유니코드로만 일관되게 저장이 되기 때문에 유추하기 쉽다. 한,영이 뒤섞여도 글자 갯수로 접근하면 되니깐.

반면 non-national 의 경우 아스키코드로 저장이 되고, 지원을 넘어선 글자는 유니코드 체계로 저장이 된다.


 

https://docs.microsoft.com/ko-kr/sql/t-sql/data-types/data-type-conversion-database-engine?view=sql-server-ver15


varchar 컬럼에 인덱스가 잡혀있는데, 쿼리가 nvarchar 로 타입캐스팅이 일어나면서 varchar 인덱스를 타지 않는 이슈가 있었다.

https://docs.microsoft.com/ko-kr/sql/connect/jdbc/setting-the-connection-properties?view=sql-server-ver15

https://docs.microsoft.com/ko-kr/sql/connect/jdbc/understanding-data-type-differences?view=sql-server-ver15


https://docs.microsoft.com/ko-kr/sql/t-sql/data-types/data-type-conversion-database-engine?view=sql-server-ver15

우연찮게 찾은 내용은 정말, 단비 같은 도움이었다.

JDBC SQLSERVER 에서는  

실제로 적용한 내용은 아래 db커넥션 쿼리에 attribute 를 하나 더 추가하는 식으로 진행했었다.

> jdbc:sqlserver://127.x.x.x;databaseName=xxx_database;;sendStringParametersAsUnicode=false



정리하면 우선 SQL SERVER JDBC 에서는 String Param Type 에 대해서는 유니코드로 무조건 발송하게 된다.

문제는 파라미터의 값이 DB로 들어갈 때의 아규먼트가 NVarchar 로 강제 캐스팅 하게 되어 있다.

이렇게 되면 해당 파라미터에 매칭이 되는  컬럼이 varchar 이더라도 nvarchar 로 처리가 되게 된다. 이슈는 varchar index로 잡혀있다면, 이 경우에는 nvarchar index로 접근하게 되면서 varchar index 가 동작하질 않는다.






```
2020-03-16 22:26 glqdlt 안녕하세요~ @전능하신DBA  님	
2020-03-16 22:26 glqdlt 밤늦게 실례드립니다. 금일 천백십일 포탈 오픈 DB 대응해주시고 계시다고 하셔서 연락드립니다.
2020-03-16 22:26 전능하신DBA 네 안녕하세요
2020-03-16 22:27 glqdlt 네, xx님 편으로 쿼리 튜닝 이슈가 있다고 연락을 받아서요.
2020-03-16 22:28 glqdlt 혹시 관련해서 DBA님에게 문의드려도 괜찮을까요?
2020-03-16 22:29 전능하신DBA 네 괜찮습니다
2020-03-16 22:29 glqdlt 저희 내부에서 짐작가는게 있어서 변경작업을 한게 있는데요. 해당 변경건이 제대로 튜닝이 되었는지 확인을 하고싶어서요.
2020-03-16 22:29 전능하신DBA 네네
2020-03-16 22:29 glqdlt 제 담당은 cms 이고, java 어플리케이션입니다.
 database 커넥터로 jdbc에서 String param type 을 모두 nvarchar 로 질의하는 경우가 있더라구요. 관련해서 수정했습니다.
2020-03-16 22:30 glqdlt declare @p1 int
set @p1=10
exec sp_prepexec @p1 output,N'@P0 nvarchar(4000)',N'SELECT
            A.uid, cn AS pid,

            ...

            level, exp
        FROM A테이블 A
            LEFT JOIN B테이블 B
                ON A.uid = B.uid
            LEFT JOIN C테이블 C
                ON A.uid = C.uid
                AND C.usable = 1
        WHERE nickname = @P0

select @p1

파라미터 p0 nickname 컬럼은 실제 컬럼에서는 varchar 인데, nvarchar 로 처리되는것 같더라구요.
2020-03-16 22:30 전능하신DBA 제가 알기로 타입을 설정하지 않으면 기본 nvarchar로 컨버팅되어 요청을 하는것으로 알고있습니다.
2020-03-16 22:31 전능하신DBA 네 맞습니다
2020-03-16 22:31 glqdlt 네 그래서 mssql 공식 문서를 참고해서 아래 내용으로 변경했습니다.
2020-03-16 22:32 glqdlt https://docs.microsoft.com/ko-kr/sql/connect/jdbc/setting-the-connection-properties?view=sql-server-ver15
2020-03-16 22:32 glqdlt 여기서 sendStringParametersAsUnicode 옵션을 변경했습니다 false로
2020-03-16 22:32 glqdlt 관련해서 위 쿼리가 varchar 로 적용되는 지 확인하고 싶은데요. 지금 쿼리 요청을 발생시키고, 특정 DB 로그 확인을 하고싶습니다. 도움주실수있으세요?
2020-03-16 22:33 전능하신DBA 이렇게되면 반대의 케이스가문제가 될수 있기 때문에
2020-03-16 22:34 glqdlt 네
2020-03-16 22:34 전능하신DBA 해당 코드를 수정해가는게 좋을것으로보입니다.
2020-03-16 22:36 glqdlt 네, 관련해서 명시적으로도 진행할 계획입니다.
2020-03-16 22:36 glqdlt db 로그 확인은 어려울까요?
2020-03-16 22:36 전능하신DBA 프로파일 지원 가능합니다
2020-03-16 22:36 전능하신DBA 변경값 확인 가능합니다
2020-03-16 22:36 glqdlt 네 감사합니다. 해당 db는 아래입니다.
zkcgostoplogdb01.d5e8adf9784a.database.windows.net;databaseName=MMatgo_GAMEDB
2020-03-16 22:36 전능하신DBA 지금도 프로파일 중입니다
2020-03-16 22:37 전능하신DBA 호출하시면됩니다.
2020-03-16 22:37 glqdlt 넵 지금 쿼리 발생중입니다
2020-03-16 22:38 전능하신DBA 닉네임 부분 이슈입니다.
2020-03-16 22:38 전능하신DBA declare @p1 int
set @p1=84
exec sp_prepexec @p1 output,N'@P0 varchar(8000)',N'SELECT
            A.uid, cn AS pid,

            ...

            nickname ...
           
        FROM A테이블 A
            LEFT JOIN B테이블 B
                ON A.uid = B.uid
            LEFT JOIN C테이블 C
                ON A.uid = C.uid
                AND C.usable = 1


        WHERE nickname = @P0

select @p1
2020-03-16 22:38 전능하신DBA 이부분도 닉네임입니다.
2020-03-16 22:39 glqdlt 네 맞습니다. varchar로 변경은 되었네요
2020-03-16 22:39 전능하신DBA varchar 뿐 아니라 사이즈도 함께 변경해주셔야 합니다
2020-03-16 22:40 glqdlt 네
2020-03-16 22:40 전능하신DBA nickname 사이즈에 맞게 함께 수정 부탁드립니다~
2020-03-16 22:40 glqdlt 혹시 궁금한 점이 있는데요,
2020-03-16 22:41 전능하신DBA 넵
2020-03-16 22:41 glqdlt nickname 자체가 varchar 컬럼인데, nvarchar 로 조회될때 인덱스를 안타게 되나요?
2020-03-16 22:41 전능하신DBA 네 내부적으로 타입이 일치하지 않으면 인덱스가 있더라도 사용을 할수 없습니다~
2020-03-16 22:41 glqdlt 아...
2020-03-16 22:41 glqdlt 네, 이해했습니다.
2020-03-16 22:41 전능하신DBA 특히 java개발시 기본 호출이nvarchar라 더 조심을 하셔야 합니다 ㅠ
2020-03-16 22:42 glqdlt 네 감사합니다 mssql 은 금번이 처음 경험이어서.. 잊지못할거같네요..
2020-03-16 22:42 glqdlt mssql jdbc 기본값이 String 파라미터의 값을 유니코드 형식으로 발송하는게 기본값인걸로 보이구요.
2020-03-16 22:42 glqdlt varchar index를 nvarchar 로 접근하면서 인덱스 장애가 발생하네요.
2020-03-16 22:43 전능하신DBA 네 맞습니다.
2020-03-16 22:43 glqdlt 컬럼 길이값(length) 지정에 대해서는 성능튜닝으로 이해하며 될까요?
2020-03-16 22:43 glqdlt varchar index 안타는 것에 대해서는 이해되었습니다
2020-03-16 22:43 전능하신DBA 네 성능이슈가 발생합니다.
2020-03-16 22:44 전능하신DBA 사이즈가 증가하면 증가한만큰 더 많은 데이터 비교가 들어가기 때문에
2020-03-16 22:44 glqdlt 네
2020-03-16 22:44 전능하신DBA 사이즈도 맞게 설정해서 조회를 해야합니다~
2020-03-16 22:44 glqdlt 아 그렇군요. 감사합니다.
2020-03-16 22:44 glqdlt 저희 내부에도 이슈 회고를 작성해야했는데, DBA님 덕분에 도움이 정말 많이 되었습니다.
2020-03-16 22:44 전능하신DBA 도움이 되었다니 다행입니다~

```

결국 내용은 sql server jdbc 에서는 데이터 타입을 명시적으로 진행하는 것이 좋다. 

기본적으로 어떠한 쿼리든 암시적 변환으로 처리가 된다.

```
암시적 및 명시적 변환
데이터 형식은 암시적으로 또는 명시적으로 변환할 수 있습니다.
암시적 변환은 사용자에게 보이지 않습니다. SQL Server는 데이터 형식을 자동으로 변환합니다. 예를 들어 smallint를 int와 비교하는 경우 smallint는 비교가 진행되기 전에 암시적으로 int로 변환됩니다.
GETDATE() 는 암시적으로 날짜 스타일 0으로 변환합니다. SYSDATETIME() 은 암시적으로 날짜 스타일 21로 변환합니다.
명시적 변환은 CAST 또는 CONVERT 함수를 사용합니다.
CAST 및 CONVERT 함수는 값(지역 변수, 열 또는 다른 식)을 한 데이터 형식에서 다른 형식으로 변환합니다. 예를 들어 다음 CAST 함수는 $157.27의 숫자 값을 '157.27'의 문자열로 변환합니다.
SQL

복사
CAST ( $157.27 AS VARCHAR(10) )  
Transact-SQL 프로그램 코드를 ISO에 맞추려면 CONVERT 대신 CAT를 사용하고, CONVERT의 스타일 기능을 사용하려면 CAST 대신 CONVERT를 사용합니다.
다음 그림에서는 SQL Server 시스템 제공 데이터 형식에 허용된 모든 명시적 및 암시적 데이터 형식 변환을 보여 줍니다. 여기에는 xml, bigint 및 sql_variant가 포함됩니다. 할당 시 sql_variant 데이터 형식에서 암시적으로 변환되지는 않지만 sql_variant로는 암시적으로 변환됩니다.

```

> 암시적 변환은 사용자에게 보이지 않습니다. SQL Server는 데이터 형식을 자동으로 변환합니다. 예를 들어 smallint를 int와 비교하는 경우 smallint는 비교가 진행되기 전에 암시적으로 int로 변환됩니다.
>


이 대목을 잘 봐야하는데, 컬럼이 small int 이고, where 절의 비교 타입 자료형이 int 타입인 경우엔..

smallint 컬럼이 where 절로 비교될 때, 암시적으로 int 형으로 변경이 된다.

이해하기로는 small int 형에 small int 절 인덱스가 잡혀 있다면, 불가능하다. 아마 정수형이라서 될건데..

String 의 경우는 문제가 생긴다. ascii 와 unicode 는 문자체계 자체가 달라서, 인덱스가 문제 생긴다.

varchar 인덱스의 경우 nvarchar 와는 문자 체계가 다르기 때문이다.  



위는 Mybatis 를 사용하는 쿼리이고, JPA 의 경우에는 참고한 [레퍼런스(https://woowabros.github.io/study/2019/01/25/sqlserver-jdbc-driver.html)](https://woowabros.github.io/study/2019/01/25/sqlserver-jdbc-driver.html)

에서 도움이 많이 되었다. 

jpa 에서는 jpql 을 직접 조작해서 (대문자 CAST 로 작성해야함을 주의) 하거나,   @Nationalized 어노테이션을 통해 내부적으로 CAST  하도록 명시 해주어야 한다.

https://stackoverflow.com/questions/46188918/casting-integer-to-string-in-jpql


---

[레퍼런스1](https://jupiny.com/2017/11/07/docker-mysql-replicaiton/)
[레퍼런스2](https://www.percona.com/blog/2016/03/30/docker-mysql-replication-101/)


데이터베이스 의 인덱싱에 대한 내용
[인덱싱](http://tech.kakao.com/2018/06/19/AscendingAndDescendingIndex/)

---


ISOLIATION 에 잘 정리한블로그
- https://suhwan.dev/2019/06/09/transaction-isolation-level-and-lock/
- https://joont92.github.io/db/%ED%8A%B8%EB%9E%9C%EC%9E%AD%EC%85%98-%EA%B2%A9%EB%A6%AC-%EC%88%98%EC%A4%80-isolation-level/

---