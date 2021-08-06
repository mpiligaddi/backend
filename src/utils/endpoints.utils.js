const endpointsRoles = {
  merchandiser: {
    GET: [
      /^profile$/gi,
      /^profile\/reports$/gi,
      /^clients$/gi,
      /^branches$/gi,
      /^chains$/gi,
      /^categories$/gi
    ],
    POST: [
      /^reports$/gi
    ]
  },
  client: {
    GET: [
      /^profile$/gi,
      /^profile\/reports$/gi,
      /^branches$/gi,
      /^chains$/gi,
      /^categories$/gi,
      /^periods$/gi,
      /^reports$/gi
    ]
  },
  backoffice: {
    GET: [
      /^profile$/gi,
      /^profile\/reports$/gi,
      /^clients$/gi,
      /^clients\/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b$/gi,
      /^branches$/gi,
      /^branches\/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b$/gi,
      /^chains$/gi,
      /^chains\/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b$/gi,
      /^categories$/gi,
      /^periods$/gi
    ],
    POST: [
      /^reports$/gi
    ],
    PUT: [
      /^reports$/gi,
      /^profile$/gi,
      /^clients$/gi,
      /^branches$/gi,
      /^chains$/gi
    ],
    PATCH: [
      /^reports$/gi,
      /^profile$/gi,
      /^clients$/gi,
      /^branches$/gi,
      /^chains$/gi
    ]
  }
}

module.exports = {
  endpointsRoles
}