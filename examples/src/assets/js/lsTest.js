import {isNumber, isArray} from "./lsUtil.js";
/**
  extensions is an Array and each item has such format:
  {firstName: 'xxx', lastName: 'xxx', ext: 'xxx', extType: 'xxx'}
  lastName, ext can be empty, extType can only has "DigitalUser", "VirtualUser","FaxUser","Dept","AO".
**/
/**
  Question 1: sort extensions by "firstName" + "lastName" + "ext" ASC
**/
/**
  Question 2: sort extensions by extType follow these orders ASC
  DigitalUser < VirtualUser < FaxUser < AO < Dept.
**/

class Extensions {

  compareToAttr(item1='',item2='', sortNameList){
    for (let i = 0,l=sortNameList.length; i < l; i++) {
      const item = sortNameList[i];
      let curIndex = this.compareToValue(item1[item.code], item2[item.code],item.ascFlag);
      if(curIndex !== 0) return curIndex;
    }
    return 0;
  }

  compareToValue(value1='',value2='', ascFlag){
    let index = value1.localeCompare(value2);
    if(!ascFlag) return index * -1;
    return index;
  }

}

export const sortExtensionsByName = function (extensions) {
	let Ex = new Extensions(extensions);
	let sortNameList = [
		{code:"firstName",ascFlag:true},
		{code:"lastName",ascFlag:false},
		{code:"ext",ascFlag:true},
	];

	extensions.sort((a,b)=>{
		return Ex.compareToAttr(a,b,sortNameList);
	});
	return extensions;
}


export const sortExtensionsByExtType = function (extensions,ascFlag=true) {
  let extList = ["DigitalUser","VirtualUser","FaxUser","AO","Dept"];
  //if desc,to do reverse.
  if(!ascFlag) extList.reverse();
  extensions.sort((a,b)=>{
    //Judging priority by index value
    let extIndex1 =  extList.indexOf(a.extType);
    let extIndex2 =  extList.indexOf(b.extType);
    console.log(a.extType,b.extType)
    return extIndex1 - extIndex2;
  });
  return extensions;
}

/**
 * examples
 */
let temp1 = [
  {firstName: 'Mr.Tian', lastName: 'test', ext: 'ext1', extType: 'DigitalUser'},
  {firstName: 'Mrs.Zhang', lastName: 'year', ext: '', extType: 'FaxUser'},
  {firstName: 'Mr.Smith', lastName: '', ext: 'extext', extType: 'AO'},
  {firstName: 'Mr.Smith', lastName: 'month', ext: 'eext', extType: 'Dept'},
  {firstName: 'Mr.Smith', lastName: 'month', ext: 'eext', extType: 'VirtualUser'},
  {firstName: 'Mr.Smith', lastName: 'month', ext: 'eext', extType: 'other'},
]
let temp2 = JSON.parse(JSON.stringify(temp1));
console.log(sortExtensionsByName(temp1))
console.log(sortExtensionsByExtType(temp2))


/**
  saleItems is an Array has each item has such format:
  {
	month: n, //[1-12],
	date: n, //[1-31],
	transationId: "xxx",
	salePrice: number
  }
**/

/**
  Question 3: write a function to calculate and return a list of total sales (sum) for each quarter, expected result like:
  [
  	{quarter: 1, totalPrices: xxx, transactionNums: n},
  	{....}
  ]
**/
/**
  Question 4: write a function to calculate and return a list of average sales for each quarter, expected result like:
  [
    {quarter: 1, averagePrices: xxx, transactionNums: n},
    {....}
  ]
**/

class SalePriceData {
  constructor(saleItems=[], digits = 2){
    
    if(!isNumber(digits)){
      console.log("Decimal digits must be numeric type!");
      digits = 2;
    }
    this.digits = digits;

    if(!isArray(saleItems)){
      throw Error("The first parameter must be an array type!");
    }
    this.saleItems = saleItems;

    //quarter divide list
    this.quarterList = [
      {quarter:1,start:1,end:3},//first quarter
      {quarter:2,start:4,end:6},//second quarter
      {quarter:3,start:7,end:9},//three quarter
      {quarter:4,start:10,end:12}//four quarter
    ];


  }

