
## 몽고DB 에서 정렬(order by ..)은 INDEX 에만 동작을 한다.


SQL 에서 조회를 하는 쿼리에는 order by 와 같은 정렬 구문을 많이 쓴다.

몽고DB도 그런지 모르지만, cosmos db(몽고DB) 에서도 SQL처럼 index 가 잡혀있지 않으면 order by 가 동작하지 않는 것을 겪었다.

실제 공식문서에도 위 이슈에 대한 내용이 나와있다.

> ORDER BY절을 사용 하려면 정렬 중인 필드에 대 한 인덱스를 인덱싱 정책에 포함 해야 합니다. Azure Cosmos DB 쿼리 런타임은 계산 된 속성이 아닌 속성 이름에 대 한 정렬을 지원 합니다. Azure Cosmos DB는 여러 ORDER BY 속성을 지원 합니다. 여러 ORDER BY 속성을 사용 하 여 쿼리를 실행 하려면 정렬할 필드에 복합 인덱스 를 정의 해야 합니다.

https://docs.microsoft.com/ko-kr/azure/cosmos-db/sql-query-order-by#remarks
