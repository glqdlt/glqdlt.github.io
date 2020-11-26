
자바의 Optional 이 flatMap() 이 존재하고, wrapping 하며, generic 처럼 반환되는 타입을 보장한다는 점 때문에 모나딕(모나드하다) 이라고들 얘기를 하더라.

처음엔 그런가보다 싶었는데, 함수형 개념을 이해하면 할수록 괴리감이 생겼다.

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