  divideQuarter(month){
    if(!isNumber(month)){
      console.log("Month must be numeric type!");
    }
    for (let i = 0,l = this.quarterList.length; i < l; i++) {
      const item = this.quarterList[i];
      if(month >= item.start && month <= item.end){
        return item.quarter;
      }
    }
    //Zore means the problem width the month.
    return 0;
  }

  sumByQuarter(){
    let quarterMap = {};
    for (let i = 0,l = this.saleItems.length; i < l; i++) {
      const item = this.saleItems[i];
      let quarter = this.divideQuarter(item.month);//Current quarter
      //QuarterMap current not quarter, create map
      if( !quarterMap[quarter] ) {
        quarterMap[quarter] = {
          quarter: quarter,
          totalPrices: 0,
          transactionNums: 0
        };
      }
      let curDigit = this.getDigit(item.salePrice);

      quarterMap[quarter].totalPrices = (quarterMap[quarter].totalPrices * curDigit + item.salePrice * curDigit) / curDigit;
      quarterMap[quarter].transactionNums ++;
    }
    return Object.values(quarterMap).sort((a,b) => (a.quarter-b.quarter));
  }

  getDigit(str=""){
    //Get the current digit
    let curDigit = (""+str).split(".")[1];
    curDigit = curDigit ? curDigit.length : 0;
    curDigit = Math.max(curDigit, this.digits);
    curDigit = Math.pow(10, curDigit);
    return curDigit;
  }

  averageByQuarter(){
    let sumQuarter = this.sumByQuarter();
    sumQuarter.map(item => {
      let curDigit = this.getDigit(item.totalPrices);
      item.averagePrice = (item.totalPrices * curDigit) / item.transactionNums / curDigit;
      return item; 
    });
    return sumQuarter;
  }

}

export const sumByQuarter = function(saleItems){
  let Sale = new SalePriceData(saleItems);
  return Sale.sumByQuarter();
}
export const averageByQuarter = function(saleItems){
  let Sale = new SalePriceData(saleItems);
  return Sale.averageByQuarter();
}

/**
  Question 5: please create a tool to generate Sequence
  Expected to be used like:
  var sequence1 = new Sequence();
  sequence1.next() --> return 1;
  sequence1.next() --> return 2;
  
  in another module:
  var sequence2 = new Sequence();
  sequence2.next() --> 3;
  sequence2.next() --> 4;
**/
let symbolNum = Symbol("num");
let sequenceMap = {
  [symbolNum]:0
}
class Sequence {
  constructor(step=1){
    if(!isNumber(step)){
      console.log("Step must be numeric type");
      this.step = 1;
    }
    this.step = step;
  }

  increase(num){
    num += this.step;
    return num;
  }

  next(){
    sequenceMap[symbolNum] = this.increase(sequenceMap[symbolNum]);
    return sequenceMap[symbolNum];
  }
}

export const next = function(){
  let Seq = new Sequence();
  return Seq.next();
}

/**
    Question 6:
    AllKeys: 0-9;
    usedKeys: an array to store all used keys like [2,3,4];
    We want to get an array which contains all the unused keys,in this example it would be: [0,1,5,6,7,8,9]
**/
function getUnUsedKeys(allKeys, usedKeys) {
	if(!isArray(allKeys) || !isArray(usedKeys)){
    throw Error("the first parameter and the second parameter should be a Array.");
  }
  allKeys.filter(item=>{
    return usedKeys.indexOf(item)===-1;
  });
  return allKeys;
}

// example
console.log(getUnUsedKeys([1,2,3],[2,4]));

