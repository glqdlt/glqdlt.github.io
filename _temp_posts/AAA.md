인터뷰 관련

Q. 다이어그램은 어느 수준으로 할 수 있나?
A. 다이어그램 그리는 것을 평가나 어느 척도로 말할 수 있는지를 모르겠다. 과거의 나는 다이어그램을 멋들어지게 그리고 싶어서 안 달난 적이 있다. 당시 조직장이 다이어그램을 그리는 걸 보고 칭찬해준 적이 있는 데, 이것이 나의 평가에 플러스가 될거라는 착각 떄문이었다. 나는 실제 업무 보다 설계단계에 시간을 많이 투자했다. 클래스 다이어그램은 마치 건축 설계도면처럼 장황하게 그리고 시퀀스 다이어그램을 매 로직마다 작성을 했다. 시간이 흘러서 보니, 내가 봐도 이해가 안되고 오히려 현재 구현된 소스와 동기화가 되지 않는 모습에 낙서보다 더 못한 다이어그램이 되었다. 후에 알게 되었지만, 객체지향의 거장 로버트 마틴의 UML 관련 책에서도 위의 나의 사례와 같은 얘기를 하며, 무엇이 중헌디? 라는 말을 하더라. 심지어 첫장부터 말이다.
 말이 많아졌는 데, 그래서 결국 하고 싶은 말은 대부분 커뮤니케이션을 위한 용도로만 다이어그램을 그리는 편이다. 객체 다이어그램은 IDE 의 디버깅 메모리 스냅샷이 훨씬 좋고, 유즈케이스 다이어그램은 프로젝트가 워낙 액티브하고 변경 되는 상황이 많아서 자주 바뀌는 탓에 의미가 없어서 잘 안 그린다. 대부분 업무 협업과 일 분배를 위해서 클래스 다이어그램과 타 조직과 서비스 플로우를 설명하기 위해서 시스템 구성도나 서비스 관점에서의 시퀀스 다디아그램을 자주 그리는 편이다.
클래스 다이어그램은 실제 구현체 보다는 전체 구조를 이해시키기 위한 슈퍼 타입 위주로 그리고, 앞으로 이렇게 할 것이다 라는 로드맵 수준의 몇몇 추상 클래스나 구현체를 그리는 편이다. 실제로 이런식으로 업무에서 활용했을 때 의사 전달이 명확해서 나도 편하고, 동료들도 편했다.  
시스템 또는 인프라 구성도는 노드 간의 연간관계 정도의 수준만 그린다. 매우 추상적이고, 갓 졸업한 학생도 이해할 수 있을 만큼 단순한 화살표로 그린다. 이는 협업 관계에 있어서 자신이 일해야할 시스템의 위치와 메세지를 주고 받을 바운더리가 어디까지 인지 이해하는 데 큰 도움을 준다.   시퀀스 다이어그램은 시스템 구성도를 조금 확장해서 그리는 식으로 한다. A와 B 시스템이 어떻게 메세지를 주고 받을지 일련의 흐름을 보여줌으로써 실제 로직 구현 단계에서 어떤 부분이 고려되야할 지 이해를 시켜줄 수 있다. 아마 시퀀스 다이어그램은 많은 이들이 그릴 것이다.

Q. 목업은 무슨 의미인가?
A. 간단한 컴포넌트의 경우 커뮤니케이션 단계에서 즉석에서 테스트 코드를 작성하는 편이다. 기획자와 GUI 를 놓고 이야기 할 시에는 머릿속에서 바로 코드가 떠오르는 경우라면 목업 UI를 정적 html 파일에 작성해서 바로 인터렉션 하는 편이고, 그 외의 경우는 노트에 드로잉 하며 설명을 나눈다.  드로잉 한 것은 기획자 1개 나 1개 복사를 해서 기획자가 추후에 기획문서를 작성할 때 참고할 수 있도록 하게 한다. 이게 불필요해보여도 매우 중요한 데, 기획자가 기획 문서에 몇일 밤을 새며 장황하게 완성 시킨 문서를 보면 기획자도 이해가 안될 떄가 있다. 나는 어떻겠는가? 그러면 쪼르르 달려가서 이게 무슨 의미냐란 얘기와 구현이 불가능하다는 이야기를 하게 되고 기획자는 다른 방안을 생각하느라 알게모르게 시간을 매우 허비하게 된다. 이는 아까운 추정한 일정의 시간을 대다수 허비하는 큰 문제가 있어서, 처음부터 손발 두발 다 쓰며 커뮤니케이션 하는 게 오히려 이득이더라.

