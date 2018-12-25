---
layout: post
title:  "Static과 final"
author: "glqdlt"
---


```java

public class SomeOuter {

    public String getOuterName() {
        return outerName;
    }

    public void setOuterName(String outerName) {
        this.outerName = outerName;
    }

    private String outerName;

    public static final class SomeInner{

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        private String name;
    }
}


```
