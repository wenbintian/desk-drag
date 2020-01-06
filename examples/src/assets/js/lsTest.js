/**
  extensions is an Array and each item has such format:
  {firstName: 'xxx', lastName: 'xxx', ext: 'xxx', extType: 'xxx'}
  lastName, ext can be empty, extType can only has "DigitalUser", "VirtualUser","FaxUser","Dept","AO".
**/
/**
  Question 1: sort extensions by "firstName" + "lastName" + "ext" ASC
**/
export const sortExtensionsByName = function sortExtensionsByName(extensions) {
	let Ex = new Extensions(extensions);
	let sortNameList = [
		{code:"firstName",sortType:"asc"},
		{code:"lastName",sortType:"desc"},
		{code:"ext",sortType:"asc"},
	];

	extensions.sort((a,b)=>{
		return Ex.compareToAttr(a,b,sortNameList);
	});
	return extensions;
}


class Extensions {
    constructor(data=[]){
        this.data = data;
		}

		compareToAttr(item1='',item2='', sortNameList){
			for (let i = 0,l=sortNameList.length; i < l; i++) {
				const item = sortNameList[i];
				let curIndex = this.compareToValue(item1[item.code], item2[item.code],item.sortType);
				if(curIndex !== 0) return curIndex;
			}
			return 0;
		}

		compareToValue(value1='',value2='', sortType){
			let index = value1.localeCompare(value2);
			if(sortType==="desc") return index * -1;
			return index;
		}

}
