const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const _ = require('lodash');

var conf = JSON.parse(fs.readFileSync('webWordsConfig.json').toString())

conf['vendor'] = _.transform(conf['vendor'], function (result, val, key) {
  result[key.toLowerCase()] = val;
})

conf['cluster'] = _.transform(conf['cluster'], function (result, val, key) {
  result[key.toLowerCase()] = val;
})

conf['activity'] = _.transform(conf['activity'], function (result, val, key) {
  result[key.toLowerCase()] = val;
})

// console.log(conf['vendor'] )

var keywords = []
for (a in conf){
  keywords = [...keywords, ...Object.keys(conf[a])]
}
keywords = keywords.map(x=>x.toLowerCase())
// console.log(keywords)

var visibleText = (res)=>{
  var $ = cheerio.load(res.data);
  for (droptag in ['style', 'script', 'footer', 'header', 'head', 'title', 'meta', '[document]']){
    $(droptag).remove()
  }
  return $('body').text()

};

var checkKeywords = (text, keywords)=>{
  keywords = keywords.map(x=>'\\W'+x+'\\W')
  let pattern =new RegExp('\\W'+keywords.join('|')+'\\W','gi');
  return text.match(pattern)
};

var checkpage = async (url, keywords)=>{
  try{
      console.log(url)
      var res = await axios.get(url,timeout=1000);
      var vtext = visibleText(res);
      return [...new Set(checkKeywords(vtext, keywords))];
      // return checkKeywords(vtext, keywords)
  }catch{
    return null
  }
};

var checksite =async (url, keywords, conf)=>{
  var domain = url.replace(/^.*:\/\//,'')
  if(!domain.endsWith('/')){
    domain += '/'
  }
  // console.log('http://'+domain)
  try{
    var home = await axios.get(url,timeout=1000);
  }catch{
    console.log('bad domain ', domain)
    return
  }
  
  var $ = cheerio.load(home.data);
  var links = ['http://'+domain];
  $('a').each((i,a)=>{
    var href = $(a).attr('href')
    if(href && (href.replace(/^.*?:\/\//,'').startsWith(domain)||!href.startsWith('http'))){
      href ='http://'+domain+href.replace(/^.*?:\/+|^\W+|domain/,'')
      links.push(href)
    }
  })
  links = _.uniq(links)
  var out = await Promise.all(links.map(async (l)=>checkpage(l, keywords)))
  out = _.flatten(out)
  out = _.uniq(out)
  out = out.filter(x=>x != null)
  out = out.map(x=>x.replace(/\W/g,' ').trim().toLowerCase())
  // console.log(out)
  var vendors = out.map(x=>conf['vendor'][x]).filter(x=>x != undefined)  
  var clusters = out.map(x=>conf['cluster'][x]).filter(x=>x != undefined)
  var activities =  out.map(x=>conf['activity'][x]).filter(x=>x != undefined)
  var nodes = {vendors, clusters, activities}
  console.log(nodes)
};

checksite('https://www.data-blue.com', keywords, conf)
