let coke =  Number(process.argv[6]);
let pay =  Number(process.argv[5]);
let month =  Number(process.argv[4]);
const per =  Number(process.argv[3])* 0.01;
let money =  Number(process.argv[2]);

for(let i = 1; i <= month; i++){
    const result = money * per;

    let p = 0 ;
    if(i !== 1){
        p = pay;
    }

    const final = result - (result * 0.15);

    const calc = final + money + p;
    console.log(`|${i} 개월|${money.toFixed(0)}|${p}|${(per*100)}%|${result.toFixed(0)}|${final.toFixed(0)}|${calc.toFixed(0)}|`);
    money = calc;
}