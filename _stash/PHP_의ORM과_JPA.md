팀 동료가 PHP 기반의 아웃소싱 산출물을 마이그레이션이 하는 일에서 알게 된 사실들

PHP 에도 ORM 이 있다.

쿼리빌더와 옐로퀀트라는 것이다.

쿼리빌더도 그렇도 퀀트도 mybatis 처럼 단순히 쿼리매퍼(또는 micro orm 이라는) 인줄알았다.

ORM 의 가장 큰 특징은 수많은 객체관의 관계 설정을 매핑하기 위한 지연로딩이 특징이다.

관계 변경 유무를 확인하기 위한 더티 테크 등이 있다.

이러한 특징을 성능 해소를 위해서 캐싱 전략 등도 얘기해볼수 있고..

옐로퀀트는 엔티티의 변경사항에 대한 이벤트 구독 기능(https://laravel.com/docs/5.7/eloquent#events)을 제공한다.

WOW 놀라웠따.

JPA에는 없나 찾아보니깐 있더라 https://www.baeldung.com/jpa-entity-lifecycle-events
