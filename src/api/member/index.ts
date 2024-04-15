const modules = import.meta.globEager('./model/**/*.ts');

let memberApi = {};

Object.keys(modules).forEach((key) => {
  const mod = modules[key].default || {};
  const	api =  Object.prototype.toString.call(mod) === '[object Object]' ? {...mod} : {mod};
   memberApi = { ...memberApi,...api}
});

export default {
	api:memberApi
}
