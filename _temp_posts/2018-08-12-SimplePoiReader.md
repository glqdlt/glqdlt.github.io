---
layout: post
title:  "팀 공통 모듈을 만들며.."
author: "glqdlt"
---


사용 방법은 아래와 같다.

나는 xml 설정보다 자바 클래스 기반의 설정을 좋아하기에 자바 클래스 기반으로 설명하겠다.

간단하게 ```@Configuration``` 어노테이션으로 bean을 등록해준다.


```java

// PoiConfig.class

@Configuration
public class PoiConfig {

    @Bean
    SimpleReader simpleReader(){
        return new SimpleReader();
    }

}

```

simple-poi-reader 개발을 고민하면서 메소드를 static으로 처리를 할까 고민을 많이 했었다.
따로 static으로 하지 않은 것은 다양하게 사용하도록 하고 싶어서 이렇게 구현 했다.

기본적으로 스프링 기반의 bean으로 사용시에 scope가 singleton 으로 등록되기 때문에 그런 점도 있다.


```java

@Service
public class SomeService {

    @Autowired
    SimpleReader simplePoiReader;


    ...

    public List<ExcelData> read(MultipartFile excel) throws IOException {

        try (InputStream is = excel.getInputStream()) {

            List<ExcelData> result = SimpleReader.read
            (is, 3,

                    (ReaderHandler<ExcelData>) (x) ->
                            ExcelData.builder()
                                    .seq((int) x.getCell(0).getNumericCellValue())
                                    .regDate(x.getCell(1).getStringCellValue())
                                    .rank((int) x.getCell(2).getNumericCellValue())
                                    .author(x.getCell(3).getStringCellValue())
                                    .title(x.getCell(4).getStringCellValue())
                                    .build()
                                    
            );
                                    
            return result;

        }
    }
}

```

simple-poi-reader 는 실제 작업을 수행하는 read 메소드의 파라미터로 InputStream 과 skip할 최대 row 값 그리고 실제 작업을 수행할 콜백함수(functional interface)를 인자로 받는다.

콜백함수인 ReaderHandler 인터페이스는 단 하나의 메소드를 가지고 있음으로 자바1.8 기준으로 람다구문으로 사용할 수 있다.