Q. 협업 시에 어떠한 관점으로 일하나
A. 사실 애자일 관련 도구를 보면 기획자, 디자이너, 개발자 이렇게 3명이서 팀을 이루라는 전략이 종종 나온다. 실제로 이렇게 공식적이지는 않지만 물리적으로 자리가 떨어져있더라도 액티브하게 같이 붙어서 이야기하려고 노력한다. 이런 점이 높게 평가 되서 지금 조직에서 긍정적인 평가를 얻기도 했다.

Q. 디자인패턴에 대한 설명을 해보라.
A.  디자인 패턴은 모델링을 하다 보면 마주할 수 밖에 없는 필수요소라 생각한다. 다양한 패턴이 참으로 많은 데, 예를 들면 디자인패턴의 꽃이라 불리는 GOF의 디자인 패턴에 100가지 가까이 나오지만, 이는 여러 언어들의 총괄적인 부분이고 실제로 그 많은 패턴에서 절반정도만 실무에서 사용 했던 것 같다. 
주로 자주 사용하는 패턴은 설계할 때에 추상 클래스를 자주 사용하다 보니 자연스럽게 템플릿 메소드 페턴을 많이 사용하는 편이고, 고계함수를 사용할 떄 전략패턴에 사용하는 편이다. 함수형 프로그래밍을 좋아서 POJO 보다는 VO를 자주 사용한다. 그렇다 보니 빌더 패턴도 자연스레 자주 사용하는 편이다. 참고로 익페티브 자바의 빌더 객체를 생성하는 패턴 보다 롬복의 inner 정적 클래스의 정적 생성 메소드를 통해 빌더를 생성하는 걸 좋아하는 편이다. 그러고 보니 정적 팩토리 메소드 패턴도 자주 사용하는 편인데, 캐싱과 같은 메모제이션 기법을 사용하는 편은 아니고, 말 그대로 생성자를 줄줄이 적는 것 보다 메소드 명으로 의도를 명확히 할 수 있는 점을 생성자 대안으로 쓰는 정도이다. 
스프링 프레임워크는 AOP 를 많이 사용하다 보니, 프록시 패턴도 알게모르게 자주 쓴다고 할 수도 있겠다. 그리고 레거시 소스 코드를 리팩토링 하다 보면 자연스레 FACADE 패턴이나, 아답터 패턴도 종종 썼던 거 같다. 아 아답터 패턴은 JPA 에서 컨버터에서도 많이 썼다. 가장 끔찍한게 CommonDTO 뭐 이딴 정신나간 객체를 파라미터로 받고 메소드 성공 실패에대한 메세지를 return 클래스로 주는 서비스 코드가 굉장히 많았는 데, 꼴뵈기 싫어서 아답터 패턴을 자주 사용했었다. facade 패턴은 외부와 통신 협업 시에 끔찍한 200의 200의 200 이런 식의 응답값으로 받는 경우가 있었는 데, 외부에 노출안시키고자 랩핑을 했던 일이 있따. GUI 화면 개발에서는 자바스크립트로 데코레이터 패턴도 많이 사용한다. 예를 들면 갬블류에서는 숫자의 콤마를 붙이는 게 사업부 입장에서 매우 중요하게 보는 것 같더라. 그 부분 떄문에 실제 객체는 정수형이고 콤마가 없지만, 화면에 노출할 때에는 데코레이터 패턴으로 콤마를 붙여서 렌더링 시키는 식으로 하는 편이다. 좋아하는 앵귤러 프레임워크에서는 이를 파이프 라는 개념으로 부르기도 한다. 
옵저버 패턴도 많이 쓴다. 필터도 일종의 옵저버  패턴이지이니 자주 사용도 했던 거 같다. 스프링 프레임워크를 확장한다고 application context 가 생성되는 이벤트를 받기 위해서 이벤트로 옵저버 패턴을 쓰기도 했었고, 로그백 어펜더도 일종의 옵저버 패턴이고.. 화면에서 addEventListner 도 옵저버 패턴이다. 이건 SDK 개발할 때도 많이 썻었다, 인증이나 이벤트 를 메세지로 보내야 하는데 , 우리 회사는 슬랙 메센저랑 라인웍스 를 쓴다. 어떤 사람은 이메일로 받기를 원하고 그래서 그런 부분 떄문에 이벤트 리스너를 등록해서 이터레이블 돌면서 메세지를 알람시켜줬다.




