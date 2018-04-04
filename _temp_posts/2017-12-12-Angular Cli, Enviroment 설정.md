---
layout: post
title:  "Angular Cli, Enviroment 설정"
author: "glqdlt"
---

## Angular cli에서, Enviroment 별 번들링

asset을 하나의 번들링으로 한다는 개념이 빌드인 것은 알겠다.
Maven의 Profile과 같은 Product 별로의 환경을 빌드할 수 없을까 해서 알아보았다.

### 1. enviroments 폴더에 enviroment.local.ts 를 만든다.

<pre>
export const environment = {
  production: false,
    apiUrl : 'http://127.0.0.1:28080'
}
</pre>

### 2. 이 apiUrl을 참조할 service를 만든다. 

import는 꼭 아래와 같이  enviroments.ts 를 바라봐야한다. 번들링 과정에서 enviroment.ts 를 바라보고 빌드할 거기 때문(그 내용이 enviroment.local.ts 일지 enviroment.ts 일지는 번들링 시점에 선택할 수가 있다.)

<pre>
import {environment} from "../../environments/environment";

  ...

this.URL = environment.apiUrl;
</pre>

### 3. package.json 에 npm script를 작성 한다.
 
<pre>
  "ng": "ng",
  "start": "ng serve --port 5555",
  "local": "ng serve --port 5555 --env=local",
  "build": "ng build",
  "test": "ng test",
  "lint": "ng lint",
  "e2e": "ng e2e"
</pre>

### 4. angular-cli.json 의 enviroments 오브젝트 필드에 'local'을 등록해준다.

<pre>
  "environments": {
        "dev": "environments/environment.ts",
        "prod": "environments/environment.prod.ts",
        "local":"environments/environment.local.ts"
  }
</pre>

## 레퍼런스

[stories application environments](https://github.com/angular/angular-cli/wiki/stories-application-environments)