
자바의 Optional 이 flatMap() 이 존재하고, wrapping 하며, generic 처럼 반환되는 타입을 보장한다는 점 때문에 모나딕(모나드하다) 이라고들 얘기를 하더라.

처음엔 그런가보다 싶었는데, 함수형 개념을 이해하면 할수록 괴리감이 생겼다. 이해하는 함수형 프로그래밍이란 객체 자체에 일련의 변화를 주지 않고, 즉 객체 상태를 변경시키지 않은 채로

어떠한 목적이 필요할 때에만 사용할 수 있는 로지컬한 부분만 정의를 하여서, 어떠한 목적이 필요한 시점을 제어하자 (어떠한 함수를 실행할 시점을 제어) 하는 데에 의의를 두는 걸로 이해하고 있다.

객체지향 프로그래밍은 어떠한 로직이 진행되는 데에 있어서 객체의 상태를 변화시켜가며 작업하는 일련의 실행이 되어야 넘어가는 (상태가 변화되어야 하는) 패러다임이기에 기능은 항상 즉시실현되어야한다. 즉 객체의 상태를 어떻게 처리할 것인가? 에 초점을 맞춘것이 객체지향 방법이다.  객체지향에서의 함수란 메소드라고 불리우는 것이 이해가 되는 것이다. (메소드는 객체안에 존재하는 기능이며, 일반적으로 객체 자신의 속성을 변화시키는 데 사용한다.)

().().().()

반면 함수형 프로그래밍은 이름 그대로 객체가 먼저가 아닌, 함수가 먼저 나오는 것처럼 연산에 대해 집중하기 때문에 값의 상태가 어떻건 말건 연산 위주로 정의를 하는 데에 목적을 두고 이 연산이 언제, 어떻게 실행시킬것인가? 에 대해 관점을 둔다. 연산 자체가 실행되는 데에 초점을 두기 떄문에, 연산이 꼭 성공할 수 있도록 외부의 변화에 방어가 되어야 하는 함수 내부의 고유한 CONTEXT를 가지게 된다. 고유한 CONTEXT를 가지는 탓에 함수를 값으로도 취급할 수 있다. 왜냐면 함수 안에 고유한 데이터가 존재하기 때문이다.

(((())))

모나드의 쓰임새는 파이프 연산과 유사하다. 어떠한 값이 함수체이닝을 통해 가공될 것이며, 이 가공되는 과정이 안전하게 전달되고 가공하는 함수를 연결(바인딩) 하는데에 의의를 둔다.

이런 개념으로 봐서는 자바 Optional 은 모나딕하지 않다.

이유는 Optional.get() 은 이미 연산된 값이 들어가있는 것을 반환할뿐이다. 즉시냐 나중에 실행되냐의 차이가 크다.

```
public final class Optional<T> {

    public static <T> Optional<T> of(T value) {
        return new Optional<>(value);
    }
    
        private Optional(T value) {
        this.value = Objects.requireNonNull(value);
    }

    public T get() {
        if (value == null) {
            throw new NoSuchElementException("No value present");
        }
        return value;
    }
    
    public<U> Optional<U> flatMap(Function<? super T, Optional<U>> mapper) {
        Objects.requireNonNull(mapper);
        if (!isPresent())
            return empty();
        else {
            return Objects.requireNonNull(mapper.apply(value));
        }
    }
    
}
```
flatMap은 순수하게 일련의 Optional 로 평면화를 할 뿐이다. 

참고로 평면화란 ["a", ["b","c"], ["d",["e","f"]]]  이러한 복잡한 집합 엔트리를 단순하게 ["a","b","c","d","e","f"]  이런식으로 특정 목적의 균일한 요소로 평탄화하는 것을 의미한다.

아래는 실제로 내가 흉내내본 모나딕한 자료구조이다.

```
  public class MyMonad<T> {
        private T value;

        private Function<T, T> binder;

        public MyMonad(T value, Function<T, T> binder) {
            this.value = value;
            this.binder = binder;
        }

        public T getValue() {
            return binder.apply(value);
        }
    }
```

값의 원형에 매핑되는 바인더는 실제 getValue()를 호출하는 시점에 실행이 된다.

Optional과 사뭇 느낌이 다르다.
