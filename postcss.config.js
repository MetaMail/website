
module.exports = {
  plugins: {
    // require('tailwindcss')(), //This refers to your tailwind config
    // require('autoprefixer')(),
    tailwindcss:{},
    autoprefixer:{},
    "postcss-pxtorem":{
      rootValue: 16,//我这里配置的是我1366分辨率下的基准值，会在下面解释
      unitPrecision: 5,
      propList: ["*"],
      selectorBlackList: [".ql",".Toastify"],
      // 排除antd样式，由于我给html设置了min-width，所以把html也排除在外不做rem转换
      replace: true,
      mediaQuery: false,
      minPixelValue: 0,
      exclude: /node_modules/i
    }
  }
}
