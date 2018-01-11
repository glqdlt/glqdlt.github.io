---
layout: post
title:  "[작성중]Angular Enviroment 설정"
author: "glqdlt"
---

1. enviroments 폴더에 enviroment.local.ts 를 만든다.

<pre><code>
export const environment = {
  production: false,
    apiUrl : 'http://127.0.0.1:28080'
};
</code></pre>

2. 이 apiUrl을 참조할 service를 만든다. (참고 : import는 꼭 아래와 같이  enviroments.ts 를 바라봐야한다.)

<pre><code>
import {environment} from "../../environments/environment";

  ...

this.URL = environment.apiUrl;
</code></pre>

3. package.json 에 script를 작성해서 등록.
 
<pre><code>
  "ng": "ng",
  "start": "ng serve --port 5555",
  "local": "ng serve --port 5555 --env=local",
  "build": "ng build",
  "test": "ng test",
  "lint": "ng lint",
  "e2e": "ng e2e"
</code></pre>

4. angular-cli.json 의 enviroments { } 오브젝트에 'local'을 등록해준다.

<pre><code>
  "environments": {
        "dev": "environments/environment.ts",
        "prod": "environments/environment.prod.ts",
        "local":"environments/environment.local.ts"
  }
</code></pre>

[Refrernce](https://github.com/angular/angular-cli/wiki/stories-application-environments)