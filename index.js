const { templateBody, getDefinitionsNotes } = require('./utils')

module.exports = {
  file: './src/services/api.json',

  outputDir: './src/services',

  mode: 'prod',

  deprecated: 'warning',

  importRequest: 'disabled',

  originalBody: false,

  ignoreDescription: true,

  disableTypesGenerate: true,

  templateFileNameCode: 'circlesService.js',

  templateCodeBefore: (extra) =>
    "import request from '../utils/request.js';\n\n",

  templateRequestCode: (params, extra) => {
    const path = extra.swaggerData.paths[params.url]
    const methods = Object.keys(path)?.[0]
    const obj = path?.[methods]
    const description = obj?.description || obj?.summary
    const parameters = obj?.parameters || []
    const responsesRef = obj?.responses?.['200']?.schema?.originalRef || ''
    const name = params?.name?.replace(/Using(Get|Post)/, '')
    const body = templateBody(params)

    let note = `/**\n* @description ${description || 'null'}\n*\n`
    // 获取参数列表，支持两种引用方式
    parameters.map((p, index) => {
      const isLast = index === parameters.length - 1
      if (p?.schema?.originalRef) {
        note += getDefinitionsNotes(p.schema.originalRef, extra)
      } else {
        note += `* @param {${p.type}} ${p.name} ${p.description || ''}\n`
      }
    })

    //获取返回值
    if (responsesRef) {
      const resNotes = getDefinitionsNotes(responsesRef, extra, 'returns')
      note += resNotes ? `*\n${resNotes}` : ''
    } else {
      note += `* @returns {void}\n`
    }
    note += '*/'

    return `${note}\nexport const ${name} = (params) => {${body}}`
  },
}