Q. 검색 알고리즘
A. 

공간복잡도는 메모리 사용 규모를 의미한다. 시간복잡도는 알고리즘의 명령이 수행되는 횟수이고, 가장 최적의 알고리즘은 시간복잡도가 낮고 공간복잡도도 낮은 것이 좋지만, 사실상 시간복잡도가 낮으면 그만큼 연산에 필요한 공간복잡도가 높을 수 밖에 없는 반비례를 가지게 된다.

빅오표기법으로 안다. 빅오표기법은 알고리즘의 최악의 속도를 기준으로 한다. 실무에서는 최악의 속도를 측정하는것이 중요하니깐.

참고로

- 빅오는 최악의 시간

- 오메가는 최상의 시간

- 세타는 평균시간을 의미한다.


개인적으로는 알고리즘 성능에 대해서는 관심을 갖고 있지만, 실제 구현 단계에서의 고려를 할 기회는 거의 없었다. 그래서 위의 시간복잡도와 공간복잡도를 계산해서 구현체들을 어떠한걸 쓰는 게 좋을지에 대해 관심을 가지는 편이다. 간단히 일반적으로 알고 있는 알고리즘은 신입 시절 면접을 위한 수준의 이해와 구현 밖에 모른다. 병합정렬과 퀵 정렬에 대한 이야기가 주로 많다. 퀵 정렬이 가장 빠르지만 리스크도 있는 걸로 다들 안다. 사실 퀵 정렬이 병합정렬보다 빠른 이유는 내부 정렬 배열을 생성하는 로직에서 차이가 있다.

n 이 16이라고 가정하면

- O(1) 상수시간 
    
    - O(1) = 1

- O(log n) 로그 시간:  특정 요인에 의해서 n으로 순환하는 게 아니라 줄어드는 경우

    - O(log 16) = 4*4 = 16 =>  4
    

- O(n) 직선시간 : 

    - 막대기는 완곡한 대각선으로 그려짐

    - O(16) => 16

- O(n^2) 2차 시간 :

    - 막대기가 수평에 가깝게 변함

    - O(16^2) => 16 * 16 =  256

- O(C^n) 지수 시간

    - O(2^16) => (16 * 16  ) * ( 16* 16) => 65536




- 선택정렬 O(n^2) 

- 삽입정렬 O(n^2)

- 버블정렬 O(n^2)

- 병합정렬 O(log n)

- 퀵정렬 O(log n) 사실 퀵정렬은 특정한 상황에 최악의 상황이 나타날수있기 때문에 빅오 표기법으로는 O(n^2)가 맞다. 그러나 이런 경우에 대해 회피하는 방어 코드가 시중에 많이 보편화되어서 사실상 n log n 으로 보고 있다.

