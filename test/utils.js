import replaceBuffer from 'replace-buffer'

const CRLF = '\r\n'

function nl(input) {
	if (typeof input !== 'string' && !Buffer.isBuffer(input)) {
		throw new TypeError(`Expected a \`string\` or a \`Buffer\`, got \`${typeof input}\``);
	}

	return Buffer.isBuffer(input) ? replaceBuffer(input, CRLF, '\n') : input.replace(new RegExp(CRLF, 'g'), '\n');
}

export const normalizeNewline = (elemt) => {
  if (typeof elemt === 'string') {
    return nl(elemt)
  }

  Object.keys(elemt).forEach((key => {
    elemt[key] = normalizeNewline(elemt[key])
  }))

  return elemt
}
