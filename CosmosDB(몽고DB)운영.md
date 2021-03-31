
## 정렬 커맨드는 INDEX가 있는 키에만 동작을 한다.


조회 쿼리를 날렸을 때, order by 와 같은 정렬 구문을 쓰기도 한다.

몽고DB도 그런지 모르지만, cosmos db에서는 index가 잡혀있지 않으면 order by 가 동작하지 않는 이슈가 있었다.

실제 공식문서에도 위 이슈에 대한 내용이 나와있다.

https://docs.microsoft.com/ko-kr/azure/cosmos-db/sql-query-order-by#remarks
