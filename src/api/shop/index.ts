const modules = import.meta.globEager('./model/**/*.ts');

let shopApi = {};

Object.keys(modules).forEach((key) => {
  const mod = modules[key].default || {};
  const	api =  Object.prototype.toString.call(mod) === '[object Object]' ? {...mod} : {mod};
   shopApi = { ...shopApi,...api}
});

export default {
	api:shopApi
}
