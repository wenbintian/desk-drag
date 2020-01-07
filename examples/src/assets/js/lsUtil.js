const isNumber = function(num){
  return Object.prototype.toString.call(num) === "[object Number]";
}
const isArray = function(data){
  return Object.prototype.toString.call(data) === "[object Array]";
}
export {isNumber, isArray};