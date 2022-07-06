const templateWariningDeprecated = (props) => {
  const { isWarningDeprecated, name } = props

  if (isWarningDeprecated) {
    return `console.warn("Api method '${name}' is deprecated");`
  }
}

const templateParams = (props) => {
  const { isExistParams } = props

  return isExistParams ? 'params' : ''
}

const templateRequest = (props) => {
  const args = templateRequestArgs(props)
  const params = templateParams(props)

  return `return request(${args})(${params});`
}

const templateRequestArgs = (props) => {
  const method = `"${props.method}"`
  const url = `\`${templateUrl(props)}\``
  const defaultParams = templateDefaultParams(props)
  const joinConfig = { separator: ', ' }
  const args = joinStrings([method, url, defaultParams], joinConfig)

  return args
}

const templateUrl = (props) => {
  if (props.isExistParams) {
    return props.url.replace(/\{(.*)\}/g, '${params.path.$1}')
  }

  return props.url
}

const templateDefaultParams = (props) => {
  const { defaultParams } = props

  if (
    defaultParams &&
    typeof defaultParams === 'object' &&
    Object.keys(defaultParams).length
  ) {
    return printObject(objectToArray(defaultParams), (propValue) =>
      printObject(objectToArray(propValue))
    )
  }

  return ''
}

const lineBreak = (value, options = {}) => {
  const before = options.before ? '\n' : ''
  const after = options.before ? '\n' : ''

  return value.length ? `${before}${value}${after}` : ''
}

const printObject = (properties, callback = (value) => value) => {
  if (properties.length) {
    return (
      properties.reduce((memo, [name, value]) => {
        memo += ` "${name}": ${callback(value)},`

        return memo
      }, '{') + ' }'
    )
  }

  return ''
}

const objectToArray = (object) => {
  return Object.keys(object).reduce((memo, name) => {
    memo.push([name, object[name]])
    return memo
  }, [])
}
const joinStrings = (strings, options = {}) => {
  const { before = '', after = '', separator = '' } = options

  return strings
    .filter(Boolean)
    .map((value) => `${before}${value}${after}`)
    .join(separator)
}

const templateBody = (props) => {
  const wariningDeprecated = templateWariningDeprecated(props)
  const request = templateRequest(props)
  const joinConfig = { before: '  ', separator: '\n' }
  const body = joinStrings([wariningDeprecated, request], joinConfig)

  return lineBreak(body, { before: true, after: true })
}

const getDefinitionsNotes = (originalRef, extra, prefix = 'param') => {
  const notesInfo = extra?.swaggerData?.definitions?.[originalRef]

  if (!notesInfo) {
    console.warn('No find notes info of ' + originalRef)
  }

  const { required = [], properties } = notesInfo
  const paramStr = Object.keys(properties)
    .map((key) => {
      const { type, description } = properties[key]
      const requiredStr = required?.includes(key) ? '' : '?:'
      return `* @${prefix} {${requiredStr}${type || '*'}} ${key} ${
        description || ''
      }`
    })
    .join('\n')

  return paramStr + '\n'
}
module.exports = {
  templateBody,
  getDefinitionsNotes,
}
